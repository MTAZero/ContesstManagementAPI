import { View, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { List } from "react-native-paper";

const NavBar = ({ navigation }: { navigation: any }) => {

  const handleNavigation = (destination: string) => {
      navigation.navigate(destination); // Điều hướng đến màn hình tương ứng
    };

  return (
    <View>
      <List.Section style={styles.listSection}>
        <View style={styles.listItem}>
          <TouchableOpacity onPress={() => handleNavigation("Home")}>
            <List.Icon icon="home" style={styles.listIcon} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.listItem}>
          <TouchableOpacity onPress={() => handleNavigation("Admin")}>
            <List.Icon icon="cogs" style={styles.listIcon} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.listItem}>
          <TouchableOpacity onPress={() => handleNavigation("Admin")}>
            <List.Icon icon="tune" style={styles.listIcon} color="#fff" />
          </TouchableOpacity>
        </View>
      </List.Section>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listSection: {
    flexDirection: "row", // Sắp xếp các item theo hàng ngang
    justifyContent: "space-around", // Căn đều các icon
    alignItems: "center", // Căn giữa icon theo chiều dọc
    paddingVertical: 12, // Khoảng cách trên-dưới
    backgroundColor: "#fff", // Nền trắng
    borderTopWidth: 1, // Đường viền trên cùng
    borderTopColor: "#ddd", // Màu đường viền
  },
  listItem: {
    alignItems: "center", // Căn giữa mỗi item
  },
  listIcon: {
    backgroundColor: "#6A0DAD", // Nền tím cho icon
    borderRadius: 20, // Icon bo tròn
    padding: 12, // Khoảng cách bên trong icon
  },
});

export default NavBar;
