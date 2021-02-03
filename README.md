# natureHood API

View natureHood [here](https://naturehood-app.vercel.app/).

View the client repo [here](https://github.com/sallygaller/naturehood).

natureHood is an app designed to foster community and wildlife advocacy in local neighborhoods. Users can record wildlife observations in their locale (e.g. species, time spotted, approximate location, and photo) and view wildlife spotted by their neighbors. The intention of the app is to build community, provide insight into wildlife population and migratory behaviors, and encourage local conservation efforts.

This REST API allows users to:
- Register and log in
- Create, delete, and edit observations
- View observations in their neighborhood

## Endpoints
### /api/user
`POST /api/user`
Body: Name, email, password, latitude and longitude of user's neighbood (calculated upon registration via Google Maps Geocoder)
Result: Creates a new user, directs them to Login page. 

### /api/auth
`POST /api/auth/login`
Body: Email, password
Result: Returns an auth token, and the latitude and longitude of user's neighborhood. 

`POST /api/auth/refresh`
Body: Auth token
Result: Returns a refreshed auth token

### /api/observations
`GET /api/observations`
Body: Auth token
Result: Returns all observations in the user's neighborhood

`POST /api/observations`
Body: Species, species type, observation description, time of sighting, date of sighting, latitude and longitude of sighting, auth token
Result: Returns the newly created observation (JSON).

`GET /api/observations/user`
Body: Auth token
Result: Returns all of the user's observations 

`GET /api/observations/:id`
Body: Auth token
Result: Returns observation details of the submitted id (JSON).

`PATCH /api/observations/:id`
Body (at least one of the following): Species, species type, observation description, time of sighting, date of sighting, latitude and longitude of sighting; and auth token.
Result: Returns the updated observatino (JSON).

`DELETE /api/observations/:id`
Body: Auth token
Result: Deletes observation with the submitted id. 