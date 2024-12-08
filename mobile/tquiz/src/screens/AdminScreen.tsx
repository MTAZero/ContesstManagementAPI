import React from "react";
import { View, StyleSheet } from "react-native";
import { Appbar, Text } from "react-native-paper";

const AdminScreen = ({ navigation }: { navigation: any }) => {
  return (
    <View style={styles.container}>
      {/* Topbar với nút Back */}
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Quản Trị Hệ Thống" />
      </Appbar.Header>

      {/* Nội dung màn hình */}
      <View style={styles.content}>
        <Text style={styles.title}>Chức năng quản trị</Text>
        <Text>Chức năng quản trị sẽ được thêm tại đây.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
});

export default AdminScreen;
