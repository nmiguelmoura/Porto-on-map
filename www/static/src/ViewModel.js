/**
 * Created by Nuno on 04/02/17.
 */
var nmm = nmm || {};
nmm.ViewModel = (function () {
    'use strict';

    var self;

    function ViewModel() {
        self = this;
        this._init();
    }

    var p = ViewModel.prototype;


    //User interactions

    p.logout = function () {
        this.model.user_id(null);
        $.get("/disconnect/", function (data) {
            console.log(data);
        });
    };

    p.listClicked = function (marker) {
        self.markerClicked(marker);
    };

    p.displayMarkers = function (markers) {
        this._mapView.displayMarkers(markers);
    };

    p.toggleFavourite = function () {
        var fav = this.model.mapParams.currentMarker.userFavourite(),
            markerId = this.model.mapParams.currentMarker.id();

        if (fav) {
            this.model.removeFavourite(markerId);
        } else {
            this.model.storeFavourite(markerId);
        }

        this.model.mapParams.currentMarker.userFavourite(!fav);
    };

    p.updateExistingMarkers = function (marker) {
        this.closeModal();
        this._mapView.addNewMarker(marker);
    };

    p.storeMarker = function () {
        this.model.evaluateInputData();
    };

    p.closeModal = function () {
        this.model.modals.modalClass('modal-out');
        this.model.modals.addOn(false);
        this.model.modals.viewOn(false);
        this._mapView.toggleMarkerAnimation(this.model.mapParams.currentMarker.id());
    };

    p.markerClicked = function (marker) {
        this._mapView.toggleMarkerAnimation(this.model.mapParams.currentMarker.id(), true);
        this.model.setCurrentMarker(marker.id);
        this._mapView.toggleMarkerAnimation(this.model.mapParams.currentMarker.id());
        this.model.modals.modalClass('modal-in');
        this.model.modals.addOn(false);
        this.model.modals.viewOn(true);
    };

    p.mapClicked = function (latitude, longitude) {
        if (this.model.user_id()) {
            this.model.resetAddMarkerModal();
            this.model.modals.add.latitude(latitude);
            this.model.modals.add.longitude(longitude);
            this.model.modals.modalClass('modal-in');
            this.model.modals.addOn(true);
            this.model.modals.viewOn(false);
        }
    };

    p.userIdUpdate = function (user_id) {
        this.model.user_id(user_id);
        this.model.getUserFavourites(user_id);
    };


    //Loading tasks

    p.markersListLoadTaskEnd = function (successful, data) {
        if (successful) {
            //MARKERS LOADED FROM DB
            this._mapView.createMarkers(data, this.model.mapParams.markerIcons);
            this.model.appStatus.state(2);
        } else {
            //MARKERS NOT LOADED FROM DB
            this.model.appStatus.state(-1);
        }
    };

    p.mapTaskEnd = function (successful) {
        if (successful) {
            //MAP LOADED
            this.model.getDBMarkersList();
            this.model.appStatus.state(1);
        } else {
            //MAP NOT LOADED
            this.model.appStatus.state(-1);
        }
    };

    //initialize

    p.renderMap = function () {
        this._mapView.renderMap(this.model.mapParams.init);
    };

    p._init = function () {
        this.model = new nmm.Model(this);
        this._mapView = new nmm.MapView(this);
        this.model.getOpenWeather();
    };

    return ViewModel;
})();

nmm.vm = new nmm.ViewModel();
ko.applyBindings(nmm.vm);