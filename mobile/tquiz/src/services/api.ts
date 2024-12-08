import axios from 'axios';
import { API_ENDPOINT } from '../utils/constants';

// Tạo instance Axios với cấu hình cơ bản
const apiClient = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;