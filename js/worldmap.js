var width = 550,
    height = 500,
    center = [width / 2, height / 2],
    defaultFill = "#E18700";

var colorScale = d3.scale.linear().range(["#FFF68F", "#D77D00"]).interpolate(d3.interpolateLab);

var countryById = d3.map(); // will have id's as keys for countries; see typeAndSet()

var projection = d3.geo.mercator()
    .scale(85)
    .translate([width/2-20, height/2+30]);

var path = d3.geo.path()
    .projection(projection);

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 8])
    .on("zoom", move);

var svg = d3.select("#vis").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .call(zoom);

svg.on("wheel.zoom", null);
svg.on("mousewheel.zoom", null);

svg.append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height);

var g = svg.append("g");


//set up tooltip!

var tooltip = d3.select("#tooltip")
 .attr("class", "tooltip")
 .style("opacity", 0);

var ttfh = 120;
var ttfw = 200;

var margin = {top:30, bottom:30, left:20, right:35};

var tth = ttfh - margin.top - margin.bottom;
var ttw = ttfw - margin.left - margin.right;

xScale = d3.time.scale().range([0,ttw]);
yScale = d3.scale.linear().range([tth,0]);

var parseDate = d3.time.format("%Y").parse;
var outputDate = d3.time.format("%Y");

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .tickFormat(d3.format("s"))
    .ticks(3)
    .tickPadding([3])
    .tickSize([0]);

var line = d3.svg.line()
    .x(function(d){
        return xScale(parseDate(d.year));
    })
    .y(function(d){
        return yScale(+d.amount);
    });

var area = d3.svg.area()
    .x(function(d){
        return xScale(parseDate(d.year));
    })
    .y0(tth)
    .y1(function(d){
        return yScale(+d.amount);
    });

var tooltipChart = tooltip
    .append("svg")
    .attr("class","lineChart")
    .attr("width",ttfw)
    .attr("height",ttfh)
    .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")");

var temperatureChanges = {};

queue()
    .defer(d3.json, "js/countries.json")
    .defer(d3.csv, "data/temperature change by country map.csv", typeAndSet)
    .await(ready);

function ready(error, world, temperature) {

    console.log(error, world, temperature);

   //colorScale.domain(d3.extent(temperature, function(d) {return +d["2012"];}));
    colorScale.domain([0.9,1.9]);

    g.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(topojson.feature(world, world.objects.units).features)
        .enter()
        .append("path")
        .attr("d", function(d){
            if(d.id != "ATA")
                return path(d);
        })
        .on("mouseover", mouseover)
        .on("mouseout", function() {
          d3.select(this).classed("selected", false);
          tooltip.transition().duration(300)
            .style("opacity", 0);
        });

    updateFill();

    make_buttons(); // create the zoom buttons

    var legend = d3.legend.color()
      .shapeWidth(15)
        .shapePadding(0)
        .labelFormat(d3.format("s"))
      .orient("vertical")
      .scale(colorScale);

    svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(20," + (height-150) +")")
      .call(legend);

    //tooltip chart
    var years = ["1930", "1960", "1990", "2012"]
    console.log(years);

    temperature.forEach(function(d,i){
        var changes = [];
        years.forEach(function(y){
            if(d[y]){
                changes.push({
                    country: d["countryCode"],
                    year: y,
                    amount: +d[y]
                });
            }
        });

        temperatureChanges[d["countryCode"]] = changes;
    });

    console.log(temperatureChanges);

    xScale.domain(d3.extent(years, function(d){
        return parseDate(d);
    }));

    yScale.domain([0, d3.max(temperatureChanges.JPN, function(d){
        return +d.amount;
    })]);

    tooltipChart
        .datum(temperatureChanges.JPN)
        .append("path")
        .attr("class","area")
        .attr("d",area);

    tooltipChart
        .append("g")
        .attr("class","linechart")
        .append("path")
        .attr("class","line")
        .attr("d",line);

    tooltipChart.append("text")
      .attr("x", 0)
      .attr("y", tth + margin.bottom/2)
      .attr("class", "static_year")
      .style("text-anchor", "start")
      .text(function(d) { return outputDate(parseDate(d[0].year)); });

    tooltipChart.append("text")
      .attr("x", ttw)
      .attr("y", tth + margin.bottom/2)
        .attr("class", "static_year")
      .style("text-anchor", "end")
      .text(function(d) { return outputDate(parseDate(d[d.length - 1].year));});

    tooltipChart.append("g")
        .call(yAxis)
        .attr("class","y axis lineChart")
        .selectAll("text")
        .style("text-anchor","end");

} // end function ready

