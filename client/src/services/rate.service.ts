import axios from 'axios';
import { ethers } from 'ethers';
import compoundABI from './compound.json';
import makerDaoABI from './makerDAO.json';

export interface Rate {
  id?: number,
  protocol: string,
  apy: number,
  timestamp: number
}

export enum Protocol {
  Compound,
  MakerDAO,
};

const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_RPC_ENDPOINT);
const compoundAddress = "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643";
const makerDaoAddress = "0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7";

export const compoundContract = new ethers.Contract(compoundAddress, compoundABI, provider);
export const makerDaoContract = new ethers.Contract(makerDaoAddress, makerDaoABI, provider);

export async function getCurrentRates(): Promise<Rate[]> {
  const compoundRate = await compoundContract.supplyRatePerBlock();
  const makerDAORate = await makerDaoContract.dsr();

  return [
    {
      protocol: Protocol[0],
      apy: calCompoundAPY(+compoundRate.toString()),
      timestamp: await getCurrentBlockTimestamp()
    },
    {
      protocol: Protocol[1],
      apy: calMakerDaoAPY(+makerDAORate.toString()),
      timestamp: await getCurrentBlockTimestamp()
    }
  ];
}

export async function getHistoricalRate(protocol: Protocol): Promise<Rate[]> {
  const url = `${process.env.REACT_APP_API_ENDPOINT}/rates/historical?protocol=${Protocol[protocol]}`;
  const { data } = await axios.get<Rate[]>(url);
  return data;
}

const getCurrentBlockTimestamp = async () => {
  const currentBlockNumber = await provider.getBlockNumber();
  const currentBlock = await provider.getBlock(currentBlockNumber);
  return currentBlock.timestamp * 1000;
}

const calCompoundAPY = (rawRate: number) => {
  const ethMantissa = 1e18;
  const blocksPerDay = 4 * 60 * 24;
  const daysPerYear = 365;
  return (((Math.pow((rawRate / ethMantissa * blocksPerDay) + 1, daysPerYear))) - 1) * 100;
}

const calMakerDaoAPY = (rawRate: number) => {
  const rate = rawRate / Math.pow(10, 27);
  const secondsInYear = 60 * 60 * 24 * 365;
  return Math.pow(rate, secondsInYear);
}

