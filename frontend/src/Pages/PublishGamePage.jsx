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
import { ErrorMap } from '../config/enums'
import EditDrawer from '../Component/EditDrawer';
import Box from '@mui/material/Box';

function PublishGamePage() {
    const [image, setImage] = useState()
    const [attachments, setAttachments] = useState()
    const [file, setFile] = useState()
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const {
        register,
        getValues,
    } = useForm()

    function onSubmit(e) {
        e.preventDefault()

        if (!image)
            return toast.error(ErrorMap['ERR_COVER_REQUIRED'])
            
        if (!attachments)
            return toast.error(ErrorMap['ERR_ATTACHMENTS_REQUIRED'])

        setLoading(true)

        const uploadData = new FormData()
        uploadData.append('title', getValues('title'))
        uploadData.append('description', getValues('description'))
        uploadData.append('price', getValues('price'))
        uploadData.append('image', image, image.name)
        uploadData.append('file', file)

        Object.keys(attachments)
            .map(
                key => uploadData.append('attachments', attachments[key], attachments[key].name)
            )

        axiosConfig.post('/api/games/create/', uploadData, {
                headers: {
                'Content-Type': 'multipart/form-data'
                }
            })
            .then(res => {
                setLoading(false)
                navigate('/')

                if (res.status == 201)
                    return toast.success('Gioco pubblicato con successo!')
                return toast.error('Errore durante la pubblicazione!')
            })
            .catch(err => console.log(err))
    }

    function handleImageUpload(e) {
        if (e.target.files[0])
            setImage(e.target.files[0])
    }

    function handleAttachmentsUpload(e) {
        if (e.target.files[0])
            setAttachments(e.target.files)
    }

    function handleFileUpload(e) {
        if (e.target.files[0])
            setFile(e.target.files[0])
    }

    function ListAttachments() {
        return (
            <EditDrawer>
                {
                    Object.keys(attachments).map(
                        key => <li>{attachments[key].name}</li>
                    )
                }
            </EditDrawer>
        )
    }

    return (
        <form className='p-10' onSubmit={e => onSubmit(e)}>
            <Stack direction="column" spacing={2}>
                <TextField {...register('title')} label="Titolo" variant="outlined" required />
                <TextField {...register('description')} label="Descrizione" variant="outlined" multiline rows={3} required />
                <TextField {...register('price')} label="Prezzo" type="number" variant="outlined" required />

                <Box className="grid grid-cols-2 gap-4">
                    <Button variant="contained" component="label" startIcon={<CloudUploadIcon />}>
                        {
                            file?.name ?? 'Carica File'
                        }
                        <input type="file" 
                            onChange={e => handleFileUpload(e)}
                            hidden 
                        />
                    </Button>

                    <Button variant="contained" component="label" startIcon={<CloudUploadIcon />}>
                        {
                            image?.name ?? 'Carica Copertina'
                        }
                        <input type="file" 
                            accept="image/jpeg,image/png,image/gif" 
                            onChange={e => handleImageUpload(e)}
                            hidden 
                        />
                    </Button>
                </Box>
                
                <Box>
                    <Button className='w-full' variant="contained" component="label" startIcon={<CloudUploadIcon />}>
                        Carica Allegati
                        <input type="file" 
                            accept="image/jpeg,image/png,image/gif" 
                            onChange={e => handleAttachmentsUpload(e)}
                            multiple
                            hidden 
                        />
                    </Button>

                    { attachments && <ListAttachments /> }
                </Box>

                {
                    loading
                    ? <LoadingButton loading variant="outlined">Loading</LoadingButton>
                    : <Button type="submit" color="success" variant="contained" disabled={loading}>Pubblica</Button>
                }
            </Stack>
        </form>
    );
}

export default PublishGamePage;