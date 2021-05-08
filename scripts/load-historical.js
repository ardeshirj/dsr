const fs = require('fs');
const path = require('path');
const ethers = require('ethers');
const { Client } = require('pg');

const LAST_128_BLOCKS = 127;

const compoundAddress = "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643";
const abiPath = path.join(__dirname, '..', 'contracts', 'compound.abi');
const compoundABIJson = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
const provider = new ethers.providers.JsonRpcProvider('https://eth.coincircle.com');
const contract = new ethers.Contract(compoundAddress, compoundABIJson, provider);

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'rates',
  password: 'dsr',
  port: 5432,
});

const main = async function() {
  const currentBlockNumber = await provider.getBlockNumber();
  console.log(currentBlockNumber);

  const ratesPromises = [];
  const previousBlocksPromises = [];
  for (let block = 0; block <= LAST_128_BLOCKS; block++) {
    const blockAgo = currentBlockNumber - block;
    const ratePromise = contract.supplyRatePerBlock({ blockTag: blockAgo })
    ratesPromises.push(ratePromise);
    previousBlocksPromises.push(provider.getBlock(blockAgo));
  }

  console.log(`Request supply rate for last ${LAST_128_BLOCKS + 1} block`)
  const bigNumberRates = await Promise.all(ratesPromises);
  const previousBlocks = await Promise.all(previousBlocksPromises);
  console.log(`Received supply rates for last ${LAST_128_BLOCKS + 1}`);

  const rates = bigNumberRates.map(rate => ethers.BigNumber.from(rate).toString());
  const blockTimestamps = previousBlocks.map(block => new Date(block.timestamp * 1000));

  client.connect();

  const insertPromises = rates.map((rate, index) => {
    const queryStatement = 'INSERT INTO rates(protocol, rate, ts) VALUES ($1, $2, $3)';
    const values = ['compound', rate, blockTimestamps[index]];
    return client.query(queryStatement, values);
  });

  console.log("Inserting rates...");
  const insertResponses = await Promise.all(insertPromises);
  console.log("Successfully inserted rates...");
  console.log(insertResponses[0]);

  client.end()
}

main().catch(error => {
  console.log(error);
  client.end()
});
