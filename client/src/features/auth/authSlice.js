import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { registerUser, loginUser } from './authService'

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      return await registerUser(userData)
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      )
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await loginUser(credentials)
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      )
    }
  }
)

const authSlice = createSlice({
  name: 'auth',

  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    businesses: [],
    activeTenant: null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null
  },

  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      localStorage.setItem('token', action.payload.token)
    },

    setBusinesses: (state, action) => {
      state.businesses = action.payload
    },

    setActiveTenant: (state, action) => {
      state.activeTenant = action.payload
    },

    logout: (state) => {
      state.user = null
      state.token = null
      state.businesses = []
      state.activeTenant = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
    },

    clearAuthError: (state) => {
      state.error = null
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        localStorage.setItem('token', action.payload.token)
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        localStorage.setItem('token', action.payload.token)
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const {
  setCredentials,
  setBusinesses,
  setActiveTenant,
  logout,
  clearAuthError
} = authSlice.actions

export default authSlice.reducer