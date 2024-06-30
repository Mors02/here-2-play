import { Typography, Box, Divider, Stack, FormGroup, FormControlLabel, Checkbox, Avatar } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { BarChart } from "@mui/x-charts";
import React, {useState, useEffect} from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { ErrorMap } from "../config/enums";
import { axiosConfig } from "../config/axiosConfig";
import { useNavigate } from "react-router";
import ManageGameReportModal from "../Modals/ManageGameReportModal";
import ManageUserReportModal from "../Modals/ManageUserReportModal";


export default function AdminPage() {
    const [year, setYear] = useState(moment)
    const [selected, setSelected] = useState({'reports': true, 'registrations': true, 'games': true, 'purchases': true, 'earnings': true})
    const [filteredSeries, setFilteredSeries] = useState([])
    const [loadingPage, setLoading] = useState(true)
    const [dataset, setDataset] = useState([])
    const [totalStats, setTotalStats] = useState({})
    const [reportedGames, setReportedGames] = useState([])
    const [reportedUsers, setReportedUsers] = useState([])
    const [gameReportModal, setGameReportModal] = useState(false)
    const [selectedGame, setSelectedGame] = useState("")
    const [userReportModal, setUserReportModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState("")
    const navigate = useNavigate()
    
    const txtClass="bg-slate-400 p-3 rounded-xl !my-5";

    useEffect(() => {
        redirectIfNotAdmin()

        updateData()
    }, []);

    function updateData() {
        showStats(selected)
        getDataSet(year)

        getReportedGames()
        getReportedUsers()
    }

    function getReportedGames() {
        axiosConfig.get('/api/stats/reported-games/')
            .then(res => {
                setReportedGames(res.data)
            })
    }

    function getReportedUsers() {
        axiosConfig.get('/api/stats/reported-users/')
            .then(res => {
                setReportedUsers(res.data)
            })
    }

    function redirectIfNotAdmin() {
        axiosConfig.get('api/user/is-admin')
            .then(res => {
                if (!res.data)
                    navigate("/")
            })
    }

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

    function openGameReportModal(game) {
        setSelectedGame(game)
        setGameReportModal(true)
    }

    function closeGameReportModal() {
        setGameReportModal(false)
        setSelectedGame("")
    }

    function openUserReportModal(user) {
        setSelectedUser(user)
        setUserReportModal(true)
    }

    function closeUserReportModal() {
        setUserReportModal(false)
        setSelectedUser("")
    }

    function GameReportCard({ game }) {
        return (
            <Box onClick={() => openGameReportModal(game)} className="bg-gray-100 flex overflow-hidden rounded-md cursor-pointer">
                <img className="aspect-[600/900] object-cover w-1/3" src={process.env.REACT_APP_BASE_URL + game.image} />

                <Stack className="p-3 lg:p-6 grow flex justify-center gap-2 lg:gap-4">
                    <Typography><b>{game.title}</b></Typography>
                    <Typography>Developer: {game.publisher.username}</Typography>
                    <Typography>Reports: {game.reports.total}</Typography>
                </Stack>
            </Box>
        )
    }

    function UserReportedCard({ user }) {
        return (
            <Box onClick={() => openUserReportModal(user)} className="bg-gray-100 flex overflow-hidden rounded-md cursor-pointer p-3 lg:p-6 gap-4">
                <Avatar className="my-auto aspect-square object-cover w-1/3" src={process.env.REACT_APP_BASE_URL + user.profile_picture} />
                
                <Stack className="grow flex justify-center gap-1 lg:gap-3">
                    <Typography><b>{user.username}</b></Typography>
                    <Typography>Reports: {user.reports.total}</Typography>
                </Stack>
            </Box>
        )
    }

    if (!loadingPage)
    return (
        <Stack spacing={4} className="p-10">
            <Box>
                <Divider className="relative"><Typography variant="h5">Sezione Statistiche</Typography></Divider>
                <Box className="grid grid-cols-3">        
                    <Box className="col-span-2">
                        <BarChart 
                            xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
                            series={filteredSeries}
                            dataset={dataset}
                            height={700}
                        />
                    </Box>
                    <Stack className="float-right !mt-7 !ml-16">
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
            </Box>

            {
                reportedGames.length > 0 && (
                    <Stack spacing={2}>
                        <Divider><Typography variant="h5">Sezione Report Giochi</Typography></Divider>
                        
                        <Box className="grid grid-cols-3 lg:grid-cols-4">
                        {
                            reportedGames.map(game => 
                                <GameReportCard game={game} />
                            )
                        }
                        </Box>
                    </Stack>
                )
            }

            {
                reportedUsers.length > 0 && (
                    <Stack spacing={2}>
                        <Divider><Typography variant="h5">Sezione Report Utenti</Typography></Divider>

                        <Box className="grid grid-cols-3 lg:grid-cols-4">
                        {
                            reportedUsers.map(user => 
                                <UserReportedCard user={user} />
                            )
                        }
                        </Box>
                    </Stack>
                ) 
            }

            <ManageGameReportModal
                modalIsOpen={gameReportModal}
                closeModal={closeGameReportModal}
                gameReported={selectedGame}
                updateData={updateData}
            />

            <ManageUserReportModal
                modalIsOpen={userReportModal}
                closeModal={closeUserReportModal}
                userReported={selectedUser}
                updateData={updateData}
            />
        </Stack>
    )
}