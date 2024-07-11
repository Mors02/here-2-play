import React, { useState, useEffect } from "react";
import { axiosConfig, getRefreshToken } from "../config/axiosConfig";
import { useNavigate, useParams, useLocation } from "react-router";
import { Container, LinearProgress, Typography, Button, Box, Stack, Tab, Divider } from "@mui/material";
import {TabList, TabPanel, TabContext } from '@mui/lab'
import useCurrentUser from "../config/UseCurrentUser";
import moment from 'moment';
import 'react-tabs/style/react-tabs.css';
import { FaPen } from "react-icons/fa";
import { MdReport, MdRotateLeft } from "react-icons/md";
import ReportUserModal from "../Modals/ReportUserModal";
import UserGamesPage from "../Component/UserGamesPage"
import GameList from "../Component/GameList";
import BundleOfUser from "./Bundles/BundleOfUser";
import DeveloperStatsPage from "./DeveloperStatsPage";
import { useAuth } from "../config/AuthContext";
import { toast } from "react-toastify";

export default function UserPage() {
    const [retrievedUser, setUser] = useState()
    const {user, role, loading} = useCurrentUser()
    const navigate = useNavigate()
    const { id } = useParams()
    const [tab, setTab] = useState(0)
    const location = useLocation()
    const [loadingPage, setLoading] = useState(true);
    const [modalIsOpen, setIsOpen] = useState(false);
    const { logout } = useAuth();

    function openModal() {
      setIsOpen(true);
    }
  
    function closeModal() {
      setIsOpen(false);
    }

    function dateDiff(start) {
        console.log(start)
        const startDate = moment(start);
        const timeEnd = moment();
        const diff = timeEnd.diff(startDate);
        const duration = moment.duration(diff);
        
        return formatLoggedSince(duration);
    }

    function formatLoggedSince(duration) {
        let str = "";
        if (duration.years())
            str += duration.years() + (duration.years() == 1? " anno, " : " anni, ")

        if (duration.years() || duration.months() > 0)
            str += duration.months() + (duration.months() == 1? " mese," : " mesi, ")

        str += duration.days() + (duration.days() == 1? " giorno." : " giorni.")

        return str;
    }

    useEffect(() => {
        if (location.hash == '#bundles')
            setTab(2)
        else if (location.hash == '#games')
            setTab(1)

        
        axiosConfig.get('/api/user/' + id + "/")
        .then(res => {
            console.log(res.data)
            setLoading(false);
            setUser(res.data);
            console.log(res);
        })
        .catch(err => {
            setLoading(false);
            console.log(err)
        });
    }, [])
    
    function handleClick({ game }) {
        return navigate('/games/' + game)
    }

    function handleLogout(e) {
        axiosConfig.post("/api/logout/", {"refresh_token": getRefreshToken()})
            .then(res => {
                logout();
                localStorage.clear();
                axiosConfig.defaults.headers.common['Authorization'] = null;
                toast.success("Logout effettuato.", {onClose: () =>{window.location.replace("/")}})
            })
    }

    if (loadingPage || loading)
        return <LinearProgress />
    else
    return (
        <Box className="w-full overflow-x-hidden">
            <Box className="flex bg-slate-400 px-5 py-3 place-items-center">
                <Box className="flex place-items-center w-full gap-4">
                    <img className="object-cover w-16 h-16 rounded-full inline" src={process.env.REACT_APP_BASE_URL + retrievedUser?.profile_picture} />

                    <Box>
                        <Typography variant="h5">{retrievedUser.username} </Typography>
                        <Typography className="text-gray-600">Registrato da {dateDiff(retrievedUser.date_joined)}</Typography>
                    </Box>
                </Box>
                <Box>
                {
                    id == user?.id ?
                    <Box className="flex gap-4">
                        <Button variant="contained" className="text-nowrap" onClick={() => window.location.replace('/user')} startIcon={<FaPen size={15} />}>Modifica profilo</Button>
                        <Button variant="contained" color="error" onClick={() => handleLogout()}>Logout</Button>
                    </Box>
                    : <Button variant="contained" color="error" onClick={() => openModal()} startIcon={<MdReport />}>Segnala</Button>
                }
                </Box>
            </Box>

            <ReportUserModal  
                closeModal={closeModal} 
                modalIsOpen={modalIsOpen} 
                userReported={retrievedUser}
            />

            <Box className="min-h-[500px]" sx={{borderLeft:"1px solid #aaa", borderRight:"1px solid #aaa"}}>
                <TabContext value={tab}>
                    <TabList onChange={(event, newValue) => setTab(newValue)}>
                        <Tab label={"Libreria"}></Tab>
                        {retrievedUser?.role == "developer" && <Tab label={"Giochi Pubblicati"}></Tab>}
                        {retrievedUser?.role == "developer" && <Tab label={"Bundle"}></Tab>}
                        {retrievedUser?.id == user?.id && role?.slug == "developer" && <Tab label={"Statistiche"}></Tab>}
                    </TabList>

                    <TabPanel value={0}>
                        <Box className="px-4 py-3">
                            <GameList games={retrievedUser?.games} handleClick={handleClick} selection={[]} />
                        </Box>
                    </TabPanel>
                    <TabPanel value={1}>
                        <UserGamesPage user={retrievedUser} />
                    </TabPanel>
                    <TabPanel value={2}>
                        <BundleOfUser user={retrievedUser} currentUser={user} />
                    </TabPanel>
                    { 
                        retrievedUser?.id == user?.id && role?.slug == "developer" && 
                        <TabPanel value={3}>
                            <DeveloperStatsPage />
                        </TabPanel>
                    }
                </TabContext>
            </Box>
                
            {
                retrievedUser?.id == user?.id && retrievedUser?.recently_visited_games.length > 0 &&
                <Box className="bg-slate-300 w-full p-6">
                    <Divider className="!mb-6"><b>Giochi Visitati di Recente</b></Divider>
                    <Box className="grid grid-cols-8 gap-6">
                    {
                        retrievedUser?.recently_visited_games.map(details => 
                            <img className="cursor-pointer aspect-[600/900] w-full object-cover rounded" title={details.game.title} onClick={() => navigate('/games/' + details.game.id)} src={process.env.REACT_APP_BASE_URL + details.game.image} />
                        )
                    }
                    </Box>
                </Box>
            }
        </Box>
    )
}