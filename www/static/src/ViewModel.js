/**
 * Created by Nuno on 04/02/17.
 */
var nmm = nmm || {};
nmm.ViewModel = (function () {
    'use strict';

    /*
    * This class is the connection between the view and the model.
    * */

    var self;

    function ViewModel() {
        self = this;
        this._init();
    }

    var p = ViewModel.prototype;


    //User interactions

    p.logout = function () {
        // On logout, set user_id to null and disconnect user sending a get
        // request to server.
        this.model.user_id(null);
        $.get("/disconnect/", function (data) {
            console.log(data);
        });
    };

    p.listClicked = function (marker) {
        // If an element on the list is clicked, show modal width description.
        self.markerClicked(marker);

        // Close the menu.
        self.model.aside.asideClass('menu-out');
    };

    p.displayMarkers = function (markers) {
        // Show only the markers on the list passed as an argument.
        this._mapView.displayMarkers(markers);
    };

    p.toggleFavourite = function () {
        // Check if the current marker is already a favourite.
        var fav = this.model.mapParams.currentMarker.userFavourite(),
            // Get current markers id.
            markerId = this.model.mapParams.currentMarker.id();

        if (fav) {
            // If current marker is a favourite, unfavourite.
            this.model.removeFavourite(markerId);
        } else {
            // If current marker is a not favourite, make it favourite.
            this.model.storeFavourite(markerId);
        }

        // Store the value (favourite or not), to allow graphical change of
        // favourite button.
        this.model.mapParams.currentMarker.userFavourite(!fav);
    };

    p.updateExistingMarkers = function (marker) {
        // After saving a new marker, close the modal window.
        this.closeModal();

        // Add marker to the map.
        this._mapView.addNewMarker(marker);
    };

    p.storeMarker = function () {
        // Check in the model if user input data is enough to save marker.
        // If it is, save it, if not return message to user.
        this.model.evaluateInputData();
    };

    p.closeModal = function () {
        // Close modal window.
        this.model.modals.modalClass('modal-out');
        this.model.modals.addOn(false);
        this.model.modals.viewOn(false);

        // Kill marker animation.
        // Pass parameter true to mark the marker as not to be animated.
        // This solves a problem when adding a new marker that animated previous
        // selected one.
        this._mapView.toggleMarkerAnimation(this.model.mapParams.currentMarker.id(), true);
    };

    p.markerClicked = function (marker) {
        // When a new marker is clicked, stop the previous one from moving.
        this._mapView.toggleMarkerAnimation(this.model.mapParams.currentMarker.id(), true);

        // Store current marker data in model.
        this.model.setCurrentMarker(marker.id);

        // Animate selected marker.
        this._mapView.toggleMarkerAnimation(this.model.mapParams.currentMarker.id());

        // Show modal window.
        this.model.modals.modalClass('modal-in');

        // Hide add marker content.
        this.model.modals.addOn(false);

        // Show description content.
        this.model.modals.viewOn(true);
    };

    p.mapClicked = function (latitude, longitude) {
        if (this.model.user_id()) {
            // If map clicked and user is logged in, reset add marker modal
            // content and show wmpty inputs and new latitude and longitude.
            this.model.resetAddMarkerModal();
            this.model.modals.add.latitude(latitude);
            this.model.modals.add.longitude(longitude);

            // Show modal window.
            this.model.modals.modalClass('modal-in');

            // Show add marker content.
            this.model.modals.addOn(true);

            // Hide description content.
            this.model.modals.viewOn(false);
        }
    };

    p.userIdUpdate = function (user_id) {
        // Run when user is logged in or logged out.
        this.model.user_id(user_id);

        // Get favourites from current user.
        this.model.getUserFavourites(user_id);
    };

    p.changeAsideContent = function (vm, target) {
        // Toggle aside menu content to correspond to button press.
        // Get button type from html button attribute.
        var btnClicked = event.target.getAttribute('data-key');

        // Set aside content to show.
        this.model.aside.asideContent(btnClicked);
    };

    p.toggleAside = function () {
        // Switch class from aside menu on button press.
        var status = this.model.aside.asideClass() === 'menu-out' ? 'menu-in' : 'menu-out';
        this.model.aside.asideClass(status);
    };


    //Loading tasks

    p.markersListLoadTaskEnd = function (successful, data) {
        if (successful) {
            // Markers loaded from database.
            // Create markers on map according to data loaded from database.
            this._mapView.createMarkers(data, this.model.mapParams.markerIcons);

            // Change app state.
            this.model.appStatus.state(2);
        } else {
            // Markers didn't load from database.
            this.model.appStatus.state(-1);
        }
    };

    p.mapTaskEnd = function (successful) {
        if (successful) {
            // Map loaded successfully.
            // Load markers list from database.
            this.model.getDBMarkersList();

            // Change app state.
            this.model.appStatus.state(1);
        } else {
            // Map hasnt load.
            // Change app state.
            this.model.appStatus.state(-1);
        }
    };

    //initialize

    p.renderMap = function () {
        // Display map after script from google maps loaded correctly.
        this._mapView.renderMap(this.model.mapParams.init);
    };

    p._init = function () {
        // Instantiate model class.
        this.model = new nmm.Model(this);

        // Instantiate map view class.
        this._mapView = new nmm.MapView(this);

        // Get data from Open Weather Map using corresponding API.
        this.model.getOpenWeather();
    };

    return ViewModel;
})();

// Store view model instante in nmm name space to turn it accessible from login
// and map callback functions.
nmm.vm = new nmm.ViewModel();
ko.applyBindings(nmm.vm);