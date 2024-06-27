import React, { useEffect, useState } from "react";
import { axiosConfig } from "../../config/axiosConfig";
import { Button, Divider, Stack, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { ErrorMap } from "../../config/enums";
import { Link, useNavigate, useParams } from "react-router-dom";
import Box from '@mui/material/Box';
import 'react-toastify/dist/ReactToastify.min.css';
import { IoArrowBackCircle } from "react-icons/io5";
import GameList from "../../Component/GameList";


export default function BundleDetails() {
    const { id }= useParams()
    const navigate = useNavigate()
    const [bundle, setBundle] = useState({})
    const [loadingPage, setLoading] = useState(true)

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
            <IoArrowBackCircle color="#63748B" size={50} className="absolute top-4 left-4 cursor-pointer" onClick={() => navigate(-1)} />
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
                        {/* <Typography><b>Categoria: </b>{game.category? game.category.name : "(Categoria Eliminata)"}</Typography>
                        <Typography><b>Data di Pubblicazione: </b>{moment(game.upload_date).format('DD/MM/YYYY')}</Typography> */}
                        <Typography>
                            <b>Sviluppatore: </b>
                            <a className="text-blue-500" href={"/user/" + bundle.publisher?.id}>{bundle.publisher?.username}</a>
                        </Typography>
                        {/* <Box className="flex gap-2">
                            <b>Tags: </b>
                            {
                                game?.tags.map(tag => 
                                    <Typography onClick={() => handleTagClick(tag.tag.id)} className="bg-orange-400 hover:bg-opacity-60 transition ease-linear text-white px-2 rounded cursor-pointer">{tag.tag.name}</Typography>
                                )
                            }
                        </Box> */}
                    </Stack>
                </Box>
            </Box>

            <Box className="grid grid-cols-2 gap-4 !mb-10">
                <Button variant="contained" className="float-right" onClick={() => addBundle()} color="info">Aggiungi al carrello</Button>
                {/* <Button variant="contained" color="error" onClick={() => openModal()}><MdReport className="mr-2" />Segnala</Button>
                <ReportGameModal 
                    closeModal={closeModal} 
                    modalIsOpen={modalIsOpen} 
                    gameReported={game}
                /> */}
            </Box>

            {/* {   
                game.publisher?.id != user.id && (
                    <ReviewSection game={game.id}/>
                ) 
            } */}
        </Stack>
    )
}