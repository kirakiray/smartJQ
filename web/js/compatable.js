defer(function(require, res, rej) {
    var r;
    if (!window.Promise) {
        r = require('es6-promise.min');
    }
    if (!window.fetch) {
        if (r) {
            r.require('fetch');
        } else {
            r = require('fetch');
        }
    }

    if (r) {
        r.done(function() {
            res();
        });
    } else {
        res();
    }

});