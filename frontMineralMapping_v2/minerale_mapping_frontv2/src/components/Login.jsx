import React from "react";
import './css/Login.css';
import Carte from './component/carteLog';
import logo from '../assets/images/bcmm.png'; 

const Login = () => {

    return (
        <div>
            <div className="logo" >
                <img src={logo} alt="Logo" height="55px" />
            </div>
            <center>
                <Carte />
            </center>
        </div>
    );
};

export default Login;