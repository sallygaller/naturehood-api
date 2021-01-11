function makeObservationsArray() {
  return [
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
      description: "I saw a mother fox and her cubs. The mother hissed at me.",
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
}

module.exports = { makeObservationsArray };
