var search = window.location.search.slice(9)
var cluster = search.split('&appname=')[0]
var appname = search.split('&appname=')[1]
appname = appname.split('&teamspace=')[0]
var teamspace = search.split('&teamspace=')[1]
var truncate = function(str, width, left) {
  if (!str) return "";

	if (str.length > width) {
    if (left) {
  		return str.slice(0, width) + "...";
    } else {
  		return "..." + str.slice(str.length - width, str.length);
    }
	}
	return str;
}

var pods = [];
var services = [];
var controllers = [];
var uses = {};

var groups = {};

var insertByName = function(index, value) {
  if (!value || !value.metadata.labels || !value.metadata.name) {
    return;
  }
  // console.log("type = " + value.type + " labels = " + value.metadata.name);
  //	var list = groups[value.metadata.name];
  var key = value.metadata.labels.name;
	var list = groups[key];
	if (!list) {
		list = [];
		groups[key] = list;
	}
	list.push(value);
};

var groupByName = function() {
	$.each(pods.items, insertByName);
	// $.each(controllers.items, insertByName);
	$.each(services.items, insertByName);
};

var matchesLabelQuery = function(labels, selector) {
	var match = true;
	$.each(selector, function(key, value) {
		if (labels[key] != value) {
			match = false;
		}
	});
	return match;
}

var colors = [
	'rgb(213,15,37)',
	'rgb(238,178,17)',
	'rgb(17,178,238)'
]

var connectUses = function() {
	var colorIx = 0;
	var keys = [];
	$.each(uses, function(key) {
		keys.push(key);
	});
	keys.sort(function(a, b) { return a > b; });
	$.each(keys, function(idx) {
		var key = keys[idx];
		var list = uses[key];
		var color = colors[colorIx];
		colorIx++;
		if (colorIx >= colors.length) { colorIx = 0;};
		$.each(pods.items, function(i, pod) {
        var podKey = pod.metadata.labels.name;
         //console.log('connect uses key: ' +key + ', ' + podKey);
			if (podKey == key) {
				$.each(list, function(j, serviceId) {
          //console.log('connect: ' + 'pod-' + pod.metadata.name + ' to service-' + serviceId);
					jsPlumb.connect(
					{
						source: 'pod-' + pod.metadata.name,
						target: 'service-' + serviceId,
						endpoint: "Blank",
						//anchors:["Bottom", "Top"],
            anchors:[[ 0.5, 1, 0, 1, -30, 0 ], "Top"],
						//connector: "Straight",
            connector: ["Bezier", { curviness:75 }],
						paintStyle:{lineWidth:2,strokeStyle:color},
						overlays:[
    						[ "Arrow", { width:15, length:30, location: 0.3}],
    						[ "Arrow", { width:15, length:30, location: 0.6}],
    						[ "Arrow", { width:15, length:30, location: 1}],
    					],
					});
				});
			}
		});
	});
};

var makeGroupOrder = function() {
  var groupScores = {};
  $.each(groups, function(key, val) {
    //console.log("group key: " + key);
		if (!groupScores[key]) {
		  groupScores[key] = 0;
		}
		if (uses[key]) {
			value = uses[key];
		  $.each(value, function(ix, uses_label) {
				if (!groupScores[uses_label]) {
				    groupScores[uses_label] = 1;
				} else {
				    groupScores[uses_label]++;
				}
			});
		} else {
			if (!groupScores["no-service"]) {
				groupScores["no-service"] = 1;
			} else {
				groupScores["no-service"]++;
			}
		}
	});
  var groupOrder = [];
  $.each(groupScores, function(key, value) {
    groupOrder.push(key);
	});
  groupOrder.sort(function(a, b) { return groupScores[a] - groupScores[b]; });

	//console.log(groupOrder);
  return groupOrder;
};

var renderNodes = function() {
	var y = 25;
	var x = 100;
  $.each(nodes.items, function(index, value) {
		var div = $('<div/>');
    var ready = 'not_ready';
    $.each(value.status.conditions, function(index, condition) {
      if (condition.type === 'Ready') {
        ready = (condition.status === 'True' ? 'ready' : 'not_ready' )
      }
    });

 		var eltDiv = $('<div class="window node ' + ready + '" title="' + value.metadata.name + '" id="node-' + value.metadata.name +
                 '" style="left: ' + (x + 250) + '; top: ' + y + '"/>');
	  eltDiv.html('<span><b>Node</b><br/><br/>' +
          truncate(value.metadata.name, 6) +
          '</span>');
    div.append(eltDiv);

	  var elt = $('.nodesbar');
		elt.append(div);

    x += 120;
 });
}

