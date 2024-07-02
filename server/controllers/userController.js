import Verification from "../models/emailVerification.js";
import Users from "../models/userModel.js";
import { compareString, createJWT, hashString } from "../utils/index.js";
import PasswordReset from "../models/PasswordReset.js";
import { resetPasswordLink } from "../utils/sendEmail.js";
import FriendRequest from "../models/friendRequest.js";


export const verifyEmail = async (req, res) => {
  const { userId, token } = req.params;

  try {
    const result = await Verification.findOne({ userId });

    if (result) {
      //check token expiry
      const { expiresAt, token: hashedToken } = result;

      //token has expired
      if (expiresAt < Date.now()) {
        await Verification.findOneAndDelete({ userId })
          .then(() => {
            Users.findOneAndDelete({ _id: userId })
              .then(() => {
                const message = "Verification token has expired";
                res.redirect(`/users/verified?status=error&message=${message}`);
              })
              .catch((err) => {
                res.redirect(`/users/verified?status=error&message=${message}`);
              });
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        //token valid
        compareString(token, hashedToken)
          .then((isMatch) => {
            if (isMatch) {
              Users.findOneAndUpdate({ _id: userId }, { verified: true })
                .then(() => {
                  Verification.findOneAndDelete({ userId }).then(() => {
                    const message = "Email verified succesfully";
                    res.redirect(
                      `/users/verified?status=success&message=${message}`
                    );
                  });
                })
                .catch((err) => {
                  console.log(err);
                  const message = "Verification failed or link is invalid";
                  res.redirect(
                    `/users/verified?status=error&message=${message}`
                  );
                });
            } else {
              //invalid token
              const message = "Verification failed or link is invalid";
              res.redirect(`/users/verified?status=error&message=${message}`);
            }
          })
          .catch((err) => {
            console.log(err);
            res.redirect(`/users/verified?message=`);
          });
      }
    } else {
      const message = "Invalid verification link Try Again later";
      res.redirect(`/users/verified?status=error&message=${message}`);
    }
  } catch (error) {
    console.log(error);
    res.redirect(`/users/verified?message=`);
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: "FAILED",
        message: "Email address not found.",
      });
    }

    const existingRequest = await PasswordReset.findOne({ email });
    if (existingRequest) {
      if (existingRequest.expiresAt > Date.now()) {
        return res.status(201).json({
          status: "PENDING",
          message: "Reset password link has already been sent to your email.",
        });
      }
      await PasswordReset.findOneAndDelete({ email });
    }
    await resetPasswordLink(user, res);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const resetPassword = async (req, res) => {
  const { userId, token } = req.params;

  try {
    const user = await Users.findById(userId);

    if (!user) {
      const message = "Invalid password reset link. Try again";
      return res.redirect(
        `/users/resetpassword?status=error&message=${message}`
      );
    }

    const resetPassword = await PasswordReset.findOne({ userId });

    if (!resetPassword) {
      const message = "Invalid password reset link. Try again";
      return res.redirect(
        `/users/resetpassword?status=error&message=${message}`
      );
    }

    const { expiresAt, token: resetToken } = resetPassword;

    if (expiresAt < Date.now()) {
      const message = "Reset Password link has expired. Please try again";
      return res.redirect(
        `/users/resetpassword?status=error&message=${message}`
      );
    }

    const isMatch = await compareString(token, resetToken);

    if (!isMatch) {
      const message = "Invalid reset password link. Please try again";
      return res.redirect(
        `/users/resetpassword?status=error&message=${message}`
      );
    }

    return res.redirect(`/users/resetpassword?type=reset&id=${userId}`);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { userId, password } = req.body;

    const hashedpassword = await hashString(password);

    const user = await Users.findByIdAndUpdate(
      { _id: userId },
      { password: hashedpassword }
    );

    if (user) {
      await PasswordReset.findOneAndDelete({ userId });

      res.status(200).json({
        ok: true,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getUser = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { id } = req.params;

    const user = await Users.findById(id ?? userId).populate({
      path: "friends",
      select: "-password",
    });

    if (!user) {
      return res.status(200).send({
        message: "User not found",
        success: false,
      });
    }

    user.password = undefined;

    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Auth error",
      success: false,
      error: error.message,
    });
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, location, profileUrl, profession } = req.body;

    if (!(firstName || lastName || location || profileUrl || profession)) {
      next("Provide all fields");
      return;
    }

    const { userId } = req.body.user;

    const updateUser = {
      firstName,
      lastName,
      location,
      profileUrl,
      profession,
      _id: userId,
    };

    const user = await Users.findByIdAndUpdate(userId, updateUser, {
      new:true,
    });

    await user.populate({ path: "friends", select: "password"});

    const token = createJWT(user?._id);

    user.password = undefined;

    res.status(200).json({
      success:true,
      message: "User updated succesfully",
      user,
      token,
    })



  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const friendRequest = async (req,res,next) => {
  try {
    //the userid refers to person who is logged in 
    const { userId} = req.body.user;
    //requestTo refers to whom the request the user is sending
    const { requestTo } = req.body;

    //checks for existing request for the same user
    const requestExist = await FriendRequest.findOne({
      requestFrom: userId,
      requestTo,
    });

        if(requestExist){
          next("Friend Request already exist");
          return;
        }
    //Checking the other way round if the user2 has sent to user1
    const accountExist = await FriendRequest.findOne({
      requestFrom:requestTo,
      requestTo: userId,
    })
    
        if(accountExist){
          next("Friend Request already exist");
          return;
        }

    //If neither of the two above case happens then creating a new req for the user for sending request

    const newRes = await FriendRequest.create({
      requestTo,
      requestFrom: userId,
    })

    //return res
    res.status(201).json({
      success:true,
      message:"Friend request has been sent succesfully"
    })

    
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Auth error",
      success: false,
      error: error.message,
    });
  }
}

export const getfriendRequest = async (req,res,next) => {
  try {

    const { userId } = req.body.user;

    const request = await FriendRequest.find({
      requestTo: userId,
      requestStatus: "Pending",
    })
    .populate({
      path: "requestFrom",
      select: "firstName lastName profileUrl profession -password",
    })
    .limit(10)
    .sort({
      _id: -1,
    });


    //return res
    res.status(200).json({
      success:true,
      data: request,
    })

    
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Auth error",
      success: false,
      error: error.message,
    });
  }
}

