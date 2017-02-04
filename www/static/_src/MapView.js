/**
 * Created by Nuno on 24/01/17.
 */

var nmm = nmm || {};

nmm.MapView = (function () {
    'use strict';

    function MapView(controller) {
        this._controller = controller;
        this._t1 = setTimeout(function () {
            this._controller.mapLoadingFailed();
        }.bind(this), 10000);

        this._markers = [];

        this._icons = this._controller.getMarkerIcons();

        this._init();
    }

    var p = MapView.prototype;

    p.getMarker = function (data) {
        var marker;
        this._markers.forEach(function (mk) {
            if(mk.key === data.id) {
                marker = mk;
            }
        });

        return marker;
    };

    p.toggleMarkerAnimation = function (marker) {
        if (!marker.getAnimation()) {
            marker.setAnimation(google.maps.Animation.BOUNCE);
        } else {
            marker.setAnimation(null);
        }
    };

    p._markerClick = function (marker) {
        this._controller.markerClicked(marker);
    };

    p.displayMarkers = function (markersToShow) {
        var fav = this._controller.getFavourites(),
            user_id = this._controller.getUserId();

        if(this._markers.length > 0) {
            this._markers.forEach(function (mk) {
                var userCreated = mk.user_id === user_id,
                    favourite = this._controller.checkIfUserFavourite(mk.key),
                    display = markersToShow[mk.type];


                if(markersToShow.userOnly && !userCreated) {
                    display = false;
                }

                if(markersToShow.favouritesOnly && !favourite) {
                    display = false;
                }

                mk.setVisible(display);
            }, this);
        }
    };

    p.addNewMarker = function (mk) {
        var lat = parseFloat(mk.latitude),
            lng = parseFloat(mk.longitude);

        var marker = new google.maps.Marker({
            position: {
                lat: lat,
                lng: lng
            },
            map: this.map,
            key: mk.id,
            type: mk.type,
            title: mk.title,
            user_id: mk.user_id,
            description: mk.description,
            icon: this._icons[mk.type]
        });

        var self = this;
        marker.addListener('click', function () {
            self._markerClickBound(marker);
        }, false);

        this._markers.push(marker);
    };

    p.launchMarkers = function (markers) {
        markers.forEach(function (mk) {
            this.addNewMarker(mk);
        }, this);
    };

    p.renderMap = function () {
        var porto = {lat: 41.1452347, lng: -8.6454186};
        this.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 14,
            center: porto
        });
        clearTimeout(this._t1);
        this._controller.mapReady();

        var self = this;
        google.maps.event.addListener(this.map, 'click', function (event) {
            self._controller.mapClicked(event.latLng.lat(), event.latLng.lng());
        });
    };

    p._init = function () {
        this._markerClickBound = this._markerClick.bind(this);
    };

    return MapView;
})();