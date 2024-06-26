import { Box, Container, CircularProgress, Typography, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import useCurrentUser from "../../config/UseCurrentUser";
import UserForm from "./UserForm";
import CenterBox from "../../Component/CenterBox";
import { axiosConfig, getToken } from "../../config/axiosConfig";
import {useNavigate } from "react-router";
import 'react-toastify/dist/ReactToastify.min.css';
import { toast } from "react-toastify";
import { ErrorMap } from "../../config/enums";
import ErrorLabel from "../../Component/ErrorLabel";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; 

function UserEditPage() {
    const {user, role, loading, loggedIn, pfp} = useCurrentUser();
    const [err, setError] = useState();
    const navigate = useNavigate();

    if (!loading) {
        if (!loggedIn)
            navigate("/")
    }

    const changeRole = () => {
        confirmAlert({
          title: 'Vuoi diventare un developer?',
          message: 'Manterrai la tua libreria e i tuoi contatti, in più potrai caricare giochi. Una volta diventato developer, non potrai tornare giocatore.',
          buttons: [
            {
              label: 'Procedi',
              onClick: () => {
                axiosConfig.get('/api/user/change-role/')
                .then(res => {
                    toast.success("Ora sei un developer!", {onClose: () => window.location.reload()})
                })
                .catch(err => {
                    toast.error(ErrorMap[err["response"]["data"]])
                })
              }
            },
            {
              label: 'Indietro'
            }
          ]
        });
      };
    
    function onSubmit(e, values) {
        axiosConfig.put('/api/user/' + user.id +"/", values,  {
            headers: {
            'Content-Type': 'multipart/form-data'
            }
        })
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
                <UserForm title={"Modifica dati"} onSubmit={onSubmit} isEdit={true} user={user} pfp={pfp}/>
                <ErrorLabel text={err} />
                {role.slug != "developer"? <Button variant={"contained"} onClick={changeRole}>Diventa developer!</Button> : <></>}
            </CenterBox>
        </Container>
        : <></>}
        </>
    )
}

export default UserEditPage