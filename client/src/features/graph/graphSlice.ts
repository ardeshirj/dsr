import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../../app/store';
import { getCurrentRate, getHistoricalRate, Rate } from '../../services/rate.service';

interface GraphState {
  isLoading: boolean;
  rates: Rate[],
  error: string;
}

export const initialState: GraphState = {
  isLoading: false,
  rates: [],
  error: null
};

export const graphSlice = createSlice({
  name: 'rates',
  initialState,
  reducers: {
    requestRate: (state) => {
      state.isLoading = true;
      state.rates = [];
      state.error = null;
    },
    getCurrentRateSuccess: (state, action: PayloadAction<Rate>) => {
      state.isLoading = !(state.rates && state.rates.length > 0);
      state.rates = state.rates.concat(action.payload);
      state.error = null;
    },
    getHistoricalRateSuccess: (state, action: PayloadAction<Rate[]>) => {
      state.isLoading = !(state.rates && state.rates.length > 0);
      state.rates = action.payload;
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
