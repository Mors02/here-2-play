import React from "react";
import { Route, Routes } from "react-router-dom";
import Homepage from "../Home/Homepage";
import LoginPage from "../Pages/Auth/LoginPage";
import RegisterPage from "../Pages/Auth/RegisterPage";
import UserEditPage from "../Pages/Auth/UserEditPage";
import UserPage from "../Pages/UserPage";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Homepage />}></Route>
            <Route path="/login" element={<LoginPage />}></Route>
            <Route path="/register" element={<RegisterPage />}></Route>
            <Route path="/user" element={<UserEditPage />}></Route>
            <Route path="/user/:id" element={<UserPage />}></Route>
        </Routes>
    )
}

export default AppRoutes