import React from "react";
import { Grid, Box } from "@mui/material";

function CenterBox(props) {
    return(
        <Box className="bg-slate-500 w-4/5 h-[632px] rounded-xl shadow-2xl grid mt-10">
            <Box className="pt-10 px-10 grid place-items-center relative">
                { props.children }
            </Box>            
        </Box>
    );
}

export default CenterBox