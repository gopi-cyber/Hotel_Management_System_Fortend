import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { ENDPOINTS } from '../apiConfig';

export interface User {
    id: string;
    username: string;
    email?: string;
    password?: string;
    role: string;
    name?: string;
    phone?: string;
    avatarUrl?: string;
    department?: string;
    shift?: string;
    employeeId?: string;
    loyaltyTier?: string;
    loyaltyPoints?: number;
    dietaryPreference?: string;
    roomPreference?: string;
    pillowPreference?: string;
    temperaturePreference?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
}

interface UserState {
    user: User | null;
    allUsers: User[];
    isAuthenticated: boolean;
    error: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const API_URL = ENDPOINTS.USERS;

export const registerUser = createAsyncThunk('user/registerUser', async (userData: Omit<User, 'id'>) => {
    try {
        const checkResponse = await axios.get(`${API_URL}?username=${encodeURIComponent(userData.username)}`);
        if (checkResponse.data && checkResponse.data.length > 0) {
            throw new Error('This username is already taken. Please choose another one.');
        }
        const response = await axios.post(API_URL, userData);
        return response.data;
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            const serverMsg = err.response?.data?.error || err.response?.data?.message;
            if (serverMsg) throw new Error(serverMsg);
        }
        throw err;
    }
});

export const loginUser = createAsyncThunk('user/loginUser', async (credentials: { username: string, password?: string }) => {
    try {
        const response = await axios.post(API_URL, { action: 'login', ...credentials });
        const authenticatedUser = { ...response.data, role: response.data.role.toLowerCase() };
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('vortex_user', JSON.stringify(authenticatedUser));
        }
        return authenticatedUser;
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            throw new Error(err.response?.data?.error || err.response?.data?.message || err.message || 'Login service currently unavailable');
        }
        throw new Error(err instanceof Error ? err.message : 'Login service currently unavailable');
    }
});

export const fetchAllUsers = createAsyncThunk('user/fetchAllUsers', async () => {
    const response = await axios.get(API_URL);
    return response.data;
});

export const updateUserRole = createAsyncThunk('user/updateUserRole', async ({ id, role }: { id: string, role: string }) => {
    const response = await axios.patch(API_URL, { id, role });
    return response.data;
});

export const deleteUserAccount = createAsyncThunk('user/deleteUserAccount', async (id: string) => {
    await axios.delete(`${API_URL}?id=${id}`);
    return id;
});

const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null,
        allUsers: [],
        isAuthenticated: false,
        error: null,
        status: 'idle',
    } as UserState,
    reducers: {
        restoreSession: (state, action: { payload: User }) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.error = null;
        },
        updateUserProfile: (state, action: { payload: Partial<User> }) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('vortex_user', JSON.stringify(state.user));
                    localStorage.setItem(`vortex_profile_${state.user.id || state.user.username}`, JSON.stringify(state.user));
                }
            }
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            if (typeof window !== 'undefined') sessionStorage.removeItem('vortex_user');
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.fulfilled, (state) => {
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.error = action.error.message || 'Registration failed. Check if server is running.';
            })
            .addCase(loginUser.pending, (state) => {
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.error = action.error.message || 'Login failed';
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.allUsers = action.payload;
            })
            .addCase(updateUserRole.fulfilled, (state, action) => {
                const index = state.allUsers.findIndex((u) => String(u.id) === String(action.payload.id));
                if (index !== -1) {
                    state.allUsers[index] = action.payload;
                }
                // If the updated user is currently logged in, update their session too
                if (state.user && String(state.user.id) === String(action.payload.id)) {
                    state.user.role = action.payload.role.toLowerCase();
                    if (typeof window !== 'undefined') {
                        sessionStorage.setItem('vortex_user', JSON.stringify(state.user));
                    }
                }
            })
            .addCase(deleteUserAccount.fulfilled, (state, action) => {
                state.allUsers = state.allUsers.filter((u) => String(u.id) !== String(action.payload));
            });
    },
});

export const { logout, restoreSession, updateUserProfile } = userSlice.actions;
export default userSlice.reducer;
