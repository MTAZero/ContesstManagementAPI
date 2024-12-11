import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Modal, Portal, Text, TextInput, Button } from "react-native-paper";

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
  const [question, setQuestion] = useState({
    title: "",
    content: "",
    options: ["", "", "", ""], // Mặc định 4 lựa chọn
    answer: "",
  });

  useEffect(() => {
    if (questionToEdit) {
      setQuestion(questionToEdit); // Nếu đang chỉnh sửa, cập nhật thông tin câu hỏi
    } else {
      setQuestion({
        title: "",
        content: "",
        options: ["", "", "", ""],
        answer: "",
      }); // Nếu không, đặt giá trị mặc định
    }
  }, [questionToEdit]);

  const handleSave = () => {
    if (
      !question.title ||
      !question.content ||
      !question.answer ||
      question.options.some((option) => !option)
    ) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    onSubmit(question, !!questionToEdit); // Gửi thông tin câu hỏi cùng trạng thái chỉnh sửa
    onDismiss();
  };

  const handleOptionChange = (text: string, index: number) => {
    const updatedOptions = [...question.options];
    updatedOptions[index] = text;
    setQuestion({ ...question, options: updatedOptions });
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <Text style={styles.modalTitle}>
          {questionToEdit ? "Sửa Câu Hỏi" : "Thêm Câu Hỏi"}
        </Text>
        <TextInput
          label="Tiêu đề"
          value={question.title}
          onChangeText={(text) => setQuestion({ ...question, title: text })}
          style={styles.input}
        />
        <TextInput
          label="Nội dung"
          value={question.content}
          onChangeText={(text) => setQuestion({ ...question, content: text })}
          style={styles.input}
          multiline
        />
        {question.options.map((option, index) => (
          <TextInput
            key={index}
            label={`Lựa chọn ${index + 1}`}
            value={option}
            onChangeText={(text) => handleOptionChange(text, index)}
            style={styles.input}
          />
        ))}
        <TextInput
          label="Đáp án đúng"
          value={question.answer}
          onChangeText={(text) => setQuestion({ ...question, answer: text })}
          style={styles.input}
        />
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
    paddingTop: 30,
    marginHorizontal: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#f5f5f5",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
});

export default QuestionInfoModal;
