export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        primaryLight: '#EFF6FF',
        background: '#F9FAFB',
        surface: '#FFFFFF',
        border: '#E5E7EB',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        textMuted: '#9CA3AF',
        // Patient
        patientAccent: '#14B8A6',
        patientAccentDark: '#0D9488',
        patientAccentLight: '#CCFBF1',
        // Doctor
        doctorAccent: '#4F46E5',
        doctorAccentDark: '#3730A3',
        doctorAccentLight: '#E0E7FF',
        // Admin
        adminAccent: '#7C3AED',
        adminAccentDark: '#5B21B6',
        adminAccentLight: '#F3E8FF',
        // Status
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      gradientColorStops: theme => ({
        'primary-gradient-from': '#2563EB',
        'primary-gradient-to': '#4F46E5',
        'patient-gradient-from': '#14B8A6',
        'patient-gradient-to': '#2563EB',
        'admin-gradient-from': '#7C3AED',
        'admin-gradient-to': '#4F46E5',
      }),
    },
  },
  plugins: [],
}