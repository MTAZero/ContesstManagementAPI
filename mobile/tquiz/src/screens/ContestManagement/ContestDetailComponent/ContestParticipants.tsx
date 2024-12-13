import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";
import contestService from "../../../services/contestService";

const ContestParticipants = ({
  contestId,
  accessToken,
}: {
  contestId: string;
  accessToken: string;
}) => {
  const [participants, setParticipants] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10; // Kích thước trang

  const fetchParticipants = async () => {
    if (loading || page > totalPages) return;

    setLoading(true);
    try {
      const response = await contestService.getContestParticipants(
        contestId,
        accessToken,
        page,
        pageSize
      );
      const { items, total } = response.data;
      setParticipants((prev) => [...prev, ...items]);
      setTotalPages(Math.ceil(total / pageSize));
    } catch (error) {
      console.error("Error fetching participants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [page]);

  const renderParticipant = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.row}>
      <Text style={styles.rank}>{index + 1}</Text>
      <View style={styles.info}>
        <Text style={styles.fullname}>
          {item.user_detail?.fullname || "N/A"}
        </Text>
        <Text style={styles.username}>
          @{item.user_detail?.username || "unknown"}
        </Text>
      </View>
      <View style={styles.status}>
        <Text style={[styles.result, item.is_submitted && styles.submitted]}>
          {item.is_submitted ? "Đã nộp bài" : "Chưa nộp"}
        </Text>
        <Text style={styles.result}>
          Kết quả: {item.result !== undefined ? item.result : "Chưa có"}
        </Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={participants}
      renderItem={renderParticipant}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.listContainer}
      onEndReached={() => setPage((prev) => prev + 1)}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loading ? <ActivityIndicator size="small" /> : null}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    elevation: 2,
  },
  rank: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  info: {
    flex: 1,
    marginLeft: 10,
  },
  fullname: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  username: {
    fontSize: 14,
    color: "#666",
  },
  status: {
    alignItems: "flex-end",
  },
  result: {
    fontSize: 14,
    color: "#333",
  },
  submitted: {
    color: "green",
    fontWeight: "bold",
  },
});

export default ContestParticipants;
