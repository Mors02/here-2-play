import React, { Component, useEffect, useState } from "react";
//import axios from "axios";
import axios from "axios";
import { Stack, Grid, Container, Button } from "@mui/material";
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

    return (
        <Grid container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
            className="flex items-center min-h-screen bg-slate-300 justify-center">
            <CenterBox>
                {showRoles?
                <Container>
                    <Button variant="contained" onClick={() => setShowRoles(false)}><FaAngleLeft />Indietro</Button>
                    <Stack direction={"row"}>
                        <RoleButton selected={selectedButton} 
                            icon={<IoGameController className={iconClass}/>} 
                            onClick={() => clickRoleButton('player')} 
                            name='Giocatore'
                            slug="player"
                            description={"Compra e gioca tutti i giochi che vuoi. Più semplice di così!"} />
                        <RoleButton selected={selectedButton} 
                            icon={<FaComputer className={iconClass}/>} 
                            onClick={() => clickRoleButton('developer')} 
                            name="Developer" 
                            slug="developer"
                            description={"Carica i tuoi giochi sullo store per milioni di giocatori pronti a giocarlo."} />
                    </Stack>
                    {selectedButton? <Button onClick={sendData} className="mt-12" variant="contained">Completa registrazione.</Button> : <></>}
                </Container>
                :
                <>
                    <UserForm title="Registrazione" user={data} onSubmit={onSubmit} isEdit={false} />
                    <ErrorLabel text={error}/>
                    <p>
                        <span>Sei già registrato?</span><a href="/login"> Entra.</a>
                    </p>
                </>
                }
            </CenterBox>
             {/* Container in cui verranno renderizzati i toast */}
        </Grid>
    ); 
}

export default RegisterPage;