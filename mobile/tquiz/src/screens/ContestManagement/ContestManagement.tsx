import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  TextInput as RNTextInput,
} from "react-native";
import {
  Appbar,
  Button,
  Card,
  Portal,
  Text,
  IconButton,
  FAB,
} from "react-native-paper";
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
  const pageSize = 5;

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
      } else {
        console.error("Không có danh sách cuộc thi trong phản hồi");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách cuộc thi:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContest = async (contest: any, isEditing: boolean) => {
    if (!accessToken) return;

    console.log("Saving contest:", contest, isEditing);

    try {
      if (isEditing) {
        await contestService.updateContest(contest._id, contest, accessToken);
        Alert.alert("Thành công", "Cuộc thi đã được cập nhật.");
      } else {
        await contestService.insertContest(contest, accessToken);
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
        <Appbar.BackAction
          onPress={() => {
            navigation.goBack();
          }}
        />
        <Appbar.Content title="Quản Lý Cuộc Thi" />
      </Appbar.Header>
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
      <FlatList
        data={contests}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.date}>
                Bắt đầu: {new Date(item.start_time).toLocaleString()}
              </Text>
              <Text style={styles.duration}>
                Thời gian: {item.duration} phút
              </Text>
            </View>
            <Card.Actions style={styles.cardActions}>
              <IconButton
                icon="eye"
                size={16}
                onPress={() => {
                  navigation.navigate("ContestDetail", {
                    contestId: item._id,
                    contestName: item.name,
                  });
                }}
              />
              <IconButton
                icon="pencil"
                size={16}
                onPress={() => handleEditContest(item)}
                color="#6A0DAD"
              />
              <IconButton
                icon="delete"
                size={16}
                onPress={() => handleDeleteContest(item._id)}
                color="red"
              />
            </Card.Actions>
          </Card>
        )}
      />
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
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddContest}
        color="#fff"
        label="Thêm Cuộc Thi"
      />
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
  },
  searchContainer: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  searchInputContainer: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    backgroundColor: "#fff",
    paddingHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  card: {
    margin: 4,
    marginLeft: 16,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    padding: 8,
  },
  cardContent: {
    paddingBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    marginBottom: 4,
  },
  duration: {
    fontSize: 14,
  },
  cardActions: {
    padding: 0,
    marginTop: -8,
    flexDirection: "row",
    justifyContent: "flex-end",
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
