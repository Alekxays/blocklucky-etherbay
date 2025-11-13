const { ethers } = require("ethers") ;
import { crypto } from "crypto";

/** 
const randomUint256 = ethers.toBigInt(
    "0x" + [...crypto.getRandomValues(new Uint8Array(32))]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
);

console.log(randomUint256)
*/



const randomBytes = crypto.randomBytes(32);

const randomUint256 = ethers.toBigInt("0x" + randomBytes.toString("hex"));

console.log("Random number:" , randomUint256);