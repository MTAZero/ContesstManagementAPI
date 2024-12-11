import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Modal, Portal, Text, TextInput, Button } from "react-native-paper";

interface CategoryInfoModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (
    category: { name: string; description: string },
    isEditing: boolean
  ) => void;
  categoryToEdit?: { name: string; description: string } | null;
}

const CategoryInfoModal: React.FC<CategoryInfoModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
  categoryToEdit,
}) => {
  const [category, setCategory] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (categoryToEdit) {
      setCategory(categoryToEdit); // Nếu có categoryToEdit, cập nhật state với thông tin danh mục
    } else {
      setCategory({ name: "", description: "" }); // Nếu không, đặt giá trị mặc định
    }
  }, [categoryToEdit]);

  const handleSave = () => {
    if (!category.name) {
      alert("Vui lòng điền tên danh mục.");
      return;
    }
    onSubmit(category, !!categoryToEdit); // Gửi thông tin danh mục và trạng thái chỉnh sửa
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <Text style={styles.modalTitle}>
          {categoryToEdit ? "Sửa Danh Mục" : "Thêm Danh Mục"}
        </Text>
        <TextInput
          label="Tên Danh Mục"
          value={category.name}
          onChangeText={(text) => setCategory({ ...category, name: text })}
          style={styles.input}
        />
        <TextInput
          label="Mô Tả"
          value={category.description}
          onChangeText={(text) =>
            setCategory({ ...category, description: text })
          }
          style={styles.input}
          multiline
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

export default CategoryInfoModal;
