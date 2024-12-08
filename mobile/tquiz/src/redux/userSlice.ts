import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  user: {
    fullname: string;
    username: string;
    role: string; // Thêm role vào user
  } | null;
  accessToken: string | null;
}

const initialState: UserState = {
  user: null,
  accessToken: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: { fullname: string; username: string; role: string };
        accessToken: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
    },
  },
});

export const { loginSuccess, logout } = userSlice.actions;

export default userSlice.reducer;
