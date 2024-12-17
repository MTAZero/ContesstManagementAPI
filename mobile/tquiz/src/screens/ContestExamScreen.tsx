import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  Appbar,
  Text,
  RadioButton,
  Button,
  ActivityIndicator,
  Modal,
  Portal,
} from "react-native-paper";
import contestService from "../services/contestService";
import { useSelector } from "react-redux";

const ContestExamScreen = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const { accessToken } = useSelector((state: any) => state.user);
  const { contestId } = route.params;
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const questionRefs = useRef<Array<View | null>>([]); // Ref cho từng câu hỏi
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await contestService.startContest(
        contestId,
        accessToken
      );
      const questionsData = response.data || [];
      const initialAnswers = questionsData.reduce((acc: any, question: any) => {
        if (question.user_choice) {
          acc[question._id] = question.user_choice.answer;
        }
        return acc;
      }, {});
      setQuestions(questionsData);
      setAnswers(initialAnswers);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải câu hỏi.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = async (
    id: string,
    questionId: string,
    answerId: string
  ) => {
    try {
      setAnswers((prev) => ({ ...prev, [id]: answerId }));
      await contestService.updateAnswer(
        contestId,
        questionId,
        answerId,
        accessToken
      );
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật lựa chọn của bạn.");
    }
  };

  const scrollToQuestion = (index: number) => {
    setModalVisible(false);
    questionRefs.current[index]?.measureLayout(
      scrollViewRef.current,
      (_x, y) => {
        scrollViewRef.current?.scrollTo({ y, animated: true });
      }
    );
  };

  const handleSubmitExam = async () => {
    const unansweredQuestions = questions.filter((q: any) => !answers[q._id]);
    if (unansweredQuestions.length > 0) {
      Alert.alert("Chưa hoàn thành", "Vui lòng hoàn thành tất cả câu hỏi.");
      return;
    }
    try {
      await contestService.submitContest(contestId, accessToken);
      Alert.alert("Nộp bài thành công", "Bài thi của bạn đã được nộp.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi nộp bài.");
    }
  };

  const renderQuestionGrid = () => {
    const rows = [];
    for (let i = 0; i < questions.length; i += 5) {
      const rowQuestions = questions.slice(i, i + 5);
      rows.push(
        <View key={i} style={styles.questionRow}>
          {rowQuestions.map((item, index) => (
            <TouchableOpacity
              key={item._id}
              style={[
                styles.questionItem,
                answers[item._id] && styles.questionItemAnswered,
              ]}
              onPress={() => scrollToQuestion(i + index)}
            >
              <Text
                style={[
                  styles.questionItemText,
                  answers[item._id] && { color: "#fff" },
                ]}
              >
                {i + index + 1}
              </Text>
            </TouchableOpacity>
          ))}
          {/* Ô trống khi câu hỏi lẻ */}
          {rowQuestions.length < 5 &&
            Array.from({ length: 5 - rowQuestions.length }).map((_, idx) => (
              <View key={`empty-${i + idx}`} style={styles.emptySlot} />
            ))}
        </View>
      );
    }
    return rows;
  };

  const allQuestionsAnswered = questions.every((q: any) => answers[q._id]);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Bài Thi" />
        <Appbar.Action
          icon="eye"
          onPress={() => setModalVisible(true)} // Mở modal
        />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loading} />
      ) : (
        <>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.content}
          >
            {questions.map((item: any, index: number) => (
              <View
                key={item._id}
                ref={(ref) => (questionRefs.current[index] = ref)}
                style={styles.questionContainer}
              >
                <Text style={styles.questionText}>
                  {index + 1}. {item.question_detail.content}
                </Text>
                <RadioButton.Group
                  onValueChange={(value) =>
                    handleAnswerChange(item._id, item.question, value)
                  }
                  value={answers[item._id] || ""}
                >
                  {item.answers.map((answer: any) => (
                    <TouchableOpacity
                      key={answer._id}
                      style={[
                        styles.optionContainer,
                        answers[item._id] === answer._id &&
                          styles.optionSelected,
                      ]}
                      onPress={() =>
                        handleAnswerChange(item._id, item.question, answer._id)
                      }
                    >
                      <RadioButton.Android value={answer._id} color="#6A0DAD" />
                      <Text style={styles.optionText}>{answer.content}</Text>
                    </TouchableOpacity>
                  ))}
                </RadioButton.Group>
              </View>
            ))}
            <Button
              mode="contained"
              onPress={handleSubmitExam}
              style={[
                styles.submitButton,
                !allQuestionsAnswered && styles.submitButtonDisabled,
              ]}
              disabled={!allQuestionsAnswered}
            >
              Nộp Bài
            </Button>
          </ScrollView>

          <Portal>
            <Modal
              visible={modalVisible}
              onDismiss={() => setModalVisible(false)}
              contentContainerStyle={styles.modalContainer}
            >
              <Text style={styles.modalTitle}>Danh Sách Câu Hỏi</Text>
              <View>{renderQuestionGrid()}</View>
              <Button
                mode="contained"
                onPress={handleSubmitExam}
                style={[
                  styles.submitButton,
                  !allQuestionsAnswered && styles.submitButtonDisabled,
                ]}
                disabled={!allQuestionsAnswered}
              >
                Nộp Bài
              </Button>
            </Modal>
          </Portal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loading: { marginTop: 20 },
  content: { padding: 16 },
  questionContainer: {
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
  },
  questionText: { fontSize: 16, fontWeight: "bold", color: "#333" },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    padding: 10,
  },
  optionSelected: { backgroundColor: "#f3e5f5" },
  optionText: { fontSize: 14, marginLeft: 8 },
  submitButton: { marginTop: 20, backgroundColor: "#6A0DAD", borderRadius: 8 },
  submitButtonDisabled: { backgroundColor: "#ccc" },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    marginHorizontal: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  questionRow: {
    flexDirection: "row",
    // justifyContent: "flex-start",
    gap: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  questionItem: {
    width: 50,
    height: 50,
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
  },
  questionItemAnswered: { backgroundColor: "#6A0DAD" },
  questionItemText: { fontSize: 16, fontWeight: "bold", color: "#333" },
  emptySlot: { width: 50, height: 50, margin: 5 },
});

export default ContestExamScreen;
