import React from "react";
import axios from "axios";
import { useForm } from 'react-hook-form';
import { Stack, Grid, TextField, Button } from "@mui/material";
import CenterBox from "../Component/CenterBox";

function LoginPage() {
    const {
        register,
        handleSubmit,
        watch,
        formState
    } = useForm()

    function onSubmit(event) {    
        console.log(formState);
        axios.post(process.env.REACT_APP_BASE_URL + '/api/login/', {
            email: "pierino",
            password: "pier"
        })
            .then(response => {
                
            })
            .catch(error => {
            console.log(error);
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
                    <form onSubmit={() => handleSubmit(onSubmit)}>
                        <p>
                            <TextField label="Email" defaultValue="" {...register("email")} variant="standard" />
                        </p>
                        <p>
                            <TextField label="Password" defaultValue="" {...register("password")} variant="standard" />
                        </p>
                        <p>
                            <Button type="submit" variant="contained" color="info">Entra</Button>
                        </p>
                    </form>
                </Stack>
            </CenterBox>
        </Grid>
    ); 
}

export default LoginPage;