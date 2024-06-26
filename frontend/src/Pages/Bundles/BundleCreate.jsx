import React, {useState} from "react";
import { Box, LinearProgress, Typography, TextField, InputAdornment, Button, Input, getAvatarGroupUtilityClass } from "@mui/material";
import GameList from "../../Component/GameList";
import useCurrentUser from "../../config/UseCurrentUser";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { axiosConfig } from "../../config/axiosConfig";
import { toast } from "react-toastify";
import { ErrorMap } from "../../config/enums";

export default function BundleCreate() {

    const {user, loading} = useCurrentUser()
    const [games, setGames] = useState([])
    const {
        register,
        getValues,
        setValue
    } = useForm()

    function handleClick(game) {
         let games = getValues("games")
         if (games == undefined || games.length == 0) {
            setValue("games", [game.id])
         }
         else {
            if (games.some(id => id == game.id)) {
                games = games.filter(id => id != game.id)
                setValue("games", games)
            }
            else
                setValue("games", [...getValues('games'), game.id])
         }
         
         setGames(getValues("games"))         
    }

    const navigate = useNavigate();

    function onSubmit(e) {
        e.preventDefault();
        const data = getValues()
        axiosConfig.post('api/bundles/', data)
        .then(res => {
            if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                throw new Error(res["response"]["data"])
            toast.success("Bundle creato correttamente.", {onClose: () => {navigate("/user/"+user.id)}})
        })
        .catch(err => {
            console.log(err)
            toast.error(ErrorMap[err.message])
        })
    }

    return (
        <form onSubmit={e => onSubmit(e)}>
            <Box className="px-10 py-8">
                <Typography variant="h5">Aggiungi giochi al bundle:</Typography>
                {!loading? <GameList selection={games} games={user.published_games} handleClick={handleClick} /> : <LinearProgress />}
                <Box className="flex gap-4 !mt-6">
                    <TextField className="grow" label="Nome" type="text" {...register('name')} />
                    <TextField className="grow" label="Percentuale" type="number" {...register('discount')} InputProps={{
                                                endAdornment: <InputAdornment position="end">%</InputAdornment>
                                            }}/>
                </Box>
                <Box className="flex gap-4 !mt-6">
                    <TextField className="grow" label="Descrizione" type="text" {...register('description')} />
                </Box>
                <Box className="float-left !mt-6">
                    <Button variant="outlined" color="error" onClick={() => navigate('/user/'+user.id)}>Indietro</Button>
                </Box>
                <Box className="float-right !mt-6">
                    <Button variant="contained" type="submit">Crea Bundle</Button>
                </Box>
                <Input type="hidden" {...register("games")}></Input>
            </Box>
        </form>
    )
    
}