import { Line } from 'react-chartjs-2';
import { Rate } from "../../services/rate.service";

interface Props {
  isLoading: boolean;
  rates: Rate[];
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
  rates,
}: Props) {

  const rateLabels = rates
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
        data:  rates.map(rate => rate.apy),
        fill: false,
        // TODO: Replace rgb with COLORS.GREEN, etc...
        borderColor: 'rgb(0,128,0)',
        backgroundColor: 'rgb(0,128,0, 0.5)',
        tension: 0.1
      },
    ],
  };

  return (
    <>
      {
        !isLoading ?
        <div>
          <h1>DIA Rates (30 minutes)</h1>
          <h3>Automatically will update on new interest rate</h3>
          <Line type="line" data={data} options={graphOptions}/>
        </div> :
        <div>Loading...</div>
      }
    </>
  )
}