var renderGroups = function() {
	var elt = $('#sheet');
	var y = 10;
	var serviceLeft = 0;
	var groupOrder = makeGroupOrder();
  var counts = {}
	$.each(groupOrder, function(ix, key) {
		list = groups[key];
		// list = value;
    if (!list) {
    	return;
    }
		var div = $('<div/>');
		var x = 100;
		$.each(list, function(index, value) {
      //console.log("render groups: " + value.type + ", " + value.metadata.name + ", " + index)
			var eltDiv = null;
      var phase = value.status.phase ? value.status.phase.toLowerCase() : '';
			if (value.type == "pod") {
        if ('deletionTimestamp' in value.metadata) {
          phase = 'terminating';
        }
				eltDiv = $('<div class="window pod ' + phase + '" title="' + value.metadata.name + '" id="pod-' + value.metadata.name +
					'" style="left: ' + (x + 250) + 'px; top: ' + (y + 160) + 'px"/>');
				eltDiv.html('<span>' +
          value.metadata.name +
          (value.metadata.labels.version ? "<br/>" + value.metadata.labels.version : "") + "<br/><br/>" +
          "(" + (value.spec.nodeName ? truncate(value.spec.nodeName, 10) : "None")  +")" +
          '</span>');
			} else if (value.type == "service") {
				eltDiv = $('<div class="window wide service ' + phase + '" title="' + value.metadata.name + '" id="service-' + value.metadata.name +
					'" style="left: ' + 75 + 'px; top: ' + y + 'px"/>');
				eltDiv.html('<span>' +
          value.metadata.name +
          (value.metadata.labels.version ? "<br/><br/>" + value.metadata.labels.version : "") +
          (value.spec.clusterIP ? "<br/><br/>" + value.spec.clusterIP : "") +
          (value.status.loadBalancer && value.status.loadBalancer.ingress ? "<br/><a style='color:white; text-decoration: underline' href='http://" + value.status.loadBalancer.ingress[0].ip + "'>" + value.status.loadBalancer.ingress[0].ip + "</a>" : "") +
          '</span>');
			} else {
        var key = 'controller-' + value.metadata.labels.name;
        counts[key] = key in counts ? counts[key] + 1 : 0;
				//eltDiv = $('<div class="window wide controller" title="' + value.metadata.name + '" id="controller-' + value.metadata.name +
				//	'" style="left: ' + (900 + counts[key] * 100) + '; top: ' + (y + 100 + counts[key] * 100) + '"/>');
        var minLeft = 900;
        var calcLeft = 400 + (value.status.replicas * 130);
        var left = minLeft > calcLeft ? minLeft : calcLeft;
				eltDiv = $('<div class="window wide controller" title="' + value.metadata.name + '" id="controller-' + value.metadata.name +
					'" style="left: ' + (left + counts[key] * 100) + '; top: ' + (y + 100 + counts[key] * 100) + '"/>');
				eltDiv.html('<span>' +
          value.metadata.name +
          (value.metadata.labels.version ? "<br/><br/>" + value.metadata.labels.version : "") +
          '</span>');
			}
			div.append(eltDiv);
			x += 130;
		});
		y += 300;
		serviceLeft += 200;
		elt.append(div);
	});
};

var insertUse = function(name, use) {
  for (var i = 0; i < uses[name].length; i++) {
    if (uses[name][i] == use) {
      return;
    }
  }
  uses[name].push(use);
};

var loadData = function() {
	var deferred = new $.Deferred();
	var newDate = new Date().getTime()

	// var req1 = $.getJSON("/api/v2/clusters/"+ cluster +"/apps/"+ appname +"/topology-pods?"+ newDate, function( data ) {
	var req1 = $.ajax({
		headers:{'teamspace': teamspace},
		type: 'GET',
		dataType:'JSON',
		url: "/api/v2/clusters/"+ cluster +"/apps/"+ appname +"/topology-pods?"+ newDate,
		success:function(data){
			pods = data; // not remove
			$.each(data.items, function(key, val) {
				val.type = 'pod';
				if (val.metadata.labels && val.metadata.labels.uses) {
					var key = val.metadata.labels.name;
					if (!uses[key]) {
						uses[key] = val.metadata.labels.uses.split("_");
					} else {
						$.each(val.metadata.labels.uses.split("_"), function(ix, use) { insertUse(key, use); });
					}
				}
			});

		}
	});



	// var req2 = $.getJSON("/api/v2/clusters/"+ cluster +"/apps/"+ appname +"/topology-services?"+ newDate, function( data ) {
	var req2 = $.ajax({
		headers:{'teamspace': teamspace},
		type: 'GET',
		dataType: 'JSON',
		url: "/api/v2/clusters/"+ cluster +"/apps/"+ appname +"/topology-services?"+ newDate,
		success:function(data) {
			services = data; // not remove
		//console.log(services);
			$.each(data.items, function(key, val) {
				val.type = 'service';
				//console.log("service ID = " + val.metadata.name)
			});

		}
	});


	$.when(req1, req2).then(function() {
		deferred.resolve();
	});


	return deferred;
}

function renderGline(){
	for (var i = 0; i < services.items.length; i++) {
		var service = services.items[i];
		//            if (service.metadata.name == 'kubernetes' || service.metadata.name == 'skydns' || service.metadata.name == 'kubernetes-ro') { continue; }
		for (var j = 0; j < pods.items.length; j++) {
			var pod = pods.items[j];
			//console.log('connect service: ' + 'service-' + service.metadata.name + ' to pod-' + pod.metadata.name);
			if (matchesLabelQuery(pod.metadata.labels, service.spec.selector)) {
				jsPlumb.connect(
					{
						source: 'service-' + service.metadata.name,
						target: 'pod-' + pod.metadata.name,
						anchors: ["Bottom", "Top"],
						paintStyle: { lineWidth: 5, strokeStyle: 'rgb(0,153,57)' },
						endpointStyle: { fillStyle: 'rgb(0,153,57)', radius: 7 },
						connector: ["Flowchart", { cornerRadius: 5 }]
					});
			}
		}
		}
}

function refresh() {
	pods = [];
	services = [];
	// controllers = [];
  nodes = [];
	uses = {};
	groups = {};


	$.when(loadData()).then(function() {
		groupByName();
		$('#sheet').empty();
    // renderNodes();
		renderGroups();
		renderGline()

  });
}

window.addEventListener("message", receiveMessage, false);

function receiveMessage(event) {
	if (event.data == 'topology') {
		refresh()
	}
}

jsPlumb.bind("ready", function() {
	var instance = jsPlumb.getInstance({
		// default drag options
		DragOptions : { cursor: 'pointer', zIndex:200 },
		ConnectionOverlays : [
			[ "Arrow", { location:1 } ]
		],
		Container:"flowchart-demo"
	});

	refresh()

	jsPlumb.fire("jsPlumbDemoLoaded", instance);
});
