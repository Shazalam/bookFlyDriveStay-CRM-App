import { handleAxiosError } from "@/lib/utils/handleAxiosError";
import { ApiResponse } from "@/types/api";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export interface RentalCompany {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface RentalCompanyState {
  rentalCompanies: RentalCompany[];
  loading: boolean;
  error: string | null;
}

const initialState: RentalCompanyState = {
  rentalCompanies: [],
  loading: false,
  error: null,
}

// Async thunk to fetch rental companies
export const fetchRentalCompanies = createAsyncThunk<
  RentalCompany[],           // return type
  void,                      // argument type
  { rejectValue: string }      // thunkAPI types
>(
  "rentalCompanies/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get<ApiResponse<RentalCompany[]>>("/api/rental-companies", {
        withCredentials: true,
      });

      if (!data.success) {
        return rejectWithValue(data.error.message);
      }
      return data.data;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch rental companies"));
    }
  }
);

// 🧩 POST add new company
export const addRentalCompany = createAsyncThunk<
  RentalCompany,
  { name: string },
  { rejectValue: string }
>("rentalCompanies/add", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await axios.post<ApiResponse<RentalCompany>>("/api/rental-companies", payload);
    if (!data.success) {
      return rejectWithValue(data?.error?.message || "Failed to add company");
    }

    return data.data;
  } catch (err) {
    return rejectWithValue(handleAxiosError(err, "Failed to add company"));
  }
});

const rentalCompanySlice = createSlice({
  name: "rentalCompanies",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch companies
      .addCase(fetchRentalCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRentalCompanies.fulfilled, (state, action: PayloadAction<RentalCompany[]>) => {
        state.loading = false;
        state.rentalCompanies = action.payload;
      })
      .addCase(fetchRentalCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching companies";
      })

      // Add company
      .addCase(addRentalCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addRentalCompany.fulfilled, (state, action: PayloadAction<RentalCompany>) => {
        state.loading = false;
        state.rentalCompanies.push(action.payload);
      })
      .addCase(addRentalCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error adding company";
      });
  },
});

export default rentalCompanySlice.reducer;