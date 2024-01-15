import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";

import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contact";
import Welcome from "../components/Welcome";
import { api } from "../components/api";



export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);



  useEffect( () => {
    const user= JSON.parse(sessionStorage.getItem("chat-app-user") );
 
    if (!user?.id || !user?.token) {
      navigate("/login");
    } else {
      // console.log(user)
      setCurrentUser( user);
    }
  }, []);


  useEffect(() => {
  const host = api;
    if (currentUser) {
      //  console.log(currentUser)
      socket.current = io(host);
      socket.current.emit("add-user", currentUser.id);

      
    }
  }, [currentUser]);


  


  useEffect( () => {
    if (currentUser) {
        const User= JSON.parse(sessionStorage.getItem("chat-app-user") )
      //= console.log(user)
          axios.get(`${api}/auth/getallusers`,{headers:{Authorization:User.token}}).then((res)=>{
          // console.log(res)
          setContacts(res.data.data);
        })
    }
    
  }, [currentUser]);


  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };
  // console.log(currentChat,socket)

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const message = 'Are you sure you want to leave?';
      event.returnValue = message; // Standard for most browsers
      return message; // For some older browsers
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);



  return (
    <>
      <Container>
        <div className="container">
          <Contacts contacts={contacts} changeChat={handleChatChange} />

          {currentChat === undefined ? (
            <Welcome />
          ) : (
            <ChatContainer currentChat={currentChat} socket={socket} />
          )}
        </div>
      </Container>
    </>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 100%;
    width: 100%;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;