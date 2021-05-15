import { Line } from 'react-chartjs-2';
import { Rate } from "../../services/rate.service";

interface Props {
  compoundRates: Rate[];
  makeDaoRates: Rate[];
  error: String
}

const COLORS = {
  green: 'rgb(0,128,0)',
  lighterGreen: 'rgb(0,128,0,0.5)',
  yellow: 'rgb(230,230,0)',
  lighterYellow: 'rgb(230,230,0.5)'
}

export default function Graph({
  compoundRates,
  makeDaoRates,
  error
}: Props) {

  const combinedAPY = compoundRates.concat(makeDaoRates).map(rate => rate.apy);
  const max = Math.max(...combinedAPY);
  const min = Math.min(...combinedAPY);

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
          text: "Rate (% APY)",
          display: true
        },
        min: min - 1,
        max: max + 1,
        ticks: {
          stepSize: max / 3
        }
      },
    },
  };

  const linesData = {
    labels: rateTimestampLabels(compoundRates),
    datasets: [
      {
        label: 'Compound',
        data:  compoundRates.map(rate => rate.apy),
        fill: false,
        borderColor: COLORS.green,
        backgroundColor: COLORS.lighterGreen,
        tension: 0.1
      },
      {
        label: 'MakerDAO',
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
      {
        error ?
          <div>Error loading historical rates: {error} </div> :
          <Line type="line" data={linesData} options={graphOptions}/>
      }
    </div>
  )
}

const rateTimestampLabels = (rates: Rate[]) => {
  return rates.map(rate => {
    const date = new Date(rate.timestamp);
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  });
}
