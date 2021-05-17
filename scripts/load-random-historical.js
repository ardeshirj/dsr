const ethers = require('ethers');
const { Client } = require('pg');

const LAST_128_BLOCKS = 120 ;

const Protocols = Object.freeze({
  "Compound": 1,
  "MakerDAO": 2
});

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_ENDPOINT);

const client = new Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: Number(process.env.PG_PORT),
});

const main = async function() {
  const currentBlockNumber = await provider.getBlockNumber();

  const previousBlocksPromises = [];
  for (let block = 0; block <= LAST_128_BLOCKS; block++) {
    const blockAgo = currentBlockNumber - block;
    previousBlocksPromises.push(provider.getBlock(blockAgo));
  }

  console.log("Requesting previous blocks data")
  const previousBlocks = await Promise.all(previousBlocksPromises);
  const blockTimestamps = previousBlocks.map(block => block.timestamp * 1000);
  console.log("Received block data");

  client.connect();

  console.log("Inserting rates...");
  await insertRateToDB(Protocols.Compound, blockTimestamps);
  await insertRateToDB(Protocols.MakerDAO, blockTimestamps);
  console.log("Successfully inserted rates.");

  client.end()
}

const insertRateToDB = async (protocol, blockTimestamps) => {
  const insertStatements = blockTimestamps.map(timestamp => {
    const queryStatement = 'INSERT INTO rates(protocol, apy, ts) VALUES ($1, $2, $3)';

    let values;
    switch (protocol) {
      case Protocols.Compound:
        values = ['Compound', calCompoundAPY(), timestamp];
        break;
      case Protocols.MakerDAO:
        values = ['MakerDAO', calMakerDaoAPY(), timestamp];
        break;
      default:
        throw Error(`Unknown protocol: ${protocol}`);
    }

    return client.query(queryStatement, values);
  });

  return await Promise.all(insertStatements);
}

const calCompoundAPY = (rawRate) => {
  return Math.random() * (4 - 3) + 3;
}

const calMakerDaoAPY = (rawRate) => {
  return Math.random() * (2 - 1) + 1;
}

try {
  main();
} catch(error) {
  console.log(error);
  client.end()
}
