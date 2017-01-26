/**
 * Created by Nuno on 24/01/17.
 */

var nmm = nmm || {};

nmm.ViewModel = (function () {
    'use strict';

    function ViewModel() {
        this._mapView = new nmm.MapView();
        nmm.mapView = this._mapView;
        this._model = new nmm.Model();
        this.menuButtonClass = ko.observable('menu-in');
        this.asideClass = ko.observable('wrapper aside-out');
        this.asideContentOn = ko.observable('locals');

        this.checks = {
            monuments: ko.observable(true),
            museums: ko.observable(true),
            hotels: ko.observable(true),
            restaurants: ko.observable(true),
            coffee: ko.observable(true),
            others: ko.observable(true)
        };
    }

    var p = ViewModel.prototype;

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