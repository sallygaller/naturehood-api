const knex = require("knex");
const app = require("../src/app");
const jwt = require("jsonwebtoken");

const { makeObservationsArray } = require("./observations.fixtures");
const { makeUsersArray } = require("./users.fixtures");

describe("Protected endpoints", function () {
  let db;

  const testUsers = makeUsersArray();
  const testUser = testUsers[0];
  const testObservations = makeObservationsArray();

  function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
      subject: user.email,
      algorithm: "HS256",
    });
    return `Bearer ${token}`;
  }

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

  beforeEach("insert observations and users", () => {
    return db
      .into("naturehood_users")
      .insert(testUsers)
      .then(() => {
        return db.into("observations").insert(testObservations);
      });
  });

  const protectedEndpoints = [
    {
      name: "GET /api/observations/:observation_id",
      path: "/api/observations/1",
      method: supertest(app).get,
    },
    {
      name: "POST /api/observations",
      path: "/api/observations",
      method: supertest(app).post,
    },
  ];

  protectedEndpoints.forEach((endpoint) => {
    describe(endpoint.name, () => {
      it(`responds 401 'Missing bearer token' when no bearer token`, () => {
        return endpoint
          .method(endpoint.path)
          .expect(401, { error: `Missing bearer token` });
      });

      it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
        const validUser = testUsers[0];
        const invalidSecret = "bad-secret";
        return endpoint
          .method(endpoint.path)
          .set("Authorization", makeAuthHeader(validUser, invalidSecret))
          .expect(401, { error: `Unauthorized request` });
      });

      it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
        const invalidUser = { email: "non-email", id: 1 };
        return endpoint
          .method(endpoint.path)
          .set("Authorization", makeAuthHeader(invalidUser))
          .expect(401, { error: `Unauthorized request` });
      });
    });
  });
});
