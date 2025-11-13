import { ethers } from "hardhat";
import crypto from "crypto";


async function main() {
    const randomBytes = crypto.randomBytes(32);
    const randomUint256 = BigInt("0x" + randomBytes.toString("hex"));

    console.log("Random number:", randomUint256);

    const [deploy] = await ethers.getSigner()
    const contractAddress = "";
    const BlockLucky = await ethers.getContractFactory("BlockLucky");
    const randomContract = await BlockLucky.attach(contractAddress);
    
}