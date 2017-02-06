/**
 * Created by Nuno on 04/02/17.
 */
var nmm = nmm || {};
nmm.Model = (function () {
    'use strict';

    var self;

    function Model(controller) {
        self = this;
        this._controller = controller;

        // Observable to store user id.
        this.user_id = ko.observable();

        // Object to store observables related to app status.
        this.appStatus = {
            state: ko.observable(0)
        };
        this.appStatus.message = ko.computed(function () {
            switch (self.appStatus.state()) {
                case -1:
                    return "An error occurred and some content could not be loaded. Please check your Internet connection and reload the page!";

                case 0:
                    return 'Loading map';

                case 1:
                    return 'Loading markers';

                case 2:
                    if (self.user_id()) {
                        return 'Click to place a marker';
                    } else {
                        return 'Login to place markers / favourites';
                    }
                    break;
            }
        });

        //Object to store map parameters
        this.mapParams = {
            init: {
                city: 'Porto',
                lat: 41.1452347,
                lng: -8.6454186,
                zoom: 14
            },
            markerIcons: {
                monument: '/static/assets/icon_monument.png',
                museum: '/static/assets/icon_museum.png',
                hotel: '/static/assets/icon_hotel.png',
                restaurant: '/static/assets/icon_restaurant.png',
                coffee: '/static/assets/icon_coffee.png',
                other: '/static/assets/icon_other.png'
            },
            markers: [],
            currentMarker: {
                id: ko.observable(),
                title: ko.observable(),
                type: ko.observable(),
                latitude: ko.observable(),
                longitude: ko.observable(),
                description: ko.observable(),
                phone: ko.observable(),
                sharedBy: ko.observable(),
                sharerPic: ko.observable(),
                userFavourite: ko.observable()
            }
        };

        // Computed variable to store if user already favourited selected
        // marker or not.
        this.mapParams.currentMarker.userFavouriteButtonClass = ko.computed(function () {
            if (self.mapParams.currentMarker.userFavourite()) {
                return 'favourite';
            } else {
                return 'unfavourite';
            }
        });

        //favourites
        this.userFavs = [];

        // Object to store observables from modal window.
        this.modals = {
            modalClass: ko.observable('modal-out'),
            addOn: ko.observable(false),
            viewOn: ko.observable(false),
            add: {
                title: ko.observable(),
                latitude: ko.observable(),
                longitude: ko.observable(),
                description: ko.observable(),
                type: ko.observable('other'),
                warning: ko.observable()
            }
        };

        // Object to store observables to aside menu.
        this.aside = {
            asideClass: ko.observable('menu-out'),
            asideContent: ko.observable('checks'),
            checks: {
                monument: ko.observable(true),
                museum: ko.observable(true),
                hotel: ko.observable(true),
                restaurant: ko.observable(true),
                coffee: ko.observable(true),
                other: ko.observable(true),
                userOnly: ko.observable(false),
                favOnly: ko.observable(false)
            }
        };

        // Array of markers to display
        this.displayList = ko.computed(function () {
            // Calling diferent checks inside this function allows to update
            // display list everytime one of the checks change.
            self.aside.checks.monument();
            self.aside.checks.museum();
            self.aside.checks.hotel();
            self.aside.checks.restaurant();
            self.aside.checks.coffee();
            self.aside.checks.other();
            self.aside.checks.userOnly();
            self.aside.checks.monument();
            if (self.appStatus.state() < 2) {
                return self.mapParams.markers;
            } else {
                var list = [];
                // Loop through all markers.
                self.mapParams.markers.forEach(function (mk) {
                    // Display given marker if its type is checked.
                    var display = self.aside.checks[mk.type]();

                    if (self.aside.checks.userOnly() && mk.user_id !== self.user_id()) {
                        // If user checked to see only his shares
                        // and marker creator does not correspond to user,
                        // do not display it.
                        display = false;
                    }

                    if (self.aside.checks.favOnly() && !self.checkIfUserFavourite(mk.id)) {
                        // If user checked  to see only his favourites
                        // and marker is not a favourite,
                        // do not display it.
                        display = false;
                    }

                    if (display) {
                        list.push(mk);
                    }
                });
                self._controller.displayMarkers(list);
                return list;
            }
        });

        // Object to store weather data from open weather maps API.
        this.weather = {
            weather: ko.observable(),
            icon: ko.observable(),
            windSpeed: ko.observable(),
            humidity: ko.observable(),
            temp: ko.observable(),
            tempMax: ko.observable(),
            tempMin: ko.observable(),
            warning: ko.observable()
        };
    }

    var p = Model.prototype;

    p.getOpenWeather = function () {
        var url = 'http://api.openweathermap.org/data/2.5/weather?q=porto,pt&units=metric&appid=7c0c2602f161b260daf19fa64ac7974a';

        // Get open weather data.
        $.ajax({
            url: url,
            dataType: 'json'
        })
            .done(function (result) {
                // Store relevant data to display to user.
                self.weather.weather(result.weather[0].description);
                self.weather.icon('http://openweathermap.org/img/w/' + result.weather[0].icon + '.png');
                self.weather.windSpeed(result.wind.speed);
                self.weather.humidity(result.main.humidity);
                self.weather.temp(result.main.temp);
                self.weather.tempMax(result.main.temp_max);
                self.weather.tempMin(result.main.temp_min);
                self.weather.warning('');
            })
            .fail(function (error) {
                self.weather.warning("It wasn't possible to retrieve current weather conditions.")
            });
    };

    p.storeNewMarker = function (markerData) {
        // Store new marker in database
        var self = this;
        $.post("/add", markerData,
            function (data, status) {
                if (status === 'success') {
                    // Add marker data to markers array.
                    self.mapParams.markers.push(data.Marker);

                    // Inform controller that a new marker has been saved,
                    // to allow the update on map view.
                    self._controller.updateExistingMarkers(data.Marker);
                } else {
                    alert('Something went wrong while saving your marker.' +
                        ' Please reload the page and try again.')
                }
            });
    };

    p.evaluateInputData = function () {
        // Check if all necessary data has been provided by the user.
        var m = this.modals.add;
        if (m.title() && m.description && m.type) {
            // If all data has been provided, store  it.
            this.storeNewMarker({
                title: m.title(),
                latitude: m.latitude(),
                longitude: m.longitude(),
                type: m.type(),
                description: m.description()
            });
        } else {
            // If some data is missing, warn user.
            m.warning('Some info is missing.')
        }
    };

    p.resetAddMarkerModal = function () {
        // Erase all data from add marker modal window.
        this.modals.add.title('');
        this.modals.add.latitude('');
        this.modals.add.longitude('');
        this.modals.add.description('');
        this.modals.add.type('other');
        this.modals.add.warning('');
    };

    p.getMarkerAditionalInfo = function (latitude, longitude) {
        var url = 'https://api.foursquare.com/v2/venues/' +
            'search?ll=' + latitude + ',' + longitude +
            '&client_id=ZXTLOWD112CMOH4VNESAI4Q1HUUHJVDO4KXD3BA0WV543UZX' +
            '&client_secret=H4AW4BW24PKHEECLABTR5N30ELYF54IXZMKL3LEWI1K0HIFC&v=20170204';

        // Get open weather data.
        $.ajax({
            url: url,
            dataType: 'json'
        })
            .done(function (result) {
                // Store relevant data to display to user.
                var phone = result.response.venues[0].contact.formattedPhone || 'No phone available';
                self.mapParams.currentMarker.phone(phone);
            })
            .fail(function (error) {
                self.mapParams.currentMarker.phone('Error loading phone number');
            });
    };

    p.setCurrentMarker = function (markerId) {
        var i,
            length = this.mapParams.markers.length,
            mk,
            c = this.mapParams.currentMarker;

        // Loop through markers and identify the correct one.
        for (i = 0; i < length; i++) {
            mk = this.mapParams.markers[i];
            if (mk.id === markerId) {
                // Store marker info has current marker.
                c.id(mk.id);
                c.title(mk.title);
                c.type(mk.type);
                c.latitude(mk.latitude);
                c.longitude(mk.longitude);
                c.phone('-');
                c.description(mk.description);
                c.sharedBy(mk.user_name);
                c.sharerPic(mk.user_pic);
                c.userFavourite(this.checkIfUserFavourite(markerId));
                this.getMarkerAditionalInfo(mk.latitude, mk.longitude);
                break;
            }
        }
    };

    p.removeFavourite = function (markerToRemove) {
        var self = this;

        // Remove favourite from database
        $.post("/unfav", {
                marker_id: markerToRemove
            },
            function (data, status) {
                if (status === 'success') {
                    var i,
                        length = self.userFavs.length;

                    for (i = 0; i < length; i++) {
                        // Find favourite in favourites array and remove it.
                        if (self.userFavs[i].marker_id === markerToRemove) {
                            self.userFavs.splice(i, 1);
                            break;
                        }
                    }
                } else {
                    alert('Something went wrong while unfavouriting this marker.' +
                        ' Please reload the page and try again.')
                }
            });

    };

    p.storeFavourite = function (markerId) {
        var self = this;

        // Post new favourite in database from user input.
        $.post("/fav", {
                marker_id: markerId
            },
            function (data, status) {
                if (status === 'success') {
                    // Push new favourite to favourites array.
                    self.userFavs.push({
                        marker_id: markerId
                    });
                } else {
                    alert('Something went wrong while favouriting this marker.' +
                        ' Please reload the page and try again.')
                }
            });
    };

    p.checkIfUserFavourite = function (markerId) {
        var i,
            length = this.userFavs.length;

        for (i = 0; i < length; i++) {
            // Check if user has favourited this location.
            if (this.userFavs[i].marker_id === markerId) {
                return true;
            }
        }
        return false;
    };

    p.getUserFavourites = function (user_id) {
        if (user_id) {
            var self = this,
                url = '/favourites/' + user_id + '/JSON/';

            // Get user favourite locations from database.
            $.ajax({
                url: url,
                dataType: 'json'
            })
                .done(function (result) {
                    // Store user favourite locations.
                    self.userFavs = result.Favourite;
                })
                .fail(function (error) {
                    alert("It wasn't possible to load your favourites. " +
                        "Please reload the page and try again.");
                });
        } else {
            this.userFavs = [];
        }
    };

    p.getDBMarkersList = function () {
        var self = this,
            url = '/markers/JSON/';

        // Get markers data from database.
        $.ajax({
            url: url,
            dataType: 'json'
        })
            .done(function (result) {
                var data = result.Marker;
                // Store data.
                self.mapParams.markers = data;

                // Inform controller that markers data is available.
                self._controller.markersListLoadTaskEnd(true, data);
            })
            .fail(function (error) {
                // Inform controller that there was an error loading markers
                // data from database.
                self._controller.markersListLoadTaskEnd(false);
            });
    };

    return Model;
})();