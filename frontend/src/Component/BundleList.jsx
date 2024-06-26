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
    const hoverClass = "relative w-60 h-48 rounded-xl bg-red-400 opacity-100 flex place-items-center cursor-pointer transition ease-linear"
    const normalClass = "relative w-60 h-48 rounded-xl bg-red-400 opacity-80 flex place-items-center cursor-pointer transition ease-linear"

    return (
        <Box className={entered ? hoverClass : normalClass}  key={bundle.id} onClick={() => handleClick(bundle)} onMouseEnter={() => setEntered(true)} onMouseLeave={() => setEntered(false)}>        
            <Box className="!mx-auto">
                <Typography variant="h4" className='text-white'>{bundle.name}</Typography>
            </Box>
        </Box>
    )
}