const express = require("express");
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

observationsRouter.route("/:observation_id").get((req, res, next) => {
  const knexInstance = req.app.get("db");
  ObservationsService.getById(knexInstance, req.params.observation_id)
    .then((observation) => {
      if (!observation) {
        return res.status(404).json({
          error: { message: `Observation doesn't exist` },
        });
      }
      res.json(observation);
    })
    .catch(next);
});

module.exports = observationsRouter;
