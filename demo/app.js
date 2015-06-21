define(
    [
        "knockout",
        "knockout.bliss"
    ],

    function (ko) {
        return {
            init: function() {
                var model = {
                  title: 'my title'
                };
                
                ko.applyBindings(model);
            }
        };
    }
);