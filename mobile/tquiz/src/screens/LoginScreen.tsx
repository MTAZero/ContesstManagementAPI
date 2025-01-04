import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  Image,
} from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/userSlice";
import { login } from "../services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = ({ navigation }: { navigation: any }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const isLoginEnabled = username.trim() !== "" && password.trim() !== "";
  const dispatch = useDispatch();

  const handleLogin = async () => {
    try {
      const response = await login(username, password);
      const { user, access_token } = response.data;
  
      // Lưu thông tin vào AsyncStorage
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({ fullname: user.fullname, username: user.username, role: user.role })
      );
      await AsyncStorage.setItem("accessToken", access_token);
  
      // Lưu thông tin vào Redux
      dispatch(
        loginSuccess({
          user: { fullname: user.fullname, username: user.username, role: user.role },
          accessToken: access_token,
        })
      );
  
      // Điều hướng đến màn hình Home
      navigation.replace("Home");
    } catch (error: any) {
      Alert.alert(
        "Đăng nhập thất bại",
        error.message || "Sai tài khoản hoặc mật khẩu!",
        [{ text: "Thử lại" }]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.logo}>OnThiQuiz</Text>
        <TextInput
          mode="outlined"
          label="Username (user1)"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          placeholder="Nhập tên đăng nhập"
        />
        <TextInput
          mode="outlined"
          label="Password (123edcxz)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholder="Nhập mật khẩu"
        />
        <Button
          mode="contained"
          onPress={handleLogin}
          disabled={!isLoginEnabled}
          style={[styles.button]}
          contentStyle={styles.buttonContent}
          labelStyle={{ color: isLoginEnabled ? "#FFFFFF" : "#A9A9A9" }}
        >
          Login
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  logo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 20,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 30,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
    width: "100%",
  },
  button: {
    marginTop: 16,
    width: "100%",
    backgroundColor: "#6A0DAD",
  },
  buttonContent: {
    height: 50,
  },
});

export default LoginScreen;
