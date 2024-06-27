import React, { useState, useEffect } from "react";
import { axiosConfig } from "../config/axiosConfig";
import { useNavigate, useParams, useLocation } from "react-router";
import { Container, LinearProgress, Typography, Button, Box, Stack, Tab, Divider } from "@mui/material";
import {TabList, TabPanel, TabContext } from '@mui/lab'
import useCurrentUser from "../config/UseCurrentUser";
import moment from 'moment';
import 'react-tabs/style/react-tabs.css';
import { FaPen } from "react-icons/fa";
import { MdReport, MdRotateLeft } from "react-icons/md";
import ReportUserModal from "../Modals/ReportUserModal";
import YourGames from "../Component/YourGames"
import GameList from "../Component/GameList";
import BundleOfUSer from "./Bundles/BundleOfUser";
import DeveloperStatsPage from "./DeveloperStatsPage";

export default function UserPage() {
    const [retrievedUser, setUser] = useState()
    const {user, role, loading} = useCurrentUser()
    const navigate = useNavigate()
    const { id } = useParams()
    const [tab, setTab] = useState(0)
    const location = useLocation()
    const [loadingPage, setLoading] = useState(true);
    const [modalIsOpen, setIsOpen] = useState(false);

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

    if (loadingPage || loading)
        return <LinearProgress />
    else
    return (
        <Box className="w-full overflow-x-hidden">
        {
            loadingPage || loading? <LinearProgress /> :
            <>
                <Box className="bg-slate-400 p-2">
                    <Box className="flex">
                        <Stack direction={"row"} className="place-items-center w-full">
                            <img className="object-cover w-16 h-16 rounded-full inline m-3" src={process.env.REACT_APP_BASE_URL + retrievedUser.profile_picture} />
                            <Typography variant="h3" >{retrievedUser.username} </Typography>
                            <Typography className="pl-4 pt-4"> Registrato da {dateDiff(retrievedUser.date_joined)} </Typography>
                        </Stack>
                        <Box>
                        {user && id == user.id?
                            <Button variant="contained" sx={{marginTop: "11px", marginRight:"24px", float: "right"}} onClick={() => window.location.replace('/user')}><FaPen /> Modifica profilo</Button> :
                            <Button variant="contained" color="error" sx={{marginTop: "11px", marginRight:"24px", float: "right"}} onClick={() => openModal()}><MdReport /> Segnala</Button>
                        }
                        </Box>
                    </Box>
                </Box>
                <ReportUserModal  
                    closeModal={closeModal} 
                    modalIsOpen={modalIsOpen} 
                    userReported={retrievedUser}
                />
                <Box className="h-screen" sx={{borderLeft:"1px solid #aaa", borderRight:"1px solid #aaa"}}>
                    <TabContext value={tab}>
                        <TabList onChange={(event, newValue) => setTab(newValue)}>
                            <Tab label={"Libreria"}></Tab>
                            {retrievedUser.role == "developer" && <Tab label={"Giochi Pubblicati"}></Tab>}
                            {retrievedUser.role == "developer" && <Tab label={"Bundle"}></Tab>}
                            {retrievedUser.id == user.id && role.slug == "developer" && <Tab label={"Statistiche"}></Tab>}
                        </TabList>

                        <TabPanel value={0}>
                            <Box className="px-4 py-3">
                                <GameList games={retrievedUser.games} handleClick={handleClick} selection={[]} />
                            </Box>
                        </TabPanel>
                        <TabPanel value={1}>
                            <YourGames user={retrievedUser} />
                        </TabPanel>
                        <TabPanel value={2}>
                            <BundleOfUSer user={retrievedUser}/>
                        </TabPanel>
                        {retrievedUser.id == user.id && role.slug == "developer" && <TabPanel value={3}>
                            <DeveloperStatsPage />
                        </TabPanel>}
                    </TabContext>
                </Box>
                <Box className="bg-slate-300 w-full p-6">
                    <Divider className="!mb-6">Giochi Visitati di Recente</Divider>
                    <Box className="grid grid-cols-8 gap-6">
                    {
                        retrievedUser?.recently_visited_games.map(details => 
                            <img className="cursor-pointer aspect-[600/900] w-full object-cover rounded" title={details.game.title} onClick={() => navigate('/games/' + details.game.id)} src={process.env.REACT_APP_BASE_URL + details.game.image} />
                        )
                    }
                </Box>
            </Box>
            </>
        }
        </Box>
    )
}