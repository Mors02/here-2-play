import React, {useState} from "react";
import {Box, Button, Typography} from '@mui/material'

export default function BundleList({bundles, handleClick}) {

    
    function Bundles() {
        return bundles.map(bundle => {
            return (
                <Bundle bundle={bundle} handleClick={handleClick} />
            )
        })
    }

    return (
        <Box className='grid sm:grid-cols-3 md:grid-cols-5 gap-4'>
            <Bundles />
        </Box>
    )
}

function Bundle({bundle, handleClick}) {
    const [entered, setEntered] = useState(false)
    const hoverClass = "relative w-60 h-48 rounded-xl bg-slate-200 opacity-100 flex place-items-center cursor-pointer transition ease-linear"
    const normalClass = "relative w-60 h-48 rounded-xl bg-slate-200 opacity-80 flex place-items-center cursor-pointer transition ease-linear"

    return (
        <Box className={entered ? hoverClass : normalClass}  key={bundle.id} onClick={() => handleClick(bundle)} onMouseEnter={() => setEntered(true)} onMouseLeave={() => setEntered(false)}>        
            <Box className="absolute top-0 right-0 w-fit p-2 bg-slate-500 rounded-tr-xl rounded-bl-xl">
                <Typography variant="h7" className="line-through text-white">{(+bundle.total_price).toFixed(2)} €</Typography>
                <Typography variant="h6"className="text-white font-bold">{(+bundle.discounted_price).toFixed(2)} €</Typography>
            </Box>
            <Box className="!mx-auto">
                <Typography variant="h4" className=''>{bundle.name}</Typography>
            </Box>
        </Box>
    )
}