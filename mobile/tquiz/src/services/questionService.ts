import { callAPI, HttpMethod } from "./baseAPI";

// Lấy danh sách câu hỏi
const getQuestions = async (
  category: string,
  pageSize: number,
  pageIndex: number,
  keyword: string,
  accessToken: string
) => {
  return callAPI(HttpMethod.GET, "/questions", accessToken, undefined, {
    category,
    pageSize,
    pageIndex,
    keyword,
  });
};

// Lấy chi tiết câu hỏi theo ID
const getQuestionById = async (id: string, accessToken: string) => {
  return callAPI(HttpMethod.GET, `/questions/${id}`, accessToken);
};

// Thêm câu hỏi mới
const insertQuestion = async (data: any, accessToken: string) => {
  return callAPI(HttpMethod.POST, "/questions", accessToken, data);
};

// Import câu hỏi từ file
const importQuestions = async (file: File, accessToken: string) => {
  const formData = new FormData();
  formData.append("file", file);
  return callAPI(HttpMethod.POST, "/questions/import", accessToken, formData);
};

// Cập nhật thông tin câu hỏi
const updateQuestion = async (id: string, data: any, accessToken: string) => {
  return callAPI(HttpMethod.PUT, `/questions/${id}`, accessToken, data);
};

// Xóa câu hỏi theo ID
const deleteQuestion = async (id: string, accessToken: string) => {
  return callAPI(HttpMethod.DELETE, `/questions/${id}`, accessToken);
};

const questionService = {
  getQuestions,
  getQuestionById,
  insertQuestion,
  importQuestions,
  updateQuestion,
  deleteQuestion,
};

export default questionService;
