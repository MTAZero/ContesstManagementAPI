import React, { useEffect } from "react";
import { Provider } from "react-redux";
import store from "./redux/store";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./navigation/AppNavigator";

export default function App() {
  useEffect(() => {
    store.dispatch({ type: "@@INIT" }); // Khởi tạo Redux từ AsyncStorage
  }, []);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </Provider>
  );
}