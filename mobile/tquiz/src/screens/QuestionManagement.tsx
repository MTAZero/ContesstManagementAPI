import React from "react";
import { View, StyleSheet } from "react-native";
import { Appbar, Text } from "react-native-paper";

const QuestionManagement = ({ navigation }: { navigation: any }) => {
  return (
    <View style={styles.container}>
      {/* Topbar với nút Back */}
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Quản Lý Câu Hỏi" />
      </Appbar.Header>

      <View style={styles.content}>
        <Text style={styles.title}>Quản Lý Câu Hỏi</Text>
        <Text>Chức năng quản lý câu hỏi sẽ được thêm tại đây.</Text>
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
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
});

export default QuestionManagement;