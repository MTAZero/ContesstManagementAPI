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
import UserInfoModal from "./UserInfoModal";
import userAPIService from "../../services/userService";

const UserManagement = () => {
  const { accessToken } = useSelector((state: any) => state.user); // Lấy token từ Redux
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null); // User đang được chỉnh sửa
  const [loading, setLoading] = useState(false);
  const pageSize = 5;

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    if (!accessToken) {
      console.error("Không có token");
      return;
    }
    setLoading(true);
    try {
      const response = await userAPIService.getUsers(
        pageSize,
        page,
        search,
        accessToken
      );
      const { data } = response;
      if (data?.items) {
        setUsers(data.items);
        setTotalPages(Math.ceil(data.total / data.size));
      } else {
        console.error("Không có danh sách người dùng trong phản hồi");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (user: any, isEditing: boolean) => {
    if (!accessToken) {
      console.error("Không có token");
      return;
    }

    try {
      if (isEditing) {
        await userAPIService.updateUser(user._id, user, accessToken);
        Alert.alert("Thành công", "Thông tin người dùng đã được cập nhật.");
      } else {
        await userAPIService.insertUser(user, accessToken);
        Alert.alert("Thành công", "Người dùng đã được thêm.");
      }
      fetchUsers(); // Tải lại danh sách người dùng
    } catch (error) {
      console.error("Lỗi khi lưu thông tin người dùng:", error.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!accessToken) {
      console.error("Không có token");
      return;
    }

    Alert.alert(
      "Xóa Người Dùng",
      "Bạn có chắc chắn muốn xóa người dùng này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          onPress: async () => {
            try {
              await userAPIService.deleteUser(userId, accessToken); // Gọi API xóa
              Alert.alert("Thành công", "Người dùng đã được xóa.");
              fetchUsers(); // Cập nhật danh sách người dùng
            } catch (error) {
              console.error("Lỗi khi xóa người dùng:", error.message);
              Alert.alert("Lỗi", "Không thể xóa người dùng.");
            }
          },
        },
      ]
    );
  };

  const handleEditUser = (user: any) => {
    console.log("user : ", user);
    setUserToEdit(user); // Đặt thông tin user vào state
    setModalVisible(true); // Hiển thị modal
  };

  const handleAddUser = () => {
    setUserToEdit(null); // Đặt chế độ "thêm mới"
    setModalVisible(true); // Hiển thị modal
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => {}} />
        <Appbar.Content title="Quản Lý Người Dùng" />
      </Appbar.Header>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <IconButton icon="magnify" />
          <RNTextInput
            placeholder="Tìm kiếm người dùng..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.fullname}>{item.fullname}</Text>
              <Text style={styles.username}>Username: {item.username}</Text>
              <Text style={styles.role}>Role: {item.role}</Text>
            </View>
            <Card.Actions style={styles.cardActions}>
              <IconButton
                icon="pencil"
                size={16}
                onPress={() => handleEditUser(item)}
              />
              <IconButton
                icon="delete"
                size={16}
                onPress={() => handleDeleteUser(item._id)} // Gọi hàm xóa người dùng
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
          <Text> Trang Trước</Text>
        </Button>

        <Text>
          Trang {page} / {totalPages}
        </Text>

        <Button
          mode="text"
          disabled={page === totalPages}
          onPress={() => setPage((prev) => Math.min(totalPages, prev + 1))}
        >
          <Text> Trang Sau</Text>
        </Button>
      </View>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddUser}
        color="#fff"
        label="Thêm Người Dùng"
      />
      <UserInfoModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        onSubmit={handleSaveUser}
        userToEdit={userToEdit}
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
  fullname: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    marginBottom: 4,
  },
  role: {
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

export default UserManagement;
