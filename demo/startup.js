requirejs.config({
    baseUrl: '../src',

    paths: {
        'knockout': '../demo/lib/knockout-min',
        'knockout.bliss': '../src/knockout.bliss',
    }
});

require(['../demo/app'], function (app) {
    app.init();
});