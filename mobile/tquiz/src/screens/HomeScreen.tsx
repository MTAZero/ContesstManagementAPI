import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Alert } from "react-native";
import { Text, Button, Appbar, ActivityIndicator } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { logout } from "../redux/userSlice";
import contestService from "../services/contestService";

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const { accessToken } = useSelector((state: any) => state.user); // Lấy token từ Redux
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const response = await contestService.getUpcomingContests(accessToken);
      setContests(response.data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách cuộc thi:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách cuộc thi.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigation.replace("Login");
  };

  const handleRegister = async (contestId: string, contestName: string) => {
    try {
      await contestService.registerForContest(contestId, accessToken);
      Alert.alert("Thành công", `Bạn đã đăng ký tham gia "${contestName}".`);
      fetchContests();
    } catch (error) {
      console.error("Lỗi khi đăng ký cuộc thi:", error);
      Alert.alert("Lỗi", "Không thể đăng ký cuộc thi.");
    }
  };

  const handleUnregister = async (contestId: string, contestName: string) => {
    try {
      await contestService.unregisterFromContest(contestId, accessToken);
      Alert.alert("Thành công", `Bạn đã hủy đăng ký "${contestName}".`);
      fetchContests(); // Cập nhật lại danh sách cuộc thi
    } catch (error) {
      console.error("Lỗi khi hủy đăng ký cuộc thi:", error);
      Alert.alert("Lỗi", "Không thể hủy đăng ký cuộc thi.");
    }
  };

  const renderContest = ({ item }: { item: any }) => (
    <View style={styles.contestContainer}>
      <View style={styles.infoContainer}>
        <Text style={styles.contestName}>{item.name}</Text>
        <Text style={styles.contestDescription}>{item.description}</Text>
        <Text style={styles.contestTime}>
          Bắt đầu: {new Date(item.start_time).toLocaleString()}
        </Text>
      </View>
      <View style={styles.actionContainer}>
        {item.canRegister ? (
          item.isRegistered ? (
            <Button
              mode="outlined"
              color="red"
              onPress={() => handleUnregister(item._id, item.name)}
            >
              Hủy Đăng Ký
            </Button>
          ) : (
            <Button
              mode="outlined"
              style={styles.registerButton}
              onPress={() => handleRegister(item._id, item.name)}
            >
              Đăng Ký
            </Button>
          )
        ) : (
          <Text style={styles.registeredText}>
            {item.isRegistered ? "Đã Đăng Ký" : "Không Thể Đăng Ký"}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title={`${user?.fullname} [${user?.username}]`} />
        <Appbar.Action icon="logout" onPress={handleLogout} />
      </Appbar.Header>

      {user?.role === "admin" && (
        <Button
          mode="contained"
          style={styles.adminButton}
          onPress={() => navigation.navigate("Admin")}
        >
          Quản Trị Hệ Thống
        </Button>
      )}

      {loading ? (
        <ActivityIndicator size="large" style={styles.loading} />
      ) : (
        <FlatList
          data={contests}
          renderItem={renderContest}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  dashboard: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 16,
  },
  dashboardCard: {
    width: "48%",
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    elevation: 2,
  },
  dashboardText: {
    fontSize: 14,
    color: "#888",
    textAlign: "left",
    marginBottom: 8,
  },
  dashboardValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  list: {
    padding: 16,
  },
  contestContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoContainer: {
    marginBottom: 10,
  },
  contestName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  contestDescription: {
    fontSize: 14,
    color: "#666",
    marginVertical: 5,
  },
  contestTime: {
    fontSize: 14,
    color: "#666",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  registerButton: {
    borderColor: "#6A0DAD",
  },
  registeredText: {
    fontSize: 14,
    color: "green",
    fontWeight: "bold",
  },
  adminButton: {
    margin: 16,
    backgroundColor: "#6A0DAD",
  },
  loading: {
    marginTop: 20,
  },
});

export default HomeScreen;

