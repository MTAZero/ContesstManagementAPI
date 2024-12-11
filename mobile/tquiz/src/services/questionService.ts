import { callAPI, HttpMethod } from "./baseAPI";

const questionService = {
  getQuestions: (
    category: string,
    pageSize: number,
    pageIndex: number,
    keyword: string,
    accessToken: string
  ) =>
    callAPI(HttpMethod.GET, "/:module", accessToken, null, {
      category,
      pageSize,
      pageIndex,
      keyword,
    }),

  getQuestionById: (id: string, accessToken: string) =>
    callAPI(HttpMethod.GET, `/:module/${id}`, accessToken),

  insertQuestion: (data: any, accessToken: string) =>
    callAPI(HttpMethod.POST, "/:module", accessToken, data),

  importQuestions: (file: File, accessToken: string) => {
    const formData = new FormData();
    formData.append("file", file);
    return callAPI(HttpMethod.POST, "/:module/import", accessToken, formData);
  },

  updateQuestion: (id: string, data: any, accessToken: string) =>
    callAPI(HttpMethod.PUT, `/:module/${id}`, accessToken, data),

  deleteQuestion: (id: string, accessToken: string) =>
    callAPI(HttpMethod.DELETE, `/:module/${id}`, accessToken),
};

export default questionService;
