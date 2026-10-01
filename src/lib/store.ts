import { configureStore } from '@reduxjs/toolkit';
import roomReducer from './features/roomSlice';
import bookingReducer from './features/bookingSlice';
import userReducer from './features/userSlice';
import staffReducer from './features/staffSlice';
import serviceReducer from './features/serviceSlice';
import settingsReducer from './features/settingsSlice';

export const makeStore = () => {
    return configureStore({
        reducer: {
            rooms: roomReducer,
            bookings: bookingReducer,
            user: userReducer,
            staff: staffReducer,
            services: serviceReducer,
            settings: settingsReducer,
        },
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];