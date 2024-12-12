import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Appbar } from "react-native-paper";
import { useSelector } from "react-redux";
import ContestLeaderboard from "./ContestDetailComponent/ContestLeaderboard";
import ContestParticipants from "./ContestDetailComponent/ContestParticipants";
import ContestQuestions from "./ContestDetailComponent/ContestQuestions";

const ContestDetailScreen = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const { contestId, contestName } = route.params;
  const { accessToken } = useSelector((state: any) => state.user); // Lấy token từ Redux
  const [activeTab, setActiveTab] = useState("participants");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "participants":
        return (
          <ContestParticipants
            contestId={contestId}
            accessToken={accessToken}
          />
        );
      case "questions":
        return (
          <ContestQuestions contestId={contestId} accessToken={accessToken} />
        );
      case "leaderboard":
        return (
          <ContestLeaderboard contestId={contestId} accessToken={accessToken} />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={contestName} />
      </Appbar.Header>

      {/* Tab Container */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "participants" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("participants")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "participants" && styles.activeTabText,
            ]}
          >
            Người Dùng
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "questions" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("questions")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "questions" && styles.activeTabText,
            ]}
          >
            Câu Hỏi
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "leaderboard" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("leaderboard")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "leaderboard" && styles.activeTabText,
            ]}
          >
            Bảng Xếp Hạng
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>{renderActiveTab()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#fff",
    elevation: 1,
  },
  activeTab: {
    backgroundColor: "#6A0DAD",
  },
  tabText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  activeTabText: {
    color: "#fff",
  },
  content: {
    flex: 1,
    padding: 10,
  },
});

export default ContestDetailScreen;
