import express from "express";
import path from "path";
import {
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  changePassword,
  getUser,
  updateUser,
  friendRequest,
  getfriendRequest,
  acceptRequest,
  suggestedFriends,
  profileViews
} from "../controllers/userController.js";
import userAuth from "../middleware/authMiddleware.js";

const router = express.Router();
const __dirname = path.resolve(path.dirname(""));

router.get("/verify/:userId/:token", verifyEmail);
//PASSWORD RESET
router.post("/request-passwordreset", requestPasswordReset);
router.get("/reset-password/:userId/:token", resetPassword);
router.post("/reset-password", changePassword);

//USER ROUTES
router.post("/get-user/:id?",userAuth,getUser);
router.put("/update-user",userAuth,updateUser);


//FRIEND REQUEST
router.post("/friend-request",userAuth, friendRequest);
router.post("/get-friend-request",userAuth, getfriendRequest);

//ACCEPT-DENY REQUEST
router.post("/accept-request", userAuth, acceptRequest);


//VIEW PROFILE
router.post("/profile-view", userAuth, profileViews);

//SUGGESTED FRIENDS
router.post("/suggested-friends",userAuth, suggestedFriends);







router.get("/verified", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/build", "index.html"));
});

router.get("/resetpassword", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/build", "index.html"));
});

export default router;
