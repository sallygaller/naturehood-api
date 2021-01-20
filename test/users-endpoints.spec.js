const knex = require("knex");
const app = require("../src/app");
const { makeObservationsArray } = require("./observations.fixtures");
const { makeUsersArray } = require("./users.fixtures");

describe.only("Users Endpoints", function () {
  let db;

  const testUsers = makeUsersArray();
  const testUser = testUsers[0];
  const testObservations = makeObservationsArray();

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

  describe(`POST /api/users`, () => {
    context(`User Validation`, () => {
      beforeEach("insert observations and users", () => {
        return db.into("naturehood_users").insert(testUsers);
      });
      const requiredFields = ["fullname", "password", "email", "zipcode"];

      requiredFields.forEach((field) => {
        const registerAttemptBody = {
          fullname: "test fullname",
          email: "test email",
          password: "test password",
          zipcode: "test zipcode",
        };

        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete registerAttemptBody[field];

          return supertest(app)
            .post("/api/users")
            .send(registerAttemptBody)
            .expect(400, {
              error: `Missing '${field}' in request body`,
            });
        });
      });

      it(`responds 400 'Password must be longer than 8 characters' when empty password`, () => {
        const userShortPassword = {
          fullname: "test fullname",
          password: "1234567",
          email: "test email",
          zipcode: "test zipcode",
        };
        return supertest(app)
          .post("/api/users")
          .send(userShortPassword)
          .expect(400, { error: `Password must be longer than 8 characters` });
      });

      it(`responds 400 'Password must be less than 72 characters' when long password`, () => {
        const userLongPassword = {
          fullname: "test fullname",
          password: "*".repeat(73),
          email: "test email",
          zipcode: "test zipcode",
        };
        return supertest(app)
          .post("/api/users")
          .send(userLongPassword)
          .expect(400, { error: `Password must be less than 72 characters` });
      });

      it(`responds 400 error when password starts with spaces`, () => {
        const userPasswordStartsSpaces = {
          fullname: "test fullname",
          password: " 1Aa!2Bb@",
          email: "test email",
          zipcode: "test zipcode",
        };
        return supertest(app)
          .post("/api/users")
          .send(userPasswordStartsSpaces)
          .expect(400, {
            error: `Password must not start or end with empty spaces`,
          });

        it(`responds 400 error when password ends with spaces`, () => {
          const userPasswordEndsSpaces = {
            fullname: "test fullname",
            password: "1Aa!2Bb@ ",
            email: "test email",
            zipcode: "test zipcode",
          };
          return supertest(app)
            .post("/api/users")
            .send(userPasswordEndsSpaces)
            .expect(400, {
              error: `Password must not start or end with empty spaces`,
            });

          it(`responds 400 error when password isn't complex enough`, () => {
            const userPasswordNotComplex = {
              fullname: "test fullname",
              password: "11AAaabb",
              email: "test email",
              zipcode: "test zipcode",
            };
            return supertest(app)
              .post("/api/users")
              .send(userPasswordNotComplex)
              .expect(400, {
                error: `Password must contain 1 upper case, lower case, number and special character`,
              });
          });
        });
      });
    });
    context(`Happy path`, () => {
      it(`responds 201, serialized user, storing bcryped password`, () => {
        const newUser = {
          fullname: "test fullname",
          password: "11AAaa!!",
          email: "test email",
          zipcode: "97203",
        };
        return supertest(app)
          .post("/api/users")
          .send(newUser)
          .expect(201)
          .expect((res) => {
            expect(res.body).to.have.property("id");
            expect(res.body.fullname).to.eql(newUser.fullname);
            expect(res.body.email).to.eql(newUser.email);
            expect(res.body.zipcode).to.eql(newUser.zipcode);
            expect(res.body).to.not.have.property("password");
            expect(res.headers.location).to.eql(`/api/users/${res.body.id}`);
            const expectedDate = new Date().toLocaleString("en", {
              timeZone: "UTC",
            });
            const actualDate = new Date(res.body.date_created).toLocaleString();
            expect(actualDate).to.eql(expectedDate);
          })
          .expect((res) =>
            db
              .from("naturehood_users")
              .select("*")
              .where({ id: res.body.id })
              .first()
              .then((row) => {
                expect(row.fullname).to.eql(newUser.fullname);
                expect(row.email).to.eql(newUser.email);
                expect(row.zipcode).to.eql(newUser.zipcode);
                const expectedDate = new Date().toLocaleString("en", {
                  timeZone: "UTC",
                });
                const actualDate = new Date(row.date_created).toLocaleString();
                expect(actualDate).to.eql(expectedDate);
              })
          );
      });
    });
  });
});
