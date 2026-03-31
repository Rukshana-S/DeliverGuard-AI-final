import api from './api';

export const initiatePayout = (claimId) => api.post('/payout/initiate', { claimId });
export const getPayoutStatus = (claimId) => api.get(`/payout/status/${claimId}`);
export const getPayoutHistory = () => api.get('/payout/history');
