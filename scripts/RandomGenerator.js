import { ethers } from "ethers";
import crypto from "crypto";


const randomBytes = crypto.randomBytes(32);
const randomUint256 = BigInt("0x" + randomBytes.toString("hex"));

console.log("Random number:", randomUint256);