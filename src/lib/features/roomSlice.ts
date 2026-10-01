import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Room {
    id: string;
    number: string;
    roomNumber?: string;
    name?: string;
    type: string;
    price: number;
    status: 'available' | 'occupied' | 'maintenance';
    amenities: string[];
    capacity: number;
    image?: string;
    imageUrl?: string;
    description?: string;
    createdAt?: string;
}

interface RoomState {
    items: Room[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

import { ENDPOINTS } from '../apiConfig';

const API_URL = ENDPOINTS.ROOMS;

const normalizeRoom = (room: Record<string, unknown>): Room => ({
    id: String(room.id ?? ''),
    number: String(room.number ?? room.roomNumber ?? ''),
    roomNumber: String(room.number ?? room.roomNumber ?? ''),
    name: String(room.name ?? room.type ?? 'Luxury Suite'),
    type: String(room.type ?? room.name ?? 'Standard'),
    price: Number(room.price ?? room.pricePerNight ?? 0),
    status: String(room.status ?? 'available').toLowerCase() as Room['status'],
    amenities: Array.isArray(room.amenities)
        ? room.amenities.map(String)
        : String(room.amenities ?? '').split(',').map((item) => item.trim()).filter(Boolean),
    capacity: Number(room.capacity ?? 1),
    image: String(room.image ?? room.imageUrl ?? ''),
    imageUrl: String(room.image ?? room.imageUrl ?? ''),
    description: String(room.description ?? ''),
    createdAt: room.createdAt ? String(room.createdAt) : undefined,
});

// API Thunks - Connecting to real backend
export const fetchRooms = createAsyncThunk(
    'rooms/fetchRooms',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch rooms');
            const data = await response.json();
            return (Array.isArray(data) ? data : []).map(normalizeRoom);
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }
);

export const addRoom = createAsyncThunk(
    'rooms/addRoom',
    async (room: Omit<Room, 'id' | 'createdAt'>, { rejectWithValue }) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(room),
            });
            if (!response.ok) throw new Error('Failed to add room');
            return normalizeRoom(await response.json());
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }
);

export const updateRoom = createAsyncThunk(
    'rooms/updateRoom',
    async (room: Room, { rejectWithValue }) => {
        try {
            const { id, ...updates } = room;
            const url = API_URL.startsWith('/api') ? API_URL : `${API_URL}/${id}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(API_URL.startsWith('/api') ? room : updates),
            });
            if (!response.ok) throw new Error('Failed to update room');
            return normalizeRoom(await response.json());
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }
);

export const deleteRoom = createAsyncThunk(
    'rooms/deleteRoom',
    async (id: string, { rejectWithValue }) => {
        try {
            const url = API_URL.startsWith('/api') ? `${API_URL}?id=${id}` : `${API_URL}/${id}`;
            const response = await fetch(url, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete room');
            return id;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }
);

const roomSlice = createSlice({
    name: 'rooms',
    initialState: {
        items: [],
        status: 'idle',
        error: null,
    } as RoomState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRooms.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchRooms.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
                state.error = null;
            })
            .addCase(fetchRooms.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(addRoom.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(updateRoom.fulfilled, (state, action) => {
                const index = state.items.findIndex((r) => r.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(deleteRoom.fulfilled, (state, action) => {
                state.items = state.items.filter((r) => r.id !== action.payload);
            });
    },
});

export const { clearError } = roomSlice.actions;
export default roomSlice.reducer;
