/**
 * Created by Nuno on 04/02/17.
 */
var nmm = nmm || {};
nmm.MapView = (function () {
    'use strict';

    var self;

    function MapView(controller) {
        self = this;
        this._controller = controller;
        this._icons = null;
        this._markers = [];
        this._setFailTimeout();
    }

    var p = MapView.prototype;

    p.toggleMarkerAnimation = function (markerId, isPreviousSelection) {
        var i,
            length = this._markers.length,
            mk;

        for (i = 0; i < length; i++) {
            if (this._markers[i].id === markerId) {
                mk = this._markers[i];
                break;
            }
        }

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
        var lat = parseFloat(mk.latitude),
            lng = parseFloat(mk.longitude);

        var marker = new google.maps.Marker({
            position: {
                lat: lat,
                lng: lng
            },
            map: this._map,
            id: mk.id,
            icon: this._icons[mk.type]
        });

        marker.addListener('click', function () {
            self._controller.markerClicked(marker);
        }, false);

        this._markers.push(marker);
    };

    p.createMarkers = function (markers, icons) {
        this._icons = icons;
        markers.forEach(function (mk) {
            this.addNewMarker(mk);
        }, this);
    };

    p.renderMap = function (initParams) {
        this._map = new google.maps.Map(document.getElementById('map'), {
            zoom: initParams.zoom,
            center: initParams
        });
        clearTimeout(this._failTimeout);
        this._controller.mapTaskEnd(true);

        google.maps.event.addListener(this._map, 'click', function (event) {
            self._controller.mapClicked(event.latLng.lat(), event.latLng.lng());
        });
    };

    p._setFailTimeout = function () {
        this._failTimeout = setTimeout(function () {
            self._controller.mapTaskEnd(false);
        }, 10000);
    };

    return MapView;
})();
