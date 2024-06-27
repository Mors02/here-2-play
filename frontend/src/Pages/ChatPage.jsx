import { Typography, Box, TextField, Button } from "@mui/material";
import { getSectionValueNow } from "@mui/x-date-pickers/internals/hooks/useField/useField.utils";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import useWebSocket, {ReadyState} from 'react-use-websocket';
import { axiosConfig } from "../config/axiosConfig";

export default function ChatPage() {
    const {id} = useParams()
    const [text, setText] = useState("")
    const [chat, setChat] = useState({})
    const [WS_URL, setWs] = useState('')
    const msgClass="bg-slate-400 my-3"

    const { sendMessage, sendJsonMessage, lastJsonMesssage, readyState } = useWebSocket(
        WS_URL,
        {
            share: false,
            shouldReconnect: () => true,
            // queryParams: {
            //     authorization: `${localStorage.getItem('access_token')}`
            // }
        },
    )

    useEffect(() => {
        axiosConfig.get("api/chat/" + id)
        .then((res) => {
            setChat(res.data)
            console.log(res.data)
            setWs(`${process.env.REACT_APP_WS_URL}/chat/` + res.data.name)
        })
        .catch(err => {
            console.log(err)
        })
        console.log("connection changed")
        // if (readyState === ReadyState.OPEN) {
        //     sendJsonMessage({
        //       event: "subscribe",
        //       data: {
        //         channel: "pierino",
        //       },
        //     })
        //   }
    }, [readyState])

    useEffect(() => {
        console.log(`new message: ${lastJsonMesssage}`)
    }, [lastJsonMesssage])

    function sendTxtMessage() {
        console.log(text)
        sendJsonMessage({
            event: 'send',
            data: {
                msg: text
            }
        })
    }

    return(
        <Box>
            <Typography>Chat con {id}</Typography>
            <Box className="overflow-y-scroll h-80">

                <Box className={msgClass}><Typography>Teste</Typography></Box>
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                <Box className={msgClass}><Typography>Teste</Typography></Box>
                <Box className={msgClass}><Typography>Teste</Typography></Box>
            </Box>
            <Box>
                <TextField value={text} onChange={(e) => setText(e.target.value)}/><Button onClick={() => sendTxtMessage()} variant="contained">Send</Button>            
            </Box>
        </Box>
    )
}