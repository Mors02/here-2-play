import React, { useEffect, useState } from "react";
import { axiosConfig } from "../../config/axiosConfig";
import { Button, Divider, Stack, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { ErrorMap } from "../../config/enums";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import Box from '@mui/material/Box';
import 'react-toastify/dist/ReactToastify.min.css';
import { IoArrowBackCircle } from "react-icons/io5";
import GameList from "../../Component/GameList";
import useCurrentUser from "../../config/UseCurrentUser";


export default function BundleDetails() {
    const { id }= useParams()
    const navigate = useNavigate()
    const [bundle, setBundle] = useState({})
    const [loadingPage, setLoading] = useState(true)
    const {user, loggedIn} = useCurrentUser()
    const {state} = useLocation()

    useEffect(() => {
        axiosConfig.get('api/bundles/'+id+"/")
        .then(res => {
            if (res.code == "ERR_BAD_RESPONSE" || res.code == "ERR_BAD_REQUEST")
                throw new Error(res["response"]["data"])
            console.log(res.data)
            setBundle(res.data)
            setLoading(false)
        })
        .catch(err => {
            toast.error(ErrorMap[err.message])
            setLoading(false)
        })
    }, [])

    function Price() {
        return (
            <Box className="flex gap-3">
                <Typography className="line-through">{(+bundle.total_price).toFixed(2)}€</Typography>
                <Typography>{(+bundle.discounted_price).toFixed(2)}€</Typography>
                <Typography className="rounded text-[#7CFC00] bg-[#228B22] px-1">-{bundle.discount}%</Typography>
            </Box>
        )        
    }

    function addBundle() {
        if (!loggedIn)
            return toast.error(ErrorMap["ERR_NOT_LOGGED_IN"])
        axiosConfig.post('api/orders/add-bundle/', {bundle_id: bundle.id})
            .then(res => {
                if (res.code == "ERR_BAD_RESPONSE" || res.code == "ERR_BAD_REQUEST")
                    throw new Error(res["response"]["data"])
                toast.success("Bundle aggiunto al carrello.")
            })
            .catch(err => {
                toast.error(ErrorMap[err.message])
            })
    }

    function handleClick(game) {
        return navigate('/games/' + game.id)
    } 

    return (
        <Stack spacing={4} className="px-[10%] lg:px-[12%] relative">
            <IoArrowBackCircle color="#63748B" size={50} className="absolute top-4 left-4 cursor-pointer" onClick={() => state?.backToBundles? navigate('/user/'+user.id+'#bundles') : navigate(-1)} />
            <Divider className="text-3xl !mt-8"><b>{bundle.name}</b></Divider>
                {!loadingPage && <GameList games={bundle.games.map(game => game.game)} previewPrices={true} selection={[]} handleClick={handleClick} />}
            <Box className="bg-gray-100 rounded-md flex">
                <Box className="p-6 w-full relative">
                    <Stack className="w-full" spacing={1}>
                        <Divider><b>{bundle.name}</b></Divider>
                        <Typography><b>Descrizione: </b>{bundle.description}</Typography>
                        <Typography className="flex gap-2">
                            <b>Prezzo: </b>
                            <Price />
                        </Typography>
                        <Typography>
                            <b>Sviluppatore: </b>
                            <a className="text-blue-500" href={"/user/" + bundle.publisher?.id}>{bundle.publisher?.username}</a>
                        </Typography>
                    </Stack>
                </Box>
            </Box>

            <Box className="gap-4 !mb-10">
                <Button variant="contained" className="w-full" onClick={() => addBundle()} color="info">Aggiungi al carrello</Button>
            </Box>
        </Stack>
    )
}