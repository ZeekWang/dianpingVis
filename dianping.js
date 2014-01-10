var stores = new StoreCollection();
var clusters = new ClusterCollection();
var selectedStores = new StoreCollection();
var mapView;
var status = "";
var colorInterpolation;
var typeList = ["火锅", "小吃快餐", "川菜", "北京菜", "自助餐", 
    "日本", "西餐", "西北菜", "海鲜", "新疆菜", "素菜", "贵州菜", "东北菜", "湖北菜"];
var typeCount = [];
var priceCount = [];
var rateCount = [];
var mode = "";

for (var i = 0; i < typeList.length; i++) {
    typeCount.push( {"type": typeList[i], "count": 0} );
}
for (var i = 0; i < 10; i++) {
    priceCount.push( {"price": i * 20 + 10, "count": 0} );
}
for (var i = 1; i <= 10; i++) {
    rateCount.push( {"rate": i, "count": 0} );
}
priceCount.push( {"price": ">200", "count": 0} );


var readDataProgress = 0;

function readData() {
    d3.csv("stores.csv", function(error, data) {
        data.forEach(function(d){
            var store = new StoreModel(d);
            if (store.get("comment_count") >= 300) {
                stores.add(store);
                selectedStores.add(store);
            }
        });
        console.log("stores.length:" + stores.length);
        readDataProgress++;
    }); 
    d3.json("cluster.json", function(error, data){
        for (var i = 0; i < data.length; i++) {
            var cluster = new SingleClusterModel({list: data[i]});
            clusters.add(cluster);
        }
        readDataProgress++;
    })
}

function init() {
    var timer = setInterval(
        function() {
            if (readDataProgress < 2)
                return;
            initData();
            initViews();
            clearInterval(timer);            
        }, 100);

}

function initData(){
    mapEvent = new MapEventModel({});
    // colorInterpolation = d3.interpolateRgb("rgb(250, 100, 100)", "rgb(40, 2, 2)");
    // colorInterpolation = d3.interpolateRgb("#fc9272", "#67000d");
    colorInterpolation = d3.interpolateRgb("#9ecae1", "#08306b");
}


function initViews(){
    mapView = new MapView({
        collection: {stores: stores},
        model: {mapEvent: mapEvent}
    });
    mainView = new MainView({
        model: {
            mapEvent: mapEvent,
            status: status
        },
        collection: {
            stores: stores,
            selectedStores: selectedStores
        }
    });
    dataListView = new DataListView({
        collection: {
            stores: stores,
            clusters: clusters,
            selectedStores: selectedStores
        },
        el: "#datalist-wrapper"
    })

    initInteraction();

    $("#lasso-button").click(function(){
        if ($(this).attr("class") == "btn btn-primary") {
            $(this).attr("class", "btn btn-default");
            mode = "";
            $("#interaction-layer").hide();
        } else if ($(this).attr("class") == "btn btn-default") {
            $(this).attr("class", "btn btn-primary");
            mode = "lasso";
            $("#interaction-layer").show();
        }
    })

    $("#showall-button").click(function(){
        selectedStores.reset(stores.models);
    })
}

function initInteraction() {
    $("#interaction-layer").hide();
}


function getColor(n) {
    var value = Math.ceil(n * 9);
    switch (value) {
        // case 0: return "#084594";
        // case 1: return "#2171b5";
        // case 2: return "#4292c6";
        // case 3: return "#6baed6";
        // case 4: return "#9ecae1";
        // case 5: return "#c6dbef";
        // case 6: return "#eff3ff";
        // case 7: return "#feedde";
        // case 8: return "#fdd0a2";
        // case 9: return "#fdae6b";
        // case 10: return "#fd8d3c";
        // case 11: return "#f16913";
        // case 12: return "#d94801";
        // case 13: return "#8c2d04";

        case 0: return "#fff5f0";
        case 1: return "#fee0d2";
        case 2: return "#fcbba1";
        case 3: return "#fc9272";
        case 4: return "#fb6a4a";
        case 5: return "#ef3b2c";
        case 6: return "#cb181d";
        case 7: return "#a50f15";
        case 8: return "#67000d";
        default: return "#8c2d04";
    }
}

readData();
init();

