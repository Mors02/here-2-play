import { Typography, Button, Box, Stack, Divider } from "@mui/material";
import React, { useEffect, useReducer, useState } from "react";
import { axiosConfig } from "../config/axiosConfig";
import { toast } from "react-toastify";
import { ErrorMap } from "../config/enums";
import PaymentModal from "../Modals/PaymentModal";
import moment from "moment";
import { IoMdClose } from "react-icons/io";
import { useNavigate } from "react-router";

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
    const navigate = useNavigate()

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

    function navigateToGame(game) {
        navigate('/games/' + game.details.id)
    }

    function navigateToBundle(bundle) {
        navigate('/bundle/' + bundle.details.id)
    }

    return (
        <Box className="px-[10%] lg:px-[12%] py-8">
            <Divider><Typography variant="h4" className="font-semibold">Carrello</Typography></Divider>

            <Stack spacing={2} className="flex justify-start overflow-auto my-4">               
                {games?.map((game, index) => (
                    <Box className="flex pr-4 rounded bg-gray-100 overflow-hidden">
                        <Box className="flex gap-4">
                            <img className="aspect-[600/900] object-cover w-[70px]" src={process.env.REACT_APP_BASE_URL + game.details.image} />
                            <Typography onClick={() => navigateToGame(game)} className="!my-auto py-3 cursor-pointer hover:text-blue-500 transition ease-linear">{game.details.title}</Typography>
                        </Box>
                        
                        <Box className="flex py-3 grow gap-4 justify-end">
                            <Typography className="!my-auto">{(+game.details.price).toFixed(2)} €</Typography>
                            <IoMdClose className="!my-auto" onClick={() => deleteGame(game.id)} color="red" size={30} />
                        </Box>
                    </Box>
                ))}
                {bundles?.map((bundle, index) => (
                    <Box className="flex px-4 rounded bg-gray-100 overflow-hidden">
                        <Typography onClick={() => navigateToBundle(bundle)} className="flex gap-2 !my-auto py-3 cursor-pointer hover:text-blue-500 transition ease-linear">{bundle.details.name} 
                            <Typography className="text-gray-400">(Bundle)</Typography>
                        </Typography>
                        
                        <Box className="flex py-3 grow gap-4 justify-end">
                            <Typography className="!my-auto">{(+bundle.details.discounted_price).toFixed(2)} €</Typography>
                            <IoMdClose className="!my-auto" onClick={() => deleteBundle(bundle.id)} color="red" size={30} />
                        </Box>
                    </Box>
                ))}
            </Stack>

            <Stack spacing={2}>
                {games.length == 0 && bundles.length == 0 && <Typography variant="h5" className="text-center !mt-3 !mb-4 rounded p-2 bg-slate-500 text-white">Il tuo carrello è vuoto. Riempilo!</Typography>}
                <Box className="flex justify-end">
                    <Typography variant="h5">Totale: € {!loading ? (state.totalCost).toFixed(2) : 0}</Typography>
                </Box>
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
            .then(res => {
                if (res.data == "") {
                    isLoading(false)
                    return
                }

                applyDiscounts(res.data?.games)
                setGames(res.data?.games)
                setBundles(res.data?.bundles)     

                res.data.games?.map(game => {
                    let price = game.details.price;
                    dispatch({price: +price, type: "add"})
                })

                res.data.bundles?.map(bundle => {
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
                { games?.length == 0 && bundles?.length == 0 && <Typography className="!my-4">Vuoto...</Typography> }

                { 
                    games?.map((game, index) => 
                        <Box className={"flex justify-between px-4 py-2 " + (index % 2 == 0 ? 'bg-slate-400' : '')}>
                            <Typography>{game.details.title}</Typography>
                            <Typography>{game.details.price} €</Typography>
                        </Box>
                    )
                }

                {
                    bundles?.map((bundle, index) =>
                        <Box className={"flex justify-between px-4 py-2 " + (index % 2 == (games.length % 2 == 0 ? 0 : 1) ? 'bg-slate-400' : '')}>
                            <Typography>{bundle.details.name}</Typography>
                            <Typography className="float-right">{(+bundle.details.discounted_price).toFixed(2)} €</Typography>
                        </Box>
                    )
                }
            </Stack>

            <Box className="flex flex-col gap-4 p-4 text-center border-t border-t-gray-400">
                <Typography className="text-white" variant="h5">Totale: {(state?.totalCost).toFixed(2)} €</Typography>
                <a href="/cart"><Button variant="contained">Vai alla pagina del carrello</Button></a>
            </Box>
        </Box>
    );
}