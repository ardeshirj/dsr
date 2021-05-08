import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '../../app/store';
import { getCurrentRate, getHistoricalRate, Rate } from '../../services/rate.service';

interface GraphState {
  isLoading: boolean;
  currentRate: Rate | null,
  historicalRates: Rate[];
  error: string | null;
}

export const initialState: GraphState = {
  isLoading: false,
  currentRate: null,
  historicalRates: [],
  error: null
};

export const graphSlice = createSlice({
  name: 'rates',
  initialState,
  reducers: {
    requestRate: (state) => {
      state.isLoading = true;
      state.currentRate = null;
      state.historicalRates = [];
      state.error = null;
    },
    getCurrentRateSuccess: (state, action: PayloadAction<Rate>) => {
      state.isLoading = false;
      state.currentRate = action.payload;
      state.error = null;
    },
    getHistoricalRateSuccess: (state, action: PayloadAction<Rate[]>) => {
      state.isLoading = false;
      state.historicalRates = action.payload;
      state.error = null;
    },
    getRateFailed: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload
    },
  },
});

export const {
  requestRate,
  getCurrentRateSuccess,
  getHistoricalRateSuccess,
  getRateFailed
} = graphSlice.actions;

export const selectCurrentRate = (state: RootState) => state.graph.currentRate;
export const selectHistoricalRate = (state: RootState) => state.graph.historicalRates;

export default graphSlice.reducer;

export const fetchCurrentRate = (): AppThunk => async dispatch => {
  try {
    const currentRate = await getCurrentRate();
    dispatch(getCurrentRateSuccess(currentRate));
  } catch (error) {
    dispatch(getRateFailed(error.toString()));
  }
}

export const fetchHistoricalRate = (): AppThunk => async dispatch => {
  try {
    const historicalRates = await getHistoricalRate();
    dispatch(getHistoricalRateSuccess(historicalRates));
  } catch (error) {
    dispatch(getRateFailed(error.toString()));
  }
}
