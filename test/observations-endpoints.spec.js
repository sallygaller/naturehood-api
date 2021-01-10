const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");

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

  context("Given there are observations in the database", () => {
    const testObservations = [
      {
        id: 1,
        species: "Robin",
        type: "Bird",
        date: "2020-12-25T08:00:00.000Z",
        time: "08:30:00",
        description: "I saw a robin at my feeder",
        lat: 45.593,
        lng: -122.755,
        date_added: "2020-12-25T09:28:32.615Z",
      },
      {
        id: 2,
        species: "Fox",
        type: "Mammal",
        date: "2020-12-15T08:00:00.000Z",
        time: "04:30:00",
        description:
          "I saw a mother fox and her cubs. The mother hissed at me.",
        lat: 47.593,
        lng: -122.755,
        date_added: "2020-12-15T16:28:32.615Z",
      },
      {
        id: 3,
        species: "Raccoon",
        type: "Mammal",
        date: "2020-12-05T08:00:00.000Z",
        time: "23:30:00",
        description: "A group of raccoons chased me down the street.",
        lat: 49.593,
        lng: -122.755,
        date_added: "2020-12-06T09:28:32.615Z",
      },
      {
        id: 4,
        species: "Skunk",
        type: "Mammal",
        date: "2020-12-08T08:00:00.000Z",
        time: "07:30:00",
        description: "I saw a skunk under my deck.",
        lat: 51.593,
        lng: -123.755,
        date_added: "2020-12-08T10:15:32.615Z",
      },
    ];

    beforeEach("insert observations", () => {
      return db.into("observations").insert(testObservations);
    });

    it("GET /observations returns with 200 and all the observations", () => {
      return supertest(app).get("/observations").expect(200, testObservations);
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
