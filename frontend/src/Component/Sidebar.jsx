import React from "react";
import Homepage from "../Home/Homepage";
import {Routes, Route, Link} from "react-router-dom";
import LoginPage from '../Auth/LoginPage';

function Sidebar(props) {
    const {authenticated} = props;
    return (
        <>
        <div style={{float: "left", backgroundColor: "red", minWidth: "10rem", height: "98vh"}}>
           <h3>Menu laterale</h3>
            <p>{authenticated? "Loggato" : "Non loggato"}</p>
           
            <nav>
                <ul>
                    <li><Link to="/login">Login</Link></li>
                    
                </ul>
            </nav>
                
            <Routes>
                <Route exact path="/login" element={<LoginPage />} />
                
            </Routes>
        </div>
        {props.children}
        </>
    )
    
}

export default Sidebar;