import React, { useEffect, useState } from 'react';
import GameList from '../Component/GameList';
import Box from '@mui/material/Box';
import { Typography, Divider, TextField, Button, Stack, Slider, Select, FormControl, MenuItem, InputLabel } from '@mui/material';
import { IoSearchOutline } from "react-icons/io5";
import { axiosConfig } from '../config/axiosConfig';
import { useLocation, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';

const maxPrice = 1000
const minDistance = 50
const orders = [
    { slug: 'title', name: "Titolo A-Z" },
    { slug: '-title', name: "Titolo Z-A" },
    { slug: 'price', name: 'Prezzo Crescente' },
    { slug: '-price', name: 'Prezzo Decrescente' },
    { slug: 'upload_date', name: 'Giochi Vecchi' },
    { slug: '-upload_date', name: 'Giochi Recenti' },
]

function Search({ tagId='', updateData, setShowRecommendations }) {
    const [loading, setLoading] = useState()
    const [rangePrices, setRangePrices] = useState([0, maxPrice])
    const [allCategories, setAllCategories] = useState([])
    const [allTags, setAllTags] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedTag, setSelectedTag] = useState(tagId)
    const [selectedOrder, setSelectedOrder] = useState('')
    const [open, setOpen] = useState(false)
    
    const {
        register,
        getValues,
        setValue
    } = useForm()

    useEffect(() => {
        setLoading(true)

        retrieveData()

        if (tagId)
            executeSearch()

        setLoading(false)
    }, [])

    function retrieveData() {
        axiosConfig.get('/api/tags/')
            .then(res => {
                setAllTags(res.data)
            })

        axiosConfig.get('/api/categories/')
            .then(res => {
                setAllCategories(res.data)
            })
    }

    const handleChange = (event, newValue, activeThumb) => {
        if (!Array.isArray(newValue)) {
            return;
        }

        if (newValue[1] - newValue[0] < minDistance) {
            if (activeThumb === 0) {
                const clamped = Math.min(newValue[0], maxPrice - minDistance);
                setRangePrices([clamped, clamped + minDistance]);
            } else {
                const clamped = Math.max(newValue[1], minDistance);
                setRangePrices([clamped - minDistance, clamped]);
            }
        } else {
            setRangePrices(newValue);
        }
    };

    function reset() {
        setLoading(true)

        setRangePrices([0, maxPrice])
        setSelectedCategory('')
        setSelectedTag('')
        setSelectedOrder('')
        setValue('title', '')
        tagId = ''
        let reset = true

        executeSearch(reset)
    }

    function SearchSection() {
        return (
            <Box className="w-full flex gap-4">
                <TextField size='small' className='grow' {...register('title')} label="Ricerca Giochi" />
                <Button variant='contained' onClick={() => reset()} color='error'>Reset</Button>
                <Button variant='contained' onClick={() => setOpen(!open)}>Filtri</Button>
                <Button variant='contained' onClick={() => executeSearch()}><IoSearchOutline size={25} /></Button>
            </Box>
        )
    }

    function executeSearch(reset = false) {
        setLoading(true)
        let params = {}

        if (!reset) {
            setShowRecommendations(false)
            if (getValues('title')) params['title'] = getValues('title')
            if (selectedCategory) params['category'] = selectedCategory
            if (selectedTag) params['tag'] = selectedTag
            if (rangePrices) {
                params['start'] = rangePrices[0]
                params['end'] = rangePrices[1]
            }
            if (selectedOrder) params['order'] = selectedOrder
        } else {
            setShowRecommendations(true)
        }
        
        axiosConfig.get('/api/games/', { params })
            .then(res => {
                updateData(res.data)
                setLoading(false)
            })
    }

    if (!loading)
    return (
        <Box>
            <SearchSection />

            {
                open && (
                    <Stack spacing={3} className="bg-gray-100 p-6 rounded-md">
                        <Box className="flex gap-4">
                            <Typography className='w-[125px] !my-auto'>Range Prezzi</Typography>
                            <Slider
                                max={1000}
                                value={rangePrices}
                                onChange={handleChange}
                                valueLabelDisplay="on"
                                disableSwap
                            />
                        </Box>

                        <Box className="grid grid-cols-3 gap-4">
                            <FormControl>
                                <InputLabel>Categoria</InputLabel>
                                <Select label="Categoria" value={selectedCategory ?? ''} onChange={e => setSelectedCategory(e.target.value)}>
                                    <MenuItem value="">--- Nessuna ---</MenuItem>
                                    {
                                        allCategories && allCategories.map(category => 
                                            <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                                        )
                                    }
                                </Select>
                            </FormControl>

                            <FormControl>
                                <InputLabel>Tag</InputLabel>
                                <Select label="Tag" value={selectedTag ?? ''} onChange={e => setSelectedTag(e.target.value)}>
                                    <MenuItem value="">--- Nessuno ---</MenuItem>
                                    {
                                        allTags && allTags.map(tag =>
                                            <MenuItem key={tag.id} value={tag.id}>{tag.name}</MenuItem>
                                        )
                                    }
                                </Select>
                            </FormControl>

                            <FormControl>
                                <InputLabel>Ordinamento</InputLabel>
                                <Select label="Ordinamento" value={selectedOrder ?? ''} onChange={e => setSelectedOrder(e.target.value)}>
                                    <MenuItem value="">--- Nessuno ---</MenuItem>
                                    {
                                        orders.map(order =>
                                            <MenuItem key={order.slug} value={order.slug}>{order.name}</MenuItem>
                                        )
                                    }
                                </Select>
                            </FormControl>
                        </Box>
                    </Stack>
                )
            }
        </Box>
    )
}

export default Search;