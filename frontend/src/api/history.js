// frontend/src/api/history.js
import { API_HISTORY } from './apiConfig';

//Lấy dữ liệu biểu đồ theo khoảng ngày (7 hoặc 30)
export const fetchChartData = range => API_HISTORY.get(`/chart?range=${range}`);

//Lấy danh sách bản ghi gần đây (cho phần dưới biểu đồ)
export const fetchRecordList = () => API_HISTORY.get('/list');

//Lấy danh sách bản ghi theo ngày cụ thể
export const fetchRecordsByDate = date =>
  API_HISTORY.get(`/by-date?date=${date}`);

//Lấy chi tiết 1 bản ghi cụ thể theo ID
export const getRecordDetail = id => API_HISTORY.get(`/record/${id}`);

//Lấy danh sách bản ghi gần đây, có lọc theo topic và limit
export const fetchRecentRecords = ({
  topicId = null,
  limit = 10,
  page = 1,
} = {}) => {
  const params = new URLSearchParams();
  if (topicId !== null) params.append('topic_id', topicId); // ⚠️ CHỈ append nếu khác null
  params.append('limit', limit); // luôn append
  params.append('page', page); // luôn append
  return API_HISTORY.get(`/recent?${params.toString()}`);
};
