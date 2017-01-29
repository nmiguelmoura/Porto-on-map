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
            title: mk.title,
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
            console.log('lat: ' + event.latLng.lat());
            console.log('long: ' + event.latLng.lng());
            self.addNewMarker(event.latLng);
        });
    };

    p._init = function () {
        this._markerClickBound = this._markerClick.bind(this);
    };

    return MapView;
})();