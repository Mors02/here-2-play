import { Typography, Button, Box, Stack, Divider } from "@mui/material";
import React, { useEffect, useReducer, useState } from "react";
import { axiosConfig } from "../config/axiosConfig";
import { toast } from "react-toastify";
import { ErrorMap } from "../config/enums";
import PaymentModal from "../Modals/PaymentModal";
import moment from "moment";

function applyDiscounts(games) {
    games.map(game => {
        game.details.discounts.some(discount => {
            let today = moment()
            if (today.isAfter(moment(discount.start_date)) && today.isBefore(moment(discount.end_date))) {
                game.details.price = +(game.details.price - (game.details.price * discount.percentage / 100)).toFixed(2)
            }
        })
    })
}

export default function OrderPage() {
    const initialState =  {totalCost: 0}
    const initializer = initialState => initialState
    const [games, setGames] = useState([])
    const [bundles, setBundles] = useState([])
    const [order, setOrder] = useState({})
    const [loading, isLoading] = useState(true)
    const [state, dispatch] = useReducer(reducer, initialState, initializer);
    const [showModal, setShowModal] = useState(false)

    const openModal = () => setShowModal(true)
    const closeModal = () => setShowModal(false)

    useEffect(() => {
        dispatch({type: "reset", totalCost: initialState})
        refreshGames()
    }, [])
    
    function reducer (state, action) {
        if (action.type == "reset")
            return initializer(action.totalCost)
        return {totalCost: state.totalCost + action.price}
    }
    
    function refreshGames() {
        axiosConfig.get('api/orders/')
        .then((res) => {
            if (res.data == "")
                return
            if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                throw new Error(res["response"]["data"])
            setOrder(res.data)
            applyDiscounts(res.data.games)
            setGames(res.data.games)
            setBundles(res.data.bundles)
            res.data.games.map(game => {
                let price = game.details.price;
                dispatch({price: +price, type: "add"})
            })
            res.data.bundles.map(bundle => {
                let price = bundle.details.discounted_price;
                dispatch({price: +price, type: "add"})                
            })
            isLoading(false)
        })
        .catch(err => {
            toast.error(ErrorMap[err.message])
            console.log(err)
        })
    }

    function deleteGame(id) {
        axiosConfig.delete('api/orders/game/' + id + "/")
        .then(res => {
            if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                throw new Error(res["response"]["data"])
        })
        .catch(err => {
            toast.error(ErrorMap[err.message])
            console.log(err)
        })
        .finally(() => {
            dispatch({type: "reset", totalCost: initialState})
            refreshGames()
        })
    }

    function deleteBundle(id) {
        axiosConfig.delete('api/orders/bundle/' + id + "/")
        .then(res => {
            if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                throw new Error(res["response"]["data"])
        })
        .catch(err => {
            toast.error(ErrorMap[err.message])
            console.log(err)
        })
        .finally(() => {
            dispatch({type: "reset", totalCost: initialState})
            refreshGames()
        })
    }

    const normalStyle = "border-b-2 min-w-60 min-h-16 border-black py-8"

    return (
        <Box>
            <Typography variant="h6">Carrello</Typography>
            <Stack className="flex justify-start max-h-full overflow-auto ">               
                {games.map((game, index) => (
                    <Box className={index==0? normalStyle + " border-t-2" : normalStyle}>
                        <Typography>{game.details.title}</Typography>
                        <Typography className="float-right">€ {(+game.details.price).toFixed(2)}</Typography>
                        <Button onClick={() => deleteGame(game.id)} color={"error"} variant={"contained"}>Rimuovi</Button>
                    </Box>
                ))}
                {bundles.map((bundle, index) => (
                    <Box className={index==0 && games.length == 0? normalStyle + " border-t-2" : normalStyle}>
                        <Typography>{bundle.details.name}</Typography>
                        <Typography className="float-right">€ {(+bundle.details.discounted_price).toFixed(2)}</Typography>
                        <Button onClick={() => deleteBundle(bundle.id)} color={"error"} variant={"contained"}>Rimuovi</Button>
                    </Box>
                ))}
            </Stack>
            <Stack>
                {games.length == 0 && bundles.length == 0 && <Typography variant="h3">Il tuo carrello è vuoto. Riempilo!</Typography>}
                <Typography variant="h5" className="float-right">Subtotale: € {!loading? (state.totalCost).toFixed(2) : 0}</Typography>
                <Button variant="contained" onClick={() => openModal()} disabled={games.length == 0 && bundles.length == 0}>Completa ordine</Button>
            </Stack>
            <PaymentModal modalIsOpen={showModal} openModal={openModal} closeModal={closeModal} order={order}/>
        </Box>
    )
}

export function OrderDropdown() {
    const [games, setGames] = useState([])
    const [loading, isLoading] = useState(true)
    const [state, dispatch] = useReducer((state, action) => {return {totalCost: state.totalCost + action.price}}, {totalCost: 0});
    const [bundles, setBundles] = useState([])

    useEffect(() => {
        axiosConfig.get('api/orders/')
            .then((res) => {
                if (res.data == "") {
                    return
                }

                applyDiscounts(res.data.games)
                setGames(res.data.games)
                setBundles(res.data.bundles)                
                res.data.games.map(game => {
                    let price = game.details.price;
                    dispatch({price: +price, type: "add"})
                })
                res.data.bundles.map(bundle => {
                    let price = bundle.details.discounted_price;
                    dispatch({price: +price, type: "add"})                
                })
                isLoading(false)
            })
            .catch(err => {
                console.log(err)
            }).finally(() => {console.log(bundles)})
    }, [])

    if (!loading)
    return(
        <Box className="bg-slate-500 min-h-dvh w-[400px]">
            <Box className="p-5 bg-slate-600 text-white">
                <Divider>
                    <b>Carrello</b>
                </Divider>
            </Box>

            <Stack className="flex text-center max-h-full overflow-auto">
                { games.length == 0 && bundles.length == 0 && <Typography>Vuoto...</Typography> }              
                { 
                    games.map((game, index) => 
                        <Box className={"flex justify-between px-4 py-2 " + (index % 2 == 0 ? 'bg-slate-400' : '')}>
                            <Typography>{game.details.title}</Typography>
                            <Typography>{game.details.price} €</Typography>
                        </Box>
                    )
                }
                {
                    bundles.map((bundle, index) =>
                        <Box className={"flex justify-between px-4 py-2 " + (index % 2 == 0 ? 'bg-slate-400' : '')}>
                            <Typography>{bundle.details.name}</Typography>
                            <Typography className="float-right">{(+bundle.details.discounted_price).toFixed(2)} €</Typography>
                        </Box>
                    )
                }
            </Stack>

            <Box className="flex flex-col gap-4 p-4 text-center border-t border-t-gray-400">
                <Typography className="text-white" variant="h5">Totale: {(state.totalCost).toFixed(2)} €</Typography>
                <a href="/cart"><Button variant="contained">Vai alla pagina del carrello</Button></a>
            </Box>
        </Box>
    );
}