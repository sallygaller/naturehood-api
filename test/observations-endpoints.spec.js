const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");

const { makeObservationsArray } = require("./observations.fixtures");
const { makeUsersArray } = require("./users.fixtures");

describe("Observations Endpoints", function () {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("clean the table", () =>
    db.raw("TRUNCATE observations, naturehood_users RESTART IDENTITY CASCADE")
  );

  afterEach("cleanup", () =>
    db.raw("TRUNCATE observations, naturehood_users RESTART IDENTITY CASCADE")
  );

  describe("GET /api/observations", () => {
    context("Given no observations", () => {
      it("responds with 200 and an empty list", () => {
        return supertest(app).get("/api/observations").expect(200, []);
      });
    });

    context("Given there are observations in the database", () => {
      const testUsers = makeUsersArray();
      const testObservations = makeObservationsArray();

      beforeEach("insert observations", () => {
        return db
          .into("naturehood_users")
          .insert(testUsers)
          .then(() => {
            return db.into("observations").insert(testObservations);
          });
      });

      it("GET /api/observations responds with 200 and all the observations", () => {
        return supertest(app)
          .get("/api/observations")
          .expect(200, testObservations);
      });
    });
  });

  describe("GET /api/observations/:observation_id", () => {
    context("Given no observations", () => {
      it("responds with 404", () => {
        const observationId = 123456;
        return supertest(app)
          .get(`/api/observations/${observationId}`)
          .expect(404, { error: { message: `Observation doesn't exist` } });
      });
    });

    context("Given there are observations in the database", () => {
      const testObservations = makeObservationsArray();
      const testUsers = makeUsersArray();

      beforeEach("insert observations", () => {
        return db
          .into("naturehood_users")
          .insert(testUsers)
          .then(() => {
            return db.into("observations").insert(testObservations);
          });
      });

      it("GET /api/observations/:observation_id responds with 200 and the specified observation", () => {
        const observationId = 2;
        const expectedObservation = testObservations[observationId - 1];
        return supertest(app)
          .get(`/api/observations/${observationId}`)
          .expect(200, expectedObservation);
      });
    });

    context("Given an XSS attack observation", () => {
      const maliciousObservation = {
        id: 911,
        species: 'Something bad <script>alert("xss");</script>',
        type: "Bird",
        date: "2021-01-08T08:00:00.000Z",
        time: "07:30:00",
        description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        lat: 51.593,
        lng: -123.755,
      };

      beforeEach("insert malicious observation", () => {
        return db.into("observations").insert([maliciousObservation]);
      });

      it("removes XSS attact content", () => {
        return supertest(app)
          .get(`/api/observations/${maliciousObservation.id}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.species).to.eql(
              'Something bad &lt;script&gt;alert("xss");&lt;/script&gt;'
            );
            expect(res.body.description).to.eql(
              `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
            );
          });
      });
    });
  });

  describe("POST /api/observations", () => {
    it("Creates an observation, responding with 201 and the new observation", () => {
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
        .post("/api/observations")
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
          expect(res.headers.location).to.eql(
            `/api/observations/${res.body.id}`
          );
          const expected = new Date().toLocaleString();
          const actual = new Date(res.body.date_added).toLocaleString();
          expect(actual).to.eql(expected);
        })
        .then((postRes) =>
          supertest(app)
            .get(`/api/observations/${postRes.body.id}`)
            .expect(postRes.body)
        );
    });

    const requiredFields = [
      "species",
      "type",
      "description",
      "date",
      "time",
      "lat",
      "lng",
    ];

    requiredFields.forEach((field) => {
      const newObservation = {
        species: "Flicker",
        type: "Bird",
        date: "2021-01-08T08:00:00.000Z",
        time: "07:30:00",
        description: "Two flickers at my feeder this morning",
        lat: 51.593,
        lng: -123.755,
      };

      it(`responds with 400 and an error message when the ${field} is missing`, () => {
        delete newObservation[field];
        return supertest(app)
          .post("/api/observations")
          .send(newObservation)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` },
          });
      });
    });
  });

  describe("DELETE /api/observations/:observation_id", () => {
    context("Given no observations", () => {
      it("responds with 404", () => {
        const observationId = 123456;
        return supertest(app)
          .delete(`/api/observations/${observationId}`)
          .expect(404, { error: { message: `Observation doesn't exist` } });
      });
    });

    context("Give there are observations in the database", () => {
      const testObservations = makeObservationsArray();
      const testUsers = makeUsersArray();

      beforeEach("insert observations", () => {
        return db
          .into("naturehood_users")
          .insert(testUsers)
          .then(() => {
            return db.into("observations").insert(testObservations);
          });
      });

      it("responds with 204 and removes the observation", () => {
        const idToRemove = 2;
        const expectedObservations = testObservations.filter(
          (observation) => observation.id !== idToRemove
        );
        return supertest(app)
          .delete(`/api/observations/${idToRemove}`)
          .expect(204)
          .then((res) =>
            supertest(app).get("/api/observations").expect(expectedObservations)
          );
      });
    });
  });

  describe(`PATCH /api/observations/:observation_id`, () => {
    context(`Given no observations`, () => {
      it(`responds with 404`, () => {
        const observationId = 123456;
        return supertest(app)
          .patch(`/api/observations/${observationId}`)
          .expect(404, { error: { message: `Observation doesn't exist` } });
      });
    });

    context(`Given there are observations in the database`, () => {
      const testObservations = makeObservationsArray();
      const testUsers = makeUsersArray();

      beforeEach("insert observations", () => {
        return db
          .into("naturehood_users")
          .insert(testUsers)
          .then(() => {
            return db.into("observations").insert(testObservations);
          });
      });

      it("responds with 204 and updates the observation", () => {
        const idToUpdate = 2;
        const updatedObservation = {
          species: "Fox",
          type: "Mammal",
          date: "2021-01-08T08:00:00.000Z",
          time: "07:30:00",
          description:
            "I saw a mother fox and her cubs. The mother hissed at me.",
          lat: 51.593,
          lng: -123.755,
        };
        const expectedObservation = {
          ...testObservations[idToUpdate - 1],
          ...updatedObservation,
        };
        return supertest(app)
          .patch(`/api/observations/${idToUpdate}`)
          .send(updatedObservation)
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/observations/${idToUpdate}`)
              .expect(expectedObservation)
          );
      });

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2;
        return supertest(app)
          .patch(`/api/observations/${idToUpdate}`)
          .send({ randomField: "foo" })
          .expect(400, {
            error: {
              message: `Request body is missing a required field`,
            },
          });
      });

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2;
        const updatedObservation = {
          species: "Skunk",
        };
        const expectedObservation = {
          ...testObservations[idToUpdate - 1],
          ...updatedObservation,
        };

        return supertest(app)
          .patch(`/api/observations/${idToUpdate}`)
          .send({
            ...updatedObservation,
            fieldToIgnore: "should not be in GET response",
          })
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/observations/${idToUpdate}`)
              .expect(expectedObservation)
          );
      });
    });
  });
});
