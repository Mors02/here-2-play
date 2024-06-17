import React, { useEffect, useState } from "react";
//import axios from "axios";
import axios from "axios";
import { useForm } from 'react-hook-form';
import { Stack, Grid, TextField, Button } from "@mui/material";
import CenterBox from "../Component/CenterBox";
import { ErrorMap } from "../enums";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../axiosConfig";
import useCurrentUser from "./UseCurrentUser";



function LoginPage() {

    const [error, setError] = useState("");
    const navigate = useNavigate();
    const {loggedIn} = useCurrentUser();

    if (loggedIn)
        navigate("/", {replace: true})
    
    //if already logged in
    

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
                    
                    navigate("/", {replace: true});
                } else {
                    setError(ErrorMap[420])
                }
            })
            .catch(error => {
                console.log(ErrorMap[error["response"]["status"]])
                //setValue('password', null)
                setError(ErrorMap[error["response"]["status"]]);
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
                    {error != ""? <p class="">{error}</p> : <></>}
                </Stack>
            </CenterBox>
        </Grid>
    ); 
}

export default LoginPage;