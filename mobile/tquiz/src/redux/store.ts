import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureStore, Middleware } from "@reduxjs/toolkit";
import userReducer, { loginSuccess } from "./userSlice";

// Middleware để khôi phục Redux khi ứng dụng khởi động
const rehydrateMiddleware: Middleware =
  (storeAPI) => (next) => async (action) => {
    if (action.type === "@@INIT") {
      const userData = await AsyncStorage.getItem("user");
      const accessToken = await AsyncStorage.getItem("accessToken");

      if (userData && accessToken) {
        const user = JSON.parse(userData);
        storeAPI.dispatch(loginSuccess({ user, accessToken }));
      }
    }
    return next(action);
  };

const store = configureStore({
  reducer: {
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(rehydrateMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
