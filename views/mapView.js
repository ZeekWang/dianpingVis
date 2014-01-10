MapView = Backbone.View.extend({
    el: "#map-wrapper",
    initialize: function(){
        this.initData();
        var dituScript = $("<script></script>").attr("src", "http://api.map.baidu.com/api?key=&v=2.0&ak=&ak=tYBOwMCM3P13hceAdtVNDyvi&callback=initializeMap");
        $("body").append(dituScript);
        this.initializeMap();
    },

    initData: function(){
        this.mapEvent = this.model.mapEvent;
    },

    initializeMap: function(){
        var _this = this;
        var timer = setInterval(function(){
            if(BMap.Map){
                BMapUtils.initMap("map-content", mapCallback, _this);
                clearInterval(timer);
            }
        },200);

        function mapCallback(event) {
            mapEvent.set("type", event.type);
            mapEvent.set("time", new Date());
        }
    }

});