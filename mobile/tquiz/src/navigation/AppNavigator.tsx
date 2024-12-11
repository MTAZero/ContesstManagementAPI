import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/userSlice";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import AdminScreen from "../screens/AdminScreen";
import SplashScreen from "../screens/SplashScreen";
import UserManagement from "../screens/UserManagement/UserManagement";
import QuestionManagement from "../screens/QuestionManagement";
import ContestManagement from "../screens/ContestManagement";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<"Login" | "Home">("Login");
  const dispatch = useDispatch();

  useEffect(() => {
    const checkUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        const accessToken = await AsyncStorage.getItem("accessToken");

        if (userData && accessToken) {
          const user = JSON.parse(userData);
          dispatch(loginSuccess({ user, accessToken }));
          setInitialRoute("Home");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserData();
  }, [dispatch]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRoute}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Admin" component={AdminScreen} />
      <Stack.Screen name="UserManagement" component={UserManagement} />
      <Stack.Screen name="QuestionManagement" component={QuestionManagement} />
      <Stack.Screen name="ContestManagement" component={ContestManagement} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
