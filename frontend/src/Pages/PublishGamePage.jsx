import axios from 'axios';
import { React, useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { TextField, Button, Stack, InputAdornment } from "@mui/material"
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useForm } from 'react-hook-form';
import { axiosConfig, getCookie } from '../axiosConfig';

function PublishGamePage() {
    const [showDiscount, setShowDiscount] = useState(false)

    const {
        register,
        getValues,
    } = useForm()

    function onSubmit(e) {
        e.preventDefault()
        console.log(getCookie('csrftoken'))
        axiosConfig.post('/api/games/', getValues(), {
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            withCredentials: true
        })
            .then((res) => console.log(res))
    }

    return (
        <form onSubmit={e => onSubmit(e)}>
            <Stack direction="column" spacing={2}>
                <TextField {...register('title')} label="Title" variant="outlined" required />
                <TextField {...register('description')} label="Description" variant="outlined" multiline rows={2} required />
                <TextField {...register('price')} label="Prezzo" type="number" variant="outlined" rows={2} required />

                <Button onClick={() => setShowDiscount(!showDiscount)} variant={showDiscount ? "outline" : "contained"}>Add a discount</Button>

                {
                    showDiscount && 
                    <div>
                        <TextField label="Percentage" InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>
                        }}/>
                        <DatePicker label="Start" />
                        <DatePicker label="End" />
                    </div>
                }

                {/* WIP */}
                <Button variant="contained" component="label">
                    Upload Game Cover
                    <input type="file" hidden />
                </Button>

                {/* WIP */}
                <Button variant="contained" component="label">
                    Upload Game Attachments
                    <input type="file" hidden />
                </Button>

                <Button type="submit" variant="contained">Publish</Button>
            </Stack>
        </form>
    );
}

export default PublishGamePage;