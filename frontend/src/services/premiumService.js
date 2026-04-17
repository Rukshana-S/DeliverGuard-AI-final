import api from './api';

export const extractIncome          = (formData) => api.post('/ocr/extract-income', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const createRazorpayOrder    = (data)     => api.post('/payments/create-order', data);
export const verifyRazorpayPayment  = (data)     => api.post('/payments/verify-payment', data);
export const payWeeklyPremium       = (data)     => api.post('/payments/weekly-premium', data);
export const getPaymentHistory      = ()         => api.get('/payments/history');
export const getCoverageStatus      = ()         => api.get('/payments/status');
