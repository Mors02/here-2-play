import React, { useEffect, useState } from "react";
import { Box, Checkbox, Stack, Typography, FormGroup, FormControlLabel } from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers';
import moment from "moment";
import { BarChart } from '@mui/x-charts'
import { axiosConfig } from "../config/axiosConfig";
import { toast } from "react-toastify";
import { ErrorMap } from "../config/enums";

export default function DeveloperStatsPage() {
    const [year, setYear] = useState(moment)
    const [selected, setSelected] = useState({'earnings': true, 'purchases': true, 'visits': true})
    const [filteredSeries, setFilteredSeries] = useState([])
    const [loadingPage, setLoading] = useState(true)
    const [dataset, setDataset] = useState([])
    const [totalStats, setTotalStats] = useState({})

    useEffect(() => {
        showStats(selected)
        getDataSet(year)
    },[]);

    function getDataSet(year) {
        axiosConfig.post('api/stats/dev/', {year: year.year()})
        .then(res => {
    
            setDataset(res.data.monthly)
            setTotalStats(res.data.year)
            setLoading(false)
        })
        .catch(err => {
            toast.error(ErrorMap[err.message])
            setDataset([])
            setTotalStats({})
            setLoading(false)
        })
    }

    function changeYear(date) {
        setLoading(true)
        setYear(date)
        getDataSet(date)
    }

    function filterStats(val, section) {
        let selection = {...selected}
        selection[section] = val
        setSelected(selection)
        showStats(selection)
    }
    const valueFormatter = (value) => `${(+value).toFixed(2)} €`;

    const series = [
        {dataKey: 'earnings', label: 'Incassi', valueFormatter},
        {dataKey: 'purchases', label: 'Acquisti'},
        {dataKey: 'visits', label: 'Visite'},
    ]

    function showStats(selection) {
        let filteredSeries = []
        Object.keys(selection).map(section => {
            if (selection[section]) {
                const obj = series.find(serie => serie.dataKey == section)
                console.log(obj)
                if (filteredSeries.length > 0) {
                    filteredSeries = [...filteredSeries, obj]
                }
                else
                filteredSeries = [obj]
                
            }  
        })

        setFilteredSeries(filteredSeries)
    }    
    const txtClass="bg-slate-400 p-3 rounded-xl !my-5";

    return(
        <Box className="px-10 py-8 flex">
            <Box className="!ml-32">
               {!loadingPage && <BarChart
                     xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
                     series={filteredSeries}
                     dataset={dataset}
                     width={1000}
                     height={600}
                />}
            </Box>
            <Stack className="float-right !mt-7 !ml-32">
                <DatePicker value={year} views={['year']} label="Anno" onChange={(val) => changeYear(val)}/>
                <Typography variant="h5" className={txtClass}>Incassi totali: {(+totalStats.earnings).toFixed(2)} €</Typography>
                <Typography variant="h5" className={txtClass}>Vendite totali: {totalStats.purchases}</Typography>
                <Typography variant="h5" className={txtClass}>Visite totali: {totalStats.visits}</Typography>
                <Box>
                <FormGroup>
                    <FormControlLabel control={<Checkbox checked={selected['earnings']} />} label="Incassi" onChange={(e, val) => filterStats(val, 'earnings')}/>
                    <FormControlLabel control={<Checkbox checked={selected['purchases']} />} label="Vendite" onChange={(e, val) => filterStats(val, 'purchases')}/>
                    <FormControlLabel control={<Checkbox checked={selected['visits']} />} label="Visite" onChange={(e, val) => filterStats(val, 'visits')}/>
                </FormGroup>
                </Box>
            </Stack>
        </Box>
    )
}