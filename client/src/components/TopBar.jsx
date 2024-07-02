import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { TbSocial } from "react-icons/tb";
import { useForm } from "react-hook-form";
import TextInput from "./TextInput";
import CustomButton from "./CustomButton";
import {BsMoon,BsSunFill} from "react-icons/bs"
import {IoMdNotificationsOutline} from "react-icons/io";
import { setTheme } from "../redux/theme";
import {UserLogout} from "../redux/userSlice";
import { IoLogOutOutline } from "react-icons/io5";
import { FaBold } from "react-icons/fa";

const TopBar = () => {
  const { theme } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const{register, handleSubmit, formState:{errors}} = useForm();

  const handleSearch = async(data)=>{};

  const handleTheme = () =>{
    const themeValue = theme === "light" ? "dark" : "light";

    dispatch(setTheme(themeValue));
  }
  return (
    <div className=" w-full flex flex-row items-center justify-between p-5 md:py-6 bg-gray-300 rounded-2xl shadow-lg ">
      <div className="w-fit flex gap-2 items-center mb-6">
        <div className="p-2 bg-[#065ad8]  rounded text-white hover:scale-110 transition-all duration-200">
          <Link to="/">
            <TbSocial />
          </Link>
        </div>

        <span className="text-2xl text-[#065ad8] font-semibold">LinkUp</span>
      </div>
      <form className="flex items-center justify-center w-3/5 " onSubmit={handleSubmit(handleSearch)}>
      <TextInput
              
              placeholder="Search..."
              register={register("search")}
              styles="w-full rounded-l-full bg-blue-50"
            />
      <CustomButton  title="Search"
        type="submit"
        containerStyles='bg-blue-600 text-white px-6 py-2.5 mt-2 rounded-r-full hover:scale-105 transition-all duration-200'
      />
       
      </form>

      {/* Icons */}

      <div className="flex  gap-4 items-center text-ascent-1 text-md md:textt-xl">
      <button onClick={()=> handleTheme()}>{theme ? <BsMoon className="hover:scale-110 transition-all duration-200 "/> : <BsSunFill className="hover:scale-110 transition-all duration-200"/>}</button>
      <div className="hidden lg:flex">
        <IoMdNotificationsOutline size={20} className="cursor-pointer hover:scale-110 transition-all duration-200"/>
      </div>

      <div>
      <IoLogOutOutline  title="Log Out"
         onClick={() => dispatch(UserLogout())}
        className=' text-black hover:scale-105 transition-all duration-200 cursor-pointer '
        size={30}
      />
    
      </div>

      </div>
    </div>
  );
};

export default TopBar;
