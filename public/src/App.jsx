import { useEffect, useState } from "react";

import "./App.css";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import SetAvatar from "./pages/SetAvatar";

function App() {



  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} /> 
        <Route index path="/register" element={<Register />} />
        <Route path="/" element={<Chat />} />
        <Route path="/setavatar" element={<SetAvatar />} />
        <Route path="*" element={<Navigate to='/login' />}>
          
        </Route>
      </Routes>
    </>
  );
}

export default App;
