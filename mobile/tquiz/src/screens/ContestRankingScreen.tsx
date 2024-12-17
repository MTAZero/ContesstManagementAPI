import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Image, Alert } from "react-native";
import { Text, Appbar, ActivityIndicator } from "react-native-paper";
import contestService from "../services/contestService";
import { useSelector } from "react-redux";

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return require("../assets/1st.png");
    case 2:
      return require("../assets/2nd.png");
    case 3:
      return require("../assets/3rd.png");
    default:
      return null;
  }
};

const ContestRankingScreen = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const { accessToken } = useSelector((state: any) => state.user);
  const { contestId } = route.params;
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

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
      console.error("Lỗi khi lấy xếp hạng:", error);
      Alert.alert("Lỗi", "Không thể tải xếp hạng cuộc thi.");
    } finally {
      setLoading(false);
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
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Xếp Hạng Cuộc Thi" />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loading} />
      ) : (
        <FlatList
          data={leaderboard}
          renderItem={renderLeaderboard}
          keyExtractor={(item, index) => `${item.rank}-${index}`}
          contentContainerStyle={styles.listContainer}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    color: "#6A0DAD",
  },
  loading: {
    marginTop: 20,
  },
});

export default ContestRankingScreen;
