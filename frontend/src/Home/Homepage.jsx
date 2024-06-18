import React, { useEffect, useState } from 'react';
import { axiosConfig } from "../axiosConfig"

function Homepage() {
    const [games, setGames] = useState([])

    useEffect(() => {
        axiosConfig.get("/api/games")
        .then((res) =>
            setGames(res.data)
        )
    }, [])

    return (
        <div>
            <h1>Store homepage</h1>

            {
                games.map(val => 
                    <div>
                        {val.title}
                    </div>
                )
            }
        </div>
    );
}

export default Homepage;