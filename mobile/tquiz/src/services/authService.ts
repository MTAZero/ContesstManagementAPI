import apiClient from './api';

// Hàm gọi API login
export const login = async (username: string, password: string) => {
  try {
    const response = await apiClient.post('/authentication/login', {
      username,
      password,
    });
    return response.data; // Trả về dữ liệu nếu thành công
  } catch (error: any) {
    throw error.response?.data || { message: 'Something went wrong' }; // Trả về lỗi
  }
};