const express = require("express");
const xss = require("xss");
const ObservationsService = require("./observations-service");

const observationsRouter = express.Router();
const jsonParser = express.json();

observationsRouter
  .route("/")
  .get((req, res, next) => {
    ObservationsService.getAllObservations(req.app.get("db"))
      .then((observations) => {
        res.json(observations);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { species, type, date, time, description, lat, lng } = req.body;
    const newObservation = { species, type, date, time, description, lat, lng };

    for (const [key, value] of Object.entries(newObservation)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }

    ObservationsService.insertObservation(req.app.get("db"), newObservation)
      .then((observation) => {
        res
          .status(201)
          .location(`/observations/${observation.id}`)
          .json(observation);
      })
      .catch(next);
  });

observationsRouter
  .route("/:observation_id")
  .all((req, res, next) => {
    ObservationsService.getById(req.app.get("db"), req.params.observation_id)
      .then((observation) => {
        if (!observation) {
          return res
            .status(404)
            .json({ error: { message: `Observation doesn't exist` } });
        }
        res.observation = observation;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json({
      id: observation.id,
      species: xss(observation.species),
      type: observation.type,
      date: observation.date,
      time: observation.time,
      description: xss(observation.description),
      lat: observation.lat,
      lng: observation.lng,
      date_added: observation.date_added,
    });
  })
  .delete((req, res, next) => {
    ObservationsService.deleteObservation(
      req.app.get("db"),
      req.params.observation_id
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = observationsRouter;
