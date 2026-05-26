export const environment = {
  production: true,
  useMock: false,
  apiUrl: 'https://hilaz-hanger-api.onrender.com/api',
  siteUrl: 'https://hilaz-hanger.vercel.app',
  /** Fallback only — checkout uses razorpayKeyId from API after RAZORPAY_KEY_ID is set on Render */
  razorpayKey: '',
  /** Set in Vercel: NG_APP_GA_MEASUREMENT_ID or replace here */
  gaMeasurementId: '',
  store: {
    storeName: 'Hilaz Hanger',
    phone: '+919876543210',
    email: 'hello@hilazhanger.com',
    whatsappNumber: '+919876543210',
    whatsappMessage: 'Hi Hilaz Hanger! I need help with an order.',
    instagramUrl: 'https://www.instagram.com/hilazhanger',
    address: 'Coimbatore, Tamil Nadu, India',
  },
};
