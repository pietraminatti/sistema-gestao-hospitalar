import { createSlice } from "@reduxjs/toolkit";
import { UserJwtData, UserState } from "../../types";

const getUserFromLocalStorage = (): UserJwtData | null => {
  try {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return null;
    // Garante que é um JSON válido
    if (savedUser.trim().startsWith("{") || savedUser.trim().startsWith("[")) {
      return JSON.parse(savedUser);
    }
    // Caso não seja JSON, retorna null e limpa o localStorage
    localStorage.removeItem("user");
    return null;
  } catch (error) {
    console.error("Erro ao obter user do localStorage:", error);
    localStorage.removeItem("user");
    return null;
  }
};

const initialState: UserState = {
  auth: getUserFromLocalStorage(),
  profile: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.auth = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    logOut: (state) => {
      state.auth = null;
      state.profile = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
});

export const { setAuth, setProfile, logOut } = userSlice.actions;
export default userSlice.reducer;
