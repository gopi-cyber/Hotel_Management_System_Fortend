export interface CountryCode {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
  maxLength: number;
}

export const COUNTRY_CODES: CountryCode[] = [
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳', maxLength: 10 },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸', maxLength: 10 },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧', maxLength: 10 },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦', maxLength: 10 },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺', maxLength: 9 },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪', maxLength: 9 },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬', maxLength: 8 },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪', maxLength: 11 },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷', maxLength: 9 },
  { name: 'Malaysia', code: 'MY', dialCode: '+60', flag: '🇲🇾', maxLength: 10 },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: '🇸🇦', maxLength: 9 },
  { name: 'Qatar', code: 'QA', dialCode: '+974', flag: '🇶🇦', maxLength: 8 },
  { name: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵', maxLength: 10 },
];
