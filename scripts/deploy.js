import hre from "hardhat";

async function main() {
  const ethers = hre.ethers;

  const Contract = await ethers.getContractFactory("FreelanceAgreement");

  const contract = await Contract.deploy(
    "0x0000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000",
    "Test Agreement",
    "Ireland",
    "EU-VAT-DEFAULT"
  );

  await contract.waitForDeployment();

  console.log("Contract deployed at:", await contract.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});