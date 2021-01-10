const ObservationsService = {
  getAllObservations(knex) {
    return knex.select("*").from("observations");
  },
  getById(knex, id) {
    return knex.from("observations").select("*").where("id", id).first();
  },
};

module.exports = ObservationsService;
