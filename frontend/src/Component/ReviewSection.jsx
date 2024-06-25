import { Typography, Box, FormControl, FormLabel, TextareaAutosize, Grid, Stack, Rating, Button, MenuItem, Select, Chip } from "@mui/material";
import React, { useEffect, useState } from "react";
import StarIcon from '@mui/icons-material/Star';
import { toast } from "react-toastify";
import { ErrorMap } from "../config/enums";
import { axiosConfig } from "../config/axiosConfig";
import useCurrentUser from "../config/UseCurrentUser";


export default function ReviewSection({game}) {
    const [body, setBody] = useState("")
    const [rating, setRating] = useState(0)
    const [hover, setHover] = React.useState(-1);
    const [loadingPage, setLoading] = useState(true);
    const [review, setReview] = useState("");
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const {user} = useCurrentUser();

    useEffect(() => {
        getTags()
        axiosConfig.get("api/games/"+game+"/reviews")
        .then(res => {
            if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                throw new Error(res["response"]["data"])
            if (res.data != "")
                setValues(res.data)
            setLoading(false)
        })
        .catch(err => {
            toast.error(ErrorMap[err.message])
            setLoading(false)
        })        
    }, [])    

    function getTags() {
        axiosConfig.get("api/tags/")
        .then(res => {
            if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                throw new Error(res["response"]["data"])
            setTags(res.data)
        })
        .catch(err => {
            toast.error(ErrorMap[err.message])
        })
    }

    function sendReview() {
        if (rating == 0) {
            toast.error(ErrorMap["ERR_NO_RATING"])
            return
        }
        console.log(rating)
        if (review != "")
            updateReview()
        else
            createReview()
    }

    function updateReview() {
        console.log(review)
        axiosConfig.patch("api/games/"+game+"/reviews/"+review.id, {body, rating})
        .then(res => {
            if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                throw new Error(res["response"]["data"])
            setValues(res.data)
            toast.success("Recensione aggiornata con successo.")
        })
        .catch(err => {
            toast.error(ErrorMap[err.message])
        })
    }

    function createReview() {
        axiosConfig.post("api/games/"+game+"/reviews/", {body, rating, tags: selectedTags})
        .then(res => {
            if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                throw new Error(res["response"]["data"])
            setValues(res.data)
            toast.success("Recensione inviata con successo.")
        })
        .catch(err => {
            toast.error(ErrorMap[err.message])
        })
    }

    function setValues(data) {        
        setReview(data)
        setBody(data.body)
        setRating(data.rating)
    }

    function handleChange(event) {
        console.log(event.target.value)
        if (event.target.value.length > 4 )
            return toast.error(ErrorMap["ERR_TOO_MANY_TAGS"])
        setSelectedTags(event.target.value);
        console.log(selectedTags)
    }

    function SelectedChip({selected}) {
        return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value.id} label={value.name} />
              ))}
            </Box>
          )
    }

    return (
        <Box className="bg-slate-300 w-full p-4">
            <Typography variant="h4">Lascia una recensione</Typography>
            {!loadingPage && <FormControl className="w-full">
                <Box className="flex gap-4 mb-6" >
                    <Box className="grow">
                        <Stack>
                            <FormLabel><Typography variant="h5">Cosa ne pensi del gioco?</Typography></FormLabel>
                            <TextareaAutosize value={body} minRows={3} maxRows={5} onChange={(event) => setBody(event.target.value)}/>
                        </Stack>
                    </Box>
                    <Box className="mx-10">
                        <Stack className="flex place-items-center">
                            <FormLabel><Typography variant="h5">Lascia un voto</Typography></FormLabel>
                            <Rating value={rating} 
                                onChange={(event, newValue) => setRating(newValue)}
                                onChangeActive={(event, newHover) => setHover(newHover)} 
                                defaultValue={2.5} 
                                precision={0.5}
                                icon={<StarIcon style={{minHeight:"50px", minWidth:"50px"}} fontSize="large"/>}
                                emptyIcon={<StarIcon style={{ minHeight:"50px", minWidth:"50px" }} fontSize="large" 
                                size={"large"}                                
                                />}
                            />
                        </Stack>
                    </Box>
                    {!review && <Box className="w-2/5">
                        <Stack>
                            <FormLabel><Typography variant="h5">Consiglia i tags</Typography></FormLabel>
                            <Select
                                value={selectedTags}
                                onChange={handleChange}
                                renderValue={(selected) => (<SelectedChip selected={selected} />)}
                                multiple 
                            >
                                {
                                    tags.map(tag => <MenuItem value={tag}>{tag.name}</MenuItem>)
                                }
                            </Select>
                        </Stack>
                    </Box>}
                </Box>
                <Box className="text-center">
                    <Button className="w-1/3" variant="contained" onClick={() => sendReview()}>Invia</Button>
                </Box>
            </FormControl>}
        </Box>
    )
}