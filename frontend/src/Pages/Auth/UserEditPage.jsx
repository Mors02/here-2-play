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
import { IoArrowBackCircle } from "react-icons/io5";

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
        values = {...values,
                  'username': values['username']? values['username'] : '',
                  'first_name': values['first_name']? values['first_name'] : '',
                  'last_name': values['last_name']? values['last_name'] : '',
                  'email': values['email']? values['email'] : ''}
        axiosConfig.put('/api/user/' + user.id +"/", {...values},  {
            headers: {
            'Content-Type': 'multipart/form-data'
            }
        })
        .then(res => {
            setError()
            if (res.code == "ERR_BAD_RESPONSE" || res.code == "ERR_BAD_REQUEST")
                throw new Error(res["response"]["data"])

            if (res.data )            
                toast.success("Dati modificati.")                            
        }).catch((err) => {
            setError(ErrorMap[err.message]);
            toast.error(ErrorMap[err.message]);
        })
    }

    if (!loading)
    return (
        <Box className="flex justify-center relative">
            <IoArrowBackCircle color="#63748B" size={50} className="absolute top-4 left-4 cursor-pointer" onClick={() => navigate('/user/' + user.id)} />

            <CenterBox>
                <UserForm title={"Modifica Dati"} onSubmit={onSubmit} isEdit={true} user={user} pfp={pfp}/>
                <ErrorLabel text={err} />
                { 
                    role.slug != "developer" && 
                    <Box className="flex justify-center mx-8 mb-4">
                        <Button className="w-full" variant="contained" onClick={changeRole}>Diventa Developer!</Button> 
                    </Box>
                }
            </CenterBox>
        </Box>
    )
}

export default UserEditPage