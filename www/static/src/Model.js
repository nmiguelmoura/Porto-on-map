/**
 * Created by Nuno on 24/01/17.
 */

var nmm = nmm || {};

nmm.Model = (function () {
    'use strict';

    function Model(controller) {
        this._controller = controller;
        this.params = {
            marker_icons: {
                monument: '/static/assets/icon_monument.png',
                museum: '/static/assets/icon_museum.png',
                hotel: '/static/assets/icon_hotel.png',
                restaurant: '/static/assets/icon_restaurant.png',
                coffee: '/static/assets/icon_coffee.png',
                other: '/static/assets/icon_other.png'
            },
            currentMarker: null
        };

        this.userFavs = [];
    }

    var p = Model.prototype;

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

        console.log(nmm.user_id);
        console.log(this.userFavs);

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

    p.storeNewMarker = function (markerData) {
        //store in db
        var self = this;
        $.post("/add", markerData,
            function (data, status) {
                if (status === 'success') {
                    self.markers.push(data.Marker);
                    console.log(data.Marker);
                    self._controller.updateExistingMarkers(data.Marker);
                } else {
                    alert('Something went wrong while saving your marker.' +
                        ' Please reload the page and try again.')
                }
            });
    };

    p.getLocalsListFromDB = function () {
        var self = this,
            url = '/markers/JSON/';
        $.ajax({
            url: url,
            dataType: 'json'
        })
            .done(function (result) {
                var data = result.Marker;
                self.markers = data;
                self._controller.markersLoaded();
            })
            .fail(function (error) {
                self.markers = [];
                self._controller.mapLoadingFailed();
            });
    };

    return Model;
})();