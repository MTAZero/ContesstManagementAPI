import { callAPI, HttpMethod } from "./baseAPI";

// Lấy danh sách người dùng
export const getUsers = async (
  pageSize: number,
  pageIndex: number,
  keyword: string,
  accessToken: string
) => {
  return callAPI(HttpMethod.GET, "/users", accessToken, undefined, {
    pageSize,
    pageIndex,
    keyword,
  });
};

// Thêm người dùng
export const insertUser = async (user: any, accessToken: string) => {
  return callAPI(HttpMethod.POST, "/users", accessToken, user);
};

// Cập nhật người dùng
export const updateUser = async (
  id: string,
  user: any,
  accessToken: string
) => {
  console.log("id : ", id);
  return callAPI(HttpMethod.PUT, `/users/${id}`, accessToken, user);
};

// Xóa người dùng
export const deleteUser = async (id: string, accessToken: string) => {
  return callAPI(HttpMethod.DELETE, `/users/${id}`, accessToken);
};

// Lấy chi tiết người dùng
export const getDetailUser = async (id: string, accessToken: string) => {
  return callAPI(HttpMethod.GET, `/users/${id}`, accessToken);
};

// Export tất cả hàm dưới dạng một object
const userAPIService = {
  getUsers,
  insertUser,
  updateUser,
  deleteUser,
  getDetailUser,
};

export default userAPIService;
