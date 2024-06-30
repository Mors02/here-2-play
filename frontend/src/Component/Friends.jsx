import React, { useState, useEffect } from "react";
import { Typography, Box, TextField, Stack, Button, Tabs, Tab } from "@mui/material";
import { CiChat1 } from "react-icons/ci";
import { TbFriendsOff } from "react-icons/tb";
import { IoMdClose } from "react-icons/io";
import { axiosConfig } from "../config/axiosConfig";
import { toast } from "react-toastify";
import { ErrorMap } from "../config/enums";
import { FaCheck } from "react-icons/fa6";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; 
import { useNavigate } from "react-router";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { IoPersonRemoveOutline } from "react-icons/io5";

export function PanelTab(props) {
    const { children, value, index, ...other} = props;
    
    return (
        <Box
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && <>{children}</>}
        </Box>
    )
}

function Friends({ onClick }) {
    const [value, setValue] = useState(0);
    const [friends, setFriends] = useState([])
    const [username, setUsername] = useState("")
    const [friendRequests, setFriendRequests] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        refreshFriendRequests()
        refreshFriends()
    }, [])

    const handleChange = (event, newValue) => {        
        setValue(newValue);
    };

    function refreshFriendRequests() {
        axiosConfig.get("/api/friend-requests/")
        .then((res) => {
            if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                throw new Error(res["response"]["data"])
            setFriendRequests(res.data)
        })
        .catch((err) => {
            toast.error(ErrorMap["ERR_SERVER_ERROR"]);
        })
    }

    function refreshFriends() {
        axiosConfig.get("/api/friends/")
        .then((res) => {
            if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                throw new Error(res["response"]["data"])
            setFriends(res.data)
        })
        .catch((err) => {
            toast.error(ErrorMap["ERR_SERVER_ERROR"]);
        })
    }

    function sendRequest () {
        if (username == "") {
            toast.error("Username non può essere vuoto")
            return 
        }

        axiosConfig.post("api/friend-requests/", {username})
            .then((res) => {
                if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                    throw new Error(res["response"]["data"])
                toast.success("Richiesta inviata con successo.");
            })
            .catch((err) => {
                console.log(err)
                toast.error(ErrorMap[err.message])
            })
        
    }

    function closeRequest(id, status) {
        axiosConfig.patch("api/friend-requests/"+id, {status})
        .then(res => {
            if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                throw new Error(res["response"]["data"])
            if (status=="den")
                toast.success("Richiesta rifiutata.")
            else {
                toast.success("Richiesa accetta.")
            }
        })
        .catch((err) => {
            console.log(err)
            toast.error(ErrorMap[err.message])
        })
        .finally(() => {
            refreshFriendRequests()
            refreshFriends()   
        })
    }

    function deleteFriend(username, id) {
        onClick()
        confirmAlert({
            title: 'Vuoi annullare l\'amicizia con '+ username +'?',
            message: 'Potrai fare una nuova richiesta di amicizia quando vuoi.',
            buttons: [
            {
                label: 'Procedi',
                onClick: () => {
                    axiosConfig.delete("api/friends/"+id+"/")
                    .then(res => {
                        if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                            throw new Error(res["response"]["data"])
                        toast.success("Amicizia annullata correttamente.")
                    })
                    .catch(err => {
                        toast.error(ErrorMap[err.message])
                    })
                    .finally(() => {
                        refreshFriends()
                    })
                }
            },
            {
                label: 'Indietro'
            }
            ]
        });        
    }

    function openChat(friend) {
        onClick()
        return navigate('/chat/' + friend.id, { state: { friend: friend } })
    }

    return (
        <Box className="bg-slate-500 min-h-dvh w-[400px]">
            <Box>
                <Tabs value={value} className="bg-slate-600 !px-2" onChange={handleChange} centered>
                    <Tab className="!my-2" label="Amici" />
                    <Tab className="!my-2" label="Richieste" />
                </Tabs> 
            </Box>

            <PanelTab value={value} index={0}>
                { friends.length == 0 && <Typography className="grid place-items-center justify-center !mt-4">Non hai nessun amico</Typography> }
                {
                    friends?.map((friend, index) => 
                        <Box className={"flex p-2 gap-3 " + (index % 2 == 0 ? 'bg-slate-400' : '')}>
                            <img className="object-cover rounded-full w-8 h-8" src={process.env.REACT_APP_BASE_URL + friend.profile_picture}/>
                            <Typography variant="h6" className="grow" ><a href={"/user/"+friend.id}>{friend.username}</a></Typography>
                            <Box className="flex gap-4 items-center">
                                <IoChatboxEllipsesOutline size={25} className="cursor-pointer" onClick={() => openChat(friend)} />
                                <IoPersonRemoveOutline size={25} className="cursor-pointer" onClick={() => deleteFriend(friend.username, friend.id)} color="red"/>
                            </Box>
                        </Box>
                    )
                }
            </PanelTab>

            <PanelTab value={value} index={1}>
                <Box className="flex gap-4 m-4">
                    <TextField className="bg-gray-300 rounded" size="small" title="Username" label="Username" onChange={(event) => {setUsername(event.target.value)}} variant="filled"></TextField>
                    <Button size="small" variant="contained" onClick={() => sendRequest()}>Invia Richiesta</Button>
                </Box>

                {
                    friendRequests?.map((request, index) => 
                        <Box className={"flex p-2 gap-3 " + (index % 2 == 0 ? 'bg-slate-400' : '')}>
                            <img className="object-cover rounded-full w-8 h-8" src={process.env.REACT_APP_BASE_URL + request.profile_picture}/>
                            <Typography className="grow" variant="h6"><a href={"/user/" + request.user_id}>{request.username}</a></Typography>
                            <Box className="flex gap-3 items-center">
                                <FaCheck size={25} className="cursor-pointer" color="green" onClick={() => closeRequest(request.id, "acc")} />
                                <IoMdClose size={30} className="cursor-pointer" color="red" onClick={() => closeRequest(request.id, "den")}/>
                            </Box>
                        </Box>
                    )
                }
            </PanelTab>
        </Box>
    )
}

export default Friends;