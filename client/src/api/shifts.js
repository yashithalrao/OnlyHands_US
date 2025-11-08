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





export const getShiftApplications = (shiftId, status = '') =>
  http.get(`/shifts/${shiftId}/applications`, { params: status ? { status } : {} }).then(r => r.data);

// approve an application
export const approveApplication = (applicationId) =>
  http.post(`/applications/${applicationId}/approve`).then(r => r.data);

// reject an application
export const rejectApplication = (applicationId) =>
  http.post(`/applications/${applicationId}/reject`).then(r => r.data);

