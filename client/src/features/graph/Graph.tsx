import { Line } from 'react-chartjs-2';
import { Rate } from "../../services/rate.service";

interface Props {
  isLoading: boolean;
  error: string | null;
  currentRate: Rate | null;
  historicalRates: Rate[];
}

const graphOptions = {
  elements: {
    point: {
      radius: 0
    }
  },
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
        },
      },
    ],
  },
};

export default function Graph({
  isLoading,
  error,
  currentRate,
  historicalRates
}: Props) {

  const rateLabels = historicalRates
    .slice()
    .reverse()
    .map(rate => {
      const rateTime = new Date(rate.timestamp);
      return rateTime.getHours() + ":" + rateTime.getMinutes();
    });

  const data = {
    labels: rateLabels,
    datasets: [
      {
        label: 'Compound Rate',
        data:  historicalRates.map(rate => rate.rate),
        fill: false,
        borderColor: 'rgb(0,128,0)',
        backgroundColor: 'rgb(0,128,0, 0.5)',
        tension: 0.1
      },
    ],
  };

  return (
    <div>
      <h1>DIA Rates (30 minutes)</h1>
      <Line type="line" data={data} options={graphOptions}/>
    </div>
  )
}
