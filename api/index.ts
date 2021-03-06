import express from 'express';
import Cors from 'cors';
import { Client } from 'pg';

const client = new Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: Number(process.env.PG_PORT),
});

client.connect();

const app = express();
const port = 8000;

const server = app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});

app.use(Cors());

app.get('/', (req, res) => res.send('Hello there!'));

app.get('/rates/historical', async (req, res) => {
  try {
    const query = {
      text: "SELECT * FROM rates WHERE protocol = $1 ORDER BY ts ASC LIMIT 128",
      values: [req.query.protocol]
    }

    const queryResult = await client.query(query);
    const rates = queryResult.rows.map(row => {
      return {
        id: row.id,
        protocol: row.protocol,
        apy: +row.apy,
        timestamp: +row.ts
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
