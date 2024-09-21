const express = require("express");
const app = require("express")();
const httpServer = require("http").createServer(app);
const cors = require("cors");
const cookieParser = require("cookie-parser");
// middlewares
app.use(
  cors({
    origin: ["*"],
    credentials: true,
  })
);
app.use(
  express.json({
    limit: "5Mb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "1Mb",
  })
);

app.use(express.static("./public"));
app.use(cookieParser());

// user router
const userRouter = require("./routes/user.routes");
const groupRouter = require("./routes/groups.routes");

// using routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/group", groupRouter);

module.exports = {
  app,
  httpServer,
};
