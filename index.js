const express = require("express");
const mongoose = require("mongoose");
// const cors = require("cors");
const {rateLimit} = require("express-rate-limit");

const MongoStore = require("rate-limit-mongo");

const passport = require("./middleware/auth");

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");

// const authMiddleware = require("./middlewares/auth");

// const corsOptions = {
//   origin: "http://localhost:5173",
//   optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
// };

const windowMs = 5*60*1000;

const limiter = rateLimit({
  store: new MongoStore({
    uri: 'mongodb://127.0.0.1:27017/test_db',
    // user: 'mongouser',
    // password: 'mongopassword',
    // should match windowMs
    expireTimeMs: windowMs,
    errorHandler: console.error.bind(null, 'rate-limit-mongo')
    // see Configuration section for more options and details
  }),

	windowMs: windowMs, // 15 minutes
	limit: 4, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
})


const app = express();

// app.use(cors(corsOptions));
app.use(express.json());
app.use(limiter);

mongoose
  .connect("mongodb://localhost:27017/authapp")
  .then(() => console.log("DB Connected successfully"))
  .catch((err) => console.log(err));

app.use("/api/v1/auth", authRoutes);
app.use(
  "/api/v1/posts",
  passport.authenticate("jwt", { session: false }),
  postRoutes
);

app.listen(8080, () => console.log("App is up and running at port 8080"));