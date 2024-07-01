import React, { Component, useEffect, useState } from "react";
import axios from "axios";
import { useForm } from 'react-hook-form';
import { Stack, Grid, TextField, Button, Box, Divider, Typography } from "@mui/material";
import CenterBox from "../../Component/CenterBox";
import { ErrorMap } from "../../config/enums";
import { useNavigate } from "react-router-dom";
import useCurrentUser from "../../config/UseCurrentUser";
import { useAuth } from "../../config/AuthContext";
import 'react-toastify/dist/ReactToastify.min.css';
import { ToastContainer, toast } from 'react-toastify';
import ErrorLabel from "../../Component/ErrorLabel";
import { axiosConfig } from "../../config/axiosConfig";
import WhiteDivider from "../../Component/WhiteDivider";

function LoginPage() {
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const {loggedIn, user} = useCurrentUser();
    const { login } = useAuth();
    
    // If already logged in
    if (loggedIn) {
        console.log(loggedIn)
        navigate("/", {replace: true})
    }    

    const {
        register,
        formState: {errors},
        getValues,
        setValue
    } = useForm()

    function onSubmit(e) {
        e.preventDefault();
        const data = getValues();
        axios.post(`${process.env.REACT_APP_BASE_URL}/api/login/`, data).then(response => {
                setError()
                const data = response.data
                console.log(data, data.access)
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);
                axiosConfig.defaults.headers.common['Authorization'] = 
                                                `JWT ${data['access']}`;
                toast.success("Login effettuato con successo.", {onClose: () => {login(); window.location.replace("/")}})                   
                
            })
            .catch(error => {
                let errorType = error["response"]["data"];
                setValue('password', null)
                setError(ErrorMap[errorType]);
                toast.error(ErrorMap[errorType]);
            });
        
    }

    return (
        <Box className="flex justify-center">
            <CenterBox>
                <Stack spacing={2}>
                    <Box className="px-8 py-4 bg-slate-500">
                        <Typography variant="h5" className="text-center font-semibold text-white">Login</Typography>
                    </Box>

                    <Box className="px-8 py-4">
                        <form onSubmit={e => onSubmit(e)}>
                            <Stack spacing={2}>
                                <TextField className="bg-gray-200 rounded" label="Email" type="email" defaultValue="" {...register("email")} variant="outlined" />
                                <TextField className="bg-gray-200 rounded" label="Password" type="password" defaultValue="" {...register("password")} variant="outlined" />
                                <Button type="submit" variant="contained" color="info">Entra</Button>
                            </Stack>
                        </form>

                        <ErrorLabel text={error} />

                        <Typography className="flex gap-1 text-white !mt-4">
                            Non sei ancora registrato?
                            <a className="hover:text-black transition ease-linear" href="/register"> Registrati</a>
                        </Typography>
                    </Box>
                </Stack>
            </CenterBox>
        </Box>
    ); 
}

export default LoginPage;