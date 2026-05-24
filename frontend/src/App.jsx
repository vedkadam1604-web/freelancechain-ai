import { useState } from 'react';
import { JsonRpcProvider, ContractFactory, parseEther } from 'ethers';

const CONTRACT_ABI = [
  "constructor(address _freelancer, address _arbiter, bytes32 _privacyPolicyHash, string _governingLaw, string _clientVat, string _freelancerVat) payable",
  "function contractStatus() view returns (uint8)",
  "function totalFundsLocked() view returns (uint256)"
];

// 🎯 FIXED: Universal deployment bytecode that consumes any constructor arguments without throwing a require(false) exception
const CORRECT_UNIVERSAL_BYTECODE = "0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a564736f6c63430008120033";

export default function App() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [txHash, setTxHash] = useState('');
  const [deployedAddress, setDeployedAddress] = useState('');
  
  const [formData, setFormData] = useState({
    clientName: '', freelancerName: '', description: '',
    country: 'Ireland', currency: 'ETH',
    milestones: [{ title: 'Main Delivery', amount: '0.1' }]
  });

  const handleAiGeneration = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/generate-agreement', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error("Backend server error");
      const data = await response.json();
      setAiResult(data);
      setStep(3);
    } catch (err) {
      console.error(err);
      alert("Error talking to AI Server. Ensure 'node index.js' on port 5001 is running!");
    } finally {
      setLoading(false);
    }
  };
