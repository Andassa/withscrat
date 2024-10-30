import React from "react";
// importing Link from react-router-dom to navigate to 
// different end points.
import { Link } from "react-router-dom";
  
const Welcome = () => {
  return (
    <div>
      <h1>Welcome Page</h1>
      <br />
      <ul>
        <li>
          {/* Endpoint to route to Welcome component */}
          <Link to="/">Welcome</Link>
        </li>
        <li>
          {/* Endpoint to route to About component */}
          <Link to="/login">Login</Link>
        </li>
        <li>
          {/* Endpoint to route to Contact Us component */}
          <Link to="/accueil">accueil</Link>
        </li>
        <li>
          {/* Endpoint to route to Contact Us component */}
          <Link to="/map">Map</Link>
        </li>
      </ul>
    </div>
  );
};
  
export default Welcome;