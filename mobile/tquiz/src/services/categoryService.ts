import { callAPI, HttpMethod } from "./baseAPI";

// Lấy danh sách category
const getCategories = async (accessToken: string) => {
  return callAPI(HttpMethod.GET, "/category-questions", accessToken);
};

// Lấy chi tiết category theo ID
const getCategoryById = async (id: string, accessToken: string) => {
  return callAPI(HttpMethod.GET, `/category-questions/${id}`, accessToken);
};

// Thêm mới category
const insertCategory = async (
  data: { name: string; description: string },
  accessToken: string
) => {
  return callAPI(HttpMethod.POST, "/category-questions", accessToken, data);
};

// Cập nhật thông tin category
const updateCategory = async (
  id: string,
  data: { name: string },
  accessToken: string
) => {
  return callAPI(
    HttpMethod.PUT,
    `/category-questions/${id}`,
    accessToken,
    data
  );
};

// Xóa category theo ID
const deleteCategory = async (id: string, accessToken: string) => {
  return callAPI(HttpMethod.DELETE, `/category-questions/${id}`, accessToken);
};

const categoryService = {
  getCategories,
  getCategoryById,
  insertCategory,
  updateCategory,
  deleteCategory,
};

export default categoryService;