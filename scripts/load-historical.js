const fs = require('fs');
const path = require('path');
const ethers = require('ethers');
const { Client } = require('pg');

const LAST_128_BLOCKS = 20 ;

const Protocols = Object.freeze({
  "Compound": 1,
  "DSR": 2,
  "BZX": 3
});

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

  for (let block = 1; block <= LAST_128_BLOCKS; block++) {
    const blockAgo = currentBlockNumber - block;

    const compoundRatePromise = compoundContract.supplyRatePerBlock({ blockTag: blockAgo });
    const dsrRatePromise = dsrContract.dsr({ blockTag: blockAgo });
    const bzxRatePromise = bzxContract.supplyInterestRate({ blockTag: blockAgo });

    compoundRatePromises.push(compoundRatePromise);
    dsrRatePromises.push(dsrRatePromise);
    bzxRatePromises.push(bzxRatePromise);

    previousBlocksPromises.push(provider.getBlock(blockAgo));
  }

  console.log("Requesting historical supply rate for Compound");
  const compoundRates = await getProtocolHistoricalRates(compoundRatePromises);
  console.log("Received Compound historical rates");

  console.log("Requesting historical supply rate for DSR");
  const dsrRates = await getProtocolHistoricalRates(dsrRatePromises);
  console.log("Received DSR historical rates");

  console.log("Requesting historical supply rate for BZX");
  const bzxRates = await getProtocolHistoricalRates(bzxRatePromises);
  console.log("Received BZX historical rates");

  console.log("Requesting previous blocks data")
  const previousBlocks = await Promise.all(previousBlocksPromises);
  const blockTimestamps = previousBlocks.map(block => new Date(block.timestamp * 1000));
  console.log("Received block data");

  client.connect();

  console.log("Inserting rates...");
  await insertRateToDB(Protocols.Compound, compoundRates, blockTimestamps);
  await insertRateToDB(Protocols.DSR, dsrRates, blockTimestamps);
  await insertRateToDB(Protocols.BZX, bzxRates, blockTimestamps)
  console.log("Successfully inserted rates.");

  client.end()
}

const getProtocolHistoricalRates = async (ratePromises) => {
  const bigNumberRates = await Promise.all(ratePromises);
  return bigNumberRates.map(rate => +ethers.BigNumber.from(rate).toString());
}

const insertRateToDB = async (protocol, rowRates, blockTimestamps) => {
  const insertStatements = rowRates.map((rawRate, index) => {
    const queryStatement = 'INSERT INTO rates(protocol, rate, ts) VALUES ($1, $2, $3)';

    let values;
    switch (protocol) {
      case Protocols.Compound:
        values = ['compound', calCompoundAPY(rawRate), blockTimestamps[index]];
        break;
      case Protocols.DSR:
        values = ['dsr', calDsrAPY(rawRate), blockTimestamps[index]];
        break;
      case Protocols.BZX:
        values = ['bzx', calBzxAPY(rawRate), blockTimestamps[index]];
        break;
      default:
        throw error(`Unknown protocol: ${protocol}`);
    }

    return client.query(queryStatement, values);
  });

  return await Promise.all(insertStatements);
}

const calCompoundAPY = (rawRate) => {
  const ethMantissa = 1e18;
  const blocksPerDay = 4 * 60 * 24;
  const daysPerYear = 365;
  return (((Math.pow((rawRate / ethMantissa * blocksPerDay) + 1, daysPerYear))) - 1) * 100;
}

const calDsrAPY = (rawRate) => {
  const rate = rawRate / Math.pow(10, 27);
  const secondsInYear = 60 * 60 * 24 * 365;
  return Math.pow(rate, secondsInYear);
}

const calBzxAPY = (rawRate) => {
  return rawRate / Math.pow(10, 18);
}

try {
  main();
} catch(error) {
  console.log(error);
  client.end()
}
