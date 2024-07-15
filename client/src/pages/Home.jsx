import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CustomButton, EditProfile, TextInput, TopBar } from "../components";
import ProfileCard from "../components/ProfileCard";
import FriendsCard from "../components/FriendsCard";
import { friends} from "../assets/data";
import { Link } from "react-router-dom";
import NoProfile from "../img/userprofile.png";
import { BsFiletypeGif, BsPersonFillAdd } from "react-icons/bs";
import { useForm } from "react-hook-form";
import { BiImages, BiSolidVideo } from "react-icons/bi";
import { Loading } from "../components/index";
import PostCard from "../components/PostCard";
import { apiRequest, deletePost, fetchPosts, handleFileUpload, likePost, sendFriendRequest } from "../utils";
// import { SetPosts } from "../redux/postSl/ice";
// import { getUserInfo } from "../utils";
// import { UserLogin } from "../redux/userSlice";

const Home = () => {
  const { user, edit } = useSelector((state) => state.user);
  const { posts } = useSelector((state) => state.posts);
  const [friendRequest, setFriendRequest] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [errMsg, setErrMsg] = useState("");
  const [file, setFile] = useState(null);
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    setLoading(true);
    getUser();
    fetchPost();
    fetchFriendRequest();
    fetchsuggestedFriends();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const handlePostSubmit = async (data) => {
    setPosting(true);
    setErrMsg("");
  
    try {
      let uri = null;
      if (file) {
        uri = await handleFileUpload(file.file, file.type);
      }
  
      const newData = uri ? { ...data, image: uri } : data;
  
      const res = await apiRequest({
        url: "/posts/create-post",
        data: newData,
        token: user?.token,
        method: "POST"
      });
  
      if (res?.status === "failed") {
        setErrMsg(res);
      } else {
        reset({
          description: "",
        });
        setFile(null);
        setErrMsg(null);
        await fetchPost();
      }
      setPosting(false);
    } catch (error) {
      console.error("Error submitting post:", error);
      setPosting(false);
    }
  }

  const fetchPost = async () => {
    await fetchPosts(user?.token, dispatch);
    setLoading(false);
  };
  // console.log(fetchPost);
  const handleLikePost = async (uri) => {
    await likePost({uri:uri, token: user?.token});

    await fetchPost();
  };
  const handleDelete = async (id) => {
    await deletePost(id,user.token);

    await fetchPost();
  };
  const fetchFriendRequest = async () => {
    try {
      const res = await apiRequest({
        url: "/users/get-friend-request",
        token: user?.token,
        method:"POST",
      });
      console.log(res);
      setFriendRequest(res?.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchsuggestedFriends = async () => {
    try {
      const res = await apiRequest({
        url: "/users/suggested-friends",
        token: user?.token,
        method:"POST",
      })
      console.log(res);
      setSuggestedFriends(res?.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  const handleFriendRequests = async (id) => {
    try {
      const res = await sendFriendRequest(user?.token, id);
      await fetchsuggestedFriends();
      
    } catch (error) {
      console.log(error);
    }
  };

  const acceptFriendRequests = async (id, status) => {
    try {
      const res = await apiRequest({
        url: "/users/accept-request",
        token:user?.token,
        method:"POST",
        data: {rid: id, status},
      });
      console.log(res);
      setFriendRequest(res?.data.data);
    } catch (error) {
      console.log(error);
    }
  }

  const getUser = async () => {
    const res = await getUserInfo(user?.token);
    const newData = {token: user?.token, ...res};
    console.log(res);
    dispatch(UserLogin(newData));
  };
  console.log(getUser);

  
  return (
    <div className="home w-full px-0 lg:px-10 pb-20 2xl:px-40 bg-bgColor lg:rounded-lg h-screen overflow-hidden mt-2">
      <TopBar />
      <div className="w-full flex gap-2 lg:gap-4 pt-5 pb-10 h-full">
        {/* LEFT */}
        <div className="hidden w-1/3 lg:w-1/4 h-full md:flex flex-col gap-6 overflow-y-auto">
          <ProfileCard user={user} />
          <FriendsCard friends={friends} />
        </div>
        {/* CENTER */}
        <div className="flex-1 h-full bg-gray-300 px-4 flex flex-col gap-6 overflow-y-auto rounded-xl">
          <form
            onSubmit={handleSubmit(handlePostSubmit)}
            className="bg-gray-300 px-4 rounded-lg"
          >
            <div className="w-full flex items-center gap-2 py-4 border-b border-[#66666645]">
              <img
                src={user?.profileUrl ?? NoProfile}
                alt="User Image"
                className="w-14 h-14 rounded-full object-cover"
              />
              <TextInput
                styles="w-full rounded-full py-5"
                placeholder="What's on your mind...."
                name="description"
                register={register("description", {
                  required: "Write something about Post",
                })}
                error={errors.description ? errors.description.message : ""}
              />
            </div>
            {errMsg?.message && (
              <span
                role="alert"
                className={`text-sm ${
                  errMsg?.status == "failed" ? "text-red-600" : "text-green-600"
                }mt-0.5`}
              >
                {errMsg?.message}
              </span>
            )}
            <div className="flex items-center justify-between py-4">
              <label
                htmlFor="imgUpload"
                className="flex items-center gap-1 text-base text-ascent-2 cursor-pointer"
              >
                <input
                  type="file"
                  onChange={(e) =>
                    setFile({ file: e.target.files[0], type: "image" })
                  }
                  className="hidden"
                  id="imgUpload"
                  accept=".jpg, .png, .jpeg"
                />
                <BiImages className="" />
                <span className="text-gray-900 text-sm ">Image</span>
              </label>

              <label
                htmlFor="videoUpload"
                className="flex items-center gap-1 text-base text-ascent-2 cursor-pointer"
              >
                <input
  type="file"
  onChange={(e) => setFile({ file: e.target.files[0], type: 'video' })}
  className="hidden"
  id="videoUpload"
  accept=".mp4, .wav"
/>
                <BiSolidVideo className="" />
                <span className="text-gray-900 text-sm ">Video</span>
              </label>

              <label
                htmlFor="vgifUpload"
                className="flex items-center gap-1 text-base text-ascent-2 cursor-pointer"
              >
                <input
  type="file"
  onChange={(e) => setFile({ file: e.target.files[0], type: 'gif' })}
  className="hidden"
  id="vgifUpload"
  accept=".gif"
/>
                <BsFiletypeGif className="" />
                <span className="text-gray-900 text-sm ">Gif</span>
              </label>

              <div>
                {posting ? (
                  <Loading />
                ) : (
                  <CustomButton
                    type="submit"
                    title="Post"
                    containerStyles="bg-blue-600 text-white py-1 px-6 rounded-full font-semibold text-sm"
                  />
                )}
              </div>
            </div>
          </form>

          {loading ? (
            <Loading />
          ) : posts?.length > 0 ? (
            posts?.map((post) => (
              <PostCard
                key={post?._id}
                post={post}
                user={user}
                delete={handleDelete}
                likePost={handleLikePost}
              />
            ))
          ) : (
            <div className="flex w-full h-full items-center justify-center">
              <p className="text-lg text-ascent-2"> No Posts Available</p>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="hidden w-1/4 h-full lg:flex flex-col gap-8 overflow-y-auto">
          {/* FRIEND REQUEST */}
          <div className="w-full bg-gray-300 shadow-sm rounded-lg px-6 py-5">
            <div className="flex items-center justify-between text-xl text-ascent-1 pb-2 border-b border-[#66666645]">
              <span>Friend Request</span>
              <span>{friendRequest?.length}</span>
            </div>

            <div className="w-full flex flex-col gap-4 pt-4 ">
              {friendRequest?.map(({ _id, requestFrom: from }) => (
                <div key={_id} className="flex items-center justify-between">
                  <Link
                    to={"/profile/" + from._id}
                    className="w-full flex gap-4 items-center cursor-pointer"
                  >
                    <img
                      src={from?.profileUrl ?? NoProfile}
                      alt={from?.firstName}
                      className="w-10 h-10 object-cover rounded-full"
                    />

                    <div className="flex-1 ">
                      <p className="text-base font-medium text-ascent-1 ">
                        {from?.firstName} {from?.lastName}
                      </p>
                      <span className="text-base font-sm text-ascent-1">
                        {from?.profession ?? "No Profession"}
                      </span>
                    </div>
                  </Link>

                  <div className="flex gap-1 ">
                    <CustomButton
                      title="Accept"
                      onClick={()=> acceptFriendRequests(_id, "Accepted")}
                      containerStyles="bg-blue-600 text-xs text-white px-1.5 py-1 rounded-full"
                    />
                    <CustomButton
                      title="Deny"
                      onClick={()=> acceptFriendRequests(_id, "Denied")}
                      containerStyles="bg-gray-500 text-xs text-white px-1.5 py-1 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SUGGESTED FRIENDS */}
          <div className="w-full bg-gray-300 shadow-sm rounded-lg px-5 py-5">
            <div className="flex items-center justify-between text-lg text-ascent-1 border-b border-[#66666645]">
              <span>Friend Suggestion</span>
            </div>
            <div className="w-full flex-col  gap-4 pt-4">
              {suggestedFriends?.map((friends) => (
                <div
                  className="flex items-center cursor-pointer"
                  key={friends?._id}
                >
                  <Link
                    to={"/profile/" + friends?._id}
                    key={friends?._id}
                    className="w-full flex gap-4 items-center cursor-pointer"
                  >
                    <img
                      src={friends?.profileUrl ?? NoProfile}
                      alt={friends?.firstName}
                      className="w-10 h-10 object-cover rounded-full"
                    />
                    <div className="fkex-1">
                      <p className="text-base font-medium text-ascent-1">
                        {friends?.firstName} {friends?.lastName}
                      </p>
                      <span className="text-sm text-ascent-2">
                        {friends?.profession ?? "No Profession"}
                      </span>
                    </div>
                  </Link>

                  <div className="flex gap-1">
                    <button
                      className=" text-sm text-white p-1 rounded"
                      onClick={() => handleFriendRequests(friends?._id)}
                    >
                      <BsPersonFillAdd size={20} className="text-blue-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {edit && <EditProfile />}
    </div>
  );
};

export default Home;
