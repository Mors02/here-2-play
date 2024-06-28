import { Typography, Box, TextField, Button } from "@mui/material";
import { getSectionValueNow } from "@mui/x-date-pickers/internals/hooks/useField/useField.utils";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import useWebSocket, {ReadyState} from 'react-use-websocket';
import { axiosConfig } from "../config/axiosConfig";

export default function ChatPage() {
    const { id } = useParams()
    const [text, setText] = useState("")
    const [chat, setChat] = useState({})
    const [WS_URL, setWs] = useState('')
    const [messages, setMessages] = useState([])
    const msgClass="bg-slate-400 my-3"

    const { sendMessage, sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
        WS_URL,
        {
            onOpen: () => console.log('WebSocket connection opened'),
            onClose: () => console.log('WebSocket connection closed'),
            onError: (e) => console.log('WebSocket error', e),
            share: false,
            shouldReconnect: () => true,
            queryParams: {
                token: `${localStorage.getItem('access_token')}`
            }
        },
    )

    useEffect(() => {
        axiosConfig.get("api/chat/" + id)
        .then((res) => {
            setChat(res.data)
            console.log(res.data)
            setWs(`${process.env.REACT_APP_WS_URL}/chat/${res.data.name}`)
            setMessages(res.data.messages)
        })
        .catch(err => {
            console.log(err)
        })
        
    }, [readyState])

    useEffect(() => {
        console.log(`new message: ${JSON.stringify(lastJsonMessage)}`)
        if (lastJsonMessage) {
            setMessages([lastJsonMessage, ...messages])
        }
    }, [lastJsonMessage])

    function sendTextMessage() {
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
            <Box className="overflow-y-scroll h-80 flex flex-col-reverse">
                {messages.map(message => (
                    <Box className={msgClass}>
                        <Typography><b>{message.user.username}</b> - {message.text}</Typography>
                    </Box>
                ))}
            </Box>
            <Box>
                <TextField value={text} onChange={(e) => setText(e.target.value)}/><Button onClick={() => sendTextMessage()} variant="contained">Send</Button>            
            </Box>
        </Box>
    )
}