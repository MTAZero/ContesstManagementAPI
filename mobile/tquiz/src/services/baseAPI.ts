import apiClient from "./api";

// Enum cho các phương thức HTTP
export enum HttpMethod {
  GET = "get",
  POST = "post",
  PUT = "put",
  DELETE = "delete",
}

// Hàm cơ sở để gọi API với access token
export const callAPI = async (
  method: HttpMethod,
  url: string,
  accessToken: string,
  data?: any,
  params?: any
) => {
  try {
    const response = await apiClient.request({
      method,
      url,
      headers: {
        Authorization: `Bearer ${accessToken}`, // Thêm access token vào header
      },
      data,
      params,
    });

    return response.data; // Trả về dữ liệu nếu thành công
  } catch (error: any) {
    throw error.response?.data || { message: error.message }; // Trả về lỗi
  }
};
