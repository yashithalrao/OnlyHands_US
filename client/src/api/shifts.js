import { http } from './http';   // ✅ named import

export const getShifts = (params = {}) =>
  http.get('/shifts', { params }).then(r => r.data);

export const createShift = (payload) =>
  http.post('/shifts', payload).then(r => r.data);

export const publishShift = (id) =>
  http.patch(`/shifts/${id}/publish`).then(r => r.data);

// NEW: apply to a shift
export const applyForShift = (shiftId, note = '') =>
  http.post(`/shifts/${shiftId}/apply`, { note }).then(r => r.data);
