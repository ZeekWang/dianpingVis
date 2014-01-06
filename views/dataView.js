DataListView = Backbone.View.extend({

    initialize: function(){
        this.stores = this.collection.stores;
        this.selectedClusters = this.collection.selectedClusters;
        this.addListeners();
        this.render();
    },

    addListeners: function(){
        var _this = this;
    },

    render: function(){

    },

    show: function(){
        $("#datalist-wrapper").fadeIn();
    },

    hide: function(){
        $("#datalist-wrapper").fadeOut();
    }

})