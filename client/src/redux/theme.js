import { createSlice } from "@reduxjs/toolkit";
import "../index.css"


const initialState = {
  theme: JSON.parse(window?.localStorage.getItem("theme")) ?? "dark",
};

const themeSlice = createSlice({
  name:"theme",
  initialState,
  reducers:{
    setTheme(state,action) {
      state.theme = action.payload;
      localStorage.setItem("theme",JSON.stringify(action.payload));
    },
  },
});

export const{setTheme} = themeSlice.actions;
export default themeSlice.reducer;
