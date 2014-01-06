EquipmentsView = Backbone.View.extend({
    initialize: function(){
        this.initData();
        this.svgGroupName = "map-svg-wrapper";
        this.addListeners();
    },
    addListeners: function(){
        var _this = this;
        this.mapEvent.bind("change", function(){
        	_this.mapEventChanged();
        })
    },
 	initData: function(){
        this.highlightedState = 0;
        this.stores = this.collection.stores;
        this.status = this.model.status;
        this.mapEvent = this.model.mapEvent;
    },

    highlight: function(radius, centerX, centerY){
        var selectedClusters = [];
        this.highlightedState = 0;
        var _this = this;
        //to do
        function distance(x1, y1, x2, y2) {
            return Math.sqrt( (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
        }
    },
    deHightlight: function() {
        if (this.highlightedState == 0)
            return;
        this.nodes.each(function(d){
            d3.select(this).select("circle").classed("highlighted-node", false);
        });
        this.highlightedState == 0;
        this.selectedClusters.reset([]);
    },
    createElements: function(){
        var nodeSize = 5;
        var _this = this;
        $($(".BMap_mask")[0]).append($("#" + this.svgGroupName));
        this.SVG = d3.select("#" + this.svgGroupName).select("svg");
        $("#" + this.svgGroupName + " svg").click(function(){
            _this.deHightlight();
        })
    },
    createNodes: function(){
        $(".tipsy").remove();
        var _this = this;
        $($(".BMap_mask")[0]).append($("#" + this.svgGroupName));
        $(".nodes").remove();
        this.nodesGroup = this.SVG.append("g").attr("class","nodes");
        this.stores.forEach(function(d){
            var loc = NS.mapToCanvas(Number(d.get("lng")), Number(d.get("lat")) );
            d.set("cx", loc.x);
            d.set("cy", loc.y);
        })
        this.nodes = this.nodesGroup
            .selectAll("g.gnode")
            .data(this.stores.models)
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", function(d){
                return "translate(" + d.get("cx") + "," + d.get("cy") + ")";
            })
        var r = 5;
        this.nodes.each(function(d){
            d3.select(this).attr("width", r)
                .attr("height", r);
            d3.select(this).append("circle")
                .attr("r", r)
                .attr("class", "node-circle");
            d3.select(this).append("text")
                .attr("text-anchor", "middle")
                .attr("transform", "translate(0, 5)");

            $(this).tipsy({
                gravity: $.fn.tipsy.autoWE,
                offset: 20,
                html:true,
                fade:false,
                title:function(){
                    console.log(d.attributes);
                    return Mustache.render($("#t-store").html(), {store: d.attributes});
                }
            });
        });
    },

    updateNodes: function() {
        console.log("update");
        var start = new Date().getTime();
        this.nodes.each(function(d){
            var loc = NS.mapToCanvas( d.get("lng"), d.get("lat") );
            d.set("cx", loc.x);
            d.set("cy", loc.y);
            d3.select(this)
                .attr("transform", function(d){
                    return "translate(" + d.get("cx") + "," + d.get("cy") + ")";
                })
        })
        console.log(new Date().getTime() - start);
    },

    mapEventChanged: function() {
    	var type = this.mapEvent.get("type");
	    if(type == "onload"){
            var map = $("#dituContent").get(0);
            this.createElements();
            this.createNodes();
        }
        if(type == "onmovestart"){
            this.wrapper_lng = NS.getBounds().swLng;
            this.wrapper_lat = NS.getBounds().neLat;
        }
        if(type == "onmoving"){
            var p = NS.mapToCanvas(this.wrapper_lng, this.wrapper_lat);
            $("#"+ this.svgGroupName)
                .css("top", p.y + "px")
                .css("left", p.x + "px");
        }
        if(type == "onmoveend" || type == "onzoomend"){
            $("#" + this.svgGroupName)
                .css("top","0px")
                .css("left","0px");
            this.updateNodes();
        }
    }
 });