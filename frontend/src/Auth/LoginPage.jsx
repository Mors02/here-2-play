import React, { Component, useEffect, useState } from "react";
//import axios from "axios";
import axios from "axios";
import { useForm } from 'react-hook-form';
import { Stack, Grid, TextField, Button } from "@mui/material";
import CenterBox from "../Component/CenterBox";
import { ErrorMap } from "../config/enums";
import { useNavigate } from "react-router-dom";
import useCurrentUser from "../config/UseCurrentUser";
import { useAuth } from "../config/AuthContext";
import 'react-toastify/dist/ReactToastify.min.css';
import { ToastContainer, toast } from 'react-toastify';
import ErrorLabel from "../Component/ErrorLabel";



function LoginPage() {
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const {loggedIn, user} = useCurrentUser();
    const { login } = useAuth();
    
    //if already logged in
    if (loggedIn) {
        console.log(loggedIn)
        navigate("/", {replace: true})
    }
        
    

    const notify = () => toast.success("Login effettuato con successo.");

    const {
        register,
        formState: {errors},
        getValues,
        setValue
    } = useForm()

    function onSubmit(e) {
        e.preventDefault();
        const data = getValues();
        axios.post(`${process.env.REACT_APP_BASE_URL}/api/login/`, data, {
            xsrfCookieName: "csrftoken",
            xsrfHeaderName: "X-CSRFToken",
            withCredentials: true,
        }).then(response => {
                console.log(response)
                if (response.data) {
                    setError()
                    toast.success("Login effettuato con successo.", {onClose: () => {login(); navigate("/")}})                   
                }
            })
            .catch(error => {
                let errorType = error["response"]["data"];
                setValue('password', null)
                setError(ErrorMap[errorType]);
                toast.error(ErrorMap[errorType]);
            });
        
    }

    return (
        <Grid container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
            class="flex items-center min-h-screen bg-slate-300 justify-center">
            <CenterBox>
                <Stack direction="column">
                    <h2>Login</h2>
                    <form onSubmit={e => onSubmit(e)}>
                        <p>
                            <TextField label="Email" type="email" defaultValue="" {...register("email")} variant="standard" />
                        </p>
                        <p>
                            <TextField label="Password" type="password" defaultValue="" {...register("password")} variant="standard" />
                        </p>
                        <p>
                            <Button type="submit" variant="contained" color="info">Entra</Button>
                        </p>
                    </form>
                    <ErrorLabel text={error} />
                    <p>
                        <span>Non sei ancora registrato?</span><a href="/register"> Registrati.</a>
                    </p>
                </Stack>
            </CenterBox>
             {/* Container in cui verranno renderizzati i toast */}
        </Grid>
    ); 
}

export default LoginPage;