import axios from 'axios';

export interface Rate {
  id?: number,
  protocol: string,
  rate: number,
  ts: Date
}

export async function getCurrentRate(): Promise<Rate> {
  const url = `http://localhost:8000/rates/current`;
  const { data } = await axios.get<Rate>(url);
  return data;
}

export async function getHistoricalRate(): Promise<Rate[]> {
  const url = `http://localhost:8000/rates/historical`;
  const { data } = await axios.get<Rate[]>(url);
  return data;
}
