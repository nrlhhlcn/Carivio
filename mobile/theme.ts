// Centralized theme for the mobile app to match the web look & feel
// Keep values verbose and readable for maintainability
export const theme = {
  colors: {
    // Brand
    primary: '#4300FF',
    primaryDark: '#2E00B3',
    primaryLight: '#6A3BFF',
    secondary: '#0065F8',
    gradientPrimary: ['#4300FF', '#0065F8'],
    gradientSurface: ['#dbeafe', '#e9d5ff'],

    // Support
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',

    // Neutrals (approx. Tailwind gray)
    gray900: '#111827',
    gray800: '#1f2937',
    gray700: '#374151',
    gray600: '#4b5563',
    gray500: '#6b7280',
    gray400: '#9ca3af',
    gray300: '#d1d5db',
    gray200: '#e5e7eb',
    gray100: '#f3f4f6',
    gray50: '#f9fafb',

    // Surfaces
    background: '#ffffff',
    surface: '#ffffff',
    overlay: 'rgba(0,0,0,0.5)',
    white: '#ffffff',
    black: '#000000',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
  },
  radii: {
    sm: 8,
    md: 12,
    lg: 16,
    pill: 999,
  },
  typography: {
    heading1: { fontSize: 32, fontWeight: 'bold' as const },
    heading2: { fontSize: 24, fontWeight: 'bold' as const },
    heading3: { fontSize: 18, fontWeight: '600' as const },
    body: { fontSize: 14, fontWeight: '400' as const },
    button: { fontSize: 16, fontWeight: '600' as const },
    label: { fontSize: 12, fontWeight: '600' as const },
  },
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
  },
}

export type Theme = typeof theme


