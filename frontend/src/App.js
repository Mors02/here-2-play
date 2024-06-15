
import { requirePropFactory } from "@mui/material";
import Layout from "./Component/Layout";
import Sidebar from "./Component/Sidebar";
import Homepage from './Home/Homepage';
import AppRoutes from "./Routing/Route";

function App() {
  return (
  
      <div className="App">
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
