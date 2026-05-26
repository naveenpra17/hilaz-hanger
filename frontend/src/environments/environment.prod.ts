export const environment = {
  production: true,
  useMock: false,
  apiUrl: 'https://hilaz-hanger-api.onrender.com/api',
  siteUrl: 'https://hilaz-hanger.vercel.app',
  /** Fallback only — checkout uses razorpayKeyId from API after RAZORPAY_KEY_ID is set on Render */
  razorpayKey: '',
  /** Set in Vercel: NG_APP_GA_MEASUREMENT_ID or replace here */
  gaMeasurementId: '',
};
