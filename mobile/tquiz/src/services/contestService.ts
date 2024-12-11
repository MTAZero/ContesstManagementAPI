import { callAPI, HttpMethod } from "./baseAPI";

const contestService = {
  // Lấy danh sách tất cả cuộc thi
  getContests: (
    pageSize: number,
    pageIndex: number,
    keyword: string,
    accessToken: string
  ) =>
    callAPI(HttpMethod.GET, "/contest", accessToken, null, {
      pageSize,
      pageIndex,
      keyword,
    }),

  // Xem chi tiết cuộc thi
  getContestById: (id: string, accessToken: string) =>
    callAPI(HttpMethod.GET, `/contest/${id}`, accessToken),

  // Thêm mới cuộc thi
  insertContest: (
    data: {
      name: string;
      description: string;
      start_time: string;
      duration: number;
    },
    accessToken: string
  ) => callAPI(HttpMethod.POST, "/contest", accessToken, data),

  // Cập nhật thông tin cuộc thi
  updateContest: (
    id: string,
    data: {
      name?: string;
      description?: string;
      start_time?: string;
      duration?: number;
    },
    accessToken: string
  ) => callAPI(HttpMethod.PUT, `/contest/${id}`, accessToken, data),

  // Xóa cuộc thi
  deleteContest: (id: string, accessToken: string) =>
    callAPI(HttpMethod.DELETE, `/contest/${id}`, accessToken),

  // Lấy danh sách câu hỏi của cuộc thi
  getContestQuestions: (contestId: string, accessToken: string) =>
    callAPI(HttpMethod.GET, `/contest/${contestId}/questions`, accessToken),

  // Thêm danh sách câu hỏi vào cuộc thi
  addQuestionsToContest: (
    contestId: string,
    questionIds: string[],
    accessToken: string
  ) =>
    callAPI(HttpMethod.POST, `/contest/${contestId}/questions`, accessToken, {
      questionIds,
    }),

  // Thêm toàn bộ câu hỏi của một category vào cuộc thi
  addCategoryQuestionsToContest: (
    contestId: string,
    categoryId: string,
    accessToken: string
  ) =>
    callAPI(
      HttpMethod.POST,
      `/contest/${contestId}/category/${categoryId}`,
      accessToken
    ),

  // Xóa một câu hỏi khỏi cuộc thi
  removeQuestionFromContest: (
    contestId: string,
    questionId: string,
    accessToken: string
  ) =>
    callAPI(
      HttpMethod.DELETE,
      `/contest/${contestId}/questions/${questionId}`,
      accessToken
    ),

  // Xóa tất cả câu hỏi khỏi cuộc thi
  removeAllQuestionsFromContest: (contestId: string, accessToken: string) =>
    callAPI(HttpMethod.DELETE, `/contest/${contestId}/questions`, accessToken),

  // Lấy danh sách người tham gia cuộc thi
  getContestParticipants: (contestId: string, accessToken: string) =>
    callAPI(HttpMethod.GET, `/contest/${contestId}/registrations`, accessToken),

  // Đăng ký tham gia cuộc thi
  registerForContest: (contestId: string, accessToken: string) =>
    callAPI(HttpMethod.POST, `/contest/${contestId}/register`, accessToken),

  // Hủy đăng ký cuộc thi
  unregisterFromContest: (contestId: string, accessToken: string) =>
    callAPI(HttpMethod.DELETE, `/contest/${contestId}/register`, accessToken),

  // User bắt đầu làm bài
  startContest: (contestId: string, accessToken: string) =>
    callAPI(HttpMethod.POST, `/contest/${contestId}/enter`, accessToken),

  // User cập nhật lựa chọn
  updateAnswer: (
    contestId: string,
    questionId: string,
    answerId: string,
    accessToken: string
  ) =>
    callAPI(
      HttpMethod.POST,
      `/contest/${contestId}/question/${questionId}/answer`,
      accessToken,
      { answerId }
    ),

  // User nộp bài
  submitContest: (contestId: string, accessToken: string) =>
    callAPI(HttpMethod.POST, `/contest/${contestId}/submit`, accessToken),

  // Lấy kết quả của user
  getUserResult: (contestId: string, accessToken: string) =>
    callAPI(HttpMethod.GET, `/contest/${contestId}/result`, accessToken),

  // Bảng xếp hạng
  getLeaderboard: (contestId: string, accessToken: string) =>
    callAPI(HttpMethod.GET, `/contest/${contestId}/leaderboard`, accessToken),

  // Danh sách các cuộc thi sắp tới
  getUpcomingContests: (isRegistered: boolean, accessToken: string) =>
    callAPI(HttpMethod.GET, `/contest/upcoming`, accessToken, null, {
      isRegistered,
    }),

  // Danh sách các cuộc thi sắp tới user đã đăng ký
  getUpcomingRegisteredContests: (
    accessToken: string,
    category?: string,
    pageSize?: number,
    pageIndex?: number,
    keyword?: string
  ) =>
    callAPI(HttpMethod.GET, `/contest/upcoming-registered`, accessToken, null, {
      category,
      pageSize,
      pageIndex,
      keyword,
    }),

  // Kết quả các cuộc thi đã hoàn thành
  getCompletedContests: (isRegistered: boolean, accessToken: string) =>
    callAPI(HttpMethod.GET, `/contest/completed`, accessToken, null, {
      isRegistered,
    }),
};

export default contestService;
