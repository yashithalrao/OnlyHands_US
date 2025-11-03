import { http } from './http';

export const loginApi = (email, password) =>
  http.post('/auth/login', { email, password }).then(r => r.data);

export const meApi = () =>
  http.get('/auth/me').then(r => r.data);

export const logoutApi = () =>
  http.post('/auth/logout').then(r => r.data);
