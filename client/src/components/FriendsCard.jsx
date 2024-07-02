import React from 'react'
import { Link } from 'react-router-dom'
import NoProfile from "../img/userprofile.png"
const FriendsCard = ({friends}) => {
  return (
    <div>
      <div className='w-full bg-gray-300 shadow-sm rounded-lg px-3 py-4  '>
        <div className='flex items-centrer justify-between text-ascent-1 pb-2 border-b border-gray-400 bg-gray-200 rounded-t-lg p-2'>
          <span className='font-bold'>Friends</span>
          <span>{friends?.length}</span>
        </div>

        <div className='w-full flex flex-col gap-4 pt-4 bg-gray-200 rounded-b-lg p-2'>
          {
            friends?.map((friends) => (
              <Link to={"/profile/"+ friends?._id}
              key={friends?._id}
              className='w-full flex gap-4 items-center cursor-pointer'>
              <img src={friends?.profileUrl ?? NoProfile}  alt={friends?.firstName} 
                className='w-10 h-10 rounded-full '
              />
              <div className='flex-1 border-b border-gray-300'>
                <p className='text-base font-medium text-ascent-1 '>
                  {friends?.firstName}{" "}{friends?.lastName}
                </p>
                <span className='text-ascent-2 text-sm font-sans'>
                  {friends?.profession ?? "No Profession"}
                </span>
              </div>
              

              </Link>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default FriendsCard
