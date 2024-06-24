import { useEffect, useState } from "react";
import { axiosConfig } from "../config/axiosConfig";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import Box from '@mui/material/Box';
import useCurrentUser from "../config/UseCurrentUser";
import { TextField, Button, Stack, InputAdornment, Typography } from "@mui/material"
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useForm } from 'react-hook-form';
import { TiDelete } from "react-icons/ti";
import { confirmAlert } from 'react-confirm-alert';
import Divider from '@mui/material/Divider';
import { RiDiscountPercentFill } from "react-icons/ri";
import EditDrawer from "../Component/EditDrawer";
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

function GameEditPage() {
    const [pageLoading, setPageLoading] = useState()
    const [game, setGame] = useState()
    const [image, setImage] = useState()
    const [file, setFile] = useState()
    const [attachments, setAttachments] = useState([])
    const [newAttachments, setNewAttachments] = useState([])
    const [showDiscount, setShowDiscount] = useState(false)
    const [activeDiscounts, setActiveDiscounts] = useState([])

    const { gameId } = useParams()
    const { user, loading } = useCurrentUser()
    const navigate = useNavigate()

    const {
        register,
        getValues,
        setValues
    } = useForm()

    function updateData() {
        setPageLoading(true)

        if (loading) return 

        axiosConfig.get('/api/games/' + gameId)
            .then(res => {
                console.log(res.data)
                if (res?.response?.status == 404) {
                    navigate('/')
                    return toast.error('Gioco non trovato!') 
                }

                if (res.data.publisher != user.id) {
                    navigate('/')
                    return toast.error('Non hai i permessi per modificare il gioco!') 
                }
                
                setAttachments(res.data.attachments)
                setGame(res.data)
                setPageLoading(false)
            })
    }

    useEffect(() => {
        updateData()
    }, [loading])

    function handleImageUpload(e) {
        if (e.target.files[0])
            setImage(e.target.files[0])
    }

    function handleAttachmentsUpload(e) {
        if (e.target.files[0])
            setNewAttachments(e.target.files)
    }

    function handleFileUpload(e) {
        if (e.target.files[0])
            setFile(e.target.files[0])
    }

    function ListAttachments() {
        return (
            <Box>
                <Divider>Vecchi Allegati</Divider>
                <Box className="grid grid-cols-4 gap-4 mt-4">
                {
                    Object.keys(attachments).map(
                        key => (
                            <Box className="relative border border-red-500">
                                <img className="aspect-[1920/1080] object-cover m-auto" src={process.env.REACT_APP_BASE_URL + attachments[key].image} />
                                <TiDelete className="absolute top-3 right-3" size={30} color="red" onClick={() => deleteAttachment(attachments[key].id)} />
                            </Box>
                        )
                    )
                }
                </Box>
            </Box>
        )
    }

    function ListNewAttachments() {
        return (
            <Box>
                <Divider>Nuovi Allegati</Divider>
                <Box>
                {
                    Object.keys(newAttachments).map(
                        key => (
                            <Typography>{newAttachments[key].name}</Typography>
                        )
                    )
                }
                </Box>
            </Box>
        )
    }

    function deleteAttachment(id) {
        confirmAlert({
          title: 'Sei sicuro di voler cancellare l\'allegato?',
          buttons: [
            {
              label: 'Procedi',
              onClick: () => {
                axiosConfig.delete('/api/attachments/' + id)
                    .then(res => {
                        if (res.status == 200) {
                            updateData()
                            return toast.success('L\'allegato è stato cancellato con successo!')
                        }
                        return toast.error('Non è stato possibile cancellare l\'allegato!')
                    })
              }
            },
            {
              label: 'Indietro'
            }
          ]
        });
    }

    function deleteGame() {
        confirmAlert({
          title: 'Sei sicuro di voler cancellare il gioco?',
          buttons: [
            {
              label: 'Procedi',
              onClick: () => {
                axiosConfig.delete('/api/games/' + gameId)
                    .then(res => {
                        if (res.status == 200) {
                            navigate('/')
                            return toast.success('Il gioco è stato cancellato con successo!')
                        }
                        return toast.error('Non è stato possibile cancellare il gioco')
                    })
              }
            },
            {
              label: 'Indietro'
            }
          ]
        });
    }

    function onSubmit(e) {
        e.preventDefault()

        if (!attachments || !newAttachments)
            return toast.error('Gli allegati del gioco sono richiesti')

        setPageLoading(true)

        const uploadData = new FormData()
        uploadData.append('title', getValues('title'))
        uploadData.append('description', getValues('description'))
        uploadData.append('price', getValues('price'))

        if (image)
            uploadData.append('image', image, image.name)

        if (file)
            uploadData.append('file', file)

        if (newAttachments.length > 0)
            Object.keys(newAttachments)
                .map(
                    key => uploadData.append('attachments', newAttachments[key], newAttachments[key].name)
                )

        axiosConfig.put('/api/games/' + gameId + "/", uploadData, {
                headers: {
                'Content-Type': 'multipart/form-data'
                }
            })
            .then(res => {
                setPageLoading(false)
                updateData()

                setNewAttachments([])
                setImage([])
                setFile([])

                if (res.status == 200)
                    return toast.success('Gioco modificato con successo!')
                return toast.error('Errore durante la modifica!')
            })
            .catch(err => console.log(err))
    }

    if (!pageLoading && game) {
        return (
            <form className='p-10' onSubmit={e => onSubmit(e)}>
                <Stack direction="column" spacing={2}>
                    <TextField defaultValue={game.title} {...register('title')} label="Title" variant="outlined" required />
                    <TextField defaultValue={game.description} {...register('description')} label="Description" variant="outlined" multiline rows={3} required />
                    <TextField defaultValue={game.price} {...register('price')} label="Prezzo" type="number" variant="outlined" required />

                    <Box>
                        <Button onClick={() => setShowDiscount(!showDiscount)} variant="contained" className="w-full" component="label" startIcon={<RiDiscountPercentFill />}>
                            Aggiungi Sconto
                        </Button>

                        {
                            (activeDiscounts.length > 0 || showDiscount) && (
                                <EditDrawer>
                                    <Box className="flex gap-4">
                                        <TextField label="Percentage" InputProps={{
                                            endAdornment: <InputAdornment position="end">%</InputAdornment>
                                        }}/>
                                        <DatePicker label="Start" />
                                        <DatePicker label="End" />
                                    </Box>
                                </EditDrawer>
                            )
                        }
                    </Box>

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
                        <Button className="w-full" variant="contained" component="label" startIcon={<CloudUploadIcon />}>
                            Carica Allegati
                            <input type="file" 
                                accept="image/jpeg,image/png,image/gif" 
                                onChange={e => handleAttachmentsUpload(e)}
                                multiple
                                hidden 
                            />
                        </Button>

                        {
                            (newAttachments.length > 0 || attachments.length > 0) && (
                                <EditDrawer>
                                    <Box>
                                        { newAttachments.length > 0 && <ListNewAttachments /> }

                                        { attachments.length > 0 && <ListAttachments /> }
                                    </Box>
                                </EditDrawer>
                            )
                        }
                    </Box>

                    <Box className="grid grid-cols-2 gap-4">
                        <Button variant="contained" color="error" onClick={() => deleteGame()}>Elimina</Button>
                        <Button variant="contained" color="success" type="submit">Salva</Button>
                    </Box>
                </Stack>
            </form>
        )
    }
}

export default GameEditPage;