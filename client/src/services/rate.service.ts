import axios from 'axios';
import { ethers } from 'ethers';
import Utils from "../utils";
import compoundAbi from "./compound.json";

export interface Rate {
  id?: number,
  protocol: string,
  apy: number,
  timestamp: number
}

const compoundAddress = "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643";
const provider = new ethers.providers.JsonRpcProvider('https://eth.coincircle.com');

export const contract = new ethers.Contract(compoundAddress, compoundAbi, provider);

export async function getCurrentRate(): Promise<Rate> {
  const currentBigNumberRate = await contract.supplyRatePerBlock();
  const rate = +ethers.BigNumber.from(currentBigNumberRate).toString();

  const currentBlockNumber = await provider.getBlockNumber();
  const currentBlock = await provider.getBlock(currentBlockNumber);
  const blockTimestamp = currentBlock.timestamp * 1000;

  return {
    protocol: 'compound',
    apy: Utils.calSupplyAPY(rate),
    timestamp: blockTimestamp
  };
}

export async function getHistoricalRate(): Promise<Rate[]> {
  const url = `http://localhost:8000/rates/historical`;
  const { data } = await axios.get<Rate[]>(url);
  return data;
}
