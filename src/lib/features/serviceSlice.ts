import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface ServiceRequest {
  id: string;
  guestId: string;
  roomId: string;
  serviceName: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  guestName?: string;
  roomNumber?: string;
  assignedStaff?: string;
  urgency?: 'normal' | 'priority' | 'urgent';
  createdAt?: string;
  completedAt?: string;
}

interface ServiceState {
  items: ServiceRequest[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

import { ENDPOINTS } from '../apiConfig';

const API_URL = ENDPOINTS.SERVICES;

const normalizeService = (service: Record<string, unknown>): ServiceRequest => ({
  id: String(service.id ?? ''),
  guestId: String(service.guestId ?? service.userId ?? ''),
  roomId: String(service.roomId ?? service.roomNumber ?? ''),
  serviceName: String(service.serviceName ?? service.serviceType ?? 'Service'),
  description: String(service.description ?? ''),
  status: String(service.status ?? 'pending').toLowerCase() as ServiceRequest['status'],
  guestName: service.guestName ? String(service.guestName) : undefined,
  roomNumber: service.roomNumber ? String(service.roomNumber) : undefined,
  assignedStaff: service.assignedStaff ? String(service.assignedStaff) : undefined,
  urgency: (service.urgency as ServiceRequest['urgency']) || 'normal',
  createdAt: service.createdAt ? String(service.createdAt) : undefined,
  completedAt: service.completedAt ? String(service.completedAt) : undefined,
});

export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      return (Array.isArray(data) ? data : []).map(normalizeService);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

export const fetchUserServices = createAsyncThunk(
  'services/fetchUserServices',
  async (guestId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}?guestId=${guestId}`);
      if (!response.ok) throw new Error('Failed to fetch user services');
      const data = await response.json();
      return (Array.isArray(data) ? data : []).map(normalizeService);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

export const createService = createAsyncThunk(
  'services/createService',
  async (service: Omit<ServiceRequest, 'id' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...service,
          userId: service.guestId,
          roomNumber: service.roomId,
          serviceType: service.serviceName,
          status: service.status.toUpperCase(),
        }),
      });
      if (!response.ok) throw new Error('Failed to create service request');
      return normalizeService(await response.json());
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

export const updateService = createAsyncThunk(
  'services/updateService',
  async (data: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const { id, ...updates } = data;
      const url = API_URL.startsWith('/api') ? API_URL : `${API_URL}/${id}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(API_URL.startsWith('/api') ? data : updates),
      });
      if (!response.ok) throw new Error('Failed to update service');
      return normalizeService(await response.json());
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

const serviceSlice = createSlice({
  name: 'services',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  } as ServiceState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addLocalServiceRequest: (state, action: { payload: ServiceRequest }) => {
      state.items.unshift(action.payload);
      if (typeof window !== 'undefined') {
        try {
          const list = JSON.parse(localStorage.getItem('luxestay_local_service_requests') || '[]');
          list.unshift(action.payload);
          localStorage.setItem('luxestay_local_service_requests', JSON.stringify(list));
        } catch {}
      }
    },
    updateLocalServiceStatus: (
      state,
      action: { payload: { id: string; status: ServiceRequest['status']; assignedStaff?: string } }
    ) => {
      const item = state.items.find((s) => String(s.id) === String(action.payload.id));
      if (item) {
        item.status = action.payload.status;
        if (action.payload.assignedStaff) {
          item.assignedStaff = action.payload.assignedStaff;
        }
        if (action.payload.status === 'completed') {
          item.completedAt = new Date().toISOString();
        }
      }
      if (typeof window !== 'undefined') {
        try {
          const list = JSON.parse(localStorage.getItem('luxestay_local_service_requests') || '[]');
          const idx = list.findIndex((s: ServiceRequest) => String(s.id) === String(action.payload.id));
          if (idx !== -1) {
            list[idx].status = action.payload.status;
            if (action.payload.assignedStaff) list[idx].assignedStaff = action.payload.assignedStaff;
            localStorage.setItem('luxestay_local_service_requests', JSON.stringify(list));
          }
        } catch {}
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        if (typeof window !== 'undefined') {
          try {
            const local = JSON.parse(localStorage.getItem('luxestay_local_service_requests') || '[]');
            if (local.length > 0) {
              const existingIds = new Set(state.items.map((i) => String(i.id)));
              local.forEach((req: ServiceRequest) => {
                if (!existingIds.has(String(req.id))) {
                  state.items.unshift(req);
                } else {
                  const existing = state.items.find((i) => String(i.id) === String(req.id));
                  if (existing) existing.status = req.status;
                }
              });
            }
          } catch {}
        }
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchUserServices.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateService.fulfilled, (state, action) => {
        const index = state.items.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const { clearError, addLocalServiceRequest, updateLocalServiceStatus } = serviceSlice.actions;
export default serviceSlice.reducer;
