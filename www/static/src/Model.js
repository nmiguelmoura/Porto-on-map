/**
 * Created by Nuno on 24/01/17.
 */

var nmm = nmm || {};

nmm.Model = (function(){
    'use strict';

    function Model (controller) {
        this._controller = controller;
        this.params = {
            /*categories: [
                'Monuments',
                'Museums',
                'Hotels',
                'Restaurants',
                'Coffee shops',
                'Others'
            ]*/
        }
    }

    var p = Model.prototype;

    p.getLocalsListFromDB = function () {
        var self = this,
            url = '/markers/JSON/';
    $.ajax({
        url: url,
        dataType: 'json'
    })
        .done(function(result){
            var data = result.Marker;
            self.markers = data;
            self._controller.markersLoaded();
        })
        .fail(function(error){
            self.markers = [];
            self._controller.mapLoadingFailed();
        });
    };

    return Model;
})();