import React from 'react'
import { Navigate } from 'react-router-dom'
function ProtectedWrapper(props) {
  const token = JSON.parse(localStorage.getItem("userToken"));
  console.log("QQQ",token);
  
  if(!token){
    return <Navigate to="/login" replace/>
  }
  return props.children
}

export default ProtectedWrapper