import React, { Component, useEffect, useState } from "react";
//import axios from "axios";
import axios from "axios";
import { Stack, Grid, Container, Button, Box, Typography } from "@mui/material";
import CenterBox from "../../Component/CenterBox";
import { ErrorMap } from "../../config/enums";
import { useNavigate } from "react-router-dom";
import useCurrentUser from "../../config/UseCurrentUser";
import 'react-toastify/dist/ReactToastify.min.css';
import { toast } from 'react-toastify';
import UserForm from "./UserForm";
import ErrorLabel from "../../Component/ErrorLabel";
import RoleButton from "../../Component/RoleButton";
import { FaComputer } from "react-icons/fa6";
import { FaAngleLeft } from "react-icons/fa";
import { IoGameController } from "react-icons/io5";


function RegisterPage() {
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const {loggedIn, user} = useCurrentUser();
    const [data, setData] = useState();
    const [selectedButton, selectButton] = useState();
    const [showRoles, setShowRoles] = useState(false);
    const iconClass = "h-32 w-32 mx-auto";
    //if already logged in
    if (loggedIn) {
        console.log(loggedIn)
        navigate("/", {replace: true})
    }    


    function onSubmit(e, values) {
        e.preventDefault();        
        //let data = values;
        setData(values);
        setShowRoles(true);
        selectButton();
    }

    function clickRoleButton(name) {
        selectButton(name);
        setData({...data, "role_slug": name})
        console.log(data);
    }

    function sendData() {
        if (data.password == data.confirmPassword) {
            axios.post(`${process.env.REACT_APP_BASE_URL}/api/register/`, data).then(response => {
                setError();
                toast.success("Registrazione effettuato con successo.", {onClose: () => {navigate("/login")}})                   
            })
            .catch(error => {               
                let errorType = error["response"]? error["response"]["data"] : "ERR_SERVER_ERROR";
                setError(ErrorMap[errorType])
                toast.error(ErrorMap[errorType])
            });
        } else {
            toast.error(ErrorMap["ERR_DIFFERENT_PASSWORDS"])
        }  
    }

    function Roles() {
        return (
            <Stack spacing={4} className="p-8">
                <Button className="w-fit" variant="contained" onClick={() => setShowRoles(false)} startIcon={<FaAngleLeft />}>Indietro</Button>

                <Box className="flex gap-8">
                    <RoleButton selected={selectedButton} 
                        icon={<IoGameController className={iconClass}/>} 
                        onClick={() => clickRoleButton('player')} 
                        name='Giocatore'
                        slug="player"
                        description={"Compra e gioca tutti i giochi che vuoi. Più semplice di così!"}
                    />
                    <RoleButton selected={selectedButton} 
                        icon={<FaComputer className={iconClass}/>} 
                        onClick={() => clickRoleButton('developer')} 
                        name="Developer" 
                        slug="developer"
                        description={"Carica i tuoi giochi sullo store per milioni di giocatori pronti a giocarlo!"}
                    />
                </Box>

                <Box className="flex justify-center"><Button disabled={!selectedButton} onClick={sendData} variant="contained">Completa Registrazione</Button></Box>
            </Stack>
        )
    }

    function RegistrationForm() {
        return (
            <Box>
                <UserForm title="Registrazione" user={data} onSubmit={onSubmit} isEdit={false} />
                <ErrorLabel text={error}/>

                <Box className="flex justify-center">
                    <Typography className="flex gap-1 text-white !mb-4">
                        Sei già registrato?
                        <a className="hover:text-black transition ease-linear" href="/login">Entra</a>
                    </Typography>
                </Box>
            </Box>
        )
    }

    return (
        <Box className="flex justify-center">
            <CenterBox>
                {
                    showRoles
                    ? <Roles />
                    : <RegistrationForm />
                }
            </CenterBox>
        </Box>
    ); 
}

export default RegisterPage;