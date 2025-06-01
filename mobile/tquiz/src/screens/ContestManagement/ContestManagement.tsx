import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  TextInput as RNTextInput,
} from "react-native";
import { Appbar, Button, Text, IconButton, FAB } from "react-native-paper";
import { useSelector } from "react-redux";
import ContestInfoModal from "./ContestInfoModal";
import contestService from "../../services/contestService";
import { useNavigation } from "@react-navigation/native";

const ContestManagement = () => {
  const { accessToken } = useSelector((state: any) => state.user);
  const [contests, setContests] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [contestToEdit, setContestToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const pageSize = 4;

  useEffect(() => {
    fetchContests();
  }, [page, search]);

  const fetchContests = async () => {
    if (!accessToken) return;
    setLoading(true);

    try {
      const response = await contestService.getContests(
        pageSize,
        page,
        search,
        accessToken
      );
      const { data } = response;
      if (data?.items) {
        setContests(data.items);
        setTotalPages(Math.ceil(data.total / pageSize));
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách cuộc thi:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContest = async (contest: any, isEditing: boolean) => {
    if (!accessToken) return;
    const {_id, ...rest} = contest;

    try {
      if (isEditing) {
        await contestService.updateContest(contest._id, rest, accessToken);
        Alert.alert("Thành công", "Cuộc thi đã được cập nhật.");
      } else {
        await contestService.insertContest(rest, accessToken);
        Alert.alert("Thành công", "Cuộc thi đã được thêm.");
      }
      fetchContests();
    } catch (error) {
      console.error("Lỗi khi lưu thông tin cuộc thi:", error.message);
    }
  };

  const handleDeleteContest = async (id: string) => {
    if (!accessToken) return;

    Alert.alert(
      "Xóa Cuộc Thi",
      "Bạn có chắc chắn muốn xóa cuộc thi này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          onPress: async () => {
            try {
              await contestService.deleteContest(id, accessToken);
              Alert.alert("Thành công", "Cuộc thi đã được xóa.");
              fetchContests();
            } catch (error) {
              console.error("Lỗi khi xóa cuộc thi:", error.message);
            }
          },
        },
      ]
    );
  };

  const handleEditContest = (contest: any) => {
    setContestToEdit(contest);
    setModalVisible(true);
  };

  const handleAddContest = () => {
    setContestToEdit(null);
    setModalVisible(true);
  };

  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Quản Lý Cuộc Thi" />
      </Appbar.Header>

      {/* Tìm kiếm */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <IconButton icon="magnify" />
          <RNTextInput
            placeholder="Tìm kiếm cuộc thi..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Danh sách cuộc thi */}
      <FlatList
        data={contests}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.contestContainer}>
            <View style={styles.contestInfo}>
              <Text style={styles.contestName}>{item.name}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.date}>
                Bắt đầu: {new Date(item.start_time).toLocaleString()}
              </Text>
              <Text style={styles.date}>
                Kết thúc: {new Date(item.end_time).toLocaleString()}
              </Text>
              <Text style={styles.duration}>
                Thời lượng: {item.duration} phút
              </Text>
            </View>
            <View style={styles.actionButtons}>
              <IconButton
                icon="eye"
                size={20}
                onPress={() =>
                  navigation.navigate("ContestDetail", {
                    contestId: item._id,
                    contestName: item.name,
                  })
                }
              />
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => handleEditContest(item)}
                color="#6A0DAD"
              />
              <IconButton
                icon="delete"
                size={20}
                onPress={() => handleDeleteContest(item._id)}
                color="red"
              />
            </View>
          </View>
        )}
      />

      {/* Phân trang */}
      <View style={styles.pagination}>
        <Button
          mode="text"
          disabled={page === 1}
          onPress={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          Trang Trước
        </Button>
        <Text>
          Trang {page} / {totalPages}
        </Text>
        <Button
          mode="text"
          disabled={page === totalPages}
          onPress={() => setPage((prev) => Math.min(totalPages, prev + 1))}
        >
          Trang Sau
        </Button>
      </View>

      {/* Nút Thêm */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddContest}
        color="#fff"
        label="Thêm Cuộc Thi"
      />

      {/* Modal */}
      <ContestInfoModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        onSubmit={handleSaveContest}
        contestToEdit={contestToEdit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  searchContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  contestContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contestInfo: {
    flex: 1,
  },
  contestName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  duration: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  actionButtons: {
    flexDirection: "row",
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

export default ContestManagement;