function make_buttons() {

    // Zoom buttons actually manually constructed, not images
  svg.selectAll(".scalebutton")
      .data(['zoom_in', 'zoom_out'])
    .enter()
      .append("g")
        .attr("id", function(d){return d;})  // id is the zoom_in and zoom_out
        .attr("class", "scalebutton")
        .attr({x: 20, width: 20, height: 20})
      .append("rect")
          .attr("y", function(d,i) { return 20 + 25*i })
          .attr({x: 20, width: 20, height: 20})
  // Plus button
  svg.select("#zoom_in")
    .append("line")
      .attr({x1: 25, y1: 30, x2: 35, y2: 30 })
      .attr("stroke", "#fff")
      .attr("stroke-width", "2px");
  svg.select("#zoom_in")
    .append("line")
      .attr({x1: 30, y1: 25, x2: 30, y2: 35 })
      .attr("stroke", "#fff")
      .attr("stroke-width", "2px");
  // Minus button
  svg.select("#zoom_out")
    .append("line")
      .attr({x1: 25, y1: 55, x2: 35, y2: 55 })
      .attr("stroke", "#fff")
      .attr("stroke-width", "2px");


  svg.selectAll(".scalebutton")
    .on("click", function() {
      d3.event.preventDefault();

      var scale = zoom.scale(),
          extent = zoom.scaleExtent(),
          translate = zoom.translate(),
          x = translate[0], y = translate[1],
          factor = (this.id === 'zoom_in') ? 2 : 1/2,
          target_scale = scale * factor;

      var clamped_target_scale = Math.max(extent[0], Math.min(extent[1], target_scale));
        if (clamped_target_scale != target_scale){
            target_scale = clamped_target_scale;
            factor = target_scale / scale;
        }

        // Center each vector, stretch, then put back
        x = (x - center[0]) * factor + center[0];
        y = (y - center[1]) * factor + center[1];

        // Transition to the new view over 350ms
        d3.transition().duration(350).tween("zoom", function () {
            var interpolate_scale = d3.interpolate(scale, target_scale),
                interpolate_trans = d3.interpolate(translate, [x,y]);
            return function (t) {
                zoom.scale(interpolate_scale(t))
                    .translate(interpolate_trans(t));
                svg.call(zoom.event);
            };
        });
    });
}

function mouseover(d){

  d3.select(this).classed("selected", true);
  d3.select(this).moveToFront();

  tooltip.transition().duration(100)
   .style("opacity", 0.9);

  tooltip
    .style("top", (d3.event.pageY - 10) + "px" )
    .style("left", (d3.event.pageX + 10) + "px");

  var europe = ["Austria","Belgium","Bulgaria","Croatia","Cyprus","Czech","Denmak","Estonia","Finland","France",
  "Germany","Greece","Hungary","Ireland","Italy","Latvia","Lithuania","Luxembourg","Malta","Netherlands","Poland",
  "Portugal","Romania","Slovakia","Slovenia","Spain","Sweden","United Kingdom"]; // add the rest!

  if (countryById.get(d.id) && countryById.get(d.id)["2012"]) {
    var countryName = countryById.get(d.id)['country'];
    if (europe.indexOf(countryName) !== -1) {
       tooltip.select(".name").text("Europe");
       tooltip.select(".val").text(countryById.get(d.id)["2012"]);
     } else {
       tooltip.select(".name").text(countryName);
       tooltip.select(".val").text(countryById.get(d.id)["2012"]);
     }
  } else {
    tooltip.select(".name").text("No data for " + d.properties.name);
    tooltip.select(".val").text("NA");
  }

    yScale.domain([0, d3.max(temperatureChanges[d.id], function(u){
        return +u.amount;
    })]);

    d3.select(".area")
        .datum(temperatureChanges[d.id])
        .attr("d",area);

    d3.select(".linechart path")
        .datum(temperatureChanges[d.id])
        .attr("d",line);

    d3.select(".y.axis")
        .call(yAxis);

} // end mouseover

function typeAndSet(d) {
    d["2012"] = +d["2012"];
    countryById.set(d["countryCode"], d); // this is a d3.map, being given a key, value pair.
    return d;
}

function updateFill() {
  svg.selectAll(".countries path")
    .attr("fill", function(d) {
      if(countryById.get(d.id) && countryById.get(d.id)["2012"])
        return colorScale(countryById.get(d.id)["2012"]);
      else
        return "#ddd";
  });
}

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

function zoomIn() {
    zoom.scale(zoom.scale()*2);
    move();
}

function move() {
  var t = d3.event.translate,
      s = d3.event.scale;
  t[0] = Math.min(width * (s - 1), Math.max(width * (1 - s), t[0]));
  t[1] = Math.min(height * (s - 1), Math.max(height * (1 - s), t[1]));
  zoom.translate(t);
  g.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");
}
