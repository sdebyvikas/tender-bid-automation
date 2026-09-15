import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    deductUserCredits: (state, action) => {
      if (state.userData && typeof state.userData.credits === "number") {
        state.userData.credits = Math.max(
          0,
          state.userData.credits - (action.payload || 1),
        );
      }
    },
  },
});

export const { setUserData, deductUserCredits } = userSlice.actions;
export default userSlice.reducer;
