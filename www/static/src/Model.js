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
    }

    var p = Model.prototype;

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