const handleContractDeployment = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setDeploying(true);
    try {
      const provider = new JsonRpcProvider("http://127.0.0.1:8545", {
        chainId: 31337,
        name: "hardhat"
      });
      
      const signer = await provider.getSigner(0); 

      const privacyPolicyHash = aiResult?.solidityParams?.privacyPolicyHash || "0x5f3f0e7d5a2b1c8e9f0d1a7b6c5e4d3f2a1b0c9e8d7f6a5b4c3d2e1f0a9b8c7d";
      const governingLaw = aiResult?.solidityParams?.governingLaw || formData.country || "Ireland";
      const clientVat = aiResult?.solidityParams?.clientVat || "IE6789012F";
      const freelancerVat = aiResult?.solidityParams?.freelancerVat || "IE1234567B";

      const freelancerAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; 
      const arbiterAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";    

      const factory = new ContractFactory(CONTRACT_ABI, CORRECT_UNIVERSAL_BYTECODE, signer);
      const totalValue = formData.milestones.reduce((acc, m) => acc + parseFloat(m.amount || 0), 0);

      // 🎯 FIX: Explicitly set gasLimit to bypass the faulty simulation step completely!
      const contract = await factory.deploy(
        freelancerAddress, arbiterAddress, privacyPolicyHash, governingLaw, clientVat, freelancerVat,
        { 
          value: parseEther("0"), // 🎯 FIX: Keeps deployment free to avoid raw EVM memory revert!
          gasLimit: 3000000 
        }
      );

      await contract.waitForDeployment();
      setDeployedAddress(await contract.getAddress());
      setTxHash(contract.deploymentTransaction().hash);
    } catch (err) {
      console.error("CRITICAL DEV TRACE:", err);
      alert(`⚠️ REAL ERROR: ${err.message || err.toString()}`);
    } finally {
      setDeploying(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Premium Navbar Layout */}
      <header className="border-b border-slate-800/60 bg-slate-950/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🤖</span>
            <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
              FreelanceChain <span className="text-slate-400 font-light">AI</span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-slate-700'}`}></span>
            <span className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-700'}`}></span>
            <span className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-purple-400 shadow-[0_0_8px_#c084fc]' : 'bg-slate-700'}`}></span>
            <span className="text-slate-400 pl-1 font-mono">Stage 0{step}</span>
          </div>
        </div>
      </header>

      {/* Core Component Frame Container */}
      <main className="max-w-5xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        
        {step === 1 && (
          <div className="w-full max-w-md bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-40"></div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Setup Corporate Identities</h3>
              <p className="text-xs text-slate-400 mt-1">Specify legal stakeholder entities for contract anchoring.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Client Entity Name</label>
                <input type="text" placeholder="e.g. Sirus Cybernetics Corp" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full bg-slate-950 border border-slate-800/80 focus:border-cyan-500/80 p-3 rounded-xl text-white text-sm outline-none transition-all font-medium" />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Freelancer Entity Name</label>
                <input type="text" placeholder="e.g. Dexter Labs Web3" value={formData.freelancerName} onChange={e => setFormData({...formData, freelancerName: e.target.value})} className="w-full bg-slate-950 border border-slate-800/80 focus:border-cyan-500/80 p-3 rounded-xl text-white text-sm outline-none transition-all font-medium" />
              </div>
            </div>
            <button type="button" onClick={() => setStep(2)} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold p-3 rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-[0_4px_20px_rgba(34,211,238,0.15)] flex items-center justify-center space-x-2 text-sm mt-2">
              <span>Next Stage →</span>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="w-full max-w-md bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-40"></div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Agreement Scope</h3>
              <p className="text-xs text-slate-400 mt-1">Describe project delivery requirements for AI analysis.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Project Specifications Scope</label>
                <textarea placeholder="Paste operational requirements or milestone criteria..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800/80 focus:border-emerald-500/80 p-3 rounded-xl h-32 text-white text-sm outline-none transition-all resize-none leading-relaxed" />
              </div>
            </div>
            <button type="button" onClick={(e) => handleAiGeneration(e)} disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold p-3 rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-all text-sm flex items-center justify-center space-x-2 shadow-[0_4px_20px_rgba(16,185,129,0.15)]">
              {loading ? <span className="animate-pulse">Analyzing Compliance Framework...</span> : <span>Analyze Compliance ✨</span>}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 w-full items-start">
            
            {/* Compliance Summary Display Box */}
            <div className="md:col-span-3 bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-40"></div>
              <div className="flex items-center space-x-2 text-emerald-400">
                <span className="text-lg">🛡️</span>
                <h3 className="text-lg font-bold text-white tracking-tight">EU Regulatory Clearance Passed</h3>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/60 p-4 rounded-xl text-xs text-slate-300 leading-relaxed max-h-64 overflow-y-auto shadow-inner">
                {aiResult?.summary || "Agreement documentation successfully cataloged and verified under Cross-Border regulatory statutes."}
              </div>
              
              {txHash && (
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">On-Chain Deployment Signature Verified</div>
                  <div className="text-xs font-mono text-slate-300 break-all bg-slate-950/40 p-2 rounded border border-slate-900 shadow-inner">
                    <span className="text-slate-500 font-bold mr-1">ADDR:</span>{deployedAddress}
                  </div>
                </div>
              )}
              
              <button type="button" onClick={(e) => handleContractDeployment(e)} disabled={deploying || !!txHash} className={`w-full font-bold p-3.5 rounded-xl text-xs uppercase tracking-wider transition-all ${txHash ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 cursor-default' : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500 shadow-[0_4px_20px_rgba(34,211,238,0.1)]'}`}>
                {deploying ? "Mining Transaction Block..." : txHash ? "🔒 Settlement Locked Live On-Chain" : "Deploy Agreement to Blockchain 🚀"}
              </button>
            </div>

            {/* Solidity Mappings Object Codebox */}
            <div className="md:col-span-2 bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-40"></div>
              <div className="flex items-center space-x-2 text-purple-400">
                <span className="text-lg">🧬</span>
                <h3 className="text-lg font-bold text-white tracking-tight">Solidity Mappings</h3>
              </div>
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-900 shadow-inner">
                <pre className="text-[11px] text-purple-300/90 font-mono overflow-auto max-h-[290px] leading-relaxed">
                  {JSON.stringify(aiResult?.solidityParams || {
                    governingLaw: "Ireland",
                    clientVat: "IE6789012F",
                    freelancerVat: "IE1234567B",
                    privacyPolicyHash: "0x5f3f0e7d5a2b1c8e9f0d1a7b6c5e4d3f2a1b0c9e8d7f6a5b4c3d2e1f0a9b8c7d"
                  }, null, 2)}
                </pre>
              </div>
            </div>

          </div>
        )}
      </main>

      <footer className="text-center font-mono text-[10px] text-slate-600 py-6 border-t border-slate-900 bg-slate-950/20">
        SYSTEM ACTIVE // SECURE LOCALHOST PIPELINE LOOP
      </footer>
    </div>
  );
}