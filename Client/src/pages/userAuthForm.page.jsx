import React, { useContext, useRef } from 'react'
import InputBox from '../components/input.component'
import googleIcon from "../imgs/google.png"
import { Link, Navigate } from "react-router-dom"
import AnimationWrapper from '../common/page-animation'
import { Toaster, toast } from 'react-hot-toast'
import axios from 'axios'
import { storeInSession } from '../common/session'
import { UserContext } from '../App'
import { authWithGoogle } from '../common/firebase'

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

const UserAuthForm = ({ type }) => {
    let { userAuth, setUserAuth } = useContext(UserContext) 
    let access_token=userAuth?.access_token
    const userAuthThroughServer = (serverRoute, formData) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
            .then(({ data }) => {

                storeInSession('user', JSON.stringify(data))
                setUserAuth(data)
                
            })
            .catch(({ response }) => {
                toast.error(response.data.error)
            })
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        let serverRoute = type === "sign-in" ? "/auth/signin" : "/auth/signup"
        const userForm = document.getElementById("userForm");
        let form = new FormData(userForm);
        let formData = {};
        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }

        // fromValidation
        let { fullname, email, password } = formData
        if (fullname) {
            if (fullname.length < 3) {
                return toast.error("Fullname must be at least 3 letters long");
            }
        }
        if (!email.length) {
            return toast.error("Enter Email");
        }
        if (!emailRegex.test(email)) {
            return toast.error("Email is invalid");
        }
        if (!passwordRegex.test(password)) {
            return toast.error("Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters");
        }

        userAuthThroughServer(serverRoute, formData)
    }

    const handleGoogleAuth = (e) =>{
          e.preventDefault();
          authWithGoogle().then(user=>{
            let serverRoute = "/auth/google-auth";
            let formData = {
                access_token : user.accessToken
            }
            userAuthThroughServer(serverRoute,formData)
          })
          .catch(err=>{
            toast.error('trouble login through google')
          })  
    }

    return (
        access_token ? 
        <Navigate to="/" />
        :
        <AnimationWrapper keyValue={type}>
            <section className='h-cover flex items-center justify-center'>
                <Toaster />
                <form id="userForm" className='w-[80%] max-w-[400px]' onSubmit={handleSubmit} >
                    <h1 className='text-4xl font-gelasio capitalize text-center mb-24'>
                        {type == 'sign-in' ? "welcome back" : "Join us today"}
                    </h1>
                    {
                        type !== "sign-in" ?
                            <InputBox
                                name="fullname"
                                type="text"
                                placeholder="Full Name"
                                icon="fi-rr-user"
                            />
                            : ""
                    }
                    <InputBox
                        name="email"
                        type="email"
                        placeholder="Email"
                        icon="fi-rr-envelope"
                    />
                    <InputBox
                        name="password"
                        type="password"
                        placeholder="Password"
                        icon="fi-rr-key"
                    />
                    <button className='btn-dark center mt-14' type="submit">
                        {type.replace("-", " ")}
                    </button>

                    <div className='relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold'>
                        <hr className='w-1/2 border-black' />
                        <p>or</p>
                        <hr className='w-1/2 border-black' />
                    </div>
                    <button className='btn-dark flex items-center justify-center gap-4 w-[90%] center'
                        onClick={handleGoogleAuth}
                    >
                        <img src={googleIcon} className='w-5 ' />
                        continue with google
                    </button>
                    {
                        type === "sign-in" ?
                            <p className='mt-6 text-dark-grey text-xl text-center'>
                                Don't have an account ?
                                <Link to="/signup" className='underlined text-black text-xl ml-1'>
                                    Join us today.
                                </Link>
                            </p>
                            :
                            <p className='mt-6 text-dark-grey text-xl text-center'>
                                Already a member ?
                                <Link to="/signin" className='underlined text-black text-xl ml-1'>
                                    Sign in here.
                                </Link>
                            </p>
                    }
                </form >
            </section >
        </AnimationWrapper >
    )
}

export default UserAuthForm
