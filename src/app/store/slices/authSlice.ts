import { handleAxiosError } from '@/lib/utils/handleAxiosError';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ApiResponse } from '@/types/api';
import { User } from '@/types/user';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  success: false,
};

export const registerUser = createAsyncThunk<
  User,
  { name: string; email: string; password: string },
  { rejectValue: string }
>('auth/register', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await axios.post<ApiResponse<User>>(
      '/api/auth/register',
      formData
    );

    if (!data.success) return rejectWithValue(data.error.message);

    return data.data;
  } catch (err) {
    return rejectWithValue(handleAxiosError(err, "Registration failed"));
  }
});


export const loginUser = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await axios.post<ApiResponse<User>>(
      '/api/auth/login',
      formData
    );

    if (!data.success) return rejectWithValue(data.error.message);

    return data.data;
  } catch (err) {
    return rejectWithValue(handleAxiosError(err, "Login failed"));
  }
});



// 🚪 Logout
export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/auth/logout');
      console.log("response logout =", res)
    } catch (err) {
      return rejectWithValue(handleAxiosError(err, "Logout failed"));
    }
  }
);


// 🧠 Get Current User
export const fetchCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axios.get<ApiResponse<User>>('/api/auth/me', {
      withCredentials: true,
    });

    if (!data.success) return rejectWithValue(data.error.message);

    return data.data;
  } catch (err) {
    return rejectWithValue(handleAxiosError(err, "Not authorized"));
  }
});


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.error = null;
      state.success = false;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder

      // LOGIN
      .addCase(loginUser.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(loginUser.fulfilled, (s, a: PayloadAction<User>) => {
        s.loading = false;
        s.user = a.payload;
        s.success = true;
      })
      .addCase(loginUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || "Login failed";
      })

      // REGISTER
      .addCase(registerUser.pending, (s) => {
        s.loading = true;
        s.error = null;
        toast.dismiss();
        toast.loading('Registering...');
      })
      .addCase(registerUser.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;
        s.success = true;
        toast.dismiss();
        toast.success('Registered successfully ✅');
      })
      .addCase(registerUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || "Registration failed";
        toast.dismiss();
        toast.error(s.error);
      })

      // CURRENT USER
      .addCase(fetchCurrentUser.fulfilled, (s, a) => {
        s.user = a.payload;
        s.success = true;
      })
      .addCase(fetchCurrentUser.rejected, (s) => {
        s.user = null;
        s.success = false;
      })

      // LOGOUT
      .addCase(logoutUser.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(logoutUser.fulfilled, (s) => {
        s.loading = false;
        s.error = null;
        s.user = null;
        s.success = false;
      })
      .addCase(logoutUser.rejected, (s) => {
        s.loading = false;
        s.error = null;
      });
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;
