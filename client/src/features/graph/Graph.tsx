import { Line } from 'react-chartjs-2';
import { Rate } from "../../services/rate.service";

interface Props {
  compoundRates: Rate[];
  dsrRates: Rate[];
  bzxRates: Rate[];
}

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
      min: -5,
      max: 20,
      ticks: {
        stepSize: 0.25
      }
    },
  },
};

export default function Graph({
  compoundRates,
  dsrRates,
  bzxRates
}: Props) {
  const linesData = {
    labels: rateTimestampLabels(compoundRates),
    datasets: [
      {
        label: 'Compound Rate',
        data:  compoundRates.map(rate => rate.apy),
        fill: false,
        // TODO: Replace rgb with COLORS.GREEN, etc...
        borderColor: 'rgb(0,128,0)',
        backgroundColor: 'rgb(0,128,0,0.5)',
        tension: 0.1
      },
      {
        label: 'DSR Rate',
        data: dsrRates.map(rate => rate.apy),
        fill: false,
        // TODO: Replace rgb with COLORS.GREEN, etc...
        borderColor: 'rgb(230,230,0)',
        backgroundColor: 'rgb(230,230,0.5)',
        tension: 0.1
      },
      {
        label: 'bZx Rate',
        data: bzxRates.map(rate => rate.apy),
        fill: false,
        // TODO: Replace rgb with COLORS.GREEN, etc...
        borderColor: 'rgb(0,0,255)',
        backgroundColor: 'rgb(0,0,255,0.5)',
        tension: 0.1
      },
    ],
  };

  return (
    <div>
      <h1>DIA Rates (Last 30 minutes)</h1>
      <h3>Automatically will update on new interest rate</h3>
      <Line type="line" data={linesData} options={graphOptions}/>
    </div>
  )
}

const rateTimestampLabels = (rates: Rate[]) => {
  console.log(rates);
  return rates
    .slice()
    .reverse()
    .map(rate => {
      const rateTime = new Date(rate.timestamp);
      return rateTime.getHours() + ":" + rateTime.getMinutes();
    });
}
