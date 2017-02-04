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
                    if(self.user_id()) {
                        return 'Click to place a marker';
                    } else {
                        return 'Login to place markers';
                    }
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
                sharerPic: ko.observable()
            }
        };

        //favourites
        this.userFavs = [];

        //modal info
        this.modals = {
            modalClass: ko.observable('modal-out'),
            addOn: ko.observable(false),
            viewOn: ko.observable(false)
        };
    }

    var p = Model.prototype;

    p.setCurrentMarker = function (markerId) {
        var i,
            length = this.mapParams.markers.length,
            mk,
            c = this.mapParams.currentMarker;

        for(i = 0; i < length; i++) {
            mk = this.mapParams.markers[i];
            if(mk.id === markerId) {
                c.id(mk.id);
                c.title(mk.title);
                c.type(mk.type);
                c.latitude(mk.latitude);
                c.longitude(mk.longitude);
                c.description(mk.description);
                c.sharedBy(mk.user_name);
                c.sharerPic(mk.user_pic);
                break;
            }
        }
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