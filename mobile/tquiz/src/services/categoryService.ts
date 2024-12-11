import { callAPI, HttpMethod } from "./baseAPI";

const categoryService = {
  getCategories: (accessToken: string) =>
    callAPI(HttpMethod.GET, "/:module", accessToken),

  getCategoryById: (id: string, accessToken: string) =>
    callAPI(HttpMethod.GET, `/:module/${id}`, accessToken),

  insertCategory: (
    data: { name: string; description: string },
    accessToken: string
  ) => callAPI(HttpMethod.POST, "/:module", accessToken, data),

  updateCategory: (id: string, data: { name: string }, accessToken: string) =>
    callAPI(HttpMethod.PUT, `/:module/${id}`, accessToken, data),

  deleteCategory: (id: string, accessToken: string) =>
    callAPI(HttpMethod.DELETE, `/:module/${id}`, accessToken),
};

export default categoryService;
