const path = require("path");
const express = require("express");
const xss = require("xss");
const ObservationsService = require("./observations-service");
const { requireAuth } = require("../middleware/jwt-auth");

const observationsRouter = express.Router();
const jsonParser = express.json();

const serializeObservation = (observation) => ({
  id: observation.id,
  species: xss(observation.species),
  type: observation.type,
  date: observation.date,
  time: observation.time,
  description: xss(observation.description),
  lat: observation.lat,
  lng: observation.lng,
  date_added: observation.date_added,
  neighbor: observation.neighbor,
});

observationsRouter
  .route("/")
  .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    ObservationsService.getAllObservations(knexInstance)
      .then((observations) => {
        res.json(observations.map(serializeObservation));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { species, type, date, time, description, lat, lng } = req.body;
    const neighbor = req.user.id;
    const newObservation = {
      species,
      type,
      date,
      time,
      description,
      lat,
      lng,
      neighbor,
    };
    for (const [key, value] of Object.entries(newObservation))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
    // newObservation.neighbor = req.user.id;
    ObservationsService.insertObservation(req.app.get("db"), newObservation)
      .then((observation) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${observation.id}`))
          .json(serializeObservation(observation));
      })
      .catch(next);
  });

observationsRouter
  .route("/user")
  .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    const id = req.user.id;
    ObservationsService.getUserObservations(knexInstance, id)
      .then((observations) => {
        res.json(observations.map(serializeObservation));
      })
      .catch(next);
  });

observationsRouter
  .route("/:observation_id")
  .all(requireAuth)
  .all((req, res, next) => {
    ObservationsService.getById(req.app.get("db"), req.params.observation_id)
      .then((observation) => {
        if (!observation) {
          return res.status(404).json({
            error: { message: `Observation doesn't exist` },
          });
        }
        res.observation = observation;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeObservation(res.observation));
  })
  .delete((req, res, next) => {
    ObservationsService.deleteObservation(
      req.app.get("db"),
      req.params.observation_id
    )
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { species, type, date, time, description, lat, lng } = req.body;
    const observationToUpdate = {
      species,
      type,
      date,
      time,
      description,
      lat,
      lng,
    };

    const numberOfValues = Object.values(observationToUpdate).filter(Boolean)
      .length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body is missing a required field`,
        },
      });
    }

    ObservationsService.updateObservation(
      req.app.get("db"),
      req.params.observation_id,
      observationToUpdate
    )
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = observationsRouter;
