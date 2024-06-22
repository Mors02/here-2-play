import { Box, Container, CircularProgress, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import useCurrentUser from "../config/UseCurrentUser";
import UserForm from "./UserForm";
import CenterBox from "../Component/CenterBox";
import { axiosConfig, getToken } from "../config/axiosConfig";
import {useNavigate } from "react-router";
import 'react-toastify/dist/ReactToastify.min.css';
import { toast } from "react-toastify";
import { ErrorMap } from "../config/enums";
import ErrorLabel from "../Component/ErrorLabel";


function UserPage() {
    const {user, role, loading, loggedIn} = useCurrentUser();
    const [err, setError] = useState();
    const navigate = useNavigate();
    
    if (!loading) {
        if (!loggedIn)
            navigate("/")
    } 
    
    function onSubmit(e, values) {
        axiosConfig.post('/api/user/edit/', values)
        .then(res => {
            setError()
            if (res.data && res.data.force_relogin)
                toast.success("Cambio password effettuato. Dovrai rifare il login.", {onClose: () => {localStorage.clear(); navigate("/login")}})
            else {
                toast.success("Dati modificati.")
            }
                
        }).catch((err) => {
            console.log("ERR", err, ErrorMap[err]);
            setError(ErrorMap[err["response"]["data"]]);
            toast.error(ErrorMap[err["response"]["data"]]);
        })
    }

    return (
        <>
        {!loading?
        <Container>
            <CenterBox>
                <Typography variant="h3">
                    Ciao, {user.username}! Sei un {role.name}
                </Typography>
                <UserForm title={"Modifica dati"} onSubmit={onSubmit} isEdit={true} user={user}/>
                <ErrorLabel text={err} />
            </CenterBox>
        </Container>
        : <></>}
        </>
    )
}

export default UserPage