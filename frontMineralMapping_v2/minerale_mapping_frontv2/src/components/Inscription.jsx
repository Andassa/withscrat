import React from "react";
import './css/Login.css';
import Inscription from './component/Inscription';
import logo from '../assets/images/bcmm.png'; 

const Login = () => {

    return (
        <div>
            <div className="logo" >
                <img src={logo} alt="Logo" height="55px" />
            </div>
            <center>
                <Inscription />
            </center>
        </div>
    );
};

export default Login;