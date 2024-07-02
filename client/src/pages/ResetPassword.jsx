import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { TextInput } from '../components';
import {CustomButton} from "../components/index"
import { apiRequest } from '../utils';
const ResetPassword = () => {

  const[errMsg,setErrMsg] = useState("");
  const[isSubmitting,setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const onSubmit = async(data) =>{
    setIsSubmitting(true);
    try {
      const res = await apiRequest({
        url: "/users/request-passwordreset",
        data: data,
        method: "POST",
      });
      if(res?.status === "failed"){
        setErrMsg(res);
        window.alert(errMsg.message);
      } else{
        setErrMsg(res);
      }

      setIsSubmitting(false);
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
    }
  };
  return (
    <div className='w-full h-[100vh] flex justify-center bg-blue-100'>
    <div className='bg-blue-200 w-full md:w-1/3 2xl:w-1/4 p-10 h-[50vh]  shadow-md rounded-lg translate-y-36'>
      <p className='text-ascent-1 text-lg font-semibold'>Reset Password</p>
      <span className='text-red-600'>*Enter Email Address used during registration </span>

      <form onSubmit={handleSubmit(onSubmit)} className='py-4 flex flex-col gap-5'>
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

            {errMsg?.message && (
              <span
               role='alert'
                className={`text-sm ${
                  errMsg?.status == "failed"
                    ? "text-[#f64949fe]"
                    : "text-[#2ba150fe]"
                } mt-0.5`}
              >
                {errMsg?.message}
              </span>
            )}
            
            {isSubmitting ? (
              <Loading />
            ) : (
              <CustomButton
                type='submit'
                containerStyles={`inline-flex justify-center rounded-md px-8 py-3 text-sm font-medium text-white outline-none bg-[#065ad8] `}
                title='Submit'
              />
            )}

      </form> 
             
    </div>
      
    </div>
  )
}

export default ResetPassword
