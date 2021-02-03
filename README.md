# natureHood API

View natureHood [here](https://naturehood-app.vercel.app/).

View the client repo [here](https://github.com/sallygaller/naturehood).

natureHood is an app designed to foster community and wildlife advocacy in local neighborhoods. Users can record wildlife observations in their locale (e.g. species, time spotted, approximate location, and photo) and view wildlife spotted by their neighbors. The intention of the app is to build community, provide insight into wildlife population and migratory behaviors, and encourage local conservation efforts.

This REST API allows users to:
- Register and log in
- View, create, delete, and edit their observations
- View observations in their neighborhood

## Technology Used
- JavaScript
- Node
- PostgreSQL
- Express
- Knex
- Chai
- Mocha
- Supertest

## Endpoints
### /api/user
| Endpoint        | Body           | Result  |
| ------------- |-------------| ----- |
| `POST /api/user` | Name, email, password, latitude and longitude of user's neighbood (calculated upon registration via Google Maps Geocoder). | Creates a new user, directs them to Login page. |

### /api/auth
| Endpoint        | Body           | Result  |
| ------------- |-------------| ----- |
| `POST /api/auth/login` | Email, password. |Returns a bearer token, and the latitude and longitude of user's neighborhood. |
| `POST /api/auth/refresh` | Bearer token. | Returns a refreshed auth token. |

### /api/observations
| Endpoint        | Body           | Result  |
| ------------- |-------------| ----- |
| `GET /api/observations` | Bearer token. | Returns all observations in the user's neighborhood |
| `GET /api/observations/user` | Bearer token. | Returns all of the user's observations. |
| `POST /api/observations` | Species, species type, observation description, time of sighting, date of sighting, latitude and longitude of sighting, auth token | Returns the newly created observation. |
| `GET /api/observations/:id` | Bearer token | Returns observation details of the submitted id. |
| `PATCH /api/observations/:id` | At least one of the following: Species, species type, observation description, time of sighting, date of sighting, latitude and longitude of sighting; and bearer token. | Returns the updated observation. |
| `DELETE /api/observations/:id` | Bearer token. | Deletes observation with the submitted id. | 