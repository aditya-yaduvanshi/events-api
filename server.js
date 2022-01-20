require("dotenv").config();
const express = require("express"),
  mongoose = require("mongoose"),
  fileUpload = require("express-fileupload");

const {PORT, MONGO_URI} = process.env;

const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(
  fileUpload({
    limits: {fileSize: 50 * 1024 * 1024},
  })
);
app.use("/static", express.static("static"));
app.use("/api/events", require("./api/events"));

mongoose
  .connect(MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then((_conn) => {
    console.log("db connected");
    app.listen(PORT || 5000, () =>
      console.log("listening on port", PORT || 5000)
    );
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
