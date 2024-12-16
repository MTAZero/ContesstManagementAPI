import React from "react";
import { View, StyleSheet } from "react-native";
import { Appbar, List } from "react-native-paper";
import NavBar from "../components/NavBar";

const AdminScreen = ({ navigation }: { navigation: any }) => {
  const handleNavigation = (destination: string) => {
    navigation.navigate(destination); // Điều hướng đến màn hình tương ứng
  };

  return (
    <View style={styles.container}>
      {/* Topbar với nút Back */}
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Quản Trị Hệ Thống" />
      </Appbar.Header>

      {/* Menu quản trị */}
      <View style={styles.menu}>
        <List.Section>
          <View style={styles.itemContainer}>
            <List.Item
              style={styles.item}
              title="Quản Lý Người Dùng"
              description="Thêm, sửa, xóa thông tin người dùng"
              left={(props) => <List.Icon {...props} icon="account" />}
              onPress={() => handleNavigation("UserManagement")}
            />
          </View>
          <View style={styles.itemContainer}>
            <List.Item
              style={styles.item}
              title="Quản Lý Câu Hỏi"
              description="Thêm, sửa, xóa câu hỏi trong hệ thống"
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              onPress={() => handleNavigation("QuestionManagement")}
            />
          </View>
          <View style={styles.itemContainer}>
            <List.Item
              style={styles.item}
              title="Quản Lý Danh Mục Câu Hỏi"
              description="Quản lý danh mục câu hỏi và nội dung liên quan"
              left={(props) => <List.Icon {...props} icon="folder" />}
              onPress={() => handleNavigation("CategoryManagement")}
            />
          </View>
          <View style={styles.itemContainer}>
            <List.Item
              style={styles.item}
              title="Quản Lý Cuộc Thi"
              description="Thêm, sửa, xóa các cuộc thi"
              left={(props) => <List.Icon {...props} icon="trophy" />}
              onPress={() => handleNavigation("ContestManagement")}
            />
          </View>
        </List.Section>
      </View>
      <NavBar navigation={navigation}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menu: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  itemContainer: {
    marginBottom: 5, // Khoảng cách giữa các mục
  },
  item: {
    backgroundColor: "#ffffff", // Màu nền trắng
    borderRadius: 4, // Bo góc
    elevation: 2, // Bóng đổ nhẹ
  },
});

export default AdminScreen;
