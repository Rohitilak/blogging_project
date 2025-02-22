const PostsModel = require("../models/post");
const UsersModel = require("../models/auth");
// const Razorpay = require("razorpay");

const keyId = "rzp_test_GLJrczK2bB2W8X";
const keySecret = "PmBODMfx3bFbMeR0iIrHSdA1";

// Initialize / login to razorpay / create an instance or object of razorpay
// const razorpay = new Razorpay({
//   key_id: keyId,
//   key_secret: keySecret,
// });

const listPosts = async (req, res) => {
  console.log(req.query);
  let pageNo = req.query.pageNo || 1;
  let pageSize = req.query.pageSize || 10;
  pageSize *= 1;
  pageNo = pageNo * 1;
  // console.log(pageNo);
  const postsList = await PostsModel.find({})
    .skip((pageNo - 1) * pageSize)
    .limit(pageSize)
    .sort({ likes: 1 }) // 1 => Ascending, -1 => Descending
    .populate("userId"); // 100
  // for (let i = 0; i < postsList.length; i++) {
  //   const userDetails = await UsersModel.findById(postsList[i].userId);
  //   postsList[i].userId = userDetails;
  // }
  res.json({
    results: postsList,
  });
};

const createPost = async (req, res) => {
  console.log(req.user._id);
  const newPost = new PostsModel({ ...req.body, userId: req.user._id });
  await newPost.save();
  res.json({
    msg: "Post created successfully",
  });
};

const getPostById = async (req, res) => {
  const postId = req.params.id;
  const post = await PostsModel.findById(postId).populate("userId");

  // const userId = post.userId;
  // const user = await UsersModel.findById(userId);
  // post.userId = user;
  res.json({ result: post });
};

const editPost = async (req, res) => {
  const postId = req.params.id;
  // ToDo : Write a find query to get the post
  // Match the post's userId with req.user._id
  await PostsModel.findByIdAndUpdate(postId, req.body);
  res.json({ msg: "Post edited successfully" });
};

const deletePost = async (req, res) => {
  const postId = req.params.id;
  await PostsModel.findByIdAndDelete(postId);
  res.json({ msg: "Post deleted successfully" });
};

const postComment = async (req, res) => {
  console.log(req.params.postId);
  // comments.push(newComment);
  await PostsModel.updateOne(
    { _id: req.params.postId },
    {
      $push: {
        comments: { comment: req.body.comment, userId: req.user._id },
      },
    }
  );
  res.json({ msg: "Comment posted successfully" });
};

const placeOrder = async (req, res) => {
  try {
    // Create an order on razorpay

    const orderDetails = {
      amount: 1999 * 100, // Amaount in paisa
      currency: "INR", // Currency -> Indian Rupees
      receipt: "ABCD1235", // Order Id
    };

    const pgResponse = await razorpay.orders.create(orderDetails);
    console.log("RESPONSE FROM RAZORPAY", pgResponse);
    res.json({
      message: "Order placed successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const postController = {
  listPosts,
  createPost,
  getPostById,
  editPost,
  deletePost,
  postComment,
  placeOrder,
};

module.exports = postController;