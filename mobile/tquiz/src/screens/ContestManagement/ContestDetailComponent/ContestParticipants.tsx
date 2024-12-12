import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Text } from "react-native";
import contestService from "../../../services/contestService";

const ContestParticipants = ({
  contestId,
  accessToken,
}: {
  contestId: string;
  accessToken: string;
}) => {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      const response = await contestService.getContestParticipants(
        contestId,
        accessToken
      );
      setParticipants(response.data.items || []);
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  const renderParticipant = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.box}>
      {/* Số thứ tự góc trên bên trái */}
      <View style={styles.badgeContainer}>
        <Text style={styles.badge}>{index + 1}</Text>
      </View>

      {/* Thông tin người dùng */}
      <View style={styles.contentContainer}>
        <View style={styles.infoContainer}>
          <Text style={styles.fullname}>
            {item.user_detail?.fullname || "N/A"} (
            {item.user_detail?.username || "N/A"})
          </Text>
          {item.is_submitted && (
            <Text style={styles.submittedText}>Đã nộp bài</Text>
          )}
        </View>

        {/* Kết quả góc dưới bên trái */}
        <Text style={styles.resultText}>
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
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 10,
  },
  box: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    padding: 10,
    elevation: 3,
    position: "relative",
  },
  badgeContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6A0DAD",
    position: "absolute",
    top: 10,
    left: 10,
  },
  badge: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  contentContainer: {
    marginLeft: 60, // Để tránh bị đè bởi badge
    flex: 1,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  fullname: {
    fontSize: 16,
    fontWeight: "bold",
  },
  submittedText: {
    fontSize: 14,
    color: "green",
    fontWeight: "bold",
  },
  resultText: {
    fontSize: 14,
    color: "#555",
    marginTop: 10,
  },
});

export default ContestParticipants;
