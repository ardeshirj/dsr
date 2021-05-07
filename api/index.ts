import express from 'express';
import fs from 'fs';
import { ethers } from 'ethers';

const compoundAddress = "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643";
const compoundABIJson = JSON.parse(fs.readFileSync('./contracts/compound.abi', 'utf8'));
const provider = new ethers.providers.JsonRpcProvider('https://eth.coincircle.com');
const contract = new ethers.Contract(compoundAddress, compoundABIJson, provider);

const app = express();
const PORT = 8000;

app.get('/', (req, res) => res.send('Express + TypeScript Server!'));

app.get('/rates/current', async (req, res) => {
  const currentRate = await contract.supplyRatePerBlock();
  res.send(`Current Rate is: ${ethers.BigNumber.from(currentRate).toString()}`);
})

app.get('/rates/historical', async (req, res) => {
  res.send(`Historical Rages are: ...`);
})

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
