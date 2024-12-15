import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  Checkbox,
  List,
} from "react-native-paper";
import categoryService from "../../services/categoryService";
import { useSelector } from "react-redux";

interface QuestionInfoModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (question: any, isEditing: boolean) => void;
  questionToEdit?: any | null;
}

const QuestionInfoModal: React.FC<QuestionInfoModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
  questionToEdit,
}) => {
  const { accessToken } = useSelector((state: any) => state.user); // Lấy token từ Redux
  const [question, setQuestion] = useState({
    content: "",
    description: "",
    category: "",
    categoryName: "",
    answers: [],
    _id: questionToEdit?._id,
  });

  const [categories, setCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    if (questionToEdit) {
      setQuestion({
        _id: questionToEdit._id,
        content: questionToEdit.content,
        description: questionToEdit.description,
        category: questionToEdit.category_detail?._id || "",
        categoryName: questionToEdit.category_detail?.name || "",
        answers: questionToEdit.answers || [],
      });
    } else {
      setQuestion({
        content: "",
        description: "",
        category: "",
        categoryName: "",
        answers: [
          { content: "", is_correct: false },
          { content: "", is_correct: false },
          { content: "", is_correct: false },
          { content: "", is_correct: false },
        ],
      });
    }
  }, [questionToEdit]);

  const fetchCategories = async (keyword: string) => {
    try {
      const response = await categoryService.getCategories(
        100,
        1,
        keyword,
        accessToken
      );
      setCategories(response.data.items || []);
    } catch (error) {
      console.error("Error fetching categories:", error.message);
    }
  };

  useEffect(() => {
    if (categorySearch) {
      fetchCategories(categorySearch);
      setShowCategories(true);
    } else {
      setShowCategories(false);
    }
  }, [categorySearch]);

  const handleCategorySelect = (category: any) => {
    setQuestion({
      ...question,
      category: category._id,
      categoryName: category.name,
    });
    setShowCategories(false);
  };

  const handleSave = () => {
    if (!question.content || !question.category) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (question.answers.every((answer) => !answer.is_correct)) {
      alert("Phải chọn ít nhất một đáp án đúng.");
      return;
    }
    onSubmit(question, !!questionToEdit);
    onDismiss();
  };

  const handleAnswerChange = (text: string, index: number) => {
    const updatedAnswers = [...question.answers];
    updatedAnswers[index].content = text;
    setQuestion({ ...question, answers: updatedAnswers });
  };

  const handleCorrectAnswerToggle = (index: number) => {
    const updatedAnswers = question.answers.map((answer, i) => ({
      ...answer,
      is_correct: i === index,
    }));
    setQuestion({ ...question, answers: updatedAnswers });
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <ScrollView style={styles.scrollContainer}>
          <Text style={styles.modalTitle}>
            {questionToEdit ? "Sửa Câu Hỏi" : "Thêm Câu Hỏi"}
          </Text>
          <TextInput
            label="Nội dung câu hỏi"
            value={question.content}
            onChangeText={(text) => setQuestion({ ...question, content: text })}
            style={styles.textArea}
            multiline
          />
          <TextInput
            label="Mô tả"
            value={question.description}
            onChangeText={(text) =>
              setQuestion({ ...question, description: text })
            }
            style={styles.input}
            multiline
          />
          <TextInput
            label="Tìm kiếm danh mục"
            value={categorySearch}
            onChangeText={setCategorySearch}
            style={styles.input}
            onFocus={() => setShowCategories(true)}
          />
          {showCategories && (
            <List.Section style={styles.categoryList}>
              {categories.map((category) => (
                <List.Item
                  key={category._id}
                  title={category.name}
                  onPress={() => handleCategorySelect(category)}
                />
              ))}
            </List.Section>
          )}
          <Text style={styles.selectedCategory}>
            Danh mục đã chọn: {question?.categoryName || "Chưa chọn"}
          </Text>
          <Text style={styles.sectionTitle}>Danh sách đáp án</Text>
          {question?.answers.map((answer, index) => (
            <View key={index} style={styles.answerRow}>
              <TextInput
                label={`Đáp án ${index + 1}`}
                value={answer.content}
                onChangeText={(text) => handleAnswerChange(text, index)}
                style={[styles.input, styles.answerInput]}
              />
              <Checkbox
                status={answer.is_correct ? "checked" : "unchecked"}
                onPress={() => handleCorrectAnswerToggle(index)}
              />
            </View>
          ))}
        </ScrollView>
        <View style={styles.modalActions}>
          <Button mode="text" onPress={onDismiss}>
            Hủy
          </Button>
          <Button mode="contained" onPress={handleSave}>
            Lưu
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: "#fff",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 8,
    height: "70%",
  },
  scrollContainer: {
    marginBottom: 60,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    marginBottom: 12,
    backgroundColor: "#f5f5f5",
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#f5f5f5",
  },
  categoryList: {
    marginBottom: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    maxHeight: 150, // Giới hạn chiều cao danh sách
  },
  selectedCategory: {
    marginBottom: 12,
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  answerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  answerInput: {
    flex: 1,
    marginRight: 8,
  },
  modalActions: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default QuestionInfoModal;
