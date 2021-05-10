import axios from 'axios';
import { ethers } from 'ethers';
import compoundABI from "./compound.json";
import dsrABI from "./dsr.json";
import bzxABI from "./bzx.json";

export interface Rate {
  id?: number,
  protocol: string,
  apy: number,
  timestamp: number
}

const compoundAddress = "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643";
const dsrAddress = "0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7";
const bzxAddress = "0x6b093998D36f2C7F0cc359441FBB24CC629D5FF0";

const provider = new ethers.providers.JsonRpcProvider('https://eth.coincircle.com');

export const compoundContract = new ethers.Contract(compoundAddress, compoundABI, provider);
export const dsrContract = new ethers.Contract(dsrAddress, dsrABI, provider);
export const bzxContract = new ethers.Contract(bzxAddress, bzxABI.abi, provider);

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

export async function getBZXCurrentRate(): Promise<Rate> {
  const currentBigNumberRate = await bzxContract.dsr();
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
