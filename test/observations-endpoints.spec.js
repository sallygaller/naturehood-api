const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const { makeObservationsArray } = require("./observations.fixtures");

describe("Observations Endpoints", function () {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("clean the table", () => db("observations").truncate());

  afterEach("cleanup", () => db("observations").truncate());

  describe("GET /observations", () => {
    context("Given no observations", () => {
      it("responds with 200 and an empty list", () => {
        return supertest(app).get("/observations").expect(200, []);
      });
    });

    context("Given there are observations in the database", () => {
      const testObservations = makeObservationsArray();

      beforeEach("insert observations", () => {
        return db.into("observations").insert(testObservations);
      });

      it("GET /observations responds with 200 and all the observations", () => {
        return supertest(app)
          .get("/observations")
          .expect(200, testObservations);
      });
    });
  });

  describe("GET /observations/:observation_id", () => {
    context("Given no observations", () => {
      it("responds with 404", () => {
        const observationId = 123456;
        return supertest(app)
          .get(`/observations/${observationId}`)
          .expect(404, { error: { message: `Observation doesn't exist` } });
      });
    });

    context("Given there are observations in the database", () => {
      const testObservations = makeObservationsArray();

      beforeEach("insert observations", () => {
        return db.into("observations").insert(testObservations);
      });

      it("GET /observations/:observation_id responds with 200 and the specified observation", () => {
        const observationId = 2;
        const expectedObservation = testObservations[observationId - 1];
        return supertest(app)
          .get(`/observations/${observationId}`)
          .expect(200, expectedObservation);
      });
    });
  });

  describe(`POST /observations`, () => {
    it(`Creates an observation, responding with 201 and the new observation`, () => {
      this.retries(3);
      const newObservation = {
        species: "Flicker",
        type: "Bird",
        date: "2021-01-08T08:00:00.000Z",
        time: "07:30:00",
        description: "Two flickers at my feeder this morning",
        lat: 51.593,
        lng: -123.755,
      };
      return supertest(app)
        .post("/observations")
        .send(newObservation)
        .expect(201)
        .expect((res) => {
          expect(res.body.species).to.eql(newObservation.species);
          expect(res.body.type).to.eql(newObservation.type);
          expect(res.body.date).to.eql(newObservation.date);
          expect(res.body.time).to.eql(newObservation.time);
          expect(res.body.description).to.eql(newObservation.description);
          expect(res.body.lat).to.eql(newObservation.lat);
          expect(res.body.lng).to.eql(newObservation.lng);
          expect(res.body).to.have.property("id");
          expect(res.headers.location).to.eql(`/observations/${res.body.id}`);
          const expected = new Date().toLocaleString();
          const actual = new Date(res.body.date_added).toLocaleString();
          expect(actual).to.eql(expected);
        })
        .then((postRes) =>
          supertest(app)
            .get(`/observations/${postRes.body.id}`)
            .expect(postRes.body)
        );
    });
  });
});
