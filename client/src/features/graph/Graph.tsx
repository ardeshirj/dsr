import { Line } from 'react-chartjs-2';
import { Rate } from "../../services/rate.service";

interface Props {
  compoundRates: Rate[];
  makeDaoRates: Rate[];
}

const COLORS = {
  green: 'rgb(0,128,0)',
  lighterGreen: 'rgb(0,128,0,0.5)',
  yellow: 'rgb(230,230,0)',
  lighterYellow: 'rgb(230,230,0.5)'
}

export default function Graph({
  compoundRates,
  makeDaoRates
}: Props) {

  const combinedAPY = compoundRates.concat(makeDaoRates).map(rate => rate.apy);
  const max = Math.max(...combinedAPY) + 5;
  const min = Math.min(...combinedAPY) - 5;

  const graphOptions = {
    elements: {
      point: {
        radius: 0
      }
    },
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false
      },
    },
    scales: {
      xAxes: {
        title: {
          text: "Time",
          display: true
        }
      },
      yAxes: {
        title: {
          text: "Rate % APY",
          display: true
        },
        min: min,
        max: max,
        ticks: {
          stepSize: max / 5
        }
      },
    },
  };

  const linesData = {
    labels: rateTimestampLabels(compoundRates),
    datasets: [
      {
        label: 'Compound DAI Rate',
        data:  compoundRates.map(rate => rate.apy),
        fill: false,
        borderColor: COLORS.green,
        backgroundColor: COLORS.lighterGreen,
        tension: 0.1
      },
      {
        label: 'DSR DAI Rate',
        data: makeDaoRates.map(rate => rate.apy),
        fill: false,
        borderColor: COLORS.yellow,
        backgroundColor: COLORS.lighterYellow,
        tension: 0.1
      },
    ],
  };

  return (
    <div>
      <h1>On-Chain Protocols DAI Rates</h1>
      <h3>Automatically will update once new interest rate is received</h3>
      <Line type="line" data={linesData} options={graphOptions}/>
    </div>
  )
}

const rateTimestampLabels = (rates: Rate[]) => {
  const labelSet = new Set();

  rates.slice().forEach(rate => {
    const date = new Date(rate.timestamp);
    labelSet.add(date.getHours() + ":" + date.getMinutes());
  });

  return Array.from(labelSet);
}
