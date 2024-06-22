import { requirePropFactory } from "@mui/material";
import Layout from "./Component/Layout";
import Sidebar from "./Component/Sidebar";
import Homepage from './Home/Homepage';
import AppRoutes from "./Routing/Route";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="App">
      <ToastContainer autoClose={400} position="bottom-center" hideProgressBar/>
      <header>
        <div>
          <Layout />            
          <AppRoutes />
        </div>
      </header>
    </div>
  );
}

export default App;
