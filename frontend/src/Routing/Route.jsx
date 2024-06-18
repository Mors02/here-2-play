import React from "react";
import { Route, Routes } from "react-router-dom";
import Homepage from "../Home/Homepage";
import LoginPage from "../Auth/LoginPage";
import UserGamesPage from "../Pages/UserGamesPage"
import PublishGamePage from "../Pages/PublishGamePage";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Homepage />}></Route>
            <Route path="/login" element={<LoginPage />}></Route>
            {/* Forse c'è bisogno di fare un Protected Route per la creazione */}
            <Route path="/your-games" element={<UserGamesPage />}></Route>
            <Route path="/publish" element={<PublishGamePage />}></Route>
        </Routes>
    )
}

export default AppRoutes