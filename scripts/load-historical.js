const fs = require('fs');
const path = require('path');
const ethers = require('ethers');
const { Client } = require('pg');

const LAST_128_BLOCKS = 115 ;

const ethMantissa = 1e18;
const blocksPerDay = 4 * 60 * 24;
const daysPerYear = 365;

const provider = new ethers.providers.JsonRpcProvider('https://eth.coincircle.com');

// compound
const compoundAddress = "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643";
const compoundABIPath = path.join(__dirname, '..', 'contracts', 'compound.abi');
const compoundABIJson = JSON.parse(fs.readFileSync(compoundABIPath, 'utf8'));
const compoundContract = new ethers.Contract(compoundAddress, compoundABIJson, provider);

// Maker DAO - DSR
const dsrAddress = "0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7";
const dsrABIPath = path.join(__dirname, '..', 'contracts', 'pot.abi');
const dsrABIJson = JSON.parse(fs.readFileSync(dsrABIPath, 'utf8'));
const dsrContract = new ethers.Contract(dsrAddress, dsrABIJson, provider);


// TODO use env var instead.
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'rates',
  password: 'dsr',
  port: 5432,
});

const main = async function() {
  const currentBlockNumber = await provider.getBlockNumber();

  const compoundRatesPromises = [];
  const dsrRatesPromises = [];

  const previousBlocksPromises = [];

  for (let block = 0; block <= LAST_128_BLOCKS; block++) {
    const blockAgo = currentBlockNumber - block;

    const compoundRatePromise = compoundContract.supplyRatePerBlock({ blockTag: blockAgo });
    const dsrRatePromise = dsrContract.dsr({ blockTag: blockAgo });

    compoundRatesPromises.push(compoundRatePromise);
    dsrRatesPromises.push(dsrRatePromise)

    previousBlocksPromises.push(provider.getBlock(blockAgo));
  }

  console.log(`Requesting historical supply rate for Compound`);
  const compoundBigNumberRates = await Promise.all(compoundRatesPromises);
  console.log(`Requesting historical supply rate for DSR`);
  const dsrBigNumberRates = await Promise.all(dsrRatesPromises);

  const compoundRates = compoundBigNumberRates.map(rate => +ethers.BigNumber.from(rate).toString());
  console.log(`Received Compound historical rates`);

  const dsrRates = dsrBigNumberRates.map(rate => +ethers.BigNumber.from(rate).toString());
  console.log(`Received DSR historical rates`);

  const previousBlocks = await Promise.all(previousBlocksPromises);
  const blockTimestamps = previousBlocks.map(block => new Date(block.timestamp * 1000));

  client.connect();

  const compoundInsertParam = compoundRates.map((rate, index) => {
    const queryStatement = 'INSERT INTO rates(protocol, rate, ts) VALUES ($1, $2, $3)';
    const values = ['compound', calSupplyAPY(rate), blockTimestamps[index]];
    return client.query(queryStatement, values);
  });

  const dsrInsertParam = dsrRates.map((rate, index) => {
    const queryStatement = 'INSERT INTO rates(protocol, rate, ts) VALUES ($1, $2, $3)';
    const values = ['dsr', calDsrAPY(rate), blockTimestamps[index]];
    return client.query(queryStatement, values);
  });

  console.log("Inserting rates...");
  await Promise.all(compoundInsertParam);
  await Promise.all(dsrInsertParam);
  console.log("Successfully inserted rates.");

  client.end()
}

const calSupplyAPY = (rate) => {
  return (((Math.pow((rate / ethMantissa * blocksPerDay) + 1, daysPerYear))) - 1) * 100;
}

const calDsrAPY = (rate) => {
  const dsr = rate / Math.pow(10, 27);
  const secondInYear = 60 * 60 * 24 * 365;
  return Math.pow(dsr, secondInYear);
}


main().catch(error => {
  console.log(error);
  client.end()
});
