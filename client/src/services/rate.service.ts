import axios from 'axios';
import { ethers } from 'ethers';
import rateABI from './rate.json';
import compoundABI from './compound.json';
// import makerDaoABI from './makerDAO.json';

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

// Ropsten address
const rateAddress = "0x6178a413c4e4c5724515abf045c17070c87edbaa";
const compoundAddress = "0xbc689667c13fb2a04f09272753760e38a95b998c";
const makerDAOAddress = "0x9588a660241aeA569B3965e2f00631f2C5eDaE33";

const provider = new ethers.providers.JsonRpcProvider('https://eth-testnet.coincircle.com');

const rateContract = new ethers.Contract(rateAddress, rateABI, provider);
export const compoundContract = new ethers.Contract(compoundAddress, compoundABI, provider);

export async function getCurrentRates(): Promise<Rate[]> {
  const rates = await rateContract.getRates(compoundAddress, makerDAOAddress);
  const compoundAPY = calCompoundAPY(rates[Protocol.Compound].toString());
  const makerDaoAPY = calMakerDaoAPY(rates[Protocol.MakerDAO].toString());
  return [
    {
      protocol: Protocol[0],
      apy: compoundAPY,
      timestamp: await getCurrentBlockTimestamp()
    },
    {
      protocol: Protocol[1],
      apy: makerDaoAPY,
      timestamp: await getCurrentBlockTimestamp()
    }
  ];
}

export async function getHistoricalRate(protocol: Protocol): Promise<Rate[]> {
  const url = `http://localhost:8000/rates/historical?protocol=${Protocol[protocol]}`;
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

