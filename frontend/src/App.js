import { requirePropFactory } from "@mui/material";
import Layout from "./Component/Layout";
import Sidebar from "./Component/Sidebar";
import Homepage from './Home/Homepage';
import AppRoutes from "./Routing/Route";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'


function App() {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="App">
                <header>
                    <div>
                        <Layout />            
                        <AppRoutes />
                    </div>
                </header>
            </div>
        </LocalizationProvider>
    );
}

export default App;
