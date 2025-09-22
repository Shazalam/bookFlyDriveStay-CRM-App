import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

export interface User {
  name: string;
  email: string;
  avatar?: string;
}

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

// 🔐 Register
export const registerUser = createAsyncThunk<
  User,
  { name: string; email: string; password: string },
  { rejectValue: string }
>('auth/register', async (formData, thunkAPI) => {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) return thunkAPI.rejectWithValue(data.error || 'Registration failed');
    return { name: formData.name, email: formData.email };
  } catch {
    return thunkAPI.rejectWithValue('Something went wrong');
  }
});

// 🔐 Login
export const loginUser = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (formData, thunkAPI) => {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok || !data.success)
      return thunkAPI.rejectWithValue(data.error || 'Invalid credentials');
    return data.user as User;
  } catch {
    return thunkAPI.rejectWithValue('Network error');
  }
});

// 🧠 Get Current User
export const fetchCurrentUser = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/me',
  async (_, thunkAPI) => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) return thunkAPI.rejectWithValue('Not authorized');
      return data.user as User;
    } catch {
      return thunkAPI.rejectWithValue('Auth check failed');
    }
  }
);

// 🚪 Logout
export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (!res.ok) return thunkAPI.rejectWithValue('Logout failed');
    } catch {
      return thunkAPI.rejectWithValue('Logout failed');
    }
  }
);

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
      // 🔐 Login
      .addCase(loginUser.pending, (s) => {
        s.loading = true; s.error = null;
        toast.dismiss(); toast.loading('Signing in...');
      })
      .addCase(loginUser.fulfilled, (s, a: PayloadAction<User>) => {
        s.loading = false; s.user = a.payload; s.success = true;
        toast.dismiss(); toast.success('Logged in successfully ✅');
      })
      .addCase(loginUser.rejected, (s, a) => {
        s.loading = false; s.error = a.payload as string;
        toast.dismiss(); toast.error(a.payload as string || 'Login failed ❌');
      })

      // 📝 Register
      .addCase(registerUser.pending, (s) => {
        s.loading = true; s.error = null;
        toast.dismiss(); toast.loading('Registering...');
      })
      .addCase(registerUser.fulfilled, (s, a: PayloadAction<User>) => {
        s.loading = false; s.user = a.payload; s.success = true;
        toast.dismiss(); toast.success('Registered successfully ✅');
      })
      .addCase(registerUser.rejected, (s, a) => {
        s.loading = false; s.error = a.payload as string;
        toast.dismiss(); toast.error(a.payload as string || 'Registration failed ❌');
      })

      // 🧠 Current User
      .addCase(fetchCurrentUser.pending, (s) => {
        s.loading = true; s.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (s, a: PayloadAction<User>) => {
        s.user = a.payload; s.success = true; s.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (s) => {
        s.user = null; s.success = false;    s.loading = false;
      })

      // 🚪 Logout
      .addCase(logoutUser.pending, () => {
        toast.dismiss(); toast.loading('Signing out...');
      })
      .addCase(logoutUser.fulfilled, (s) => {
        s.user = null; s.success = false;
        toast.dismiss(); toast.success('Logged out successfully ✅');
      })
      .addCase(logoutUser.rejected, (s, a) => {
        toast.dismiss(); toast.error(a.payload as string || 'Logout failed ❌');
      });
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;
