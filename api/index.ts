import express from 'express';
import fs from 'fs';
import path from 'path';
import Cors from 'cors';
import { ethers } from 'ethers';
import { Client } from 'pg';

import Utils from './utils';

const compoundAddress = "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643";
const abiPath = path.join(__dirname, '..', 'contracts', 'compound.abi');
const compoundABIJson = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
const provider = new ethers.providers.JsonRpcProvider('https://eth.coincircle.com');
const contract = new ethers.Contract(compoundAddress, compoundABIJson, provider);

// TODO use env var instead.
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'rates',
  password: 'dsr',
  port: 5432,
});

client.connect();

const app = express();
const port = 8000;

const server = app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});

app.use(Cors());

app.get('/', (req, res) => res.send('Hello there!'));

app.get('/rates/current', async (req, res) => {
  try {
    const currentBigNumberRate = await contract.supplyRatePerBlock();
    const currentBlockNumber = await provider.getBlockNumber();
    const currentBlock = await provider.getBlock(currentBlockNumber);
    const bigNumberRate = +ethers.BigNumber.from(currentBigNumberRate).toString()
    const currentRate = {
      protocol: 'compound', // TODO needs to be dynamic
      rate: Utils.calSupplyAPY(bigNumberRate),
      timestamp: new Date(currentBlock.timestamp * 1000)
    };
    res.status(200).json(currentRate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
})

app.get('/rates/historical', async (req, res) => {
  try {
    const queryResult = await client.query("SELECT * FROM rates ORDER BY ts DESC LIMIT 128");
    const rates = queryResult.rows.map(row => {
      return {
        id: row.id,
        protocol: 'compound',
        rate: Utils.calSupplyAPY(+row.rate),
        timestamp: new Date(row.ts)
      }
    })
    res.status(200).json(rates);
  } catch(error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

process.on('SIGTERM', () => {
  console.log("SIGTERM received. Cleaning up...")
  server.close();
  client.end()
});
