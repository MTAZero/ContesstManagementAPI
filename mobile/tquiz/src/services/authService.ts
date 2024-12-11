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

// Hàm gọi API logout
export const logout = async (token: string) => {
  try {
    const response = await apiClient.post(
      '/authentication/logout',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Something went wrong' };
  }
};

// Hàm lấy thông tin người dùng hiện tại
export const getCurrentUser = async (token: string) => {
  try {
    const response = await apiClient.get('/authentication/my-info', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Something went wrong' };
  }
};