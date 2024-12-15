import { callAPI, HttpMethod } from "./baseAPI";

// Lấy danh sách tất cả cuộc thi
const getContests = async (
  pageSize: number,
  pageIndex: number,
  keyword: string,
  accessToken: string
) => {
  return callAPI(HttpMethod.GET, "/contests", accessToken, undefined, {
    pageSize,
    pageIndex,
    keyword,
  });
};

// Xem chi tiết cuộc thi
const getContestById = async (id: string, accessToken: string) => {
  return callAPI(HttpMethod.GET, `/contests/${id}`, accessToken);
};

// Thêm mới cuộc thi
const insertContest = async (
  data: {
    name: string;
    description: string;
    start_time: string;
    duration: number;
  },
  accessToken: string
) => {
  return callAPI(HttpMethod.POST, "/contests", accessToken, data);
};

// Cập nhật thông tin cuộc thi
const updateContest = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    start_time?: string;
    duration?: number;
  },
  accessToken: string
) => {
  return callAPI(HttpMethod.PUT, `/contests/${id}`, accessToken, data);
};

// Xóa cuộc thi
const deleteContest = async (id: string, accessToken: string) => {
  return callAPI(HttpMethod.DELETE, `/contests/${id}`, accessToken);
};

// Lấy danh sách câu hỏi của cuộc thi
const getContestQuestions = async (
  contestId: string,
  accessToken: string,
  pageIndex: number = 1,
  pageSize: number = 10
) => {
  return callAPI(
    HttpMethod.GET,
    `/contests/${contestId}/questions`,
    accessToken,
    undefined,
    {
      pageIndex: pageIndex.toString(),
      pageSize: pageSize.toString(),
    }
  );
};
// Thêm danh sách câu hỏi vào cuộc thi
const addQuestionsToContest = async (
  contestId: string,
  questionIds: string[],
  accessToken: string
) => {
  return callAPI(
    HttpMethod.POST,
    `/contests/${contestId}/questions`,
    accessToken,
    { questionIds }
  );
};

// Thêm toàn bộ câu hỏi của một category vào cuộc thi
const addCategoryQuestionsToContest = async (
  contestId: string,
  categoryId: string,
  accessToken: string
) => {
  return callAPI(
    HttpMethod.POST,
    `/contests/${contestId}/category/${categoryId}`,
    accessToken
  );
};

// Xóa một câu hỏi khỏi cuộc thi
const removeQuestionFromContest = async (
  contestId: string,
  questionId: string,
  accessToken: string
) => {
  console.log("Removing question:", questionId, contestId);
  return callAPI(
    HttpMethod.DELETE,
    `/contests/${contestId}/questions/${questionId}`,
    accessToken
  );
};

// Xóa tất cả câu hỏi khỏi cuộc thi
const removeAllQuestionsFromContest = async (
  contestId: string,
  accessToken: string
) => {
  return callAPI(
    HttpMethod.DELETE,
    `/contests/${contestId}/questions`,
    accessToken
  );
};

// Lấy danh sách người tham gia cuộc thi với phân trang
const getContestParticipants = async (
  contestId: string,
  accessToken: string,
  pageIndex: number = 1,
  pageSize: number = 10
) => {
  return callAPI(
    HttpMethod.GET,
    `/contests/${contestId}/registrations`,
    accessToken,
    undefined,
    {
      pageIndex,
      pageSize,
    }
  );
};

// Đăng ký tham gia cuộc thi
const registerForContest = async (contestId: string, accessToken: string) => {
  return callAPI(
    HttpMethod.POST,
    `/contests/${contestId}/register`,
    accessToken
  );
};

// Hủy đăng ký cuộc thi
const unregisterFromContest = async (
  contestId: string,
  accessToken: string
) => {
  return callAPI(
    HttpMethod.DELETE,
    `/contests/${contestId}/register`,
    accessToken
  );
};

// User bắt đầu làm bài
const startContest = async (contestId: string, accessToken: string) => {
  return callAPI(HttpMethod.POST, `/contests/${contestId}/enter`, accessToken);
};

// User cập nhật lựa chọn
const updateAnswer = async (
  contestId: string,
  questionId: string,
  answerId: string,
  accessToken: string
) => {
  return callAPI(
    HttpMethod.POST,
    `/contests/${contestId}/question/${questionId}/answer`,
    accessToken,
    { answerId }
  );
};

// User nộp bài
const submitContest = async (contestId: string, accessToken: string) => {
  return callAPI(HttpMethod.POST, `/contests/${contestId}/submit`, accessToken);
};

// Lấy kết quả của user
const getUserResult = async (contestId: string, accessToken: string) => {
  return callAPI(HttpMethod.GET, `/contests/${contestId}/result`, accessToken);
};

// Bảng xếp hạng
const getLeaderboard = async (contestId: string, accessToken: string) => {
  return callAPI(
    HttpMethod.GET,
    `/contests/${contestId}/leaderboard`,
    accessToken
  );
};

// Danh sách các cuộc thi sắp tới
const getUpcomingContests = async (
  accessToken: string,
  isRegistered?: boolean | undefined,
) => {
  const params: any = {}; // Tạo một object chứa các tham số query

  if (isRegistered !== undefined) {
    params.isRegistered = isRegistered; // Thêm tham số isRegistered nếu có
  }

  return callAPI(HttpMethod.GET, `/contests/upcoming`, accessToken, undefined, params);
};

// Danh sách các cuộc thi sắp tới user đã đăng ký
const getUpcomingRegisteredContests = async (
  accessToken: string,
  category?: string,
  pageSize?: number,
  pageIndex?: number,
  keyword?: string
) => {
  return callAPI(
    HttpMethod.GET,
    `/contests/upcoming-registered`,
    accessToken,
    undefined,
    {
      category,
      pageSize,
      pageIndex,
      keyword,
    }
  );
};

// Kết quả các cuộc thi đã hoàn thành
const getCompletedContests = async (
  isRegistered: boolean,
  accessToken: string
) => {
  return callAPI(
    HttpMethod.GET,
    `/contests/completed`,
    accessToken,
    undefined,
    {
      isRegistered,
    }
  );
};

const contestService = {
  getContests,
  getContestById,
  insertContest,
  updateContest,
  deleteContest,
  getContestQuestions,
  addQuestionsToContest,
  addCategoryQuestionsToContest,
  removeQuestionFromContest,
  removeAllQuestionsFromContest,
  getContestParticipants,
  registerForContest,
  unregisterFromContest,
  startContest,
  updateAnswer,
  submitContest,
  getUserResult,
  getLeaderboard,
  getUpcomingContests,
  getUpcomingRegisteredContests,
  getCompletedContests,
};

export default contestService;
