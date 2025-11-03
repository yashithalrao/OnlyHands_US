import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  withCredentials: true
});

console.log("API BASE:", import.meta.env.VITE_API_BASE);
