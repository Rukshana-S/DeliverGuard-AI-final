import api from './api';

export const getClaims = () => api.get('/claims');
export const getClaimById = (id) => api.get(`/claims/${id}`);
export const createClaim = (data) => api.post('/claims/create', data);
