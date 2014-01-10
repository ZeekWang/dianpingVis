MainView = Backbone.View.extend({
    initialize: function(){
        this.initData();
        this.svgGroupName = "map-svg-wrapper";
        this.addDrag();
        this.addListeners();
    },
    addListeners: function(){
        var _this = this;
        this.mapEvent.bind("change", function(){
        	_this.mapEventChanged();
        })
        this.selectedStores.bind("reset", function() {
            _this.selectedStoresChanged();
        })
    },
 	initData: function(){
        this.highlightedState = 0;
        this.stores = this.collection.stores;
        this.selectedStores = this.collection.selectedStores;
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
        this.stores.models.forEach(function(d){
            var loc = NS.mapToCanvas(Number(d.get("lng")), Number(d.get("lat")) );
            d.set("cx", loc.x);
            d.set("cy", loc.y);
        })
        this.nodes = this.nodesGroup
            .selectAll("g.gnode")
            .data(this.stores.models)
            .enter()
            .append("g")
            .attr("class", "node store-node")
            .attr("id", function(d) {
                return "store-node-" + d.get("id")
            })
            .attr("transform", function(d){
                return "translate(" + d.get("cx") + "," + d.get("cy") + ")";
            })
        
        this.nodes.each(function(d){
            // d3.select(this).attr("width", r)
            //     .attr("height", r);
            d3.select(this).append("circle")
                .attr("r", function(d) {
                    return 3 + Math.sqrt(d.get("comment_count") / 20000) * 10;
                })
                .attr("fill", colorInterpolation( Math.sqrt(d.get("price") /200) ) )
                // .attr("r", function(d) {
                //     return 3 + Math.sqrt(d.get("price") /200) * 5;
                // })
                // .attr("fill", colorInterpolation( Math.sqrt(d.get("comment_count") / 5000) ) )
                 // .attr("fill", "steelblue")
                 // .attr("opacity", Math.sqrt(d.get("comment_count")/5000) * 0.5)
                 .attr("opacity", 0.6)
                 .attr("stroke", "#08519c")
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

    selectedStoresChanged: function() {
        $(".store-node").hide();
        for (var i = 0; i < this.selectedStores.models.length; i++) {
            var store = this.selectedStores.models[i];
            $("#store-node-" + store.id).show();
        }
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
            console.log(this.wrapper_lng + " " + this.wrapper_lat);
        }
        if(type == "onmoving"){
            var p = NS.mapToCanvas(this.wrapper_lng, this.wrapper_lat);
            console.log(p);
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
    },

    addDrag: function() {
        var _this = this;
        var jqView = $("#interaction-layer");
        var svg = d3.select("#interaction-layer");
        var brush = svg.append("g")
            .attr("class", "brush")
            .call(d3.svg.brush()
                    .x(d3.scale.identity().domain([0, 2000]))
                    .y(d3.scale.identity().domain([0, 2000]))
                    .on("brush", function() {
                        var extent = d3.event.target.extent();
                    })
            );

        jqView.mousedown(function(e){
            if (mode == "lasso")
                e.stopPropagation();
            dragTimes = 0;
            var brushX1 = 0, brushY1 = 0, brushX2 = 0, brushY2 = 0;
            jqView.bind("mousemove", function(e) {
                console.log("mousemove");
                if (e.which != 1) 
                    return;
                if (mode == "lasso"){
                    if (dragTimes == 0) {
                        console.log(e);
                        svg.append("rect")
                            .attr("class", "brush")
                            .attr("x", e.offsetX)
                            .attr("y", e.offsetY)
                            .attr("width", 0)
                            .attr("height", 0);
                        brushX1 = brushX2 = e.offsetX;
                        brushY1 = brushY2 = e.offsetY;
                    } else {
                        brushX2 = e.offsetX;
                        brushY2 = e.offsetY;
                        svg.select(".brush")
                            .attr("x", Math.min(brushX1, brushX2))
                            .attr("y", Math.min(brushY1, brushY2))
                            .attr("width", Math.abs(brushX1 - brushX2))
                            .attr("height", Math.abs(brushY1 - brushY2))
                    }
                    dragTimes++;
                } 
            });
        });

        jqView.mouseup(function(){
            jqView.unbind("mousemove");
            console.log("mouseup");
            if (dragTimes == 0) {

            }
            else if (mode == "lasso") {
                if (svg.selectAll(".brush").attr("width") > 0
                    || svg.selectAll(".brush").attr("height") > 0) {
                    var x1 = Number(svg.selectAll(".brush").attr("x")),
                        x2 = x1 + Number(svg.selectAll(".brush").attr("width")),
                        y1 = Number(svg.selectAll(".brush").attr("y")),
                        y2 = y1 + Number(svg.selectAll(".brush").attr("height"));
                    _this.brushStores(x1, y1, x2, y2);
                }
                svg.selectAll(".brush").remove();
            }
        })

    },

    brushStores: function(x1, y1, x2, y2) {
        var selected = [];
        this.nodes.each(function(d){
            var cx = d.get("cx");
            var cy = d.get("cy");
            if (cx > x1 && cx < x2 && cy > y1 && cy < y2) {
                var storeId = d.get("id");
                $("#store-node-" + storeId).show();
                selected.push(d);
            } else {
                $("#store-node-" + storeId).hide();
            }
        })   
        this.selectedStores.reset(selected);    
    }
 });