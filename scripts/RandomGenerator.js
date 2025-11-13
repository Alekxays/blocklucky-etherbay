import { ethers } from "ethers";
import { crypto} from "crypto";



const randomBytes = crypto.randomBytes(32);

const randomUint256 = ethers.toBigInt("0x" + randomBytes.toString("hex"));

console.log("Random number:" , randomUint256);