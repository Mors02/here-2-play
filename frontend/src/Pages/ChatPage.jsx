import { Typography, Box, TextField, Button, Divider, Avatar, Stack } from "@mui/material";
import { getSectionValueNow } from "@mui/x-date-pickers/internals/hooks/useField/useField.utils";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import useWebSocket, {ReadyState} from 'react-use-websocket';
import { axiosConfig } from "../config/axiosConfig";
import useCurrentUser from "../config/UseCurrentUser"
import moment from "moment";
import { IoSend } from "react-icons/io5";

export default function ChatPage() {
    const { id } = useParams()
    const [text, setText] = useState("")
    const [chat, setChat] = useState({})
    const [WS_URL, setWs] = useState('')
    const [messages, setMessages] = useState([])
    const { user, loading } = useCurrentUser()
    const { state } = useLocation()
    const navigate = useNavigate()
    
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
            setWs(`${process.env.REACT_APP_WS_URL}/chat/${res.data.name}`)
            setMessages(res.data.messages)
        })
    }, [readyState])

    useEffect(() => {
        if (lastJsonMessage)
            setMessages([lastJsonMessage, ...messages])
    }, [lastJsonMessage])

    function sendTextMessage() {
        if (text == "")
            return

        sendJsonMessage({
            event: 'send',
            data: {
                msg: text
            }
        })
        setText('')
    }

    function enterKeyPress(e) {
        if (e.key === "Enter")
            sendTextMessage()
    }

    function Messages() {
        if (messages.length > 0)
            return messages.map(message => {
                const fromFriend = message.user.id === state.friend.id
                
                return (
                    <Box className={"flex " + (fromFriend ? '' : 'justify-end')}>
                        <Box className={"rounded p-[5px] flex gap-4 place-items-end max-w-[60%] " + (fromFriend ? 'bg-[#212E36]' : 'bg-[#1B76D2]')}>
                            <Typography variant="h5" className="pl-1 text-white">{message.text}</Typography>
                            <Typography className="!text-xs text-gray-300">{moment(message.sent_at).format('HH:mm')}</Typography>
                        </Box>
                    </Box>
                )
            })
        return (
            <Box className="bg-orange-400 rounded p-3 w-fit absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Typography className="text-white">Nessun Messaggio</Typography>
            </Box>
        )
    }

    function handleAvatarClick() {
        return navigate('/user/' + state.friend.id)
    }

    if (!loading)
    return(
        <Box className="p-10">
            <Divider>
                <Box className="flex gap-4 justify-center px-4">
                    <Avatar className="cursor-pointer" onClick={() => handleAvatarClick()} src={process.env.REACT_APP_BASE_URL + state.friend.profile_picture} /> 
                    <b className="!my-auto">{state.friend.username}</b>
                </Box>
            </Divider>

            <Stack className="relative overflow-y-scroll h-[500px] gap-2 flex !flex-col-reverse bg-gray-100 rounded-md !mt-4 p-4">
                <Messages />
            </Stack>
            <Box className="flex align-middle gap-4 mt-4">
                <TextField size="small" onKeyDown={e => enterKeyPress(e)} className="grow" value={text} onChange={(e) => setText(e.target.value)}/>
                <Button size="small" onClick={() => sendTextMessage()} variant="contained"><IoSend size={20} /></Button>            
            </Box>
        </Box>
    )
}