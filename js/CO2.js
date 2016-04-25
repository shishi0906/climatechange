var fullwidth = 550;
var fullheight = 400;
var margin = { top: 20, right: 50, bottom: 50, left: 50};
var width = fullwidth - margin.left - margin.right;
var height = fullheight - margin.top - margin.bottom;
//Set up date formatting and years
var dateFormat = d3.time.format("%m-%Y");
var xScale = d3.time.scale()
          .range([ 0, width ]);
var yScale = d3.scale.linear()
          .range([ 0, height ]);
var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(15)
        .tickFormat(function(d) {
          return d3.time.format("%Y")(d);
        });
var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");
var line = d3.svg.line()
  .x(function(d) {
    return xScale(dateFormat.parse(d.year));
  })
  .y(function(d) {
    return yScale(d.emissions);
  });
var tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip");
var svg = d3.select("body")
      .append("svg")
      .attr("width", fullwidth)
      .attr("height", fullheight)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var path = svg
      .append("path");

      // you need a path to be created before you can get the length.
    var totalLength = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .style("display", null) // now we can display it
      .transition()
        .duration(2000)
        .ease("linear")
        .attr("stroke-dashoffset", 0);


d3.csv("data/CO2 concetration monthly.csv", function(myData) {
  // get the min and max of the years in the data, after parsing as dates!
  xScale.domain(d3.extent(myData, function(d){
      return dateFormat.parse(d.year);
      })
  );
  // the domain is from the max of the emissions to 0 - remember it's reversed.
  yScale.domain([ d3.max(myData, function(d) {
      return +d.emissions;
    }),
    d3.min(myData, function(d) {
        return +d.emissions;
      })
  ]);
  console.log("my data", myData);
  var myData2=[];
  var segment=[myData[0]];
  for (var i=1,trend="up";i<myData.length;i++){
    if (trend="up"){
      if (myData[i].emissions>myData[i-1].emissions){
        segment.push(myData[i]);
      }else{
        myData2.push(segment);
        trend="down";
        segment=[];
    segment.push(myData[i-1]);
    segment.push(myData[i]);
      }
    }
    else if (trend=="down"){
      if(myData[i].emissions<myData[i-1].emissions){
        segment.push(myData[i]);
      }else{
        myData2.push(segment);
        trend="up";
        segment=[];
    segment.push(myData[i-1]);
    segment.push(myData[i]);
      }
    }
  }
  svg.selectAll("path")
    .data(myData2)
    .enter()
    .append("path")
    .attr("class", function(d,i){
      if (i%2==0)
      return "upLine";
      else
      return "downLine";
    })
    .attr("d", line)  // line is a function that will operate on the data array, with x and y.
    .attr("fill", "none")
    .attr("stroke","orange")
    .attr("stroke-width", 2);
    var lastItem = myData[myData.length - 1];
      svg.append("text")
        .attr("x", xScale(dateFormat.parse(lastItem.year)))
        .attr("y", yScale(+lastItem.emissions))
        .attr("class", "label")
        .text(lastItem.emissions);


  // dots go on top of the line!
 var circles = svg.selectAll("circle")
          .data(myData)
          .enter()
          .append("circle");
  circles.attr("cx", function(d) {
      return xScale(dateFormat.parse(d.year));
    })
    .attr("cy", function(d) {
      return yScale(d.emissions);
    })
    .attr("r", 3)
    .style("opacity", 0); // this is optional - if you want visible dots or not!
  circles
    .on("mouseover", mouseoverFunc)
    .on("mousemove", mousemoveFunc)
    .on("mouseout",	mouseoutFunc);
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);
});


function mouseoverFunc(d) {
// Adding a subtle animation to increase the dot size when over it!
d3.select(this)
  .transition()
  .duration(50)
  .style("opacity", 1)
  .attr("r", 4);
tooltip
  .style("display", null) // this removes the display none setting from it
  .html("<p>Month-Year: " + d.year +
        "<br>Emissions: " + d.emissions + " ppm</p>");
}
function mousemoveFunc(d) {
tooltip
  .style("top", (d3.event.pageY - 10) + "px" )
  .style("left", (d3.event.pageX + 10) + "px");
}
function mouseoutFunc(d) {
// shrink it back down:
d3.select(this)
  .transition()
  .style("opacity", 0)
  .attr("r", 3);
tooltip.style("display", "none");  // this sets it to invisible!
}
