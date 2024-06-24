import React, { useEffect, useState } from "react";
import { axiosConfig } from "../config/axiosConfig";
import { useParams } from "react-router-dom";
import { Button } from "@mui/material";
import { MdReport } from "react-icons/md";
import ReportGameModal from "../Modals/ReportGameModal";
import { toast } from "react-toastify";
import { ErrorMap } from "../config/enums";
import 'react-toastify/dist/ReactToastify.min.css';

function GameDetailsPage() {
    const { gameId } = useParams()
    const [game, setGame] = useState([])
    const [modalIsOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    function openModal() {
        setIsOpen(true);
      }
    
      function closeModal() {
        setIsOpen(false);
      }

    useEffect(() => {
        axiosConfig.get('/api/games/' + gameId)
            .then((res) => {
                setGame(res.data)
                setLoading(false)
            })
            .catch(err => {
                toast.error(ErrorMap[err["response"]["data"]])
            })
    }, [])

    function addGame() {
        axiosConfig.post('api/orders/add-game/', {game_id: gameId})
            .then(res => {
                if (res.code == "ERR_BAD_RESPONSE" || res.code == "ERR_BAD_REQUEST")
                    throw new Error(res["response"]["data"])
                console.log(res.data)
                toast.success("Gioco aggiunto al carrello.")
            })
            .catch(err => {
                toast.error(ErrorMap[err.message])
            })
    }

    return (
        <div>
             {
             !loading?
                 <>
                    <h1>{game.title}</h1>
                    <p>{game.description}</p>
                    <p>{game.price}</p>
                    <p>{game.upload_date}</p>
                    <Button variant="contained" color="error" sx={{marginTop: "11px", marginRight:"24px", float: "right"}} onClick={() => openModal()}><MdReport /> Segnala</Button>
                    <ReportGameModal 
                        closeModal={closeModal} 
                        modalIsOpen={modalIsOpen} 
                        gameReported={game}
                    />
                    <Button variant="contained" onClick={() => addGame()}color="info">Aggiungi al carrello</Button>
                </>  
                : 
                <></>
            }
        </div>
    )
}

export default GameDetailsPage;