var stores = new StoreCollection();
var mapView;
var status = "";
var colorInterpolation;

function readData() {
    d3.csv("stores.csv", function(error, data) {
        data.forEach(function(d){
            var store = new StoreModel(d);
            if (store.get("comment_count") >= 300)
                stores.push(store);
        });
        console.log("stores.length:" + stores.length);
        initData();
        initViews();
    }); 
}

function initData(){
    mapEvent = new MapEventModel({});
    colorInterpolation = d3.interpolateRgb("white", "red");
}


function initViews(){
    mapView = new MapView({
        collection: {stores: stores},
        model: {mapEvent: mapEvent}
    });
    equipmentsView = new EquipmentsView({
        model: {
            mapEvent: mapEvent,
            status: status
        },
        collection: {
            stores: stores
        }
    });
    dataListView = new DataListView({
        collection: {
            stores: stores
        }
    })
    initInteraction();
}

function initInteraction() {
    $("#interaction-layer").hide();
}

readData();

