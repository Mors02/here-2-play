import { Box, Container, CircularProgress, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import useCurrentUser from "../config/UseCurrentUser";
import UserForm from "./UserForm";
import CenterBox from "../Component/CenterBox";
import { axiosConfig, getCookie } from "../config/axiosConfig";
import {useNavigate } from "react-router";
import 'react-toastify/dist/ReactToastify.min.css';
import { toast } from "react-toastify";
import { ErrorMap } from "../config/enums";


function UserPage() {
    const {user, loading, loggedIn} = useCurrentUser();
    const [err, setError] = useState();
    const navigate = useNavigate();
    
    if (!loading && !loggedIn)
        navigate("/")
    
    function onSubmit(e, values) {
        axiosConfig.post('/api/user/edit/', values)
        .then(res => {
            toast.success("Cambio password effettuato. Dovrai rifare il login.", {onClose: () => {navigate("/login")}})
        }).catch((err) => {
            setError(ErrorMap[err]);
            toast.error(ErrorMap[err]);
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
            {err? <p>{err}</p> : <></>}
        </Container>
        : <></>}
        </>
    )
}

export default UserPage