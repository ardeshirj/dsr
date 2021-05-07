import express from 'express';

const app = express();
const PORT = 8000;

app.get('/', (req, res) => res.send('Express + TypeScript Server!'));

app.get('/rates/current', (req, res) => {
  res.send("rates/current");
})

app.get('/rates/historical', (req, res) => {
  res.send("rates/historical");
})

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
