import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  TextInput as RNTextInput,
} from "react-native";
import {
  Appbar,
  Button,
  Card,
  Text,
  IconButton,
  FAB,
  ActivityIndicator,
} from "react-native-paper";
import { useSelector } from "react-redux";
import QuestionInfoModal from "./QuestionInfoModal";
import questionAPIService from "../../services/questionService";
import { useNavigation } from "@react-navigation/native";

const QuestionManagement = () => {
  const { accessToken } = useSelector((state: any) => state.user); // Lấy token từ Redux
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState(null); // Câu hỏi đang chỉnh sửa
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  const navigation = useNavigation();

  useEffect(() => {
    fetchQuestions();
  }, [page, search]);

  const fetchQuestions = async () => {
    if (!accessToken) {
      console.error("Không có token");
      return;
    }
    setLoading(true);
    try {
      const response = await questionAPIService.getQuestions(
        "",
        pageSize,
        page,
        search,
        accessToken
      );
      const { data } = response;
      if (data?.items) {
        setQuestions(data.items);
        setTotalPages(Math.ceil(data.total / pageSize));
      } else {
        console.error("Không có danh sách câu hỏi trong phản hồi");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách câu hỏi:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestion = async (question: any, isEditing: boolean) => {
    if (!accessToken) {
      console.error("Không có token");
      return;
    }
    try {
      if (isEditing) {
        await questionAPIService.updateQuestion(
          question._id,
          question,
          accessToken
        );
        Alert.alert("Thành công", "Câu hỏi đã được cập nhật.");
      } else {
        await questionAPIService.insertQuestion(question, accessToken);
        Alert.alert("Thành công", "Câu hỏi đã được thêm.");
      }
      fetchQuestions(); // Tải lại danh sách câu hỏi
    } catch (error) {
      console.error("Lỗi khi lưu thông tin câu hỏi:", error.message);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!accessToken) {
      console.error("Không có token");
      return;
    }
    Alert.alert("Xóa Câu Hỏi", "Bạn có chắc chắn muốn xóa câu hỏi này không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        onPress: async () => {
          try {
            await questionAPIService.deleteQuestion(id, accessToken);
            Alert.alert("Thành công", "Câu hỏi đã được xóa.");
            fetchQuestions(); // Tải lại danh sách câu hỏi
          } catch (error) {
            console.error("Lỗi khi xóa câu hỏi:", error.message);
          }
        },
      },
    ]);
  };

  const handleEditQuestion = (question: any) => {
    setQuestionToEdit(question); // Đặt thông tin câu hỏi vào state
    setModalVisible(true); // Hiển thị modal
  };

  const handleAddQuestion = () => {
    setQuestionToEdit(null); // Đặt chế độ "thêm mới"
    setModalVisible(true); // Hiển thị modal
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Quản Lý Câu Hỏi" />
      </Appbar.Header>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <IconButton icon="magnify" />
          <RNTextInput
            placeholder="Tìm kiếm câu hỏi..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
      </View>
      {loading ? (
        <ActivityIndicator size="large" style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={questions}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.cardContent}>
                {/* Nội dung câu hỏi */}
                <Text style={styles.title}>{item.content}</Text>
                {/* Danh mục câu hỏi */}
                <Text style={styles.category}>
                  <Text style={styles.label}>Danh mục:</Text>{" "}
                  {item.category_detail?.name || "Không rõ"}
                </Text>
                {/* Các lựa chọn */}
                <View style={styles.optionsContainer}>
                  <Text style={styles.label}>Lựa chọn:</Text>
                  {item.answers.map((answer, index) => (
                    <Text
                      key={index}
                      style={[
                        styles.option,
                        answer.is_correct && styles.correctOption,
                      ]}
                    >
                      - {answer.content} {answer.is_correct ? "(Đúng)" : ""}
                    </Text>
                  ))}
                </View>
              </View>
              {/* Nút hành động */}
              <Card.Actions style={styles.cardActions}>
                <IconButton
                  icon="pencil"
                  size={20}
                  onPress={() => handleEditQuestion(item)}
                  color="#6A0DAD"
                />
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={() => handleDeleteQuestion(item._id)}
                  color="red"
                />
              </Card.Actions>
            </Card>
          )}
        />
      )}
      <View style={styles.pagination}>
        <Button
          mode="text"
          disabled={page === 1}
          onPress={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          Trang Trước
        </Button>
        <Text>
          Trang {page} / {totalPages}
        </Text>
        <Button
          mode="text"
          disabled={page === totalPages}
          onPress={() => setPage((prev) => Math.min(totalPages, prev + 1))}
        >
          Trang Sau
        </Button>
      </View>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddQuestion}
        color="#fff"
        label="Thêm Câu Hỏi"
      />
      <QuestionInfoModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        onSubmit={handleSaveQuestion}
        questionToEdit={questionToEdit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  searchInputContainer: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    backgroundColor: "#fff",
    paddingHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  card: {
    margin: 4,
    marginLeft: 16,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    padding: 8,
  },
  cardContent: {
    paddingBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    marginBottom: 4,
  },
  optionsContainer: {
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#444",
  },
  option: {
    fontSize: 14,
    marginTop: 4,
    color: "#333",
  },
  correctOption: {
    color: "green",
    fontWeight: "bold",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 50,
    backgroundColor: "#6A0DAD",
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default QuestionManagement;
