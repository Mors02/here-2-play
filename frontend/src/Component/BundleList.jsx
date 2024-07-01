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
    const hoverClass = "relative py-10 rounded bg-slate-200 opacity-100 flex place-items-center cursor-pointer transition ease-linear"
    const normalClass = "relative py-10 rounded bg-slate-200 opacity-80 flex place-items-center cursor-pointer transition ease-linear"

    return (
        <Box className={entered ? hoverClass : normalClass}  key={bundle.id} onClick={() => handleClick(bundle)} onMouseEnter={() => setEntered(true)} onMouseLeave={() => setEntered(false)}>        
            <Box className="absolute top-0 right-0 w-fit p-2 bg-slate-500 rounded-tr rounded-bl-xl flex gap-2">
                <Typography variant="h7" className="line-through text-white">{(+bundle.total_price).toFixed(2)} €</Typography>
                <Typography variant="h7"className="text-white font-semibold">{(+bundle.discounted_price).toFixed(2)} €</Typography>
            </Box>
            <Box className="!mx-auto">
                <Typography variant="h4" className=''>{bundle.name}</Typography>
            </Box>
        </Box>
    )
}