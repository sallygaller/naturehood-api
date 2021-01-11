const ObservationsService = {
  getAllObservations(knex) {
    return knex.select("*").from("observations");
  },
  getById(knex, id) {
    return knex.from("observations").select("*").where("id", id).first();
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
};

module.exports = ObservationsService;