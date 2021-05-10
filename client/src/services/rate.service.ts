import axios from 'axios';
import { ethers } from 'ethers';
import compoundAbi from "./compound.json";
import potAbi from "./pot.json";

export interface Rate {
  id?: number,
  protocol: string,
  apy: number,
  timestamp: number
}

const compoundAddress = "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643";
const dsrAddress = "0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7";

const provider = new ethers.providers.JsonRpcProvider('https://eth.coincircle.com');

export const compoundContract = new ethers.Contract(compoundAddress, compoundAbi, provider);
export const dsrContract = new ethers.Contract(dsrAddress, potAbi, provider);

export async function getCompoundCurrentRate(): Promise<Rate> {
  const currentBigNumberRate = await compoundContract.supplyRatePerBlock();
  const rate = +ethers.BigNumber.from(currentBigNumberRate).toString();
  const blockTimestamp = await getCurrentBlockTimestamp();

  return {
    protocol: 'compound',
    apy: rate,
    timestamp: blockTimestamp
  };
}

export async function getDSRCurrentRate(): Promise<Rate> {
  const currentBigNumberRate = await dsrContract.dsr();
  const rate = +ethers.BigNumber.from(currentBigNumberRate).toString();
  const blockTimestamp = await getCurrentBlockTimestamp();

  return {
    protocol: 'dsr',
    apy: rate,
    timestamp: blockTimestamp
  };
}

export async function getHistoricalRate(protocol: string): Promise<Rate[]> {
  const url = `http://localhost:8000/rates/historical?protocol=${protocol}`;
  const { data } = await axios.get<Rate[]>(url);
  return data;
}

const getCurrentBlockTimestamp = async () => {
  const currentBlockNumber = await provider.getBlockNumber();
  const currentBlock = await provider.getBlock(currentBlockNumber);
  return currentBlock.timestamp * 1000;
}
