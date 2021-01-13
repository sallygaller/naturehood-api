function makeUsersArray() {
  return [
    {
      id: 1,
      date_created: "2029-01-22T16:28:32.615Z",
      fullname: "Sam Skunk",
      email: "sam.skunk@madeup.com",
      password: "secret",
      zipcode: 97217,
    },
    {
      id: 2,
      date_created: "2100-05-24T16:28:32.615Z",
      fullname: "Bob Fox",
      email: "bob.fox@madeup.com",
      password: "secret",
      zipcode: 97218,
    },
    {
      id: 3,
      date_created: "2100-03-22T16:28:32.615Z",
      fullname: "Clare Raccoon",
      email: "clare.raccoon@madeup.com",
      password: "secret",
      zipcode: 97203,
    },
  ];
}

module.exports = {
  makeUsersArray,
};
