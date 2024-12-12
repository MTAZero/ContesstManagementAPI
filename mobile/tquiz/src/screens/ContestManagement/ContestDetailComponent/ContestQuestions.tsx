import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Text } from "react-native";
import contestService from "../../../services/contestService";

const ContestQuestions = ({
  contestId,
  accessToken,
}: {
  contestId: string;
  accessToken: string;
}) => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await contestService.getContestQuestions(
        contestId,
        accessToken
      );
      setQuestions(response.data.items || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const renderAnswer = (answer: any) => {
    return (
      <Text
        key={answer._id}
        style={[styles.answer, answer.is_correct && styles.correctAnswer]}
      >
        {answer.content}
      </Text>
    );
  };

  const renderQuestion = ({ item }: { item: any }) => (
    <View style={styles.questionBox}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionTitle}>
          {item.question_detail?.content || "Câu hỏi không rõ"}
        </Text>
      </View>
      <View style={styles.questionContent}>
        <Text style={styles.category}>
          Danh mục: {item.category_detail?.name || "N/A"}
        </Text>
        {/* <Text style={styles.description}>
          {item.question_detail?.description || "Không có mô tả"}
        </Text> */}
        <View style={styles.answersContainer}>
          <Text style={styles.answersTitle}>Đáp án:</Text>
          {item.answers.map(renderAnswer)}
        </View>
      </View>
    </View>
  );

  return (
    <FlatList
      data={questions}
      renderItem={renderQuestion}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 10,
  },
  questionBox: {
    marginBottom: 5,
    borderRadius: 8,
    backgroundColor: "#fff",
    padding: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  questionHeader: {
    marginBottom: 10,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 22, // Đảm bảo tiêu đề hiển thị đầy đủ
    color: "#333",
  },
  questionContent: {
    marginTop: 10,
  },
  category: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#555",
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
});

export default ContestQuestions;
