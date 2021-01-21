const knex = require("knex");
const jwt = require("jsonwebtoken");
const app = require("../src/app");

const { makeObservationsArray } = require("./observations.fixtures");
const { makeUsersArray } = require("./users.fixtures");

describe("Auth endpoints", function () {
  let db;

  const testUsers = makeUsersArray();
  const testUser = testUsers[0];

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

  describe(`POST /api/auth/login`, () => {
    beforeEach("insert users", () => {
      return db.into("naturehood_users").insert(testUsers);
    });

    const requiredFields = ["email", "password"];

    requiredFields.forEach((field) => {
      const loginAttemptBody = {
        email: testUser.email,
        password: testUser.password,
      };

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete loginAttemptBody[field];

        return supertest(app)
          .post("/api/auth/login")
          .send(loginAttemptBody)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          });
      });
    });

    it(`responds 400 'invalid email or password' when bad email address`, () => {
      const userInvalidUser = { email: "nope", password: "secret" };
      return supertest(app)
        .post("/api/auth/login")
        .send(userInvalidUser)
        .expect(400, { error: `Incorrect email or password` });
    });

    it(`responds 400 'invalid email or password' when bad password`, () => {
      const userInvalidPass = {
        email: testUser.email,
        password: "nah",
      };
      return supertest(app)
        .post("/api/auth/login")
        .send(userInvalidPass)
        .expect(400, { error: `Incorrect email or password` });
    });

    it(`responds 200 and JWT auth token using secret when valid credentials`, () => {
      const userValidCreds = {
        email: testUser.email,
        password: testUser.password,
      };
      const expectedToken = jwt.sign(
        { user_id: testUser.id }, // payload
        process.env.JWT_SECRET,
        {
          subject: testUser.email,
          expiresIn: process.env.JWT_EXPIRY,
          algorithm: "HS256",
        }
      );
      console.log(expectedToken);
      return supertest(app)
        .post("/api/auth/login")
        .send(userValidCreds)
        .expect(200, {
          authToken: expectedToken,
        });
    });
  });
});
