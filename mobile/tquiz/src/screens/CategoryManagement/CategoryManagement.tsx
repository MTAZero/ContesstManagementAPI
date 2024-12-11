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
  Portal,
  Text,
  IconButton,
  FAB,
} from "react-native-paper";
import { useSelector } from "react-redux";
import CategoryInfoModal from "./CategoryInfoModal"; // Modal thêm/sửa danh mục
import categoryAPIService from "../../services/categoryService";
import { useNavigation } from "@react-navigation/native";

const CategoryManagement = () => {
  const { accessToken } = useSelector((state: any) => state.user); // Lấy token từ Redux
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null); // Danh mục đang được chỉnh sửa
  const [loading, setLoading] = useState(false);
  const pageSize = 5;
  const navigation = useNavigation();

  useEffect(() => {
    fetchCategories();
  }, [page, search]);

  const fetchCategories = async () => {
    if (!accessToken) {
      console.error("Không có token");
      return;
    }
    setLoading(true);
    try {
      const response = await categoryAPIService.getCategories(
        pageSize,
        page,
        search,
        accessToken
      );
      const { data } = response;
      if (data?.items) {
        setCategories(data.items);
        setTotalPages(Math.ceil(data.total / pageSize));
      } else {
        console.error("Không có danh sách danh mục trong phản hồi");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách danh mục:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (category: any, isEditing: boolean) => {
    if (!accessToken) {
      console.error("Không có token");
      return;
    }
    try {
      if (isEditing) {
        await categoryAPIService.updateCategory(
          category._id,
          { name: category.name, description: category.description },
          accessToken
        );
        Alert.alert("Thành công", "Danh mục đã được cập nhật.");
      } else {
        await categoryAPIService.insertCategory(
          { name: category.name, description: category.description },
          accessToken
        );
        Alert.alert("Thành công", "Danh mục đã được thêm.");
      }
      fetchCategories(); // Tải lại danh sách danh mục
    } catch (error) {
      console.error("Lỗi khi lưu danh mục:", error.message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!accessToken) {
      console.error("Không có token");
      return;
    }
    Alert.alert(
      "Xóa Danh Mục",
      "Bạn có chắc chắn muốn xóa danh mục này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          onPress: async () => {
            try {
              await categoryAPIService.deleteCategory(id, accessToken);
              Alert.alert("Thành công", "Danh mục đã được xóa.");
              fetchCategories(); // Tải lại danh sách danh mục
            } catch (error) {
              console.error("Lỗi khi xóa danh mục:", error.message);
            }
          },
        },
      ]
    );
  };

  const handleEditCategory = (category: any) => {
    setCategoryToEdit(category); // Đặt thông tin danh mục vào state
    setModalVisible(true); // Hiển thị modal
  };

  const handleAddCategory = () => {
    setCategoryToEdit(null); // Đặt chế độ "thêm mới"
    setModalVisible(true); // Hiển thị modal
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Quản Lý Danh Mục" />
      </Appbar.Header>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <IconButton icon="magnify" />
          <RNTextInput
            placeholder="Tìm kiếm danh mục..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
      </View>
      <FlatList
        data={categories}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.description}>
                Mô tả: {item.description || "Không có mô tả"}
              </Text>
            </View>
            <Card.Actions style={styles.cardActions}>
              <IconButton
                icon="pencil"
                size={16}
                onPress={() => handleEditCategory(item)}
              />
              <IconButton
                icon="delete"
                size={16}
                onPress={() => handleDeleteCategory(item._id)}
                color="red"
              />
            </Card.Actions>
          </Card>
        )}
      />
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
        onPress={handleAddCategory}
        color="#fff"
        label="Thêm Danh Mục"
      />
      <CategoryInfoModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        onSubmit={handleSaveCategory}
        categoryToEdit={categoryToEdit}
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
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  cardActions: {
    padding: 0,
    marginTop: -8,
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
});

export default CategoryManagement;
