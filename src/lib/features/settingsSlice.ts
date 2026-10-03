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

export interface CompanyProfile {
  adminName: string;
  adminTitle: string;
  adminEmail: string;
  adminPhone: string;
  adminAvatarUrl: string;
  companyName: string;
  brandName: string;
  tagline?: string;
  logoUrl: string;
  cin: string;
  gstin: string;
  starRating: string;
  address: string;
  contactEmail: string;
  conciergePhone: string;
  emergencyPhone: string;
  checkInTime: string;
  checkOutTime: string;
  taxGstRate: number;
}

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  adminName: 'Gopinath',
  adminTitle: 'Administrator',
  adminEmail: 'executive@luxestayhotel.com',
  adminPhone: '+91 98200 99881',
  adminAvatarUrl: '',
  companyName: 'LuxeStay Hotel & Resort',
  brandName: 'LuxeStay Hotel',
  logoUrl: '',
  cin: 'U55101MH2021PTC368940',
  gstin: '27AABCL1234F1Z8',
  starRating: '5-Star Luxury Resort',
  address: 'Marina Promenade, Colaba, Mumbai 400001, Maharashtra, India',
  contactEmail: 'concierge@luxestayhotel.com',
  conciergePhone: '+91 98200 44101',
  emergencyPhone: '+91 98200 99881',
  checkInTime: '14:00',
  checkOutTime: '11:00',
  taxGstRate: 12,
};

const getInitialProfile = (): CompanyProfile => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('luxestay_company_profile');
      if (saved) return { ...DEFAULT_COMPANY_PROFILE, ...JSON.parse(saved) };
    } catch {}
  }
  return DEFAULT_COMPANY_PROFILE;
};

interface SettingsState {
  currency: CurrencyCode;
  nightAudit: boolean;
  companyProfile: CompanyProfile;
}

const initialState: SettingsState = {
  currency: 'INR',
  nightAudit: false,
  companyProfile: getInitialProfile(),
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
    updateCompanyProfile: (state, action: PayloadAction<Partial<CompanyProfile>>) => {
      state.companyProfile = { ...state.companyProfile, ...action.payload };
      if (typeof window !== 'undefined') {
        localStorage.setItem('luxestay_company_profile', JSON.stringify(state.companyProfile));
      }
    },
  },
});

export const { setCurrency, toggleNightAudit, setNightAudit, updateCompanyProfile } = settingsSlice.actions;
export default settingsSlice.reducer;
