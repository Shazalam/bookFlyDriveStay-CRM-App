import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface Booking {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  rentalCompany: string;
  confirmationNumber: string;
  vehicleImage: string;
  total: number;
  mco: number;
  payableAtPickup: number;
  pickupDate: string;
  dropoffDate: string;
  pickupTime: string;
  dropoffTime: string;
  pickupLocation: string;
  dropoffLocation: string;
  cardLast4: string;
  expiration: string;
  billingAddress: string;
  salesAgent: string;
  status: "BOOKED" | "MODIFIED" | "CANCELLED";
  createdAt: string;
  timeline?: { date: string; message: string }[];
}

interface BookingState {
  currentBooking: Booking | null;
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  currentBooking: null,
  loading: false,
  error: null,
};

// thunk
export const fetchBookingById = createAsyncThunk<
  Booking,
  string,
  { rejectValue: string }
>("booking/fetchById", async (id, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/bookings/${id}`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to load booking");
    const data = await res.json();
    return data.booking as Booking;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error loading booking";
    return rejectWithValue(message);
  }
});

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearBooking: (state) => {
      state.currentBooking = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.currentBooking = action.payload;
        state.loading = false;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.error = action.payload || "Failed to fetch booking";
        state.loading = false;
      });
  },
});

export const { clearBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
