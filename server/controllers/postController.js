import Posts from "../models/postModel.js";
import Users from "../models/userModel.js";
import Comments from "../models/commentModel.js"
export const createPost = async (req, res, next) => {
  try {

    const { userId } = req.body.user;
    const { description, image } = req.body;

    if (!description) {
      next("You must provide a description");
      return;
    }

    const post = await Posts.create({
      userId,
      description,
      image,
    });

    res.status(200).json({
      success:true,
      message:"Post created succesfully",
      data: post
    })
    
    
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: error.message,
      success: false,
    });
  }
};

export const getPosts = async(req,res,next) => {
  try {
    const { userId } = req.body.user;
    const { search } = req.body;

          const user = await Users.findById(userId);
          const friends = user?.friends?.toString().split(",") ?? [];
          friends.push(userId);

          const searchPostQuery = {
            $or: [
              {
                description: { $regex: search, $options: "i"},
              },
            ],
          };

          //search query for posts
          const posts = await Posts.find(search ? searchPostQuery : {})
          .populate({
            path: "userId",
            select: "firstName lastName location profileUrl -password",
          })
          .sort({ _id: -1});

          //Posts of our friends
          const friendsPosts = posts?.filter((post) => {
            return friends.includes(post?.userId?._id.toString());
          });

          //Posts other than our and friends
          const otherPosts = posts?.filter(
            (post) => !friends.includes(post?.userId._id.toString())
          );

          let postsRes = null;

          //if there exists posts of friends and we search then we will send the friends post data otherwise otherposts
          if(friendsPosts?.length > 0) {
            postsRes = search ? friendsPosts : [...friendsPosts, ...otherPosts];
          }else {
            postsRes = posts;
          }

          res.status(200).json({
            success:true,
            message:"Post fetched succesfully",
            data: postsRes
          })


  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: error.message,
      success: false,
    });
  }
}

export const getSinglePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Posts.findById(id).populate({
      path: "userId",
      select: "firstName lastName location profileUrl -password",
    });
    // .populate({
    //   path: "comments",
    //   populate: {
    //     path: "userId",
    //     select: "firstName lastName location profileUrl -password",
    //   },
    //   options: {
    //     sort: "-_id",
    //   },
    // })
    // .populate({
    //   path: "comments",
    //   populate: {
    //     path: "replies.userId",
    //     select: "firstName lastName location profileUrl -password",
    //   },
    // });

    res.status(200).json({
      sucess: true,
      message: "successfully",
      data: post,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getUserPost = async (req,res,next) => {
  try {
    const { id } = req.params;

  const post = await Posts.find({userId: id})
  .populate({
    path: "userId",
    select: "firstName lastName location profileUrl -password",
  })
  .sort({_id: -1});

  res.status(200).json({
    success:true,
    message:"success",
    data: post
  })
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
}

export const getComments = async (req,res,next) => {
 try {
  const {postId} = req.params;

  const postComments = await Comments.find({postId})
    .populate({
      path:"userId",
      select: "firstName lastName location profileUrl -password",
    })
    .populate({
      path: "replies.userId",
      select: "firstName lastName location profileUrl -password",
    })
    .sort({ _id: -1});

    res.status(200).json({
      success:true,
      message:"success",
      data:postComments
    })
 } catch (error) {
  console.log(error);
  res.status(404).json({ message: error.message });
 }
}

export const likePost = async (req,res,next) => {
  try {
    const {userId} = req.body.user;
    const {id} = req.params;


    const post = await Posts.findById(id);

    //check for likes of a post from userId
    const index = post.likes.findIndex((pid) => pid === String(userId));

    //if we haven't liked it:
    if(index === -1){
      post.likes.push(userId);
    }else{
      //if we have liked it already
      post.likes = post.likes.filter((pid) => pid !== String(userId))
    }

    //updating the post with the likes and comment
    const newPost = await Posts.findByIdAndUpdate(id,post, {
      new:true,
    })

    res.status(200).json({
      success:true,
      message:"success",
      data:newPost
    })

  } catch (error) {
    console.log(error);
  res.status(404).json({ message: error.message });
  }
}

export const likePostComment = async (req, res, next) => {
  const { userId } = req.body.user;
  const { id, rid } = req.params;

  try {
    if (rid === undefined || rid === null || rid === `false`) {
      const comment = await Comments.findById(id);

      const index = comment.likes.findIndex((el) => el === String(userId));

      if (index === -1) {
        comment.likes.push(userId);
      } else {
        comment.likes = comment.likes.filter((i) => i !== String(userId));
      }

      const updated = await Comments.findByIdAndUpdate(id, comment, {
        new: true,
      });

      res.status(201).json(updated);
    } else {
      const replyComments = await Comments.findOne(
        { _id: id },
        {
          replies: {
            $elemMatch: {
              _id: rid,
            },
          },
        }
      );

      const index = replyComments?.replies[0]?.likes.findIndex(
        (i) => i === String(userId)
      );

      if (index === -1) {
        replyComments.replies[0].likes.push(userId);
      } else {
        replyComments.replies[0].likes = replyComments.replies[0]?.likes.filter(
          (i) => i !== String(userId)
        );
      }

      const query = { _id: id, "replies._id": rid };

      const updated = {
        $set: {
          "replies.$.likes": replyComments.replies[0].likes,
        },
      };

      const result = await Comments.updateOne(query, updated, { new: true });

      res.status(201).json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const commentPost = async (req,res,next) => {
 try {
      const {comment , from } = req.body;
      const { userId} = req.body.user;
      const {id} = req.params;

      if(comment == null){
        return res.status(404).json({
          message:"Comment is required",
        })
      }

      const newComment = new Comments({comment , from, userId, postId: id});

      await newComment.save();

      //updating the post with post id
      const post = await Posts.findById(id);

      post.comments.push(newComment._id);

      const updatedPost = await Posts.findByIdAndUpdate(id, post, 
        {new:true}
      );

      res.status(201).json(newComment);

 } catch (error) {
  console.log(error);
  res.status(404).json({
    message:error.message
  })
 }
}

export const replyPostComment = async(req,res,next) => {
  const {userId} = req.body.user;
  const {comment, replyAt, from } = req.body;
  const {id} = req.params;

  if(comment === null){
   return res.status(404).json({
      message:"Comment is Required"
    })
  }

  try {
    const CommentInfo = await Comments.findById(id);

    CommentInfo.replies.push({
      comment,
      replyAt,
      from,
      userId,
      created_At: Date.now(),
    });

    CommentInfo.save();
    res.status(200).json(CommentInfo);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: error.message
    })
  }
}

export const deletePost = async(req,res,next) => {
  try {
    const {id} = req.params;

    await Posts.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Deleted succesfully"
    })
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message:error.message
    })
  }
}