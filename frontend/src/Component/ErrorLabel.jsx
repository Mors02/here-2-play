import { Typography, Container } from "@mui/material";
import React from "react";

export default function ErrorLabel({text}) {

    return(
        <>{text? 
            <Container className="bg-red-300 rounded-md text-center shadow-xl my-4">
                <Typography variant="caption" color={"red"}>
                    {text}
                </Typography>
            </Container> : <></>
        }</>
    )
}