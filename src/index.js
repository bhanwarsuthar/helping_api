console.log("Hello World!!!");
var path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const { TokenExpiredError, JsonWebTokenError } = require("jsonwebtoken");
const morgan = require("morgan");
require("../config/database");
const userRouter = require("../router/user");
const adminRouter = require("../router/admin");
require(".././middleware/adminPassport");
require(".././middleware/userPassport");

const { User } = require("../models");
const { Op } = require("sequelize");

// defining the Express app
const app = express();
global.__basedir = __dirname;

// adding morgan to log HTTP requests
if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// for google play console

app.get("/user/delete/:mobile", async (req, res) => {
  const user = await User.findOne({ where: { mobile: req.params.mobile.replace("+91", ""), role: { [Op.ne]: "admin" }, status: "active" } });

  if (!user) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  await user.destroy();

  res.status(200).json({
    message: "User deleted successfully",
  });
});

app.use("/v1", userRouter);
app.use("/admin/v1", adminRouter);
// defining an array to work as the database (temporary solution)
const ads = [{ title: "Hello, world (again)!" }];

// adding Helmet to enhance your Rest API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// defining an endpoint to return all ads
app.get("/", (req, res) => {
  res.send(ads);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  if (err) {
    if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError || err?.name == "JsonWebTokenError") {
      return res.status(401).send({ message: "Unauthenticated." });
    }
    if (err?.message == "No auth token") {
      return res.status(401).send({ message: err?.message });
    }
    if (err.name === "SequelizeValidationError") {
    }
  }
  // render the error page
  res.status(err.status || 500);
  if (res.status == 404) {
    return res.send({ error: { message: "not found." } });
  }
  console.log(err);
  return res.send({ message: "Something went wrong." });
});

// starting the server
app.listen(3002, () => {
  console.log("listening on port 3002");
});
