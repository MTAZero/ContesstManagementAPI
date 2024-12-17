import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Text, Button, Appbar, ActivityIndicator } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { logout } from "../redux/userSlice";
import contestService from "../services/contestService";

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const { accessToken } = useSelector((state: any) => state.user);
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // Bộ lọc: "all", "upcoming", "registered"
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchContests();
  }, [filter, currentPage]);

  const fetchContests = async () => {
    setLoading(true);
    try {
      const response = await contestService.getUserContest(
        accessToken,
        pageSize,
        currentPage,
        "",
        ""
      );

      setContests(response.data?.items || []);
      setTotalPages(Math.ceil(response.data?.total / pageSize) || 1);
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
      Alert.alert("Lỗi", "Không thể đăng ký cuộc thi.");
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
        {item.is_registered ? (
          item.is_submitted ? (
            <Text style={styles.statusText}>Đã Nộp Bài</Text>
          ) : (
            <Button
              mode="contained"
              style={[styles.actionButton, styles.joinButton]}
              onPress={() =>
                navigation.navigate("ContestExam", { contestId: item._id })
              }
            >
              Vào Thi
            </Button>
          )
        ) : (
          <Button
            mode="contained"
            style={[styles.actionButton, styles.registerButton]}
            onPress={() => handleRegister(item._id, item.name)}
          >
            Đăng Ký
          </Button>
        )}
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <Button
        disabled={currentPage === 1}
        onPress={() => setCurrentPage((prev) => prev - 1)}
      >
        Trang Trước
      </Button>
      <Text style={styles.pageIndicator}>
        {currentPage} / {totalPages}
      </Text>
      <Button
        disabled={currentPage === totalPages}
        onPress={() => setCurrentPage((prev) => prev + 1)}
      >
        Trang Sau
      </Button>
    </View>
  );

  const renderFilterButton = (title: string, value: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[styles.filterText, filter === value && styles.filterTextActive]}
      >
        {title}
      </Text>
    </TouchableOpacity>
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

      {/* Bộ lọc */}
      <View style={styles.filterContainer}>
        {renderFilterButton("Tất Cả", "all")}
        {renderFilterButton("Sắp Diễn Ra", "upcoming")}
        {renderFilterButton("Đã Đăng Ký", "registered")}
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loading} />
      ) : (
        <>
          <FlatList
            data={contests}
            renderItem={renderContest}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
          />
          {renderPagination()}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  list: { padding: 16 },
  contestContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  infoContainer: { marginBottom: 10 },
  contestName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  contestDescription: { fontSize: 14, color: "#666", marginVertical: 5 },
  contestTime: { fontSize: 14, color: "#666" },
  rankContainer: {
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionContainer: { marginTop: 10 },
  actionButton: { borderRadius: 24, paddingVertical: 6 },
  registerButton: { backgroundColor: "#6A0DAD" },
  joinButton: { backgroundColor: "#1E90FF" },
  rankButton: { borderColor: "#FFD700", borderWidth: 1 },
  statusText: { fontSize: 14, color: "#999", fontWeight: "bold" },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 10,
    marginLeft: 15,
    marginRight: 15,
    paddingVertical: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
  },
  filterButtonActive: { backgroundColor: "#6A0DAD" },
  filterText: { fontSize: 14, color: "#666" },
  filterTextActive: { color: "#fff", fontWeight: "bold" },
  loading: { marginTop: 20 },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    gap: 20,
  },
  pageIndicator: { fontSize: 16, fontWeight: "bold" },
  adminButton: {
    margin: 16,
    backgroundColor: "#6A0DAD",
  },
});

export default HomeScreen;
