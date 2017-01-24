/**
 * Created by Nuno on 24/01/17.
 */

var nmm = nmm || {};

nmm.MapView = (function () {
    'use strict';

    function MapView() {
        this._t1 = setTimeout(function(){
            document.getElementsByClassName('map-error')[0].style.display = 'block';
        }, 10000);
    }

    var p = MapView.prototype;

    p.renderMap = function () {
        var porto = {lat: 41.1452347, lng: -8.6454186};
        this.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 14,
            center: porto
        });
        clearTimeout(this._t1);
    };

    return MapView;
})();