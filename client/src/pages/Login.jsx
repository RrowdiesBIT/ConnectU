import React, { useState } from "react";
import { TbSocial } from "react-icons/tb";
import { TextInput } from "../components/index.js";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Loading, CustomButton } from "../components/index.js";
import { FaArrowCircleRight } from "react-icons/fa";
import bgImg from "../img/bgImg.jpeg";
import { apiRequest } from "../utils/index.js";
import { UserLogin } from "../redux/userSlice.js";
import swal from 'sweetalert';

const Login = () => {
  // const {user,edit} = useSelector((state) => state.user);
  const [errMsg, setErrMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await apiRequest({
        url: "/auth/login",
        data: data,
        method: "POST",
      });
      console.log(res);
      if (res?.status === "failed") {
        setErrMsg(res);
        window.alert(errMsg.message);
        
      } else {
        setErrMsg("");

        const newData = {token: res?.token, ...res?.user};
        dispatch(UserLogin(newData));
        swal("Login Successfully","Keep Connecting","Success");
        setTimeout(() => {
          window.location.replace("/");
        },5000)
        
      }
      setIsSubmitting(false);
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-blue-100 w-full h-[100vh] flex items-center justify-center p-6  ">
      <div className="w-full md:w-2/3 h-fit lg:h-full 2xl:h-5/6 py-8 lg:py-0 flex bg-primary rounded-xl overflow-hidden shadow-xl bg-white">
        {/* LEFT */}
        <div className="w-full lg:w=1/2 h-full p-10 2xl:px-20 flex flex-col justify-center ">
          <div className="w-full flex gap-2 items-center mb-6">
            <div className="p-2 bg-[#065ad8]  rounded text-white">
              <TbSocial />
            </div>
            <span className="text-2xl text-[#065ad8] font-semibold">
              ConnectU
             
            </span>
          </div>

          <p className="text-ascent-1 text-base font-semibold">
            Log in to your account
          </p>
          <span className="text-sm mt-2 text-ascent-2 font-medium">
            Welcome Back
          </span>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="py-8 flex flex-col gap-5"
          >
            <TextInput
              name="email"
              placeholder="email@example.com"
              label="Email Address"
              type="email"
              register={register("email", {
                required: "Email Address is required",
              })}
              styles="w-full rounded-full bg-gray-200"
              labelStyle="ml-2"
              error={errors.email ? errors.email.message : ""}
            />

            <TextInput
              name="password"
              placeholder="Password"
              label="Password"
              type="password"
              register={register("password", {
                required: "Passsword is required",
              })}
              styles="w-full rounded-full bg-gray-200"
              labelStyle="ml-2"
              error={errors.password ? errors.password?.message : ""}
            />

            <Link
              to="/reset-password"
              className="text-sm text-right text-[#065ad8]  font-semibold"
            >
              Forgot Password?
            </Link>

            

            {isSubmitting ? (
              <Loading />
            ) : (
              <CustomButton
                type="submit"
                containerStyles={
                  "inline-flex justify-center rounded-md bg-[#065ad8] p-3 text-white"
                }
                title="Login"
              />
            )}
          </form>
          <p className="text-ascent-2 text-sm text-center font-medium">
            Dont't have an Account?
          </p>

          <div className="flex flex-row items-center gap-2">
            <Link
              to="/register"
              className="text-[#065ad8] font-semibold ml-2 cursor-pointer"
            >
              Create Account
            </Link>
            <FaArrowCircleRight className="text-[#065ad8]" />
          </div>
        </div>
        {/* RIGHT */}
        <div className="hidden w-3/4 h-full lg:flex flex-col items-center justify-center object-fill">
          <img src={bgImg} alt="" className="object-contain" />
        </div>
      </div>
    </div>
  );
};

export default Login;
