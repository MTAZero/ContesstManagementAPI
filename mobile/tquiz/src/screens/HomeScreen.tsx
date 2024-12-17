import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  Button,
  Appbar,
  ActivityIndicator,
  SegmentedButtons,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { logout } from "../redux/userSlice";
import contestService from "../services/contestService";

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const { accessToken } = useSelector((state: any) => state.user);
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const [contests, setContests] = useState([]);
  const [filteredContests, setFilteredContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // Bộ lọc: "all", "upcoming", "registered"

  useEffect(() => {
    fetchContests();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, contests]);

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

  const applyFilter = () => {
    switch (filter) {
      case "upcoming":
        setFilteredContests(contests.filter((item: any) => item.canRegister));
        break;
      case "registered":
        setFilteredContests(contests.filter((item: any) => item.isRegistered));
        break;
      default:
        setFilteredContests(contests);
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
      Alert.alert("Lỗi", "Không thể đăng ký cuộc thi.");
    }
  };

  const handleUnregister = async (contestId: string, contestName: string) => {
    try {
      await contestService.unregisterFromContest(contestId, accessToken);
      Alert.alert("Thành công", `Bạn đã hủy đăng ký "${contestName}".`);
      fetchContests();
    } catch (error) {
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

      <View style={styles.rankContainer}>
        <Button
          mode="outlined"
          style={[styles.actionButton, styles.rankButton]}
          onPress={() =>
            navigation.navigate("ContestRanking", { contestId: item._id })
          }
        >
          Xếp Hạng
        </Button>
      </View>

      <View style={styles.actionContainer}>
        {item.canRegister ? (
          item.isRegistered ? (
            <View style={styles.buttonGroup}>
              <Button
                mode="contained"
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleUnregister(item._id, item.name)}
              >
                Hủy Đăng Ký
              </Button>
              <Button
                mode="contained"
                style={[styles.actionButton, styles.joinButton]}
                onPress={() =>
                  navigation.navigate("ContestExam", { contestId: item._id })
                }
              >
                Tham Gia Thi
              </Button>
            </View>
          ) : (
            <Button
              mode="contained"
              style={[styles.actionButton, styles.registerButton]}
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

  const renderFilterButton = (title: string, value: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value && styles.filterButtonActive,
      ]}
      onPress={() => handleFilterChange(value)}
    >
      <Text
        style={[styles.filterText, filter === value && styles.filterTextActive]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const handleFilterChange = (selectedFilter: string) => {
    setFilter(selectedFilter);
  };

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

      {/* Bộ lọc cuộc thi */}
      <View style={styles.filterContainer}>
        {renderFilterButton("Tất Cả", "all")}
        {renderFilterButton("Sắp Diễn Ra", "upcoming")}
        {renderFilterButton("Đã Đăng Ký", "registered")}
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loading} />
      ) : (
        <FlatList
          data={filteredContests}
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
  list: {
    padding: 16,
  },
  filterButtons: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  contestContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
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
  rankContainer: {
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionContainer: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    width: "100%",
  },
  actionButton: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: 6,
  },
  registerButton: {
    backgroundColor: "#6A0DAD",
  },
  cancelButton: {
    backgroundColor: "#FF6347",
  },
  joinButton: {
    backgroundColor: "#1E90FF",
  },
  rankButton: {
    borderColor: "#FFD700",
    borderWidth: 1,
  },
  registeredText: {
    fontSize: 14,
    color: "green",
    fontWeight: "bold",
    textAlign: "center",
  },
  loading: {
    marginTop: 20,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 10,
    margin: 10,
    marginBottom: 0,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
  },
  filterButtonActive: {
    backgroundColor: "#6A0DAD",
  },
  filterText: {
    fontSize: 14,
    color: "#666",
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  adminButton: {
    margin: 16,
    backgroundColor: "#6A0DAD",
  },
});

export default HomeScreen;
