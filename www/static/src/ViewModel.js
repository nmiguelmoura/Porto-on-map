/**
 * Created by Nuno on 04/02/17.
 */
var nmm = nmm || {};
nmm.ViewModel = (function () {
    'use strict';

    var self;

    function ViewModel () {
        self = this;
        this._init();
    }

    var p = ViewModel.prototype;


    //User interactions

    p.markerClicked = function (marker) {
        console.log(this, marker.id)
    };

    p.mapClicked = function () {
        console.log('place marker');
    };




    //Loading tasks

    p.markersListLoadTaskEnd = function (successful, data) {
        if(successful) {
            //MARKERS LOADED FROM DB
            this._mapView.createMarkers(data, this.model.mapParams.markerIcons);
            this.model.appStatus.state(2);
        } else {
            //MARKERS NOT LOADED FROM DB
            this.model.appStatus.state(-1);
        }
    };

    p.mapTaskEnd = function (successful) {
        if(successful) {
            //MAP LOADED
            this.model.getDBMarkersList();
            this.model.appStatus.state(1);
        } else {
            //MAP NOT LOADED
            this.model.appStatus.state(-1);
        }
    };



    p.renderMap = function () {
        this._mapView.renderMap(this.model.mapParams.init);
    };

    p._init = function () {
        this.model = new nmm.Model(this);
        this._mapView = new nmm.MapView(this);
    };

    return ViewModel;
})();

nmm.vm = new nmm.ViewModel();
ko.applyBindings(nmm.vm);