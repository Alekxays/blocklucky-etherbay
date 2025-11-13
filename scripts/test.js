import pkg from 'hardhat';
const { ethers } = pkg;

async function deployContract() {
    const [owner] = await ethers.getSigners();
    const BlockLucky = await ethers.getContractFactory("BlockLucky");
    const randomContract = await BlockLucky.deploy();
    await randomContract.deployed();

    console.log("Contract deployed to:", randomContract.address);
    return randomContract.address; // <- tu utilises cette adresse dans ton script générateur
}

deployContract();
