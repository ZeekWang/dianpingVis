StoreModel = Backbone.Model.extend({
    defaults: {
    },
    initialize: function() {
    	this.set("lng", Number(this.get("lng")));
    	this.set("lat", Number(this.get("lat")));
    	this.set("price", Number(this.get("price")));
    	this.set("comment_count", Number(this.get("comment_count")));
    	this.set("comment_count", Number(this.get("comment_count")));
    	this.set("comment1", Number(this.get("comment1")));
    	this.set("comment2", Number(this.get("comment2")));
    	this.set("comment3", Number(this.get("comment3")));
    }
})

StoreCollection = Backbone.Collection.extend({
    model: StoreModel
})

SingleClusterModel = Backbone.Model.extend({
})

ClusterCollection = Backbone.Collection.extend({
    model: SingleClusterModel
})

MapEventModel = Backbone.Model.extend({

})
