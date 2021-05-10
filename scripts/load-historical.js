const fs = require('fs');
const path = require('path');
const ethers = require('ethers');
const { Client } = require('pg');

const LAST_128_BLOCKS = 100 ;

const ethMantissa = 1e18;
const blocksPerDay = 4 * 60 * 24;
const daysPerYear = 365;

const provider = new ethers.providers.JsonRpcProvider('https://eth.coincircle.com');

// compound
const compoundAddress = "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643";
const compoundABIPath = path.join(__dirname, '..', 'abi', 'compound.abi');
const compoundABIJson = JSON.parse(fs.readFileSync(compoundABIPath, 'utf8'));
const compoundContract = new ethers.Contract(compoundAddress, compoundABIJson, provider);

// Maker DAO - DSR
const dsrAddress = "0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7";
const dsrABIPath = path.join(__dirname, '..', 'abi', 'dsr.abi');
const dsrABIJson = JSON.parse(fs.readFileSync(dsrABIPath, 'utf8'));
const dsrContract = new ethers.Contract(dsrAddress, dsrABIJson, provider);

// bZx
const bzxAddress = "0x6b093998D36f2C7F0cc359441FBB24CC629D5FF0";
const bzxABIPath = path.join(__dirname, '..', 'abi', 'bzx.abi');
const bzxABIJson = JSON.parse(fs.readFileSync(bzxABIPath, 'utf8')).abi;
const bzxContract = new ethers.Contract(bzxAddress, bzxABIJson, provider);

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

  const compoundRatePromises = [];
  const dsrRatePromises = [];
  const bzxRatePromises = [];

  const previousBlocksPromises = [];

  for (let block = 0; block <= LAST_128_BLOCKS; block++) {
    const blockAgo = currentBlockNumber - block;

    const compoundRatePromise = compoundContract.supplyRatePerBlock({ blockTag: blockAgo });
    const dsrRatePromise = dsrContract.dsr({ blockTag: blockAgo });
    const bzxRatePromise = bzxContract.supplyInterestRate({ blockTag: blockAgo });

    compoundRatePromises.push(compoundRatePromise);
    dsrRatePromises.push(dsrRatePromise);
    bzxRatePromises.push(bzxRatePromise);

    previousBlocksPromises.push(provider.getBlock(blockAgo));
  }

  console.log(`Requesting historical supply rate for Compound`);
  const compoundBigNumberRates = await Promise.all(compoundRatePromises);
  const compoundRates = compoundBigNumberRates.map(rate => +ethers.BigNumber.from(rate).toString());
  console.log(`Received Compound historical rates`);

  console.log(`Requesting historical supply rate for DSR`);
  const dsrBigNumberRates = await Promise.all(dsrRatePromises);
  const dsrRates = dsrBigNumberRates.map(rate => ethers.utils.formatEther(rate));
  console.log(`Received DSR historical rates`);

  console.log(`Requesting historical supply rate for BZX`);
  const bzxBigNumberRates = await Promise.all(bzxRatePromises);
  const bzxRates = bzxBigNumberRates.map(rate => ethers.utils.formatEther(rate));
  console.log(`Received BZX historical rates`);

  const previousBlocks = await Promise.all(previousBlocksPromises);
  const blockTimestamps = previousBlocks.map(block => new Date(block.timestamp * 1000));

  client.connect();

  const compoundInsertStatements = compoundRates.map((rate, index) => {
    const queryStatement = 'INSERT INTO rates(protocol, rate, ts) VALUES ($1, $2, $3)';
    const values = ['compound', calSupplyAPY(rate), blockTimestamps[index]];
    return client.query(queryStatement, values);
  });

  const dsrInsertStatements = dsrRates.map((rate, index) => {
    const queryStatement = 'INSERT INTO rates(protocol, rate, ts) VALUES ($1, $2, $3)';
    const values = ['dsr', calDsrAPY(rate), blockTimestamps[index]];
    return client.query(queryStatement, values);
  });

  const bzxInsertStatements = bzxRates.map((rate, index) => {
    const queryStatement = 'INSERT INTO rates(protocol, rate, ts) VALUES ($1, $2, $3)';
    const values = ['bzx', rate, blockTimestamps[index]];
    return client.query(queryStatement, values);
  });

  console.log("Inserting rates...");
  await Promise.all(compoundInsertStatements);
  await Promise.all(dsrInsertStatements);
  await Promise.all(bzxInsertStatements);
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
