import { http } from './http';   // ✅ named import

export const getShifts = (params = {}) =>
  http.get('/shifts', { params }).then(r => r.data);

export const createShift = (payload) =>
  http.post('/shifts', payload).then(r => r.data);

export const publishShift = (id) =>
  http.patch(`/shifts/${id}/publish`).then(r => r.data);
