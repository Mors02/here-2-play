import { useEffect, useState } from "react";
import { axiosConfig } from "../config/axiosConfig";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import Box from '@mui/material/Box';
import useCurrentUser from "../config/UseCurrentUser";
import { TextField, Button, Stack, InputAdornment, Typography, Table, TableHead, TableRow, TableCell, TableBody, Select, FormControl } from "@mui/material"
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useForm } from 'react-hook-form';
import { TiDelete } from "react-icons/ti";
import { confirmAlert } from 'react-confirm-alert';
import Divider from '@mui/material/Divider';
import { RiDiscountPercentFill } from "react-icons/ri";
import EditDrawer from "../Component/EditDrawer";
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { MdDelete } from "react-icons/md";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import moment from 'moment';

function GameEditPage() {
    const [pageLoading, setPageLoading] = useState()
    const [game, setGame] = useState()
    const [image, setImage] = useState()
    const [file, setFile] = useState()
    const [allCategories, setAllCategories] = useState()
    const [category, setCategory] = useState()
    const [attachments, setAttachments] = useState([])
    const [newAttachments, setNewAttachments] = useState([])
    const [showDiscount, setShowDiscount] = useState(false)

    const [activeDiscounts, setActiveDiscounts] = useState([])
    const [discountStart, setDiscountStart] = useState()
    const [discountEnd, setDiscountEnd] = useState()

    const { gameId } = useParams()
    const { user, loading } = useCurrentUser()
    const navigate = useNavigate()

    const {
        register,
        getValues,
        setValue
    } = useForm()

    function updateData() {
        setPageLoading(true)

        if (loading) return 

        axiosConfig.get('/api/games/' + gameId)
            .then(res => {
                if (res?.response?.status == 404) {
                    navigate('/')
                    return toast.error('Gioco non trovato!') 
                }

                if (res.data.publisher.id != user.id) {
                    navigate('/')
                    return toast.error('Non hai i permessi per modificare il gioco!') 
                }
                
                setAttachments(res.data.attachments)

                setActiveDiscounts(
                    res.data.discounts.map(discount => {
                        if (discount.end_date > moment().format('YYYY-MM-DD')) {
                            return discount
                        }
                    })
                )
                setGame(res.data)
                setValue('discount_percentage', '')
                setCategory(res.data.category.id)
            })

        axiosConfig.get('/api/categories/')
            .then(res => {
                setAllCategories(res.data)
            })

        setPageLoading(false)
    }

    useEffect(() => {
        updateData()
    }, [loading])

    function handleImageUpload(e) {
        console.log(e.target.files[0])
        if (e.target.files[0])
            setImage(e.target.files[0])
    }

    function handleAttachmentsUpload(e) {
        setNewAttachments(e.target.files)
    }

    function handleFileUpload(e) {
        if (e.target.files[0])
            setFile(e.target.files[0])
    }

    function ListAttachments() {
        return (
            <Box>
                <Divider>Allegati Attuali</Divider>
                <Box className="grid grid-cols-4 gap-4 mt-4">
                {
                    Object.keys(attachments).map(
                        key => (
                            <Box className="relative border border-gray-500">
                                <img className="aspect-[1920/1080] object-cover m-auto" src={process.env.REACT_APP_BASE_URL + attachments[key].image} />
                                <TiDelete className="absolute top-2 right-2" size={25} color="red" onClick={() => deleteAttachment(attachments[key].id)} />
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
        uploadData.append('category_id', category)

        if (image?.name)
            uploadData.append('image', image, image.name)

        if (file?.name)
            uploadData.append('file', file)

        if (newAttachments.length > 0)
            Object.keys(newAttachments)
                .map(
                    key => uploadData.append('attachments', newAttachments[key], newAttachments[key].name)
                )
        console.log(uploadData)
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
    }

    function createDiscount() {
        if (discountStart >= discountEnd)
            return toast.error('Le date per lo sconto sono scorrette!')

        if (getValues('discount_percentage') && discountStart && discountEnd) {
            setPageLoading(true)

            const discountData = new FormData()
            discountData.append('discount_percentage', getValues('discount_percentage'))
            discountData.append('discount_start', discountStart)
            discountData.append('discount_end', discountEnd)

            axiosConfig.post('/api/games/' + gameId + '/discounts/', discountData)
                .then(res => {
                    setPageLoading(false)
                    if (res.status == 201) {
                        updateData()

                        toast.success('Sconto creato con successo!')
                    } else if (res?.response?.status == 400)
                        toast.error('I periodi di sconto non possono incrociarsi con quelli già attivi!')
                    else
                        toast.error('Creazione sconto fallita!')
                })
        }
    }

    function deleteDiscount(id) {
        confirmAlert({
            title: 'Sei sicuro di voler cancellare questo sconto?',
            buttons: [
                {
                    label: 'Procedi',
                    onClick: () => {
                        axiosConfig.delete('/api/discounts/' + id + '/')
                        .then(res => {
                            if (res.status == 200) {
                                updateData()
                                return toast.success('Sconto cancellato con successo!')
                            }
                            return toast.error('Non è stato possibile cancellare lo sconto')
                        })
                    }
                },
                {
                    label: 'Indietro'
                }
            ]
        })
    }

    function ActiveDiscounts() {
        return (
            <Box>
                <Divider>Sconti Attivi</Divider>

                <Table className="bg-gray-100 rounded mt-4">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center"><b>Inizio</b></TableCell>
                            <TableCell align="center"><b>Fine</b></TableCell>
                            <TableCell align="center"><b>Percentuale</b></TableCell>
                            <TableCell align="center"><b>Prezzo Scontato</b></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {
                        activeDiscounts.map(discount =>
                            <TableRow className="border-t-1" key={discount.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell align="center">{moment(discount.start_date).format('DD/MM/YYYY')}</TableCell>
                                <TableCell align="center">{moment(discount.end_date).format('DD/MM/YYYY')}</TableCell>
                                <TableCell align="center">{discount.percentage}%</TableCell>
                                <TableCell align="center">{game.price - (game.price * discount.percentage / 100)}</TableCell>
                                <TableCell><MdDelete onClick={() => deleteDiscount(discount.id)} color="red" size={20} className="my-auto cursor-pointer" /></TableCell>
                            </TableRow>
                        )
                    }
                    </TableBody>
                </Table>
            </Box>
        )
    }

    function handleCategory() {

    }

    if (!pageLoading && game) {
        return (
            <form className='p-10' onSubmit={e => onSubmit(e)}>
                <Stack direction="column" spacing={2}>
                    <TextField defaultValue={game.title} {...register('title')} label="Title" variant="outlined" required />
                    <TextField defaultValue={game.description} {...register('description')} label="Description" variant="outlined" multiline rows={3} required />
                    <Box className="grid grid-cols-2 gap-4">
                        <TextField defaultValue={game.price} {...register('price')} label="Prezzo" variant="outlined" required />
                        <FormControl>
                            <InputLabel>Categoria *</InputLabel>
                            <Select label="Categoria" value={category} onChange={e => setCategory(e.target.value)} required>
                            {
                                allCategories && allCategories.map(category => 
                                    <MenuItem value={category.id}>{category.name}</MenuItem>
                                )
                            }
                            </Select>
                        </FormControl>
                    </Box>

                    { activeDiscounts.length > 0 && <ActiveDiscounts /> }

                    <Box>
                        <Button onClick={() => setShowDiscount(!showDiscount)} variant="contained" className="w-full" component="label" startIcon={<RiDiscountPercentFill />}>
                            Aggiungi Sconto
                        </Button>

                        {
                            showDiscount && (
                                <EditDrawer>
                                    <Stack gap={2}>
                                        <Box className="flex gap-4">
                                            <TextField className="grow" label="Percentuale" type="number" {...register('discount_percentage')} InputProps={{
                                                endAdornment: <InputAdornment position="end">%</InputAdornment>
                                            }}/>
                                            <DatePicker className="grow" onChange={e => setDiscountStart(moment(e).format('YYYY-MM-DD'))} label="Inizio" />
                                            <DatePicker className="grow" onChange={e => setDiscountEnd(moment(e).format('YYYY-MM-DD'))} label="Fine" />
                                            <Button className="h-fit !my-auto" variant="contained" onClick={() => createDiscount()}>Inserisci</Button>
                                        </Box>
                                    </Stack>
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