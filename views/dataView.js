DataListView = Backbone.View.extend({

    initialize: function(){
        this.stores = this.collection.stores;
        this.clusters = this.collection.clusters;
        this.selectedStores = this.collection.selectedStores;

        var tpClusters = [];
        for (var i = 0; i < this.clusters.models.length; i++) {
            var tpCluster = {clusterId: i+1, list:[]};
            for (var j = 0; j < this.clusters.models[i].get("list").length; j++) {
                var storeId = this.clusters.models[i].get("list")[j];
                var store = this.stores.findWhere({id:storeId});
                tpCluster.list.push({storeId: storeId, store: store.attributes});
            }
            tpClusters.push(tpCluster);
        }
        this.sClusters = tpClusters;

        this.histogramHeight = 200;

        this.addListeners();
        this.render();
        this.updateTypeHistogram();
        this.updatePriceHistogram();
        this.updateRateHistogram();
        this.updateDataCountLabel();
    },

    addListeners: function(){
        var _this = this;
        this.selectedStores.bind("reset", function() {
            _this.updatePriceHistogram();
            _this.updateTypeHistogram();
            _this.updateRateHistogram();
            _this.updateDataCountLabel();
        })
    },

    render: function(){
        var _this = this;
        var listHtml = Mustache.render($("#cluster-list-template").html(), {clusters: this.sClusters});
        $("#toolbar-right").append( listHtml );

        $(".cluster-tab").click(function() {
            clusterId = Number($(this).attr("clusterid") - 1);
            _this.selectCluster(clusterId);
        })
        
    },

    selectCluster: function(clusterId) {
        var storeList = this.sClusters[clusterId].list;
        var selected = [];
        for (var i = 0; i < storeList.length; i++) {
            selected.push(storeList[i].store);
        }
        this.selectedStores.reset(selected);
    },

    updateDataCountLabel: function() {
        $("#data-count-label").text("显示餐厅数：" + this.selectedStores.models.length);
    },

    updateTypeHistogram: function() {

        //统计
        $("#type-distribute").html("");
        for (var i = 0; i < typeCount.length; i++)
            typeCount[i].count = 0;
        for (var i = 0; i < this.selectedStores.models.length; i++) {
            var store = this.selectedStores.models[i];
            if (typeList.indexOf(store.get("type")) >= 0)
                typeCount[typeList.indexOf(store.get("type"))].count++;
        }
        
        //添加svg
        var width = $("#type-distribute").width();
        var height = this.histogramHeight;
        var margin = {top: 20, right: 20, bottom: 30, left: 40};
        width = width - margin.left - margin.right,
        height = height - margin.top - margin.bottom;
        var svg = d3.select("#type-distribute").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        //绘制直方图
        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);
        var y = d3.scale.linear()
            .range([height, 0]);
        x.domain(typeCount.map(function(d) { return d.type }));
        y.domain([0, d3.max(typeCount, function(d) { return d.count; })]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(function(d) { return d.substring(0,1)})
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(10, "");

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")

        svg.selectAll(".bar")
            .data(typeCount)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.type); })
            .attr("width", x.rangeBand())
            .attr("y", function(d) { return y(d.count); })
            .attr("height", function(d) { 
                return height - y(d.count); 
            });
        svg.selectAll(".text-label")
            .data(typeCount)
            .enter().append("text")
            .attr("class", "label")
            .attr("text-anchor", "middle")
            .attr("transform", function(d){
                return "translate(" + (x(d.type) + x.rangeBand() / 2) + "," +  (y(d.count) - 10) + ")"
            })
            .text(function(d){ return d.count});
    },

    updatePriceHistogram: function() {

        //统计
        $("#price-distribute").html("");
        for (var i = 0; i < priceCount.length; i++)
            priceCount[i].count = 0;
        for (var i = 0; i < this.selectedStores.models.length; i++) {
            var store = this.selectedStores.models[i];
            var index = Math.floor(store.get("price") / 20);
            
            if (index < 10)
                priceCount[index].count++;
            else if (store.get("price") > 200)
                priceCount[priceCount.length-1].count++;
        }
        console.log(priceCount);
        
        //添加svg
        var width = $("#price-distribute").width();
        var height = this.histogramHeight;
        var margin = {top: 20, right: 20, bottom: 30, left: 40};
        width = width - margin.left - margin.right,
        height = height - margin.top - margin.bottom;
        var svg = d3.select("#price-distribute").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        //绘制直方图
        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);
        var y = d3.scale.linear()
            .range([height, 0]);
        x.domain(priceCount.map(function(d) { return d.price }));
        y.domain([0, d3.max(priceCount, function(d) { return d.count; })]);

        var xAxis = d3.svg.axis()
            .scale(x)

            .orient("bottom");
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(10, "");
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")

        svg.selectAll(".bar")
            .data(priceCount)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.price); })
            .attr("width", x.rangeBand())
            .attr("y", function(d) { return y(d.count); })
            .attr("height", function(d) { 
                return height - y(d.count); 
            });
        svg.selectAll(".text-label")
            .data(priceCount)
            .enter().append("text")
            .attr("class", "label")
            .attr("text-anchor", "middle")
            .attr("transform", function(d){
                return "translate(" + (x(d.price) + x.rangeBand() / 2) + "," +  (y(d.count) - 10) + ")"
            })
            .text(function(d){ return d.count});
    },


    updateRateHistogram: function() {

        //统计
        $("#rate-distribute").html("");
        for (var i = 0; i < rateCount.length; i++)
            rateCount[i].count = 0;
        for (var i = 0; i < this.selectedStores.models.length; i++) {
            var store = this.selectedStores.models[i];
            var index = Math.floor(store.get("rate") ) - 1;
            
            if (index < 10)
                rateCount[index].count++;
        }
        
        //添加svg
        var width = $("#rate-distribute").width();
        var height = this.histogramHeight;
        var margin = {top: 20, right: 20, bottom: 30, left: 40};
        width = width - margin.left - margin.right,
        height = height - margin.top - margin.bottom;
        var svg = d3.select("#rate-distribute").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        //绘制直方图
        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);
        var y = d3.scale.linear()
            .range([height, 0]);
        x.domain(rateCount.map(function(d) { return d.rate }));
        y.domain([0, d3.max(rateCount, function(d) { return d.count; })]);

        var xAxis = d3.svg.axis()
            .scale(x)

            .orient("bottom");
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(10, "");
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")

        svg.selectAll(".bar")
            .data(rateCount)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.rate); })
            .attr("width", x.rangeBand())
            .attr("y", function(d) { return y(d.count); })
            .attr("height", function(d) { 
                return height - y(d.count); 
            });
        svg.selectAll(".text-label")
            .data(rateCount)
            .enter().append("text")
            .attr("class", "label")
            .attr("text-anchor", "middle")
            .attr("transform", function(d){
                return "translate(" + (x(d.rate) + x.rangeBand() / 2) + "," +  (y(d.count) - 10) + ")"
            })
            .text(function(d){ return d.count});
    },



    show: function(){
        $("#datalist-wrapper").fadeIn();
    },

    hide: function(){
        $("#datalist-wrapper").fadeOut();
    }

})