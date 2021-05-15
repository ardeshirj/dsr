const fs = require('fs');
const path = require('path');
const ethers = require('ethers');
const { Client } = require('pg');

const LAST_128_BLOCKS = 120 ;

const Protocols = Object.freeze({
  "Compound": 1,
  "MakerDAO": 2
});

const provider = new ethers.providers.JsonRpcProvider('https://eth-testnet.coincircle.com');

// Compound
const compoundAddress = "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643";
const compoundABIPath = path.join(__dirname, 'abi', 'compound.abi');
const compoundABIJson = JSON.parse(fs.readFileSync(compoundABIPath, 'utf8'));
const compoundContract = new ethers.Contract(compoundAddress, compoundABIJson, provider);

// Maker DAO - DSR
const makerDaoAddress = "0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7";
const makerDaoABIPath = path.join(__dirname, 'abi', 'makerDAO.abi');
const makerDaoABIJson = JSON.parse(fs.readFileSync(makerDaoABIPath, 'utf8'));
const makerDaoContract = new ethers.Contract(makerDaoAddress, makerDaoABIJson, provider);

const client = new Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: Number(process.env.PG_PORT),
});

const main = async function() {
  const currentBlockNumber = await provider.getBlockNumber();

  const compoundRatePromises = [];
  const makerDaoRatePromises = [];

  const previousBlocksPromises = [];

  for (let block = 0; block <= LAST_128_BLOCKS; block++) {
    const blockAgo = currentBlockNumber - block;

    const compoundRatePromise = compoundContract.supplyRatePerBlock({ blockTag: blockAgo });
    const makerDaoRatePromise = makerDaoContract.dsr({ blockTag: blockAgo });

    compoundRatePromises.push(compoundRatePromise);
    makerDaoRatePromises.push(makerDaoRatePromise);

    previousBlocksPromises.push(provider.getBlock(blockAgo));
  }

  console.log("Requesting historical supply rate for Compound");
  const compoundRates = await getProtocolHistoricalRates(compoundRatePromises);
  console.log("Received Compound historical rates");

  console.log("Requesting historical supply rate for MakerDAO");
  const makerDaoRates = await getProtocolHistoricalRates(makerDaoRatePromises);
  console.log("Received DSR historical rates");

  console.log("Requesting previous blocks data")
  const previousBlocks = await Promise.all(previousBlocksPromises);
  const blockTimestamps = previousBlocks.map(block => block.timestamp * 1000);
  console.log("Received block data");

  client.connect();

  console.log("Inserting rates...");
  await insertRateToDB(Protocols.Compound, compoundRates, blockTimestamps);
  await insertRateToDB(Protocols.MakerDAO, makerDaoRates, blockTimestamps);
  console.log("Successfully inserted rates.");

  client.end()
}

const getProtocolHistoricalRates = async (ratePromises) => {
  const bigNumberRates = await Promise.all(ratePromises);
  return bigNumberRates.map(rate => +ethers.BigNumber.from(rate).toString());
}

const insertRateToDB = async (protocol, rowRates, blockTimestamps) => {
  const insertStatements = rowRates.map((rawRate, index) => {
    const queryStatement = 'INSERT INTO rates(protocol, apy, ts) VALUES ($1, $2, $3)';

    let values;
    switch (protocol) {
      case Protocols.Compound:
        values = ['Compound', calCompoundAPY(rawRate), blockTimestamps[index]];
        break;
      case Protocols.MakerDAO:
        values = ['MakerDAO', calMakerDaoAPY(rawRate), blockTimestamps[index]];
        break;
      default:
        throw Error(`Unknown protocol: ${protocol}`);
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

const calMakerDaoAPY = (rawRate) => {
  const rate = rawRate / Math.pow(10, 27);
  const secondsInYear = 60 * 60 * 24 * 365;
  return Math.pow(rate, secondsInYear);
}

try {
  main();
} catch(error) {
  console.log(error);
  client.end()
}
