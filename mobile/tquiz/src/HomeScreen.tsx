import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { logout } from "../redux/userSlice";

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);

  const handleLogout = () => {
    dispatch(logout());
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.userInfo}>
        {user?.fullname} [{user?.username}]
      </Text>
      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Đăng Xuất
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  userInfo: {
    fontSize: 20,
    marginBottom: 24,
    fontWeight: "bold",
  },
  button: {
    marginTop: 16,
  },
  buttonContent: {
    height: 50,
  },
});

export default HomeScreen;
