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
    }

    var p = ViewModel.prototype;

    p.toggleAside = function () {
        this.menuButtonClass(this.menuButtonClass() === 'menu-in' ? 'menu-out' : 'menu-in');
        this.asideClass(this.asideClass() === 'wrapper aside-out' ? 'wrapper aside-in' : 'wrapper aside-out');
    };

    return ViewModel;
})();

ko.applyBindings(new nmm.ViewModel);