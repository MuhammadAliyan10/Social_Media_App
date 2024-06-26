const express = require("express");
const router = express.Router();
const Post = require("../Models/Post.js");
const User = require("../Models/User.js");
const auth = require("../Middleware/auth.js");

router.post("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { content, image } = req.body;
    const newPost = new Post({
      user: req.user.id,
      content: content,
      image: image,
    });
    const post = await newPost.save();
    user.posts.push(post);
    await user.save();
    res.json(post);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Server Error." });
  }
});

//! Get all post
router.get("/posts", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    const userIds = posts.map((post) => post.user);
    const uniqueUserIds = [...new Set(userIds)];
    const users = await User.find({ _id: { $in: uniqueUserIds } });

    const userByPost = posts.map((post) => {
      const user = users.find(
        (user) => user._id.toString() === post.user.toString()
      );
      return { ...post.toObject(), user };
    });

    res.json({ post: userByPost });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Server Error." });
  }
});

//! Get single Post

router.get("/post/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    console.log(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not found" });
    }
    return res.status(500).json({ message: "Server Error." });
  }
});

//! Delete a post

router.delete("/deletePost/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }
    await post.deleteOne();
    res.json({ message: "Post removed successfully." });
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});
module.exports = router;

//! Update a post

router.patch("/updatePost/:postId", auth, async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    if (!req.body.content) {
      return res
        .status(400)
        .send({ message: "Please provide the new content." });
    }

    post.content = req.body.content;
    await post.save();

    res.status(200).send(post);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server error" });
  }
});

//! Fetch singlePerson posts

router.get("/userPosts/:id", auth, async (req, res) => {
  try {
    const logInUser = await User.findById(req.user._id);
    if (!logInUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    const userPosts = req.params.id;
    const posts = await Post.find({ user: userPosts });
    if (!posts) {
      return res.status(404).send({ message: "Post not found" });
    }
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server error" });
  }
});

//! Add a comment

router.post("/comment/:postId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const postID = req.params.postId;
    const post = await Post.findById(postID);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const comment = {
      user: req.user,
      content: req.body.content,
    };
    post.comments.push(comment);
    await post.save();
    return res.status(200).json({ message: "Comment posted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server error" });
  }
});

//! Get comments
router.get("/postComment/:postId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const postID = req.params.postId;
    const post = await Post.findById(postID);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.comments.length === 0) {
      return res
        .status(200)
        .json({ message: "No comments. You are the first one to comment." });
    }

    const populatedComments = await Promise.all(
      post.comments.map(async (comment) => {
        const commentUser = await User.findById(comment.user);
        return {
          ...comment.toObject(),
          user: commentUser
            ? {
                _id: commentUser._id,
                username: commentUser.username,
                avatar: commentUser.profile.avatar,
              }
            : null,
        };
      })
    );

    res.json({ comments: populatedComments });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server error" });
  }
});

router.delete("/deleteComment/:postId/:commentId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const postId = req.params.postId;
    if (!postId) {
      return res.status(400).json({ message: "postId parameter is missing" });
    }

    const commentId = req.params.commentId;
    if (!commentId) {
      return res
        .status(400)
        .json({ message: "commentId parameter is missing" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const commentIndex = post.comments.findIndex(
      (comment) => comment["_id"].toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    post.comments.splice(commentIndex, 1);

    await post.save();

    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server error" });
  }
});
