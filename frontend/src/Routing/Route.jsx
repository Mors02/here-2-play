import React from "react";
import { Route, Routes } from "react-router-dom";
import Homepage from "../Home/Homepage";
import LoginPage from "../Auth/LoginPage";
import YourGamesPage from "../Pages/YourGamesPage"
import PublishGamePage from "../Pages/PublishGamePage";
import GameDetailsPage from "../Pages/GameDetailsPage";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Homepage />}></Route>
            <Route path="/login" element={<LoginPage />}></Route>
            {/* Forse c'è bisogno di fare un Protected Route per la creazione */}
            <Route path="/your-games" element={<YourGamesPage />}></Route>
            <Route path="/publish" element={<PublishGamePage />}></Route>
            <Route path="/games/:gameId" element={<GameDetailsPage />}></Route>
        </Routes>
    )
}

export default AppRoutes