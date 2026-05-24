# 🤖 AI Freelance Contract Generator

> EU-compliant smart contracts for freelancers, powered by Claude AI and Ethereum

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Claude API](https://img.shields.io/badge/AI-Claude%20Sonnet%204-purple)](https://anthropic.com)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?logo=solidity)](https://soliditylang.org/)

## 🎯 The Problem

Freelancers across the EU face:
- **Legal complexity**: Understanding EU directives (Late Payment, GDPR, Consumer Rights)
- **Payment disputes**: No automated escrow systems
- **Manual processes**: Writing contracts from scratch every time
- **Compliance risk**: Missing required clauses can invalidate contracts

## 💡 The Solution

An AI-powered platform that generates:
1. **Human-readable contracts** — Plain English, EU-compliant terms
2. **Smart contract code** — Solidity escrow system with milestone payments
3. **Compliance validation** — Automatic checks against EU regulations

### Key Features

✅ **AI Contract Generation** (Claude Sonnet 4)
- Converts plain English project descriptions into legal contracts
- Automatically includes required EU clauses

✅ **EU Legal Compliance**
- Late Payment Directive (2011/7/EU) — 30-day payment terms
- GDPR data protection clauses
- Consumer Rights Directive — 14-day cooling-off period
- VAT handling for B2B contracts
- Governing law selection (EU member states)

✅ **Smart Contract Escrow**
- Funds locked on deployment
- Released upon milestone approval
- Multi-signature support
- Dispute resolution mechanism

✅ **Interactive UI**
- 3-step wizard: Parties → Milestones → Deploy
- Real-time compliance validation
- Side-by-side contract preview

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React + Vite + Tailwind CSS |
| **Backend** | Node.js + Express |
| **AI Engine** | Claude API (Sonnet 4) |
| **Blockchain** | Solidity + Hardhat + Ethers.js |
| **Database** | PostgreSQL + Prisma *(planned)* |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Claude API key ([get one here](https://console.anthropic.com/))
- MetaMask or similar Web3 wallet

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/freelance-contract-ai.git
cd freelance-contract-ai
```

2. **Backend setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your CLAUDE_API_KEY
npm run dev
```

3. **Frontend setup** (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

4. **Smart contracts** (optional — for deployment)
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat node  # Start local blockchain
```

### Usage

1. Open `http://localhost:5173` in your browser
2. Fill in the contract details:
   - Parties (freelancer & client)
   - Project description
   - Milestones & payment terms
3. Click **Generate Contract with AI**
4. Review the generated contract and compliance checks
5. Deploy to blockchain (requires MetaMask)

## 📋 API Endpoints

### `POST /api/contracts/generate`

Generate an EU-compliant contract from form data.

**Request:**
```json
{
  "freelancerName": "Jane Smith",
  "freelancerAddress": "123 Main St, Dublin, Ireland",
  "freelancerVAT": "IE1234567L",
  "clientName": "TechCorp Ltd",
  "clientAddress": "456 Business Ave, Berlin, Germany",
  "clientVAT": "DE123456789",
  "projectDescription": "Build a responsive e-commerce website with payment integration",
  "totalAmount": "5000",
  "currency": "EUR",
  "milestones": [
    {
      "title": "Design Phase",
      "amount": "2000",
      "deadline": "2026-06-15"
    },
    {
      "title": "Development Phase",
      "amount": "3000",
      "deadline": "2026-07-15"
    }
  ],
  "governingLaw": "Ireland"
}
```

**Response:**
```json
{
  "success": true,
  "contract": "FREELANCE SERVICE AGREEMENT\n\nThis Agreement...",
  "solidityParams": {
    "freelancerAddress": "0x...",
    "clientAddress": "0x...",
    "totalAmount": "5000000000000000000000",
    "milestones": [...]
  },
  "compliance": {
    "allPassed": true,
    "items": [...]
  },
  "metadata": {
    "generatedAt": "2026-05-23T14:30:00Z",
    "model": "claude-sonnet-4-20250514",
    "euCompliant": true
  }
}
```

### `GET /api/contracts/sample`

Get a sample contract for testing the UI.

### `POST /api/contracts/validate`

Validate Solidity parameters before deployment.

## 🔒 EU Compliance Details

This system ensures compliance with:

### 1. Late Payment Directive (2011/7/EU)
- Payment terms ≤ 30 days
- Automatic validation in backend
- Warning if milestones exceed limit

### 2. GDPR (2016/679)
- Data processing clause included
- Party consent mechanisms
- Right to erasure mentioned

### 3. Consumer Rights Directive (2011/83/EU)
- 14-day cooling-off period
- Right to withdraw
- Clear information requirements

### 4. VAT Directive (2006/112/EC)
- VAT identification numbers
- Cross-border transaction handling
- Reverse charge mechanism mention

### 5. Rome I Regulation (593/2008)
- Governing law selection
- Jurisdiction specification
- Cross-border contract rules

## 🧠 How the AI Works

The system uses Claude Sonnet 4 to:

1. **Parse user input** — Extracts parties, milestones, amounts, dates
2. **Generate legal text** — Creates EU-compliant contract language
3. **Extract structured data** — Converts to Solidity deployment parameters
4. **Validate compliance** — Checks against EU directives

**Prompt Engineering:**
- System prompt includes EU legal context
- Structured output format (JSON)
- Validation rules for required clauses

## 🎨 Screenshots

*(Add screenshots here after deployment)*

## 🛣️ Roadmap

- [x] Core AI contract generation
- [x] EU compliance validation
- [x] Basic React UI
- [ ] Hardhat deployment integration
- [ ] MetaMask wallet connection
- [ ] Database persistence (PostgreSQL)
- [ ] Contract templates library
- [ ] Multi-language support (DE, FR, ES, IT)
- [ ] PDF export functionality
- [ ] Email notifications
- [ ] Arbitration dashboard

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ⚖️ Legal Disclaimer

**This tool provides AI-generated contract templates for informational purposes only.**

- Not a substitute for professional legal advice
- Users should consult qualified lawyers before deployment
- No liability for legal disputes arising from generated contracts
- Compliance checks are automated and may not cover all scenarios

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [Anthropic](https://anthropic.com) for Claude API
- [Hardhat](https://hardhat.org) for Ethereum development tools
- EU Commission for public directive documentation

## 📬 Contact

Built by Vedant Kadam | [LinkedIn](https://linkedin.com/in/yourprofile) | 

---

**⭐ If this project helped you, please star it on GitHub!**