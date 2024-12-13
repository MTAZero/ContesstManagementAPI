import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import contestService from "../../../services/contestService";

const ContestQuestions = ({
  contestId,
  accessToken,
}: {
  contestId: string;
  accessToken: string;
}) => {
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0); // Tổng số câu hỏi
  const pageSize = 10; // Đặt kích thước trang là 10

  const fetchQuestions = async () => {
    if (loading || page > totalPages) return;

    setLoading(true);
    try {
      setQuestions([]);
      const response = await contestService.getContestQuestions(
        contestId,
        accessToken,
        page,
        pageSize
      );
      const { items, total, page: pageIndex } = response.data;

      if (page === pageIndex) {
        setTimeout(() => {
          setQuestions(items); // Đặt lại danh sách khi ở trang đầu
          setTotalPages(Math.ceil(total / pageSize));
          setTotalQuestions(total); // Cập nhật tổng số câu hỏi
        }, 1);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [page]);

  const renderAnswer = (answer: any) => (
    <Text
      key={answer._id}
      style={[styles.answer, answer.is_correct && styles.correctAnswer]}
    >
      {answer.content}
    </Text>
  );

  const renderQuestion = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.questionContainer}>
      <Text style={styles.questionTitle}>
        {index + 1 + (page - 1) * pageSize}.{" "}
        {item.question_detail?.content || "Câu hỏi không rõ"}
      </Text>
      <Text style={styles.category}>
        Danh mục: {item.category_detail?.name || "N/A"}
      </Text>
      <Text style={styles.description}>
        {item.question_detail?.description || "Không có mô tả"}
      </Text>
      <View style={styles.answersContainer}>
        <Text style={styles.answersTitle}>Đáp án:</Text>
        {item.answers.map(renderAnswer)}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.totalQuestions}>
        Tổng số câu hỏi: {totalQuestions}
      </Text>
      <FlatList
        data={questions}
        renderItem={renderQuestion}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={
          loading ? <ActivityIndicator size="small" /> : null
        }
      />
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, page === 1 && styles.disabledButton]}
          onPress={() => {
            if (page > 1 && !loading) setPage(page - 1);
          }}
          disabled={page === 1}
        >
          <Text style={styles.paginationText}>Trước</Text>
        </TouchableOpacity>
        <Text style={styles.paginationInfo}>
          Trang {page} / {totalPages}
        </Text>
        <TouchableOpacity
          style={[
            styles.paginationButton,
            page === totalPages && styles.disabledButton,
          ]}
          onPress={() => page < totalPages && setPage(page + 1)}
          disabled={page === totalPages}
        >
          <Text style={styles.paginationText}>Tiếp</Text>
        </TouchableOpacity>
      </View>
      {loading && <ActivityIndicator size="large" style={styles.loader} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  totalQuestions: {
    fontSize: 16,
    fontWeight: "bold",
    padding: 10,
    color: "#333",
  },
  listContainer: {
    padding: 10,
  },
  questionContainer: {
    backgroundColor: "#fff",
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    elevation: 2,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  category: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
    color: "#666",
  },
  answersContainer: {
    marginTop: 10,
  },
  answersTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  answer: {
    fontSize: 14,
    marginVertical: 2,
  },
  correctAnswer: {
    fontWeight: "bold",
    color: "green",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  paginationButton: {
    padding: 10,
    backgroundColor: "#6A0DAD",
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  paginationText: {
    color: "#fff",
    fontWeight: "bold",
  },
  paginationInfo: {
    fontSize: 16,
    fontWeight: "bold",
  },
  loader: {
    marginTop: 10,
  },
});

export default ContestQuestions;
