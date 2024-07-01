import React from "react";
import { Grid, Box } from "@mui/material";

function CenterBox(props) {
    return(
        <Box className="bg-slate-400 w-fit rounded shadow-2xl my-20 overflow-hidden">
            { props.children }
        </Box>
    );
}

export default CenterBox