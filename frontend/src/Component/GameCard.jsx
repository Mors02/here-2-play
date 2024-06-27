import { Box, Divider, Stack, Typography, Rating } from "@mui/material";
import moment from 'moment'
import { useState } from "react";
import { Navigate, useNavigate } from "react-router";

function GameCard({ game, owned }) {
    const [discount, setDiscount] = useState(game?.discounts[0])
    const navigate = useNavigate()

    function Price() {
        if (discount) {
            return (
                <Box className="flex gap-3">
                    <Typography className="line-through">{game.price}</Typography>
                    <Typography>{(game.price - (game.price * discount.percentage / 100)).toFixed(2)}€</Typography>
                    <Typography className="rounded text-[#7CFC00] bg-[#228B22] px-1">-{discount.percentage}%</Typography>
                </Box>
            )
        }
        return game.price
    }

    function handleTagClick(id) {
        navigate('/', { state: { tagId: id } })
    }

    function PlayTime() {
        if (owned)
        return (
            <Box className="flex gap-2">
                <b>Ore di Gioco: </b>
                <Typography>{Math.floor(owned.play_time / 60)}:{owned.play_time % 60} Ore</Typography>
            </Box>
        )
    }

    return (
        <Box className="bg-gray-100 rounded-md flex">
            <img className="aspect-[600/900] w-2/5 object-cover rounded-l" src={process.env.REACT_APP_BASE_URL + game.image} />
            <Box className="p-6 w-full relative">
                <Stack className="w-full" spacing={1}>
                    <Divider><b>{game.title}</b></Divider>
                    <Box><b>Descrizione: </b>{game.description}</Box>
                    <Box className="flex gap-2">
                        <b>Prezzo: </b>
                        <Price />
                    </Box>
                    <Box><b>Categoria: </b>{game.category? game.category.name : "(Categoria Eliminata)"}</Box>
                    <Box><b>Data di Pubblicazione: </b>{moment(game.upload_date).format('DD/MM/YYYY')}</Box>
                    <Box>
                        <b>Sviluppatore: </b>
                        <a className="text-blue-500" href={"/user/" + game.publisher?.id}>{game.publisher?.username}</a>
                    </Box>
                    <Box className="flex gap-2">
                        <b>Valutazione Media: </b>
                        <Rating defaultValue={game?.average_rating} precision={0.5} readOnly />
                        <Typography>({game?.reviews?.length})</Typography>
                    </Box>
                    <Box className="flex gap-2">
                        <b>Tags: </b>
                        {
                            game?.tags.map(tag => 
                                <Typography onClick={() => handleTagClick(tag.tag.id)} className="bg-orange-400 hover:bg-opacity-60 transition ease-linear text-white px-2 rounded cursor-pointer">{tag.tag.name}</Typography>
                            )
                        }
                    </Box>
                    <PlayTime />
                </Stack>
            </Box>
        </Box>
    )
}

export default GameCard;