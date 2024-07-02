import { createSlice } from "@reduxjs/toolkit";
import {user} from "../assets/data.js"

const initialState = {
  user: JSON.parse(window?.localStorage.getItem("user")) ?? user,
  edit: false,
};

const userSlice = createSlice({
  name:"user",
  initialState,
  reducers:{
    login(state,action){
      state.user = action.payload;
      window.localStorage.setItem("user",JSON.stringify(action.payload));
    },
    logout(state,action){
      state.user = null;
      window.localStorage?.removeItem("user");
    },
    updateProfile(state,action){
      state.edit = action.payload;
    },
  },
});


export default userSlice.reducer;

export function UserLogout(){
  return (dispatch, getState) => {
    dispatch(userSlice.actions.logout());
  }
}



export function UserLogin(user){
  return (dispatch, getState) => {
    dispatch(userSlice.actions.login(user));
  }
}



export function UpdateProfile(val){
  return (dispatch, getState) => {
    dispatch(userSlice.actions.updateProfile(val));
  }
}