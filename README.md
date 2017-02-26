# Get to know Porto

This app was built using Flask on back-end and Knockout.js, Google Maps API, Foursquare API and Open Weather Maps API on front-end. Users can check previously placed markers on a map of city of Porto and check description of each one.

Logged users can mark places as favourites and create new ones.
The login system uses third-party provides: Google and Facebook.

The project implements a JSON endpoint that serves user info, marker location data and user favourites.

## Run code
The project is configured to run in a Virtualbox VM with Ubuntu, using Vagrant. All the necessary tools, like python, flask and sqlalchemy, oauth2client, requests, httplib2, are already installed in the VM.

To run the code:
- Install [Virtualbox](https://www.virtualbox.org/);

- Install [Vagrant](https://www.vagrantup.com/);

- Fork and clone this repository to your system.

- Through command line, navigate to the project folder and run the code:
`$ vagrant up`

- After that, run:
`$ vagrant ssh`

- Navigate to shared folder vagrant:
`$ cd /vagrant`

- Navigate to folder www:
`$ cd /www`

- Configure database:
`$ python database_setup.py`

- Populate database:
`$ python populate_database.py`

- Run the file project.py:
`$ python project.py`

- Test in your browser in port 5000:
`localhost:5000/`