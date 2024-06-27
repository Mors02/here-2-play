import { requirePropFactory } from "@mui/material";
import Layout from "./Component/Layout";
import AppRoutes, { ChatRoute } from "./Routing/Route";
import { useLocation } from "react-router";
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
          <ChatRoute />   
        </div>
      </header>
    </div>
  );
}

export default App;
