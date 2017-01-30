/**
 * Created by Nuno on 24/01/17.
 */

var nmm = nmm || {};

nmm.ViewModel = (function () {
    'use strict';

    var LOADING_MARKERS_FAILED = -2,
        LOADING_MAP_FAILED = -1,
        LOADING_MAP = 0,
        LOADING_MARKERS = 1,
        FINISHED_LOADING = 2;

    function ViewModel() {
        this._appState = ko.observable(LOADING_MAP);
        this._model = new nmm.Model(this);
        this._mapView = new nmm.MapView(this);
        nmm.mapView = this._mapView;
        this.menuButtonClass = ko.observable('menu-in');
        this.asideClass = ko.observable('wrapper aside-out');
        this.asideContentOn = ko.observable('locals');
        this._user_id = ko.observable();

        this.messageToUser = ko.computed(function () {
            switch (this._appState()) {
                case LOADING_MAP:
                    return 'Loading map';

                case LOADING_MARKERS:
                    return 'Loading markers';

                case FINISHED_LOADING:
                    if (this._user_id()) {
                        return 'Click on map to place marker';
                    } else {
                        return 'Login to place new markers';
                    }

                case LOADING_MAP_FAILED:
                    return "An error occurred and the map can't be shown. Please check your Internet connection and reload the page!";

                case LOADING_MARKERS_FAILED:
                    return "An error occurred and the markers can't be shown. Please check your Internet connection and reload the page!";
            }
        }, this);

        this.checks = {
            monuments: ko.observable(true),
            museums: ko.observable(true),
            hotels: ko.observable(true),
            restaurants: ko.observable(true),
            coffee: ko.observable(true),
            others: ko.observable(true)
        };

        this.markers = ko.observableArray([]);

        this.addMarkerModal = {
            modalOn: ko.observable(false),
            modalClass: ko.observable('add-marker-content-area-out'),
            modalTitle: ko.observable(''),
            modalCoordinates: ko.observable(''),
            modalLatitude: ko.observable(''),
            modalLongitude: ko.observable(''),
            modalType: ko.observable('other'),
            modalDescription: ko.observable(''),
            warning: ko.observable('')
        };
    }

    var p = ViewModel.prototype;

    p.userIdUpdate = function (user_id) {
        this._user_id(user_id);
    };

    p.newMarkerSubmitted = function () {
        if (this.addMarkerModal.modalTitle() === '' || this.addMarkerModal.modalDescription() === '') {
            this.addMarkerModal.warning('Please insert all the information requested.');
        } else {
            this.addMarkerModal.warning('');

            var self = this;
            //store in db
            $.post("/add",
                {
                    title: self.addMarkerModal.modalTitle(),
                    latitude: self.addMarkerModal.modalLatitude(),
                    longitude: self.addMarkerModal.modalLongitude(),
                    type: self.addMarkerModal.modalType(),
                    description: self.addMarkerModal.modalDescription()
                },
                function (data, status) {
                    if (status === 'success') {
                        self._model.markers.push(data.Marker);
                        self._mapView.addNewMarker(data.Marker);
                    } else {
                        alert('Something went wrong while saving your marker.' +
                            ' Please reload the page and try again.')
                    }
                });

            this.resetAddMarkerModal();
        }
    };

    p.showAddMarkerModal = function (latitude, longitude) {
        this.addMarkerModal.modalOn(true);
        this.addMarkerModal.modalLatitude(latitude);
        this.addMarkerModal.modalLongitude(longitude);
        this.addMarkerModal.modalCoordinates('Lat: ' + latitude + ' — Lng: ' + longitude);

        var self = this;
        setTimeout(function () {
            self.addMarkerModal.modalClass('add-marker-content-area-in');
        }, 100);
    };

    p.resetAddMarkerModal = function () {
        this.addMarkerModal.modalOn(false);
        this.addMarkerModal.modalClass('add-marker-content-area-out');
        this.addMarkerModal.modalTitle('');
        this.addMarkerModal.modalCoordinates('');
        this.addMarkerModal.modalType('other');
        this.addMarkerModal.modalDescription('');
        this.addMarkerModal.warning('');
        this.addMarkerModal.modalLatitude('');
        this.addMarkerModal.modalLongitude('');
    };

    p.mapClicked = function (latitude, longitude) {
        if (this._user_id()) {
            this.showAddMarkerModal(latitude, longitude);
        }
    };

    p.markerClicked = function (marker) {
        if (this._model.params.currentMarker !== null) {
            this._mapView.toggleMarkerAnimation(this._model.params.currentMarker);
        }

        this._model.params.currentMarker = marker;
        this._mapView.toggleMarkerAnimation(marker);
    };

    p.getMarkerIcons = function () {
        return this._model.params.marker_icons;
    };

    p.markersLoadingFailed = function () {
        this._appState(LOADING_MARKERS_FAILED);
    };

    p.markersLoaded = function () {
        this._appState(FINISHED_LOADING);
        this._mapView.launchMarkers(this._model.markers);
    };

    p.mapReady = function () {
        this._appState(LOADING_MARKERS);
        this._model.getLocalsListFromDB();
    };

    p.mapLoadingFailed = function () {
        this._appState(LOADING_MAP_FAILED);
    };

    p.toggleContent = function (model, event) {
        var btnClicked = event.target.getAttribute('data-key');

        if (btnClicked === '0') {
            this.asideContentOn('locals');
        } else if (btnClicked === '1') {
            this.asideContentOn('list');
        } else if (btnClicked === '2') {
            this.asideContentOn('login');
        } else if (btnClicked === '3') {
            this.asideContentOn('weather');
        }
    };

    p.toggleAside = function () {
        this.menuButtonClass(this.menuButtonClass() === 'menu-in' ? 'menu-out' : 'menu-in');
        this.asideClass(this.asideClass() === 'wrapper aside-out' ? 'wrapper aside-in' : 'wrapper aside-out');
    };

    return ViewModel;
})();

nmm.vm = new nmm.ViewModel();
ko.applyBindings(nmm.vm);