import api from './api';

export const getLiveData = (lat, lon) => api.get(`/monitoring/live?lat=${lat}&lon=${lon}`);
