import React, { useState, useEffect } from "react";
import { axiosConfig } from "../config/axiosConfig";
import { useNavigate, useParams } from "react-router";
import { Container, LinearProgress, Typography, Button, Box } from "@mui/material";
import useCurrentUser from "../config/UseCurrentUser";
import moment from 'moment';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { FaPen } from "react-icons/fa";
import { MdReport } from "react-icons/md";
import ReportUserModal from "../Modals/ReportUserModal";
import YourGames from "../Component/YourGames"
import GameList from "../Component/GameList";

export default function UserPage() {
    const [retrievedUser, setUser] = useState()
    const {user, loading} = useCurrentUser()
    const navigate = useNavigate()
    const { id } = useParams()
    const [loadingPage, setLoading] = useState(true);
    const [modalIsOpen, setIsOpen] = useState(false);

    function openModal() {
      setIsOpen(true);
    }
  
    function closeModal() {
      setIsOpen(false);
    }

    function dateDiff(start) {
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
        axiosConfig.get('/api/user/'+id+"/")
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
    
    function handleClick(game) {
        return navigate('/games/' + game.id)
    }

    return (
        <Box className="w-screen overflow-x-hidden">
        {
            loadingPage || loading? <LinearProgress /> :
            <>
                <Box className="bg-slate-400 p-2">
                    <Box>
                        <Typography className="inline" variant="h3" >{retrievedUser.username} </Typography>
                        <Typography className="inline"> Registrato da {dateDiff(retrievedUser.date_joined)} </Typography>
                        {user && id == user.id?
                            <Button variant="contained" sx={{marginTop: "11px", marginRight:"24px", float: "right"}} onClick={() => window.location.replace('/user')}><FaPen /> Modifica profilo</Button> :
                            <Button variant="contained" color="error" sx={{marginTop: "11px", marginRight:"24px", float: "right"}} onClick={() => openModal()}><MdReport /> Segnala</Button>
                        }
                    </Box>
                </Box>
                <ReportUserModal  
                    closeModal={closeModal} 
                    modalIsOpen={modalIsOpen} 
                    userReported={retrievedUser}
                />
                <Box className="h-screen" sx={{borderLeft:"1px solid #aaa", borderRight:"1px solid #aaa"}}>
                    <Tabs>
                        <TabList>
                            <Tab>Libreria</Tab>
                            <Tab>Giochi Pubblicati</Tab>
                        </TabList>

                        <TabPanel>
                            <Box className="px-10 py-8">
                                <GameList games={retrievedUser.games} handleClick={handleClick} />
                            </Box>
                        </TabPanel>
                        <TabPanel>
                            <YourGames user={retrievedUser} />
                        </TabPanel>
                    </Tabs>
                </Box>
            </>
        }
        </Box>
    )
}