export const acceptRequest = async (req,res,next) => {
  try {

    const id = req.body.user.userId;

    const { rid, status} = req.body;

    const requestExist = await FriendRequest.findById(rid);

    if(!requestExist){
      next("No Friend req FOund");
      return;
    }

    const newRes = await FriendRequest.findByIdAndUpdate(
      {_id: rid},
      {requestStatus: status }
    );

    if(status === "Accepted"){
      //find the user by its id
      const user = await Users.findById(id);
      
      //push into the friend list of the requested user
      user.friends.push(newRes?.requestFrom);

      //save into the db
      await user.save();

      //pushing the id of the user who requested into the friends lsit of the requested user
      const friend = await Users.findById(newRes?.requestFrom);

      friend.friends.push(newRes?.requestTo);

      await friend.save();
    }

    //return res
    res.status(201).json({
      success: true,
      message: "Friend Request "+ status,
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Auth error",
      success: false,
      error: error.message,
    });
  }
}

export const profileViews = async (req,res,next) => {
  try {
    //id of the person who is logged in
  const { userId } = req.body.user;
  //persons profile view
  const { id } = req.body;

  const user = await Users.findById(id);

  user.views.push(userId);

  await user.save();

  res.status(201).json({
    success: true,
    message: "Succesful"
  });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Auth error",
      success: false,
      error: error.message,
    });
  }

}

export const suggestedFriends = async (req,res,next) => {
  try {
    const { userId } = req.body.user;

    let queryObject = {};

    //query not to include the users id
    queryObject._id = { $ne: userId};

    //query not inclusive of his friends but include  his friend's friends
    queryObject.friends = { $nin: userId};

    let queryResult = Users.find(queryObject)
      .limit(15)
      .select("firstName lastName profileUrl profession -password");
    const suggestedFriends = await queryResult;

    //return res
    res.status(200).json({
      success: true,
      data: suggestedFriends,
    });



  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Auth error",
      success: false,
      error: error.message,
    });
  }
}