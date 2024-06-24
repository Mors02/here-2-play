import React from "react";
import { Grid } from "@mui/material";

function CenterBox(props) {
    return(
        <Grid className="bg-slate-500 w-2/5 h-[632px] rounded-xl shadow-2xl">
            <Grid className="pt-10 px-10">
                { props.children }
            </Grid>            
        </Grid>
    );
}

export default CenterBox