import React from "react";
import { Route, Routes } from "react-router-dom";
import Homepage from "../Home/Homepage";
import LoginPage from "../Pages/Auth/LoginPage";
import YourGamesPage from "../Pages/YourGamesPage"
import PublishGamePage from "../Pages/PublishGamePage";
import GameDetailsPage from "../Pages/GameDetailsPage";
import RegisterPage from "../Pages/Auth/RegisterPage";
import UserEditPage from "../Pages/Auth/UserEditPage";
import UserPage from "../Pages/UserPage";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Homepage />}></Route>
            <Route path="/login" element={<LoginPage />}></Route>
            <Route path="/your-games" element={<YourGamesPage />}></Route>
            <Route path="/publish" element={<PublishGamePage />}></Route>
            <Route path="/games/:gameId" element={<GameDetailsPage />}></Route>
            <Route path="/register" element={<RegisterPage />}></Route>
            <Route path="/user/:id" element={<UserPage />}></Route>
            <Route path="/user/" element={<UserEditPage />}></Route>
        </Routes>
    )
}

export default AppRoutes