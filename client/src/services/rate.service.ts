import axios from 'axios';
import { ethers } from 'ethers';
import rateABI from './rate.json';
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

// ropsten address
const rateAddress = "0x6178a413c4e4c5724515abf045c17070c87edbaa";
const compoundAddress = "0xbc689667c13fb2a04f09272753760e38a95b998c";
const makerDAOAddress = "0x9588a660241aeA569B3965e2f00631f2C5eDaE33";

// TODO: Regenerate API key & expose it in env var
const provider = new ethers.providers.JsonRpcProvider('https://ropsten.infura.io/v3/1f130364fd12487f86318286d1fefc3e');
// const provider = new ethers.providers.JsonRpcProvider('https://eth-testnet.coincircle.com');
// const provider = new ethers.providers.JsonRpcBatchProvider('http://localhost:8545');

export const rateContract = new ethers.Contract(rateAddress, rateABI, provider);

export async function getCurrentRates(): Promise<Rate[]> {
  const rates = await rateContract.getRates(compoundAddress, makerDAOAddress);
  return [
    {
      protocol: Protocol[0],
      apy: rates[Protocol.Compound].toString(),
      timestamp: await getCurrentBlockTimestamp()
    },
    {
      protocol: Protocol[1],
      apy: rates[Protocol.MakerDAO].toString(),
      timestamp: await getCurrentBlockTimestamp()
    }
  ];
}

export async function getHistoricalRate(protocol: Protocol): Promise<Rate[]> {
  const url = `http://localhost:8000/rates/historical?protocol=${Protocol[protocol].toLowerCase()}`;
  const { data } = await axios.get<Rate[]>(url);
  return data;
}

const getCurrentBlockTimestamp = async () => {
  const currentBlockNumber = await provider.getBlockNumber();
  const currentBlock = await provider.getBlock(currentBlockNumber);
  return currentBlock.timestamp * 1000;
}
