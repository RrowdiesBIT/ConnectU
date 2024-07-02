import React from "react";
import { Outlet, Navigate, Route, Routes, useLocation } from "react-router-dom";
import {Home,Login,Profile,Register,ResetPassword} from "./pages/index"
import { useSelector } from "react-redux";


//function has been made to ensure if the user is not logged in he/she can not access the protected routes
function Layout() {
  const {user} = useSelector((state)=> state.user);
  const location = useLocation();

 
  console.log(user);
  return user?.token ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
}

function App() {
  const {theme} = useSelector((state) => state.theme);
  // console.log(theme);
  return (
    <div data-theme={theme} className="w-full min-h-[100vh]">
      <Routes>
        //Protected Route
        <Route element={<Layout />}>
          <Route path="/" element={<Home/>} />
          <Route path="/profile/:id?" element={<Profile />} />
        </Route>

        //Non-Protected Route
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="reset-password" element={<ResetPassword />} />
      </Routes>
    </div>
  );
}

export default App;
