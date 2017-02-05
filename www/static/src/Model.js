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

        //user params
        this.user_id = ko.observable();

        //app status
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
                        return 'Login to place markers';
                    }
                    break;
            }
        });

        //map parameters
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
                sharedBy: ko.observable(),
                sharerPic: ko.observable(),
                userFavourite: ko.observable()
            }
        };

        this.mapParams.currentMarker.userFavouriteButtonClass = ko.computed(function () {
            if (self.mapParams.currentMarker.userFavourite()) {
                return 'favourite';
            } else {
                return 'unfavourite';
            }
        });

        //favourites
        this.userFavs = [];

        //modal info
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

        this.aside = {
            asideClass: ko.observable('modal-out'),
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

        this.displayList = ko.computed(function () {
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
                self.mapParams.markers.forEach(function (mk) {
                    var display = self.aside.checks[mk.type]();

                    if (self.aside.checks.userOnly() && mk.user_id !== self.user_id()) {
                        display = false;
                    }

                    if (self.aside.checks.favOnly() && !self.checkIfUserFavourite(mk.id)) {
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

        $.ajax({
            url: url,
            dataType: 'json'
        })
            .done(function (result) {
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
                this.weather.warning("It wasn't possible to retrieve current weather conditions.")
            });
    };

    p.storeNewMarker = function (markerData) {
        //store in db
        var self = this;
        $.post("/add", markerData,
            function (data, status) {
                if (status === 'success') {
                    self.mapParams.markers.push(data.Marker);
                    self._controller.updateExistingMarkers(data.Marker);
                } else {
                    alert('Something went wrong while saving your marker.' +
                        ' Please reload the page and try again.')
                }
            });
    };

    p.evaluateInputData = function () {
        var m = this.modals.add;
        if (m.title() && m.description && m.type) {
            this.storeNewMarker({
                title: m.title(),
                latitude: m.latitude(),
                longitude: m.longitude(),
                type: m.type(),
                description: m.description()
            });
        } else {
            m.warning('Some info is missing.')
        }
    };

    p.resetAddMarkerModal = function () {
        this.modals.add.title('');
        this.modals.add.latitude('');
        this.modals.add.longitude('');
        this.modals.add.description('');
        this.modals.add.type('other');
        this.modals.add.warning('');
    };

    p.setCurrentMarker = function (markerId) {
        var i,
            length = this.mapParams.markers.length,
            mk,
            c = this.mapParams.currentMarker;

        for (i = 0; i < length; i++) {
            mk = this.mapParams.markers[i];
            if (mk.id === markerId) {
                c.id(mk.id);
                c.title(mk.title);
                c.type(mk.type);
                c.latitude(mk.latitude);
                c.longitude(mk.longitude);
                c.description(mk.description);
                c.sharedBy(mk.user_name);
                c.sharerPic(mk.user_pic);
                c.userFavourite(this.checkIfUserFavourite(markerId));
                break;
            }
        }
    };

    p.removeFavourite = function (markerToRemove) {
        var self = this;
        $.post("/unfav", {
                marker_id: markerToRemove
            },
            function (data, status) {
                if (status === 'success') {
                    var i,
                        length = self.userFavs.length;

                    for (i = 0; i < length; i++) {
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
        $.post("/fav", {
                marker_id: markerId
            },
            function (data, status) {
                if (status === 'success') {
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
            console.log(this.userFavs[i].marker_id, markerId);
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
            $.ajax({
                url: url,
                dataType: 'json'
            })
                .done(function (result) {
                    self.userFavs = result.Favourite;
                })
                .fail(function (error) {
                    alert("It wasn't possible to load your favourites. Please reload the page and try again.");
                });
        } else {
            this.userFavs = [];
        }
    };

    p.getDBMarkersList = function () {
        var self = this,
            url = '/markers/JSON/';
        $.ajax({
            url: url,
            dataType: 'json'
        })
            .done(function (result) {
                var data = result.Marker;
                self.mapParams.markers = data;
                self._controller.markersListLoadTaskEnd(true, data);
            })
            .fail(function (error) {
                self._controller.markersListLoadTaskEnd(false);
            });
    };

    return Model;
})();