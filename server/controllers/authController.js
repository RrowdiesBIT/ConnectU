import Users from "../models/userModel.js";
import { createJWT, hashString, compareString} from "../utils/index.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";


export const register = async(req,res,next) => {
  try {
    const {firstName, lastName, email, password} = req.body;
    //validate fields

    if(!firstName || !lastName || !email || !password){
      res.json({message:"all fields are required"})
     next()
      return;
    }

    //find the email address in the db
   
      const userExist = await Users.findOne({email});
      if(userExist){
        next("Email Address already exist");
        return;
      }
      const hashedPassword = await hashString(password);

      const user = await Users.create({
        firstName,
        lastName,
        email,
        password: hashedPassword
      });

      //send email verification to user
      sendVerificationEmail(user,res);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      error:error.message
    })
  }
}

export const login = async(req,res,next) => {
  const {email, password} = req.body;

  try {
    //validation
    const user = await Users.findOne({email}).select("+password").populate({
      path: "friends",
      select: "firstName lastName location profileUrl -password"
    })

    if(!user){
      next("User doesnot exist");
      return;
    }

    if(!user?.verified) {
      next(
        "User email is not verified.Check ur email A/C and verify"
      );
      return;
    }
    
    //compare password
    const isMatch = await compareString(password,user?.password);

    if(!isMatch){
     next("Invalid password");
     return;
     
    }

    user.password = undefined;

    const token = createJWT(user?._id);

    return res.status(201).json({
      success:true,
      message: "Login Succesfully",
      user,
      token,
    })


  } catch (error) {
    console.log(error);
    res.status(404).json({
      success:false,
      error:error.message,
      message:"User cant be login due to some error or CHeck your email for verification email"
    })
  }
}