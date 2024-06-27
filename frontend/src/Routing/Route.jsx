import React from "react";
import { Route, Routes } from "react-router-dom";
import Homepage from "../Home/Homepage";
import LoginPage from "../Pages/Auth/LoginPage";
import PublishGamePage from "../Pages/PublishGamePage";
import GameDetailsPage from "../Pages/GameDetailsPage";
import GameEditPage from "../Pages/GameEditPage";
import RegisterPage from "../Pages/Auth/RegisterPage";
import UserEditPage from "../Pages/Auth/UserEditPage";
import UserPage from "../Pages/UserPage";
import { validUrls } from "../config/enums";
import OrderPage from "../Pages/OrderPage";
import BundleCreate from "../Pages/Bundles/BundleCreate";
import BundleDetails from "../Pages/Bundles/BundleDetails";
import GameStatisticsPage from "../Pages/GameStatisticsPage";
import PlayGamePage from "../Pages/PlayGamePage"

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Homepage />}></Route>
            <Route path="/login" element={<LoginPage />}></Route>
            <Route path="/publish" element={<PublishGamePage />}></Route>
            <Route path="/play/:gameId" element={<PlayGamePage />}></Route>
            <Route path="/games/:gameId" element={<GameDetailsPage />}></Route>
            <Route path="/games/:gameId/edit" element={<GameEditPage />}></Route>
            <Route path="/games/:gameId/statistics" element={<GameStatisticsPage />}></Route>
            <Route path="/bundle/:id" element={<BundleDetails />}></Route>
            <Route path="/bundle/create" element={<BundleCreate />}></Route>
            <Route path="/register" element={<RegisterPage />}></Route>
            <Route path="/user/:id" element={<UserPage />}></Route>
            <Route path="/user/" element={<UserEditPage />}></Route>
            <Route path="/cart" element={<OrderPage />}></Route>
        </Routes>
    )
}

export function shouldShowFriendlistInUrl(url) {
    
    if (validUrls.some(s => {
        const reg = new RegExp(s)
        url = url.replace(process.env.REACT_APP_FRONTEND_URL, "")
        return reg.test(url)
    }))
        return true;
    return false;
}