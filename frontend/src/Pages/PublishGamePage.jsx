import axios from 'axios';
import { React, useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { TextField, Button, Stack, InputAdornment } from "@mui/material"
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useForm } from 'react-hook-form';
import { axiosConfig, getCookie } from '../config/axiosConfig';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LoadingButton from '@mui/lab/LoadingButton';
import { ToastContainer, toast } from 'react-toastify';

function PublishGamePage() {
    const [showDiscount, setShowDiscount] = useState(false)
    const [image, setImage] = useState()
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const {
        register,
        getValues,
    } = useForm()

    function onSubmit(e) {
        e.preventDefault()

        setLoading(true)

        const uploadData = new FormData()
        uploadData.append('title', getValues('title'))
        uploadData.append('description', getValues('description'))
        uploadData.append('price', getValues('price'))
        uploadData.append('image_url', image, image.name)

        axiosConfig.put('/api/games/create/', uploadData, {
                headers: {
                'Content-Type': 'multipart/form-data'
                }
            })
            .then((res) => {
                setLoading(false)
                toast.success('Gioco pubblicato con successo!', {onClose: () => navigate('/your-games')})
            })
            .catch(err => console.log(err))
    }

    function handleImageUpload(e) {
        if (e.target.files[0])
            setImage(e.target.files[0])
    }

    return (
        <form className='p-10' onSubmit={e => onSubmit(e)}>
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

                <Button variant="contained" component="label" startIcon={<CloudUploadIcon />}>
                    {
                        image?.name ?? 'Upload Game Cover'
                    }
                    <input type="file" 
                        name="image_url"
                        accept="image/jpeg,image/png,image/gif" 
                        hidden 
                        onChange={e => handleImageUpload(e)}
                    />
                </Button>

                {/* WIP */}
                {/* <Button variant="contained" component="label">
                    Upload Game Attachments
                    <input type="file" hidden />
                </Button> */}

                {
                    loading
                    ? <LoadingButton loading variant="outlined">asdsa</LoadingButton>
                    : <Button type="submit" variant="contained" disabled={loading}>Publish</Button>
                }
            </Stack>
        </form>
    );
}

export default PublishGamePage;