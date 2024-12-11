import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  Menu,
  Divider,
} from "react-native-paper";

interface UserInfoModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (
    user: {
      _id: string;
      fullname: string;
      username: string;
      password?: string;
      role: string;
    },
    isEditing: boolean
  ) => void;
  userToEdit?: {
    _id: string;
    fullname: string;
    username: string;
    role: string;
  } | null;
}

const UseInfoModal: React.FC<UserInfoModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
  userToEdit,
}) => {
  const [user, setUser] = useState({
    _id: "",
    fullname: "",
    username: "",
    password: "",
    role: "user",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setUser({
        fullname: userToEdit.fullname,
        username: userToEdit.username,
        role: userToEdit.role,
        password: "",
        _id: userToEdit._id,
      });
      setConfirmPassword(""); // Xóa confirm password khi chỉnh sửa
    } else {
      setUser({
        _id: "",
        fullname: "",
        username: "",
        password: "",
        role: "user",
      });
      setConfirmPassword("");
    }
  }, [userToEdit]);

  const isSaveEnabled =
    user.fullname &&
    user.username &&
    user.role &&
    (userToEdit || (user.password && user.password === confirmPassword)); // Kiểm tra điều kiện nút Lưu

  const handleSave = () => {
    if (!isSaveEnabled) return;
    onSubmit(user, !!userToEdit); // Gửi thông tin người dùng cùng trạng thái chỉnh sửa
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
          {userToEdit ? "Sửa Thông Tin Người Dùng" : "Thêm Người Dùng"}
        </Text>
        <TextInput
          label="Họ và Tên"
          value={user.fullname}
          onChangeText={(text) => setUser({ ...user, fullname: text })}
          style={styles.input}
        />
        <TextInput
          label="Username"
          value={user.username}
          onChangeText={(text) => setUser({ ...user, username: text })}
          style={styles.input}
          disabled={!!userToEdit} // Không cho sửa username khi chỉnh sửa
        />
        {!userToEdit && ( // Chỉ hiển thị ô nhập mật khẩu khi thêm mới
          <>
            <TextInput
              label="Password"
              secureTextEntry
              value={user.password}
              onChangeText={(text) => setUser({ ...user, password: text })}
              style={styles.input}
            />
            <TextInput
              label="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              error={!!user.password && user.password !== confirmPassword}
            />
            {user.password && user.password !== confirmPassword && (
              <Text style={styles.errorText}>Mật khẩu không trùng khớp</Text>
            )}
          </>
        )}
        <Text style={styles.dropdownLabel}>Vai Trò</Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              style={styles.dropdown}
            >
              {user.role === "user" ? "User" : "Admin"}
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setUser({ ...user, role: "user" });
              setMenuVisible(false);
            }}
            title="User"
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              setUser({ ...user, role: "admin" });
              setMenuVisible(false);
            }}
            title="Admin"
          />
        </Menu>
        <View style={styles.modalActions}>
          <Button mode="text" onPress={onDismiss}>
            Hủy
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            disabled={!isSaveEnabled} // Nút Lưu chỉ được kích hoạt khi điều kiện đúng
          >
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
  dropdownLabel: {
    fontSize: 16,
    marginVertical: 8,
  },
  dropdown: {
    marginBottom: 12,
    backgroundColor: "#f5f5f5",
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#f5f5f5",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
});

export default UseInfoModal;
