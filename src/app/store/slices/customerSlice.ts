import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface CustomerLocation {
  country: string;
  region: string;
  city: string;
  zipcode: string;
}

export interface Customer {
  _id: string;
  ip: string;
  sessionId: string;
  device: string;
  browser: string;
  os: string;
  bookingId: string;
  location: CustomerLocation;
  acknowledged: boolean;
  frontImage: string;
  backImage: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Matches your ApiResponse<T> shape from backend
interface ApiResponseCustomer {
  status: 'success' | 'error' | 'validation_error' | 'authentication_error' | 'authorization_error' | 'not_found' | 'rate_limited' | 'server_error';
  message: string;
  data?: {
    customer: Customer;
  };
  error?: {
    code: string;
    details?: unknown;
    stack?: string;
  };
}

interface CustomerState {
  customer: Customer | null;
  loading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  customer: null,
  loading: false,
  error: null,
};

// Async thunk to fetch customer by bookingId
export const fetchCustomerById = createAsyncThunk<
  Customer,              // return type
  string,                // argument type (bookingId)
  { rejectValue: string } // rejectWithValue type
>(
  'customer/fetchCustomerById',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://www.nationfirstchoice.com/api/customers/${bookingId}`);
      console.log("response =", response)
      if (!response.ok) {
        // still try to read ApiResponse to get message
        let fallbackMessage = `Failed to fetch customer: ${response.status}`;
        try {
          const errorBody: ApiResponseCustomer = await response.json();
          fallbackMessage = errorBody.message || fallbackMessage;
        } catch {
          // ignore JSON parse errors
        }
        return rejectWithValue(fallbackMessage);
      }

      const data: ApiResponseCustomer = await response.json();

      if (data.status !== 'success' || !data.data?.customer) {
        const message =
          data.message || data.error?.code || 'Failed to fetch customer data';
        return rejectWithValue(message);
      }

      return data.data.customer;
    } catch (error: unknown) {
      let message = 'Failed to fetch customer data';
      if (error instanceof Error) message = error.message;
      return rejectWithValue(message);
    }
  }
);

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    clearCustomer(state) {
      state.customer = null;
      state.error = null;
    },
    resetCustomerError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCustomerById.fulfilled,
        (state, action: PayloadAction<Customer>) => {
          state.loading = false;
          state.customer = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch customer';
        state.customer = null;
      });
  },
});

export const { clearCustomer, resetCustomerError } = customerSlice.actions;
export default customerSlice.reducer;
