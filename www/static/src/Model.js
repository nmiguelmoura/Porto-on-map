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
                    return 'Login to place markers';

                case 3:
                    return 'Click to place marker';
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
            }
        };
    }

    var p = Model.prototype;

    p.getDBMarkersList = function () {
        var self = this,
            url = '/markers/JSON/';
        $.ajax({
            url: url,
            dataType: 'json'
        })
            .done(function (result) {
                var data = result.Marker;
                self.markers = data;
                self._controller.markersListLoadTaskEnd(true, data);
            })
            .fail(function (error) {
                self.markers = [];
                self._controller.markersListLoadTaskEnd(false);
            });
    };

    return Model;
})();