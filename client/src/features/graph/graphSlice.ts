import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../../app/store';
import { getHistoricalRate, getCurrentRate, Protocol, Rate } from '../../services/rate.service';

interface GraphState {
  isLoading: boolean;
  compoundRates: Rate[],
  dsrRates: Rate[],
  bzxRates: Rate[],
  error: string;
}

export const initialState: GraphState = {
  isLoading: false,
  compoundRates: [],
  dsrRates: [],
  bzxRates: [],
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
    // DSR
    fetchedDSRCurrentRate: (state, action: PayloadAction<Rate>) => {
      state.isLoading = isLoading(state);
      state.dsrRates = state.dsrRates.concat(action.payload);
      state.error = null;
    },
    fetchedDSRHistoricalRate: (state, action: PayloadAction<Rate[]>) => {
      state.isLoading = isLoading(state);
      state.dsrRates = action.payload;
      state.error = null;
    },
    // BZX
    fetchedBZXCurrentRate: (state, action: PayloadAction<Rate>) => {
      state.isLoading = isLoading(state);
      state.bzxRates = state.bzxRates.concat(action.payload);
      state.error = null;
    },
    fetchedBZXHistoricalRate: (state, action: PayloadAction<Rate[]>) => {
      state.isLoading = isLoading(state);
      state.bzxRates = action.payload;
      state.error = null;
    }
  },
});

const isLoading = (state: GraphState) => {
  return state.compoundRates &&
    state.compoundRates.length == 0 &&
    state.dsrRates &&
    state.dsrRates.length == 0 &&
    state.bzxRates &&
    state.bzxRates.length == 0
}

export const {
  fetchRate,
  fetchRateFailed,
  // compound
  fetchedCompoundCurrentRate,
  fetchedCompoundHistoricalRate,
  // DSR
  fetchedDSRCurrentRate,
  fetchedDSRHistoricalRate,
  // BZX
  fetchedBZXCurrentRate,
  fetchedBZXHistoricalRate,
} = graphSlice.actions;

export default graphSlice.reducer;

  export const fetchCurrentRate = (protocol: Protocol): AppThunk => async dispatch => {
  try {
    const currentRate = await getCurrentRate(protocol);

    switch (protocol) {
      case Protocol.Compound:
        dispatch(fetchedCompoundCurrentRate(currentRate));
        break;
      case Protocol.DSR:
        dispatch(fetchedDSRCurrentRate(currentRate));
        break;
      case Protocol.BZX:
        dispatch(fetchedBZXCurrentRate(currentRate));
        break;
      default:
        throw Error(`Unknown protocol value: ${protocol}`)
    }

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
      case Protocol.DSR:
        dispatch(fetchedDSRHistoricalRate(historicalRates));
        break;
      case Protocol.BZX:
        dispatch(fetchedBZXHistoricalRate(historicalRates));
        break;
      default:
        throw Error(`Unknown protocol value: ${protocol}`)
    }
  } catch (error) {
    dispatch(fetchRateFailed(error.toString()));
  }
}
