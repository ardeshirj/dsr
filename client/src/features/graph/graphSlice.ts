import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../../app/store';
import { getHistoricalRate, getCurrentRates, Protocol, Rate } from '../../services/rate.service';

interface GraphState {
  isLoading: boolean;
  compoundRates: Rate[],
  makerDaoRates: Rate[],
  error: string;
}

export const initialState: GraphState = {
  isLoading: false,
  compoundRates: [],
  makerDaoRates: [],
  error: null
};

export const graphSlice = createSlice({
  name: 'rates',
  initialState,
  reducers: {
    fetchRate: (state) => {
      state.isLoading = true;
      state.compoundRates = [];
      state.error = null;
    },
    fetchRateFailed: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload
    },
    // Compound
    fetchedCompoundCurrentRate: (state, action: PayloadAction<Rate>) => {
      state.isLoading = isLoading(state);
      state.compoundRates = state.compoundRates.concat(action.payload);
      state.error = null;
    },
    fetchedCompoundHistoricalRate: (state, action: PayloadAction<Rate[]>) => {
      state.isLoading = isLoading(state);
      state.compoundRates = action.payload;
      state.error = null;
    },
    // MakeDao
    fetchedDSRCurrentRate: (state, action: PayloadAction<Rate>) => {
      state.isLoading = isLoading(state);
      state.makerDaoRates = state.makerDaoRates.concat(action.payload);
      state.error = null;
    },
    fetchedDSRHistoricalRate: (state, action: PayloadAction<Rate[]>) => {
      state.isLoading = isLoading(state);
      state.makerDaoRates = action.payload;
      state.error = null;
    },
  },
});

const isLoading = (state: GraphState) => {
  return state.compoundRates &&
    state.compoundRates.length === 0 &&
    state.makerDaoRates &&
    state.makerDaoRates.length === 0;
}

export const {
  fetchRate,
  fetchRateFailed,
  // compound
  fetchedCompoundCurrentRate,
  fetchedCompoundHistoricalRate,
  // MakeDao
  fetchedDSRCurrentRate,
  fetchedDSRHistoricalRate,
} = graphSlice.actions;

export default graphSlice.reducer;

  export const fetchCurrentRates = (): AppThunk => async dispatch => {
  try {
    const currentRate = await getCurrentRates();
    dispatch(fetchedCompoundCurrentRate(currentRate[0]));
    dispatch(fetchedDSRCurrentRate(currentRate[1]));
  } catch (error) {
    dispatch(fetchRateFailed(error.toString()));
  }
}

export const fetchHistoricalRate = (protocol: Protocol): AppThunk => async dispatch => {
  try {
    const historicalRates = await getHistoricalRate(protocol);

    switch (protocol) {
      case Protocol.Compound:
        dispatch(fetchedCompoundHistoricalRate(historicalRates));
        break;
      default:
        throw Error(`Unknown protocol value: ${protocol}`)
    }
  } catch (error) {
    dispatch(fetchRateFailed(error.toString()));
  }
}
