// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title FreelanceAgreement
 * @dev Escrow framework incorporating multi-milestone payments, multi-sig release patterns,
 * and structural compliance data fields for EU regulatory standards (GDPR, Consumer Rights Directive).
 */
contract FreelanceAgreement {
    
    // --- LEGAL & REGULATORY COMPLIANCE FIELDS (EU SPECIFIC) ---
    // GDPR Compliance: Cryptographic hash of off-chain Data Processing Agreement (DPA) containing PII
    bytes32 public privacyPolicyHash;
    string public governingLawAndJurisdiction; // e.g., "France, Courts of Paris"
    string public clientVatNumber;              // EU Reverse-Charge VAT compliance identifier
    string public freelancerVatNumber;          // Provider VAT registration identifier
    
    // EU Consumer Rights Directive (2011/83/EU): 14-day statutory withdrawal / cooling-off tracking
    uint256 public immutable contractDeploymentTimestamp;
    uint256 public constant EU_COOLING_OFF_PERIOD = 14 days;

    // --- CORE ACTORS ---
    address public immutable client;
    address public immutable freelancer;
    address public immutable designatedArbiter; // Independent EU-arbitration body / oracle

    // --- ESCROW & MILESTONE STRUCTURES ---
    enum Status { Active, Disputed, Resolved, Terminated }
    Status public contractStatus;

    struct Milestone {
        string title;
        uint256 amount;
        uint256 deadline;
        bool clientApproved;
        bool freelancerApproved;
        bool isReleased;
    }

    Milestone[] public milestones;
    uint256 public totalContractValue;
    uint256 public totalFundsLocked;

    // --- EVENTS ---
    event MilestoneFunded(uint256 indexed milestoneId, uint256 amount);
    event MilestoneApproved(uint256 indexed milestoneId, address indexed approver);
    event FundsReleased(uint256 indexed milestoneId, uint256 amount);
    event DisputeRaised(address indexed initiator, string reason);
    event DisputeResolvedByArbiter(uint256 totalReleasedToFreelancer, uint256 totalRefundedToClient);
    event RightToWithdrawExercised();

    // --- MODIFIERS ---
    modifier onlyParties() {
        require(msg.sender == client || msg.sender == freelancer, "Sender is not a contracting party");
        _;
    }

    modifier onlyClient() {
        require(msg.sender == client, "Action restricted to Client");
        _;
    }

    modifier onlyArbiter() {
        require(msg.sender == designatedArbiter, "Action restricted to Designated Arbiter");
        _;
    }

    modifier inStatus(Status _status) {
        require(contractStatus == _status, "Contract state invalid for this operation");
        _;
    }

    /**
     * @notice Initializes the freelance contract, locks structural values, and registers regulatory metadata.
     * @param _freelancer Wallet address of the service provider.
     * @param _arbiter Independent dispute resolution system/address.
     * @param _privacyPolicyHash Hash of the external GDPR-compliant technical data management notice.
     * @param _governingLaw Defined EU Member State framework and local court venue selection string.
     * @param _clientVat Client VIES-verifiable tax entity index string. Pass empty string if consumer (B2C).
     * @param _freelancerVat Freelancer VIES-verifiable tax entity index string.
     */
    constructor(
        address _freelancer,
        address _arbiter,
        bytes32 _privacyPolicyHash,
        string memory _governingLaw,
        string memory _clientVat,
        string memory _freelancerVat
    ) payable {
        require(_freelancer != address(0) && _arbiter != address(0), "Invalid platform addresses");
        require(msg.value > 0, "Initial deployment must fund contract escrow milestones");

        client = msg.sender;
        freelancer = _freelancer;
        designatedArbiter = _arbiter;
        
        // Legal data injection
        privacyPolicyHash = _privacyPolicyHash;
        governingLawAndJurisdiction = _governingLaw;
        clientVatNumber = _clientVat;
        freelancerVatNumber = _freelancerVat;
        
        contractDeploymentTimestamp = block.timestamp;
        contractStatus = Status.Active;
        totalFundsLocked = msg.value;
    }

    /**
     * @notice Appends a structured contract stage mapping out production targets and required funding allocations.
     * @dev Total values must map cleanly to structural `totalFundsLocked` sent at deployment.
     */
    function addMilestone(string memory _title, uint256 _amount, uint256 _deadline) external onlyClient inStatus(Status.Active) {
        milestones.push(Milestone({
            title: _title,
            amount: _amount,
            deadline: _deadline,
            clientApproved: false,
            freelancerApproved: false,
            isReleased: false
        }));
        totalContractValue += _amount;
    }

    /**
     * @notice Execution framework for Multi-Signature escrow release patterns.
     * @dev Both parties must explicitly trigger authorization before assets migrate off-chain.
     */
    function approveMilestone(uint256 _milestoneId) external onlyParties inStatus(Status.Active) {
        require(_milestoneId < milestones.length, "Target milestone range index invalid");
        Milestone storage milestone = milestones[_milestoneId];
        require(!milestone.isReleased, "Milestone assets have already been assigned out");

        if (msg.sender == client) {
            milestone.clientApproved = true;
            emit MilestoneApproved(_milestoneId, client);
        } else {
            milestone.freelancerApproved = true;
            emit MilestoneApproved(_milestoneId, freelancer);
        }

        // Multi-sig evaluation trigger condition
        if (milestone.clientApproved && milestone.freelancerApproved) {
            _executeEscrowRelease(_milestoneId);
        }
    }

    /**
     * @dev Secure low-level internal payment transfer mechanism execution.
     */
    function _executeEscrowRelease(uint256 _milestoneId) internal {
        Milestone storage milestone = milestones[_milestoneId];
        milestone.isReleased = true;
        
        uint256 transferAmount = milestone.amount;
        require(totalFundsLocked >= transferAmount, "Insufficient locked escrow balance");
        
        totalFundsLocked -= transferAmount;
        emit FundsReleased(_milestoneId, transferAmount);
        
        payable(freelancer).transfer(transferAmount);
    }

    /**
     * @notice Invokes statutory Article 9 protection under EU Directive 2011/83/EU.
     * @dev Valid solely within the 14-day initialization envelope. Automatically returns unreleased assets.
     */
    function exerciseRightToWithdraw() external onlyClient inStatus(Status.Active) {
        require(block.timestamp <= contractDeploymentTimestamp + EU_COOLING_OFF_PERIOD, "Statutory 14-day window closed");
        
        contractStatus = Status.Terminated;
        uint256 refundAmount = totalFundsLocked;
        totalFundsLocked = 0;
        
        emit RightToWithdrawExercised();
        payable(client).transfer(refundAmount);
    }

    /**
     * @notice Freezes the escrow balance state machine and flags tracking systems for official arbiter assessment.
     */
    function raiseDispute(string memory _reason) external onlyParties inStatus(Status.Active) {
        contractStatus = Status.Disputed;
        emit DisputeRaised(msg.sender, _reason);
    }

    /**
     * @notice Administrative resolution engine override execution bypass.
     * @param _releaseToFreelancer Raw quantitative balance configuration allocated to the service provider.
     * @param _refundToClient Raw quantitative balance configuration returned to the initiator.
     */
    function resolveDispute(uint256 _releaseToFreelancer, uint256 _refundToClient) external onlyArbiter inStatus(Status.Disputed) {
        require(_releaseToFreelancer + _refundToClient == totalFundsLocked, "Resolution mismatch against locked balance pool");
        
        totalFundsLocked = 0;
        contractStatus = Status.Resolved;
        
        emit DisputeResolvedByArbiter(_releaseToFreelancer, _refundToClient);

        if (_releaseToFreelancer > 0) {
            payable(freelancer).transfer(_releaseToFreelancer);
        }
        if (_refundToClient > 0) {
            payable(client).transfer(_refundToClient);
        }
    }
}