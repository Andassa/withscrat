import "./App.css";
// importing components from react-router-dom package
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet
} from "react-router-dom";
import ReactDOM from 'react-dom';
import React, { useState } from 'react';
import Welcome from "./components/Welcome";
import Login from "./components/Login";
import Inscription from "./components/Inscription";
import Carte from "./components/Base";
import Admin from "./components/BaseAdmin";
import ProtectedWrapper from "./components/ProtectedWrapper";


function App() {
  // const [fenetre, setFenetre]=useState('utilisateurGestion');
  return (
    <>
      {/* This is the alias of BrowserRouter i.e. Router */}

      <Router>
        <Routes>
          {/* <Route path="/" element={<Login />} /> */}
          {/* <Route path="/welcome" element={<Welcome />} /> */}
          <Route  path="/login" element={<Login />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path='/' element={
            <ProtectedWrapper>
              <Outlet/>
            </ProtectedWrapper>
          }>
            <Route path="/map" element={<Carte />} />
            <Route path="/admin/dashboard" element={<Admin fenetre={'Tableaudebord'} />} />
            <Route path="/admin/utilisateurGestion" element={<Admin fenetre={'UtilisateurGestion'} />} />
            <Route path="/admin/carte" element={<Admin fenetre={'Carte'} />} />
            <Route path="/admin/historique" element={<Admin fenetre={'Historique'} />} />
          </Route>

        </Routes>
      </Router>
    </>
  );
}
 
// ReactDOM.render(<App />, document.getElementById('root'));

export default App;