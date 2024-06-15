import React, { useState } from "react";
import axios from "axios";
import { useForm } from 'react-hook-form';
import { Stack, Grid, TextField, Button } from "@mui/material";
import CenterBox from "../Component/CenterBox";
import { ErrorMap } from "../enums";
import { useNavigate } from "react-router-dom";

function LoginPage() {
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const {
        register,
        formState: {errors},
        getValues
    } = useForm()

    function enterPress(e) {
        if (e.key == "Enter")
            onSubmit();
    }

    function onSubmit(event) {  
        const data = getValues();

        axios.post(process.env.REACT_APP_BASE_URL + '/api/login/', data)
            .then(response => {
                if (response.data.result) {
                    navigate("/", {replace: true});
                } else {
                    setError(ErrorMap["ERR_INVALID_LOGIN"])
                }
            })
            .catch(error => {
                console.log(error)
                setError(ErrorMap[error.code]);
            });
        
    }
    console.log(errors)

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
                    <form>
                        <p>
                            <TextField label="Email" type="email" defaultValue="" {...register("email")} variant="standard" />
                        </p>
                        <p>
                            <TextField label="Password" type="password" defaultValue="" {...register("password")} variant="standard" />
                        </p>
                        <p>
                            <Button onClick={(e) => onSubmit(e)} onKeyDown={(e) => enterPress(e)} variant="contained" color="info">Entra</Button>
                        </p>
                    </form>
                    {error != ""? <p>{error}</p> : <></>}
                </Stack>
            </CenterBox>
        </Grid>
    ); 
}

export default LoginPage;