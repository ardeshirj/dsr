import { Rate } from "../../services/rate.service";

interface Props {
  isLoading: boolean;
  error: string | null;
  currentRate: Rate | null;
  historicalRates: Rate[];
}

export default function Graph({
  isLoading,
  error,
  currentRate,
  historicalRates
}: Props) {
  return (
    <div>
      <h1>Rates graph goes here!</h1>
    </div>
  )
}
