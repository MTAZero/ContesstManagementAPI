import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Image } from "react-native";
import { Text } from "react-native-paper";
import contestService from "../../../services/contestService";

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return require("../../../assets/1st.png");
    case 2:
      return require("../../../assets/2nd.png");
    case 3:
      return require("../../../assets/3rd.png");
    default:
      return null;
  }
};

const ContestLeaderboard = ({
  contestId,
  accessToken,
}: {
  contestId: string;
  accessToken: string;
}) => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await contestService.getLeaderboard(
        contestId,
        accessToken
      );
      setLeaderboard(response?.data || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  const renderLeaderboard = ({ item }: { item: any }) => {
    const rankIcon = getRankIcon(item.rank);

    return (
      <View style={styles.row}>
        <View style={styles.rankContainer}>
          {rankIcon ? (
            <Image source={rankIcon} style={styles.rankIcon} />
          ) : (
            <Text style={styles.rankText}>{item.rank}</Text>
          )}
        </View>
        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>{item.user?.fullname || "N/A"}</Text>
          <Text style={styles.username}>
            @{item.user?.username || "unknown"}
          </Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.score}>{item.score}</Text>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={leaderboard}
      renderItem={renderLeaderboard}
      keyExtractor={(item) => `${item.rank}`}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
  },
  rankContainer: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  rankIcon: {
    width: 40,
    height: 40,
  },
  rankText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  userInfoContainer: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  username: {
    fontSize: 14,
    color: "#666",
  },
  scoreContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  score: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});

export default ContestLeaderboard;