import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { subscribe } from "./subscriber.js";
import 'dotenv/config'

const app = express();
const port = process.env.PORT || 5050;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  next();
});

subscribe();

app.listen(port, () => {
  console.log("server running");
});
