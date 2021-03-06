const ObservationsService = {
  getAllObservations(knex) {
    return knex.select("*").from("observations");
  },
  getById(knex, id) {
    return knex.from("observations").select("*").where("id", id).first();
  },
  getUserObservations(knex, id) {
    return knex.from("observations").select("*").where("neighbor", id);
  },
  insertObservation(knex, newObservation) {
    return knex
      .insert(newObservation)
      .into("observations")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  deleteObservation(knex, id) {
    return knex("observations").where({ id }).delete();
  },
  updateObservation(knex, id, newObservationFields) {
    return knex("observations").where({ id }).update(newObservationFields);
  },
};

module.exports = ObservationsService;
