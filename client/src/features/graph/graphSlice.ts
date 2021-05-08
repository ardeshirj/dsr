import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '../../app/store';
import { getCurrentRate, Rate } from '../../services/rates';

interface GraphState {
  isLoading: boolean;
  rates: Rate[] | null;
  error: string | null;
}

export const initialState: GraphState = {
  isLoading: false,
  rates: null,
  error: null
};

export const graphSlice = createSlice({
  name: 'rates',
  initialState,
  reducers: {
    loadCurrentRate: (state, action: PayloadAction<string>) => {
      state.isLoading = true;
      state.error = null;
    },
    getCurrentRateSuccess: (state, action: PayloadAction<Rate[]>) => {
      state.isLoading = false;
      state.rates = action.payload;
      state.error = null;
    },
    getCurrentRateFailed: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload
    }
  },
});

export const {
  loadCurrentRate,
  getCurrentRateSuccess,
  getCurrentRateFailed
} = graphSlice.actions;

export const selectLocation = (state: RootState) => state.graph.rates;

export default graphSlice.reducer;

export const fetchRates = (): AppThunk => async dispatch => {
  try {
    const rates = await getCurrentRate();
    dispatch(getCurrentRateSuccess(rates));
  } catch (error) {
    dispatch(getCurrentRateFailed(error.toString()));
  }
}
