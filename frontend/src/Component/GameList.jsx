import React, { useEffect, useState } from 'react';
import { axiosConfig } from "../config/axiosConfig"
import { useActionData, useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import { TextField, Typography, Button, Divider, Stack, Select, FormControl, InputLabel, MenuItem, Menu } from '@mui/material';
import { IoSearchOutline } from "react-icons/io5";
import Drawer from '@mui/material/Drawer';
import Slider from '@mui/material/Slider';
import { toast } from "react-toastify";
import { ErrorMap } from "../config/enums"
import { useForm } from 'react-hook-form';
import moment from 'moment';

function GameList({selection=[], games, handleClick, maxCount=1000, searchSection=false, tagId='', previewPrices=false }) {
    const [loading, setLoading] = useState(true)
    const [filteredGames, setFilteredGames] = useState([])
    const [rangePrices, setRangePrices] = useState([0, 1000])
    const [allCategories, setAllCategories] = useState([])
    const [allTags, setAllTags] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedTag, setSelectedTag] = useState(tagId)
    const [open, setOpen] = useState(false)
    const [selected, setSelected] = useState(selection)
        
    useEffect(() => {
        setSelected(selection)
    }, [selection]);

    const maxHomepageGames = maxCount
    const minDistance = 20

    const {
        register,
        getValues
    } = useForm()

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

    function updateData(games) {
        setLoading(true)

        let data = (games.length > maxHomepageGames && searchSection) ? games.slice(0, maxHomepageGames) : games

        // if (searchSection) {
        //     data.map(game => {
        //         let discount = game?.discounts[0]
        //         if (discount)
        //             game.price = game.price - (game.price * discount.percentage / 100)
        //     })
            
        //     if (data.length <= 0) 
        //         toast.error(ErrorMap['ERR_NO_GAMES_AVAILABLES'])
        // }
        setFilteredGames(data)
        
        setLoading(false)
    }
    
    useEffect(() => {
        if (searchSection)
            retrieveData()
        updateData(games)
        
        if (tagId)
            executeSearch()
    }, [])

    function executeSearch() {
        setLoading(true)
        let params = {}

        if (getValues('title')) params['title'] = getValues('title')
        if (selectedCategory) params['category'] = selectedCategory
        if (selectedTag) params['tag'] = selectedTag
        if (rangePrices) {
            params['start'] = rangePrices[0]
            params['end'] = rangePrices[1]
        }
        
        axiosConfig.get('/api/games/', { params })
            .then(res => {
                updateData(res.data)
            })
    }

    function SearchSection() {
        if (searchSection)
        return (
            <Box className="w-full flex gap-4">
                <TextField size='small' className='grow' {...register('title')} label="Ricerca Giochi" />
                <Button variant='contained' onClick={() => setOpen(!open)}>Filtri</Button>
                <Button variant='contained' onClick={executeSearch}><IoSearchOutline size={25} /></Button>
            </Box>
        )
    }

    const handleChange = (event, newValue, activeThumb) => {
        if (!Array.isArray(newValue)) {
            return;
        }

        if (newValue[1] - newValue[0] < minDistance) {
            if (activeThumb === 0) {
                const clamped = Math.min(newValue[0], 100 - minDistance);
                setRangePrices([clamped, clamped + minDistance]);
            } else {
                const clamped = Math.max(newValue[1], minDistance);
                setRangePrices([clamped - minDistance, clamped]);
            }
        } else {
            setRangePrices(newValue);
        }
    };

    if (!loading) 
    return (
        <Stack spacing={4}>
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

                        <Box className="grid grid-cols-2 gap-4">
                            <FormControl>
                                <InputLabel>Categoria</InputLabel>
                                <Select label="Categoria" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
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
                                <Select label="Tag" value={selectedTag} onChange={e => setSelectedTag(e.target.value)}>
                                    <MenuItem value="">--- Nessuno ---</MenuItem>
                                    {
                                        allTags && allTags.map(tag =>
                                            <MenuItem key={tag.id} value={tag.id}>{tag.name}</MenuItem>
                                        )
                                    }
                                </Select>
                            </FormControl>
                        </Box>
                    </Stack>
                )
            }

            <Box className='grid sm:grid-cols-3 md:grid-cols-5 gap-8'>
                {
                    filteredGames?.map(game =>
                        <Game game={game} handleClick={handleClick} selected={selected.length > 0? selected.some(id => id == game.id) : false} previewPrices={previewPrices}/>
                    )
                }
            </Box>
        </Stack>
    )
}

function Game({ game, handleClick, selected, previewPrices }) {
    const [entered, setEntered] = useState(false)
    const hoverClass = "bg-opacity-80 shadow-[0_-10px_20px_-15px_rgba(0,0,0)]"
    const normalClass = "bg-opacity-20"
    
    function price(game) {
        if (game?.discounts?.length > 0)
            return (+game.price - (+game.price * game.discounts[0].percentage / 100)).toFixed(2)
        else
            return (+game.price).toFixed(2)
    }

    return (
        <Box className={"relative rounded overflow-hidden hover:scale-105 transition ease-linear shadow-2xl cursor-pointer " + (selected ? "outline outline-4 outline-slate-600 opacity-80" : "")}  
            key={game.id} 
            onClick={() => handleClick(game)} 
            onMouseEnter={() => setEntered(true)} 
            onMouseLeave={() => setEntered(false)}
        >
            <img className='aspect-[600/900] w-full object-cover' src={process.env.REACT_APP_BASE_URL + (game.image ?? game.details.image)} />
            <Box className={"bg-slate-700 absolute bottom-0 w-full py-2 text-center rounded-t-lg transition ease-linear " + (entered ? hoverClass : normalClass)}>
                <Typography className='text-white md:!text-lg'>{game.title ?? game.details.title}</Typography>
            </Box>
            {
                previewPrices && <Box className={"absolute top-0 right-0 bg-opacity-80 px-2 py-1 rounded-bl-md " + (game?.discounts?.length > 0 ? 'bg-[#228B22]' : 'bg-slate-700')}>
                    <Typography className='text-white md:!text-lg'>{price(game)} €</Typography>
                </Box>
            }
        </Box>
    )
}

export default GameList;