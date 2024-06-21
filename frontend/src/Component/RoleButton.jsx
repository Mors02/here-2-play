import React from "react";
import { Button, Container, Typography } from "@mui/material";

export default function RoleButton({icon, selected, onClick, slug, name, description}) {
    const normalClass = "bg-slate-50 border-solid border-black rounded-md shadow-xl min-h-64 w-64 m-3 px-3";
    const selectedClass = "bg-slate-200 border-4 border-solid border-black rounded-md shadow-2xl min-h-64 w-64 m-3 px-3"
    return (
        <Container>
            <Button onClick={onClick} class={selected == slug? selectedClass : normalClass}>
                {icon}               
                <Typography variant="h3">{name}</Typography>
                <Typography>{description}</Typography>
            </Button>
        </Container>
    );
}