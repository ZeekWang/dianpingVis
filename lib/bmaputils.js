var BMapUtils = (function() {

(function(){
/*
function load_script(xyUrl, callback){
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = xyUrl;
    //借鉴了jQuery的script跨域方法
    script.onload = script.onreadystatechange = function(){
        if((!this.readyState || this.readyState === "loaded" || this.readyState === "complete")){
            callback && callback();
            // Handle memory leak in IE
            script.onload = script.onreadystatechange = null;
            if ( head && script.parentNode ) {
                head.removeChild( script );
            }
        }
    };
    // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
    head.insertBefore( script, head.firstChild );
}
*/
function transMore(points,type,callback){
	var xyUrl = "http://api.map.baidu.com/ag/coord/convert?from=" + type + "&to=4&mode=1";
	var xs = [];
	var ys = [];
	var maxCnt = 20;//每次发送的最大个数
	/*
    var send = function(){
		var url = xyUrl + "&x=" + xs.join(",") + "&y=" + ys.join(",");
	    //动态创建script标签
	    load_script(url,callback);
		xs = [];
		ys = [];
	}
    */

    var send = function(){
    $.ajax({
    	"url":"http://api.map.baidu.com/ag/coord/convert",
    	"data":{"mode":1, "x":xs.join(","),"y":ys.join(","),"from":0,"to":4},
    	"dataType":"jsonp",
    	"success":function(data){callback(data)}
    })
    }

    for(var index in points){
		if(index % maxCnt == 0 && index != 0){
			send();
		}
    	xs.push(points[index].lng);
    	ys.push(points[index].lat);
		if(index == points.length - 1){
			send();
		}
    }

}

window.BMap = window.BMap || {};
window.BMapLib = window.BMapLib || {};
BMap.Convertor = {};
BMap.Convertor.transMore = transMore;
})();

NS = {};

//NS.drawingManager=null;

//创建和初始化地图函数：
NS.initMap = function(divid, handler){
    createMap(divid);//创建地图
    addMyListeners(handler);
    initMap();
    setMapEvent();//设置地图事件
    addMapControl();//向地图添加控件
 /*
    drawingManager = new BMapLib.DrawingManager(map,{
        isOpen:false,
        enableDrawingTooL:false,
        rectangleOptions:{
            strokeColor:"black",
            strokeWeight:3,
            strokeOpacity:0.8,
            strokeStyle: 'dashed'
        }
    });      

    drawingManager.setDrawingMode(BMAP_DRAWING_RECTANGLE);
    drawingManager.addEventListener('overlaycomplete',overlaycomplete);
*/
};

NS.disableInteraction = function() {
    if (!window.map) return;
    map.disableDragging();
    map.disableScrollWheelZoom();
    map.disableDoubleClickZoom();
    map.disableKeyboard();
};

NS.enableInteraction = function() {
    if (!window.map) return;
    map.enableDragging();//启用地图拖拽事件，默认启用(可不写)
    map.enableScrollWheelZoom();//启用地图滚轮放大缩小
    map.enableDoubleClickZoom();//启用鼠标双击放大，默认启用(可不写)
    map.enableKeyboard();//启用键盘上下左右键移动地图
};

NS.getBounds = function() {
    if (!window.map) return;
    var bnd = map.getBounds();
    return {
        swLng : bnd.qd,
        swLat : bnd.od,
        neLng : bnd.md,
        neLat : bnd.ld
    };
};
   
NS.canvasToMap = function(x, y) {
    if (!window.map) return {"lng":-100, "lat":-100};
    var pixel = new BMap.Pixel(x, y);
    var point = map.pixelToPoint(pixel);
    return {"lng":point.lng, "lat":point.lat};
}

NS.mapToCanvas = function(lng, lat) {
    if (!window.map) return {"x":-100, "y":-100};
    var point = new BMap.Point(lng, lat);
    var pixel = map.pointToPixel(point);
    return {"x":pixel.x, "y":pixel.y};
}

NS.setViewport = function(bound, callback) {
    var sv = function() {
        if (window.map) {
            var sw = new BMap.Point(bound.swLng, bound.swLat),
                ne = new BMap.Point(bound.neLng, bound.neLat);
            callback();
            map.setViewport([sw, ne], {margins: [0,0,0,0], zoomFactor: 0});
        } else {
            setTimeout(sv, 500);
        }
    }
    sv();
}

NS.showLoc = function(lng, lat) {
    map.panTo(new BMap.Point(lng, lat));
}
//csm
NS.getZoom = function(){
    return map.getZoom();
}

NS.enableRegionSelection = function(){
}

NS.setCenterAndZoom = function(point){
    map.centerAndZoom(new BMap.Point(point.lng,point.lat),11);
}

NS.getLocInfo = function(weiboData,clusterData,callbackFunc){
    var pts = [];
    for(var i=0;i<clusterData.length;i++){
        pts.push(new BMap.Point(clusterData[i].lng,clusterData[i].lat));
    }
    var nPages=0;
    var myGeo = new BMap.Geocoder();

    function getLocation(cluster,point){
        function callbackGeo(rsResult){
            var result = rsResult.addressComponents;
            if(rsResult.business){
                cluster.place=rsResult.business;
                var n = cluster.place.split(",");
                cluster.place = n[n.length-1];
            }else if(result.district){
                cluster.place=result.district;
            }else if(result.city){
                cluster.place=result.city;
            }else{
                cluster.place="其他区域";
            }
            nPages++;
        }
        myGeo.getLocation(point,callbackGeo);
    }

    for(var i=0;i<clusterData.length;i++){
        getLocation(clusterData[i],pts[i]);
    }

    var timer = setInterval(function(){
        if(nPages>=clusterData.length){
            clearInterval(timer);
            callbackFunc(weiboData,clusterData);
        }
    },100);

}
/*
function overlaycomplete(e){
    var overlay = e.overlay;
    console.log(overlay);
    drawingManager.close();
}

NS.setRegionSelection = function(flag){
    if(flag){
        drawingManager.open();
    }else{
        drawingManager.close();
    };
};
*/
NS.transformGPSCoord = function(weiboData,data,callbackFunc){
    var points=[];
    var results=[];
    var weibos=[];
    for(var i=0;i<data.length;i+=20){
        var point=[];
        var weiboList =[];
        for(var j=0;j<20;j++){
            if((i+j)>=data.length){
                break;
            }
            weiboList.push(weiboData[i+j]);
            point.push(new BMap.Point(data[i+j].x,data[i+j].y));
        }
        weibos.push(weiboList);
        points.push(point);
    }
    var nPages=0;

    function getWeiboGeoShift(weibos,pts){
    
        function callbackGeo(xyResults){
            nPages++;
            results=results.concat(xyResults);
            for(var i=0;i<pts.length;i++){
                var p = new BMap.Point(xyResults[i].x,xyResults[i].y);
                weibos[i].geo.coordinates[1]=p.lng;
                weibos[i].geo.coordinates[0]=p.lat;
                if(!p.lng || !p.lat){
                    weibos[i].geo.coordinates[1]=weibos[i].geo.gpsCoordinates[1];
                    weibos[i].geo.coordinates[0]=weibos[i].geo.gpsCoordinates[0];
                }
            }
        }
    
        BMap.Convertor.transMore(pts,0,callbackGeo);
    }
    
    for(var i=0;i<weibos.length;i++){
        getWeiboGeoShift(weibos[i],points[i]);
    }

/*
    for(var i=0;i<points.length;i++){
       BMap.Convertor.transMore(points[i],0,callbackGeo);
    }
*/
    var timer = setInterval(function(){
        if(nPages>=points.length){
            clearInterval(timer);
            /*
            console.log(results);
            var returnP=[];
            for(var i=0;i<results.length;i++){
                returnP.push(new BMap.Point(results[i].x,results[i].y));
            }
            */

            callbackFunc(weiboData);
        }
    },100);
}

NS.zoomToQueryArea = function(queryArea){
    var vp = getViewport(queryArea);
    console.log(vp);
    //map.centerAndZoom(new BMap.Point(point.lng,point.lat),11);
    map.centerAndZoom(vp.center,vp.zoom);
}

function getViewport(bound) {
    var sw = new BMap.Point(bound.swLng, bound.swLat),
        ne = new BMap.Point(bound.neLng, bound.neLat);
    return map.getViewport([sw, ne], {margins: [0,0,0,0], zoomFactor: 0});
}


//创建地图函数：
function createMap(divid){
    var map = new BMap.Map(divid);//在百度地图容器中创建一个地图
    window.map = map;//将map变量存储在全局
}

function initMap(){
    // var vp = getViewport(bound);
    map.centerAndZoom("北京");//设定地图的中心点和坐标并将地图显示在地图容器中
}

//地图事件设置函数：
function setMapEvent(){
    map.enableDragging();//启用地图拖拽事件，默认启用(可不写)
    map.enableScrollWheelZoom();//启用地图滚轮放大缩小
    console.log("enable");
    map.enableDoubleClickZoom();//启用鼠标双击放大，默认启用(可不写)
    map.enableKeyboard();//启用键盘上下左右键移动地图
}

//地图控件添加函数：
function addMapControl(){
    //向地图中添加缩放控件
    var ctrl_nav = new BMap.NavigationControl({anchor:BMAP_ANCHOR_TOP_LEFT,type:BMAP_NAVIGATION_CONTROL_LARGE});
    map.addControl(ctrl_nav);
    //向地图中添加缩略图控件
    var ctrl_ove = new BMap.OverviewMapControl({anchor:BMAP_ANCHOR_BOTTOM_RIGHT,isOpen:1});
    map.addControl(ctrl_ove);
    //向地图中添加比例尺控件
    var ctrl_sca = new BMap.ScaleControl({anchor:BMAP_ANCHOR_BOTTOM_LEFT});
    map.addControl(ctrl_sca);
    
    map.addControl(new BMap.MapTypeControl({type:BMAP_MAPTYPE_CONTROL_HORIZONTAL, mapTypes: [BMAP_NORMAL_MAP,BMAP_SATELLITE_MAP]})); 
    map.setCurrentCity("北京");
}

function addMyListeners(handler) {
	map.addEventListener("movestart", handler);
	map.addEventListener("moving", handler);
	map.addEventListener("moveend", handler);
	map.addEventListener("zoomstart", handler);
	map.addEventListener("zoomend", handler);
	map.addEventListener("load", handler);
	map.addEventListener("resize", handler);
	
	map.addEventListener("load", function() {
	    // console.log("map load");
	});
	
	map.addEventListener("tilesloaded", function() {
	    // console.log("map tilesloaded");
	});

    

}

return NS;

})();
