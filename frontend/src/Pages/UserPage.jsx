import React, { useState, useEffect } from "react";
import { axiosConfig } from "../config/axiosConfig";
import { useParams } from "react-router";
import { Container, LinearProgress, Typography, Button, Box } from "@mui/material";
import useCurrentUser from "../config/UseCurrentUser";
import moment from 'moment';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

export default function UserPage() {
    const [retrievedUser, setUser] = useState()
    const {user, loading} = useCurrentUser()
    const {id} = useParams()
    const [loadingPage, setLoading] = useState(true)

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
            setLoading(false);
            setUser(res.data);
            console.log(res);
        })
        .catch(err => {
            setLoading(false);
            console.log(err)
        });
    }, [])
    

    return (
        <Box className="w-screen">
        {
            loadingPage || loading? <LinearProgress /> :
            <>
                <Box className="bg-slate-400 p-2 ">
                    <Box>
                        <Typography className="inline" variant="h3" >{retrievedUser.username} </Typography>
                        <Typography className="inline"> Registrato da {dateDiff(retrievedUser.date_joined)} </Typography>
                        {user && id == user.id?
                            <Button variant="contained" sx={{marginTop: "11px", marginRight:"24px", float: "right"}} onClick={() => window.location.replace('/user')}>Modifica profilo</Button> :
                            <></>
                        }
                    </Box>
                </Box>
                <Box className=" w-4/5 h-screen mx-auto" sx={{borderLeft:"1px solid #aaa", borderRight:"1px solid #aaa"}}>
                    <Tabs>
                        <TabList>
                        <Tab>Libreria</Tab>
                        <Tab>Giochi Pubblicati</Tab>
                        </TabList>

                        <TabPanel>
                        <h2>Libreria</h2>
                        </TabPanel>
                        <TabPanel>
                        <h2>Giochi pubblicati</h2>
                        </TabPanel>
                    </Tabs>
                </Box>
            </>
        
        }
        </Box>
    )
}