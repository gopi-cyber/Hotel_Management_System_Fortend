import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rate: number; // multiplier from INR base
  label: string;
}

export const CURRENCY_MAP: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', rate: 1, label: 'INR (₹)' },
  USD: { code: 'USD', symbol: '$', rate: 0.012, label: 'USD ($)' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.011, label: 'EUR (€)' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.0095, label: 'GBP (£)' },
  AED: { code: 'AED', symbol: 'AED ', rate: 0.044, label: 'AED (د.إ)' },
};

export const formatPrice = (inrAmount: number, code: CurrencyCode = 'INR'): string => {
  const conf = CURRENCY_MAP[code] || CURRENCY_MAP.INR;
  const converted = Math.round(inrAmount * conf.rate);
  return `${conf.symbol}${converted.toLocaleString()}`;
};

interface SettingsState {
  currency: CurrencyCode;
  nightAudit: boolean;
}

const initialState: SettingsState = {
  currency: 'INR',
  nightAudit: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<CurrencyCode>) => {
      state.currency = action.payload;
    },
    toggleNightAudit: (state) => {
      state.nightAudit = !state.nightAudit;
    },
    setNightAudit: (state, action: PayloadAction<boolean>) => {
      state.nightAudit = action.payload;
    },
  },
});

export const { setCurrency, toggleNightAudit, setNightAudit } = settingsSlice.actions;
export default settingsSlice.reducer;
