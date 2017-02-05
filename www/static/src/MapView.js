/**
 * Created by Nuno on 04/02/17.
 */
var nmm = nmm || {};
nmm.MapView = (function () {
    'use strict';

    // This class manages map view.

    var self;

    function MapView(controller) {
        self = this;
        this._controller = controller;
        this._icons = null;
        this._markers = [];

        // Set a fail timeout, in case map doesnt load.
        this._setFailTimeout();
    }

    var p = MapView.prototype;

    p.toggleMarkerAnimation = function (markerId, isPreviousSelection) {
        var i,
            length = this._markers.length,
            mk;

        // Pick marker from markers array.
        for (i = 0; i < length; i++) {
            if (this._markers[i].id === markerId) {
                mk = this._markers[i];
                break;
            }
        }

        // Toggle animation.
        // If is stoped, bounce it.
        // If is bouncing, stop it.
        // If is previous selection (and not current) stop it anyway.
        if (mk) {
            if (!mk.getAnimation() && !isPreviousSelection) {
                mk.setAnimation(google.maps.Animation.BOUNCE);
            } else {
                mk.setAnimation(null);
            }
        }
    };

    p.displayMarkers = function (markers) {
        var i,
            j,
            lengthI = this._markers.length,
            lengthJ = markers.length,
            display;

        // Display only the markers on map with similar id to the ids
        // of markers passed
        // as argument.
        for (i = 0; i < lengthI; i++) {
            display = false;
            for (j = 0; j < lengthJ; j++) {
                if (this._markers[i].id === markers[j].id) {
                    display = true;
                    break;
                }
            }
            this._markers[i].setVisible(display);
        }
    };

    p.addNewMarker = function (mk) {
        // Get latitude and longitude from marker data.
        var lat = parseFloat(mk.latitude),
            lng = parseFloat(mk.longitude);

        // Create marker with latitude, longitude and id from marker
        // data passed as argument.
        var marker = new google.maps.Marker({
            position: {
                lat: lat,
                lng: lng
            },
            map: this._map,
            id: mk.id,
            icon: this._icons[mk.type]
        });

        // Add listener to marker to allow click.
        marker.addListener('click', function () {
            self._controller.markerClicked(marker);
        }, false);

        // Push marker to markers array.
        this._markers.push(marker);
    };

    p.createMarkers = function (markers, icons) {
        // Store icons to use in markers.
        this._icons = icons;

        // For each marker data passed, create it on map.
        markers.forEach(function (mk) {
            this.addNewMarker(mk);
        }, this);
    };

    p.renderMap = function (initParams) {
        // Instantiate new map with initial parameters passed by controller.
        this._map = new google.maps.Map(document.getElementById('map'), {
            zoom: initParams.zoom,
            center: initParams
        });

        // Clear fail timeout.
        clearTimeout(this._failTimeout);

        // Inform controller to proceed.
        this._controller.mapTaskEnd(true);

        // Add an event listener to map to allow click.
        // This will allow the addition of new markers.
        google.maps.event.addListener(this._map, 'click', function (event) {
            self._controller.mapClicked(event.latLng.lat(), event.latLng.lng());
        });
    };

    p._setFailTimeout = function () {
        //If map doesnt load in ten seconds, inform controller and user.
        this._failTimeout = setTimeout(function () {
            self._controller.mapTaskEnd(false);
        }, 10000);
    };

    return MapView;
})();
