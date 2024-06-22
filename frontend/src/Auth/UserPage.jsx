import { Box, Container, CircularProgress, Typography } from "@mui/material";
import React, { useEffect } from "react";
import useCurrentUser from "../config/UseCurrentUser";
import UserForm from "./UserForm";
import CenterBox from "../Component/CenterBox";
import { axiosConfig, getCookie } from "../config/axiosConfig";
import {useNavigate } from "react-router";

function UserPage() {
    const {user, loading, loggedIn} = useCurrentUser();
    const navigate = useNavigate();
    
    useEffect(() => {
        console.log(!loading)
        if (!loading && !loggedIn)
            navigate("/")
    }, []);
    
    function onSubmit(e, values) {
        axiosConfig.post('/api/user/edit/', values)
        .then(res => {
            console.log(res);
        })
    }

    return (
        <>
        {!loading?
        <Container>
            <CenterBox>
                <Typography variant="h3">
                    Ciao, {user.username}
                </Typography>
                <UserForm title={"Modifica dati"} onSubmit={onSubmit} isEdit={true} user={user}/>
            </CenterBox>
        </Container>
        : <></>}
        </>
    )
}

export default UserPage