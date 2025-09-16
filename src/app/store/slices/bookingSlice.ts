// bookingSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface Booking {
  _id?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  rentalCompany: string;
  confirmationNumber: string;
  vehicleImage: string;
  total: string;
  mco: string;
  payableAtPickup: string;
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
  dateOfBirth: string;
  status: "BOOKED" | "MODIFIED" | "CANCELLED";
  createdAt: string;
  modificationFee: { charge: string }[]; // Change to array
  timeline?: {
    date: string;
    message: string;
    agentName: string;
    changes: { text: string }[];
  }[];
}

interface BookingState {
  currentBooking: Booking | null;
  loading: boolean;
  error: string | null;
  operation: "idle" | "pending" | "succeeded" | "failed";
}

const initialState: BookingState = {
  currentBooking: null,
  loading: false,
  error: null,
  operation: "idle",
};

// Async thunk for saving/updating booking
export const saveBooking = createAsyncThunk<
  Booking,
  { formData: Partial<Booking>; id?: string },
  { rejectValue: string }
>("booking/save", async ({ formData, id }, { rejectWithValue }) => {
  try {
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/bookings/${id}` : "/api/bookings";

    // For updates, remove _id from the data
    const dataToSend = id ?
      Object.fromEntries(Object.entries(formData).filter(([key]) => key !== '_id')) :
      formData;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to save booking");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error saving booking";
    return rejectWithValue(message);
  }
});

// Async thunk for fetching booking by ID
export const fetchBookingById = createAsyncThunk<
  Booking,
  string,
  { rejectValue: string }
>("booking/fetchById", async (id, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/bookings/${id}`, { credentials: "include" });

    if (!res.ok) {
      throw new Error("Failed to load booking");
    }

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
      state.operation = "idle";
    },
    resetOperationStatus: (state) => {
      state.operation = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Save booking cases
      .addCase(saveBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.operation = "pending";
      })
      .addCase(saveBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.currentBooking = action.payload;
        state.loading = false;
        state.operation = "succeeded";
      })
      .addCase(saveBooking.rejected, (state, action) => {
        state.error = action.payload || "Failed to save booking";
        state.loading = false;
        state.operation = "failed";
      })
      // Fetch booking cases
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

export const { clearBooking, resetOperationStatus } = bookingSlice.actions;
export default bookingSlice.reducer;