import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import Tooltip from '@mui/material/Tooltip';

export default function RoleButton({icon, selected, onClick, slug, name, description}) {
    return (
        <Tooltip title={description} placement="top">
            <Box onClick={onClick} className={"p-4 flex flex-col gap-2 bg-gray-100 rounded cursor-pointer " + (selected == slug ? 'outline outline-4 outline-slate-600 shadow-2xl' : '')}>
                {icon}
                <Typography variant="h3">{name}</Typography>
            </Box>
        </Tooltip>
    );
}