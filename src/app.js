require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const { CLIENT_ORIGIN } = require("./config");
const ObservationsService = require("./observations/observations-service");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.get("/observations", (req, res, next) => {
  const knexInstance = req.app.get("db");
  ObservationsService.getAllObservations(knexInstance)
    .then((observations) => {
      res.json(observations);
    })
    .catch(next);
});

app.get("/observations/:observation_id", (req, res, next) => {
  const knexInstance = req.app.get("db");
  ObservationsService.getById(knexInstance, req.params.observation_id)
    .then((observation) => {
      res.json(observation);
    })
    .catch(next);
});

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.use(
  cors({
    origin: CLIENT_ORIGIN,
  })
);

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
