import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import logo from "../assets/logo.svg";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios"
import { api } from "../components/api";

const Login = () => {
  const navigate=useNavigate()
  const [values, setValues] = useState({ emailorusername: "", password: "", });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (handleValidation()) {
    const {password, emailorusername }=values


    await axios?.post(`${api}/auth/login`,{emailorusername,password},{headers:{}}).then((res)=>{

      if(res?.data?.status){
        sessionStorage.setItem("chat-app-user",JSON.stringify(res?.data))
        toast.success("Login Successfully",{position:"top-center", autoClose: 2000, theme: "colored",})
        setTimeout(()=> navigate("/"),2000)
      }
     else {toast.error(`${res?.data?.msg}`,{position:"top-center", autoClose: 2000, theme: "colored",})}

   }).catch((err)=>{
    console.log(err)
     toast.error("Something Wrong");
    })

 
   


    }
  };

  const handleValidation = () => {
    const { password, emailorusername} = values;
    if( !password || !emailorusername  ){
      toast.error("Please fill all details", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      
      });
      return false;
    }
  else {
      if (password && emailorusername) {
        return true;
      } 
       
    }
  };




  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  return (
    <>
      {" "}
      <ToastContainer />
      <FormConatiner>
        <form onSubmit={(event) => handleSubmit(event)}>
          <div className="brand">
            <img src={logo} alt="logo" />
            <h1>Snappy</h1>
          </div>

        
          <input
            type="text"
            placeholder="Email or Username or Full mobile with +"
            name="emailorusername"
            onChange={(e) => handleChange(e)}
          />
          <input
            type="password"
            placeholder="password"
            name="password"
            onChange={(e) => handleChange(e)}
          />
        

          <button type="submit">Login</button>
           <span>
            New Account ? &nbsp; <Link to={"/register"}> Register </Link>
          </span>
        </form>
      </FormConatiner>
    </>
  );
};

const FormConatiner = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    img {
      height: 5rem;
    }
    h1 {
      color: white;
      text-transform: uppercase;
    }
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    background-color: #00000076;
    border-radius: 2rem;
    padding: 3rem 5rem;
  }
  input {
    background-color: transparent;
    padding: 1rem;
    border: 0.1rem solid #4e0eff;
    border-radius: 0.4rem;
    color: white;
    width: 100%;
    font-size: 1rem;
    &:focus {
      border: 0.1rem solid #997af0;
      outline: none;
    }
  }
  button {
    background-color: #4e0eff;
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;
    &:hover {
      background-color: #4e0eff;
    }
  }
  span {
    color: white;
    text-transform: uppercase;
    a {
      color: #4e0eff;
      text-decoration: none;
      font-weight: bold;
    }
  }
`;

export default Login;
