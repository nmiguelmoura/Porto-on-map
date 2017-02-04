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
        FINISHED_LOADING = 2, self;

    function ViewModel() {
        self = this;
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
            monument: ko.observable(true),
            museum: ko.observable(true),
            hotel: ko.observable(true),
            restaurant: ko.observable(true),
            coffee: ko.observable(true),
            other: ko.observable(true),
            userOnly: ko.observable(false),
            favouritesOnly: ko.observable(false)
        };

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

        this.descriptionModal = {
            modalMarkerKey: ko.observable(),
            modalOn: ko.observable(false),
            modalClass: ko.observable('description-content-area-out'),
            modalTitle: ko.observable(''),
            modalType: ko.observable(''),
            modalCoordinates: ko.observable(''),
            modalDescription: ko.observable(''),
            modalFav: ko.observable()
        };

        this.descriptionModal.modalFavClass = ko.computed(function () {
            if (self.descriptionModal.modalFav()) {
                return 'button-favourite';
            } else {
                return 'button-unfavourite';
            }
        });
    }

    var p = ViewModel.prototype;

    p.checkIfUserFavourite = function (marker_id) {
        return this._model.checkIfUserFavourite(marker_id)
    };

    p.getUserId = function () {
        return this._user_id();
    };

    p.getFavourites = function () {
        return this._model.userFavs;
    };

    p.toggleUserFavourite = function () {
        if (this._user_id) {
            var newFavState = !this.descriptionModal.modalFav();
            this.descriptionModal.modalFav(newFavState);

            if (newFavState) {
                this._model.storeFavourite(this.descriptionModal.modalMarkerKey());
            } else {
                this._model.removeFavourite(this.descriptionModal.modalMarkerKey());
            }
        }
    };

    p.listClicked = function (object, event) {
        var marker = self._mapView.getMarker(object);
        if (marker) {
            self.markerClicked(marker);
        }
    };

    p.updateExistingMarkers = function (marker) {
        this._mapView.addNewMarker(marker);
    };

    p.newMarkerSubmitted = function () {
        if (this.addMarkerModal.modalTitle() === '' || this.addMarkerModal.modalDescription() === '') {
            this.addMarkerModal.warning('Please insert all the information requested.');
        } else {
            this.addMarkerModal.warning('');

            var storedMarker = this._model.storeNewMarker({
                title: this.addMarkerModal.modalTitle(),
                latitude: this.addMarkerModal.modalLatitude(),
                longitude: this.addMarkerModal.modalLongitude(),
                type: this.addMarkerModal.modalType(),
                description: this.addMarkerModal.modalDescription()
            });

            this.resetAddMarkerModal();
        }
    };

    p.showDescriptionModal = function () {
        var marker = this._model.params.currentMarker;
        this.descriptionModal.modalMarkerKey(marker.key);
        this.descriptionModal.modalOn(true);
        this.descriptionModal.modalTitle(marker.title);
        this.descriptionModal.modalType(marker.type);
        this.descriptionModal.modalCoordinates('Lat: ' + marker.position.lat() + ' — Lng: ' + marker.position.lng());
        this.descriptionModal.modalDescription(marker.description);

        var favourite = false;
        if (this._user_id()) {
            favourite = this._model.checkIfUserFavourite(marker.key);
            console.log(marker);
        }
        this.descriptionModal.modalFav(favourite);

        //this.addMarkerModal.modalCoordinates('Lat: ' + latitude + ' — Lng: ' + longitude);

        setTimeout(function () {
            self.descriptionModal.modalClass('description-content-area-in');
        }, 100);
    };

    p.resetDescriptionModal = function () {
        this.descriptionModal.modalOn(false);
        this.descriptionModal.modalMarkerKey('');
        this.descriptionModal.modalClass('description-content-area-out');
        this.descriptionModal.modalTitle('');
        this.descriptionModal.modalType('other');
        this.descriptionModal.modalCoordinates('');
        this.descriptionModal.modalDescription('');
        this.descriptionModal.modalFav('');

        this._mapView.toggleMarkerAnimation(this._model.params.currentMarker);
        this._model.params.currentMarker = null;
    };

    p.showAddMarkerModal = function (latitude, longitude) {
        this.addMarkerModal.modalOn(true);
        this.addMarkerModal.modalLatitude(latitude);
        this.addMarkerModal.modalLongitude(longitude);
        this.addMarkerModal.modalCoordinates('Lat: ' + latitude + ' — Lng: ' + longitude);

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

    p.userIdUpdate = function (user_id) {
        this._user_id(user_id);
        this._model.getUserFavourites(user_id);
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

        if (this.menuButtonClass() === 'menu-out') {
            this.toggleAside();
        }

        if (this.descriptionModal.modalOn()) {
            this.resetDescriptionModal()
        } else {
            this.showDescriptionModal(marker);
        }
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

        this.displayedMarkers = ko.computed(function () {
            this._mapView.displayMarkers({
                monument: this.checks.monument(),
                museum: this.checks.museum(),
                hotel: this.checks.hotel(),
                restaurant: this.checks.restaurant(),
                coffee: this.checks.coffee(),
                other: this.checks.other(),
                userOnly: this.checks.userOnly(),
                favouritesOnly: this.checks.favouritesOnly()
            });

            var list = [];

            this._model.markers.forEach(function (mk) {
                var userCreated = mk.user_id === this._user_id(),
                    favourite = this.checkIfUserFavourite(mk.id),
                    display = this.checks[mk.type]();


                if(this.checks.userOnly() && !userCreated) {
                    display = false;
                }

                if(this.checks.favouritesOnly() && !favourite) {
                    display = false;
                }

                if (display) {
                    list.push(mk);
                }
            }, this);

            return list;
        }, this);
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