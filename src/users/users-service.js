const UsersService = {
  getAllUsers(knex) {
    return knex.select("*").from("naturehood_users");
  },

  insertUser(knex, newUser) {
    return knex
      .insert(newUser)
      .into(naturehood_users)
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },

  getById(knex, id) {
    return knex.from("naturehood_users").select("*").where("id", id).first();
  },

  deleteUser(knex, id) {
    return knex("naturehood_users").where({ id }).delete();
  },

  updateUser(knex, id, newUserFields) {
    return knex("naturehood_users").where({ id }).update(newUserFields);
  },
};

module.exports = UsersService;
