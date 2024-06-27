import { Box, Button, Typography } from "@mui/material";
import moment from "moment";
import { useEffect, useState } from "react";
import { axiosConfig } from "../config/axiosConfig";
import { useParams } from "react-router";

function PlayGamePage() {
    const [startTime, setStartTime] = useState(moment())
    const [show, setShow] = useState(false)
    const { gameId } = useParams()

    useEffect(() => {
        setStartTime(moment())
        const handleBeforeUnload = (event) => {
            axiosConfig.post('/api/library/' + gameId + '/add-play-time/', {
                playTime: (Math.abs(startTime - moment()) / 1000 / 60).toFixed(0)
            })

            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [])

    return (
        <Box className="text-center pt-10">
            <Button variant="contained">Pew Pew Pew</Button>
        </Box>
    )
}

export default PlayGamePage;