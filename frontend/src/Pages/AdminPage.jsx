import { Typography, Box, Divider, Stack, FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { BarChart } from "@mui/x-charts";
import React, {useState, useEffect} from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { ErrorMap } from "../config/enums";
import { axiosConfig } from "../config/axiosConfig";
import { useNavigate } from "react-router";


export default function AdminPage() {
    const [year, setYear] = useState(moment)
    const [selected, setSelected] = useState({'reports': true, 'registrations': true, 'games': true, 'purchases': true, 'earnings': true})
    const [filteredSeries, setFilteredSeries] = useState([])
    const [loadingPage, setLoading] = useState(true)
    const [dataset, setDataset] = useState([])
    const [totalStats, setTotalStats] = useState({})
    const navigate = useNavigate()

    useEffect(() => {
        redirectIfNotAdmin()
        showStats(selected)
        getDataSet(year)
    },[]);

    function redirectIfNotAdmin() {
        axiosConfig.get('api/user/is-admin')
        .then(res => {
            // if (!res.data)
            //     navigate("/")
        })
        .catch(err => {

        })
    }

    //change this
    function getDataSet(year) {
        axiosConfig.post('api/stats/admin/', {year: year.year()})
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
        {dataKey: 'reports', label: 'Segnalazioni' },
        {dataKey: 'registrations', label: 'Registrazioni'},
        {dataKey: 'games', label: 'Giochi'},
        {dataKey: 'purchases', label: 'Acquisti'},
        {dataKey: 'earnings', label: 'Incassi', valueFormatter}
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

    return (
        <><Divider className="relative"><Typography variant="h5">Sezione statistiche</Typography></Divider>
        <Box className="px-10 py-8 flex">            
            <Box>
               {!loadingPage && <BarChart 
                     xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
                     series={filteredSeries}
                     dataset={dataset}
                     width={1000}
                     height={600}
                />}
            </Box>
            <Stack className="float-right !mt-7 !ml-32 w-2/6">
                <DatePicker value={year} views={['year']} label="Anno" onChange={(val) => changeYear(val)}/>
                <Stack direction={"row"} className="w-full justify-between">
                    <Typography variant="h5" className={txtClass}>Segnalazioni totali: {totalStats.reports}</Typography> 
                    <Typography variant="h5" className={txtClass}>Vendite totali: {totalStats.purchases}</Typography>
                </Stack>
                <Stack direction={"row"} className="w-full justify-between">
                    <Typography variant="h5" className={txtClass}>Nuovi giochi totali: {totalStats.games}</Typography>
                    <Typography variant="h5" className={txtClass}>Registrazioni totali: {totalStats.registrations}</Typography>
                </Stack>
                <Typography variant="h5" className={txtClass + " text-center"}>Incassi totali: {(+totalStats.earnings).toFixed(2)} €</Typography> 
                <Box>
                <FormGroup>
                    <FormControlLabel control={<Checkbox checked={selected['reports']} />} label="Segnalazioni" onChange={(e, val) => filterStats(val, 'reports')}/>
                    <FormControlLabel control={<Checkbox checked={selected['purchases']} />} label="Acquisti" onChange={(e, val) => filterStats(val, 'purchases')}/>
                    <FormControlLabel control={<Checkbox checked={selected['registrations']} />} label="Registrazioni" onChange={(e, val) => filterStats(val, 'registrations')}/>
                    <FormControlLabel control={<Checkbox checked={selected['games']} />} label="Giochi" onChange={(e, val) => filterStats(val, 'games')}/>
                    <FormControlLabel control={<Checkbox checked={selected['earnings']} />} label="Incassi" onChange={(e, val) => filterStats(val, 'earnings')}/>
                </FormGroup>
                </Box>
            </Stack>
        </Box>
        </>
    )
}