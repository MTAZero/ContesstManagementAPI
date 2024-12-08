import React from "react";
import { View, StyleSheet, FlatList, Alert } from "react-native";
import { Text, Button, Appbar, Card } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { logout } from "../redux/userSlice";

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);

  const data = [
    {
      _id: "67542b664c32e29bf175b2ed",
      name: "Physics Olympiad 2024",
      description: "A prestigious physics competition for top students worldwide.",
      start_time: "2024-12-10T10:00:00.000Z",
      canRegister: true,
      isRegistered: true,
    },
    {
      _id: "67542b6d4c32e29bf175b2f0",
      name: "Programming Hackathon",
      description: "An intense 12-hour programming competition.",
      start_time: "2024-12-15T08:00:00.000Z",
      canRegister: true,
      isRegistered: false,
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigation.replace("Login");
  };

  const handleRegister = (contestName: string) => {
    Alert.alert(
      "Tham gia cuộc thi",
      `Bạn đã đăng ký tham gia cuộc thi "${contestName}"!`,
      [{ text: "OK" }]
    );
  };

  const renderContest = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <Card.Title
        title={item.name}
        subtitle={`Bắt đầu: ${new Date(item.start_time).toLocaleString()}`}
      />
      <Card.Content>
        <Text>{item.description}</Text>
      </Card.Content>
      <Card.Actions>
        {item.canRegister && !item.isRegistered ? (
          <Button mode="outlined" onPress={() => handleRegister(item.name)}>
            Đăng Ký
          </Button>
        ) : (
          <Button mode="text" disabled>
            {item.isRegistered ? "Đã Đăng Ký" : "Không Thể Đăng Ký"}
          </Button>
        )}
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Topbar */}
      <Appbar.Header>
        <Appbar.Content title={`${user?.fullname} [${user?.username}]`} />
        <Appbar.Action icon="logout" onPress={handleLogout} />
      </Appbar.Header>

      {/* Nút Quản Trị nếu user là admin */}
      {user?.role === "admin" && (
        <Button
          mode="contained"
          style={styles.adminButton}
          onPress={() => navigation.navigate("Admin")}
        >
          Quản Trị Hệ Thống
        </Button>
      )}

      {/* Danh sách các cuộc thi */}
      <FlatList
        data={data}
        renderItem={renderContest}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  adminButton: {
    margin: 16,
    backgroundColor: "#6A0DAD",
  },
});

export default HomeScreen;