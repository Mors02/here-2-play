import { Typography, Box, FormControl, FormLabel, TextareaAutosize, Grid, Stack, Rating, Button, MenuItem, Select, Chip, Divider } from "@mui/material";
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
        axiosConfig.get("api/games/" + game + "/reviews/")
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
        axiosConfig.patch("api/games/"+game+"/reviews/"+review.id+"/", {body, rating})
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
        axiosConfig.post("api/games/" + game + "/reviews/", {body, rating, tags: selectedTags})
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

    if (!loadingPage)
    return (
        <Box className="bg-slate-100 w-full p-6 rounded">
            <Divider><b>Lascia una Recensione</b></Divider>
            <FormControl className="w-full !mt-4">
                <Stack spacing={2}>
                    <Stack className="flex place-items-start !-mt-2">
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

                    <TextareaAutosize className="w-full" value={body} minRows={3} maxRows={5} onChange={(event) => setBody(event.target.value)}/>

                    {
                        !review && 
                        <Stack>
                            <FormLabel><Typography>Consiglia i tags (Opzionale)</Typography></FormLabel>
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
                    }
                </Stack>

                <Box className="text-center mt-6">
                    <Button className="w-1/3" variant="contained" onClick={() => sendReview()}>Invia</Button>
                </Box>
            </FormControl>
        </Box>
    )
}