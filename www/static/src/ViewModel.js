/**
 * Created by Nuno on 24/01/17.
 */

var nmm = nmm || {};

nmm.ViewModel = (function () {
    'use strict';

    function ViewModel() {
        this._model = new nmm.Model(this);
        this._mapView = new nmm.MapView(this);
        nmm.mapView = this._mapView;
        this.menuButtonClass = ko.observable('menu-in');
        this.asideClass = ko.observable('wrapper aside-out');
        this.asideContentOn = ko.observable('locals');
        this.messageToUser = ko.observable('Loading map...');

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
            modalClass: ko.observable('add-marker-content-area-out')
        };

        /*setTimeout(function(){
            this.addMarkerModal.modalOn(true);
        }.bind(this), 2000);

        setTimeout(function(){
            this.addMarkerModal.modalClass('add-marker-content-area-in');
        }.bind(this), 2100);*/
    }

    var p = ViewModel.prototype;

    p.markerClicked = function (marker) {
        if(this._model.params.currentMarker !== null) {
            this._mapView.toggleMarkerAnimation(this._model.params.currentMarker);
        }

        this._model.params.currentMarker = marker;
        this._mapView.toggleMarkerAnimation(marker);
    };

    p.getMarkerIcons = function () {
        return this._model.params.marker_icons;
    };

    p.markersLoadingFailed = function () {
        this.messageToUser("An error occurred and the markers can't be shown. Please check your Internet connection and reload the page!");
    };

    p.markersLoaded = function () {
        this.messageToUser('');
        this._mapView.launchMarkers(this._model.markers);
    };

    p.mapReady = function () {
        this.messageToUser('Loading places...');
        this._model.getLocalsListFromDB();
    };

    p.mapLoadingFailed = function () {
        this.messageToUser("An error occurred and the map can't be shown. Please check your Internet connection and reload the page!");
        console.log('lo');
    };

    p.toggleContent = function (model, event) {
        var btnClicked = event.target.getAttribute('data-key');

        if(btnClicked === '0') {
            this.asideContentOn('locals');
        } else if(btnClicked === '1') {
            this.asideContentOn('list');
        } else if(btnClicked === '2') {
            this.asideContentOn('login');
        } else if(btnClicked === '3') {
            this.asideContentOn('weather');
        }
    };

    p.toggleAside = function () {
        this.menuButtonClass(this.menuButtonClass() === 'menu-in' ? 'menu-out' : 'menu-in');
        this.asideClass(this.asideClass() === 'wrapper aside-out' ? 'wrapper aside-in' : 'wrapper aside-out');
    };

    return ViewModel;
})();

ko.applyBindings(new nmm.ViewModel);