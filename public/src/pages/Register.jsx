import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import logo from "../assets/logo.svg";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { api } from "../components/api";
import { dialCode } from "../components/countryDialCode";

const Register = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    username: "",
    email: "",
    mobilecode: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (handleValidation()) {
      const { password, username, email,mobile,mobilecode } = values;
     console.log(values)
      await axios
        .post(`${api}/auth/register`, { username, email, password,mobile,mobilecode })
        .then((res) => {
          if (res.data.status) {
            toast.success("Register Successfully", {
              position: "top-center",
              autoClose: 2000,
              theme: "colored",
            });
            setTimeout(() => navigate("/setavatar"), 2000);
          } else {
            toast.error(`${res?.data?.msg}`, {
              position: "top-center",
              autoClose: 2000,
              theme: "colored",
            });
          }
        })
        .catch((err) => {
          toast.error("Something Wrong");
        });
    }
  };

  const handleValidation = () => {
    const { password, confirmPassword, username, email ,mobile,mobilecode} = values;
    if (!password || !confirmPassword || !username || !email) {
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
    }else if(!mobilecode){
      toast.error("Please select your country")
    }
     else if (password !== confirmPassword) {
      toast.warn("Password and Confirm Password does not matched", {
        position: "top-right",
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
      if (password && confirmPassword && username && email && mobile) {
        return true;
      }
    }
  };

  const handleChange = (name, value) => {
    // setValues({ ...values, [name]: value });
    if (name == "mobile") {
    // const  newvalue =values.mobile.concat(value);
      setValues({...values, [name]: value});
    }
    else if(name == "mobilecode") {
      setValues({ ...values, [name]: value,"mobile":value });
    }
    else {
      setValues({ ...values, [name]: value });
    }
  };
   console.log(values)

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
            placeholder="Username"
            name="username"
            onChange={(e) => handleChange(e.target.name, e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            name="email"
            onChange={(e) => handleChange(e.target.name, e.target.value)}
          />
          <div >
            <select
              name="mobilecode"
              onChange={(e) => handleChange(e.target.name, e.target.value)}
            >
              <option value="">Select Country</option>
              {dialCode &&
                dialCode?.map((item) => {
                  return (
                    <option
                      key={item.dial_code + item.name}
                      value={item.dial_code}
                    >
                      {item.name+" - "+item.dial_code}
                    </option>
                  );
                })}
            </select>
            <input
              type="text"
              placeholder={`${values.mobilecode} Enter Mobile No. Here..`}
              name="mobile"
              value={`${values.mobile}`}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
            />
          </div>
          <input
            type="password"
            placeholder="password"
            name="password"
            onChange={(e) => handleChange(e.target.name, e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            onChange={(e) => handleChange(e.target.name, e.target.value)}
          />

          <button type="submit">Create User</button>
          <span>
            Already have an Accounty ? &nbsp; <Link to={"/login"}> Login </Link>
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
    gap: 1rem;
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
  select {
    background-color: transparent;
    text-align: center;
    border: 0.1rem solid #4e0eff;
    border-radius: 0.4rem;
    color: orange;
    width: 40%;
    font-style: italic;
    font-size: 1.1rem;
    &:focus {
      background-color: #4e0eff;
      border: 0.1rem solid #997af0;
      outline: none;
      scroll: hidden;
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

export default Register;
