var fullwidth = 600;
var fullheight = 500;

var margin = {
top: 50,
right: 50,
bottom: 20,
left: 50
};

var width = fullwidth - margin.left - margin.right;
var height = fullheight - margin.top - margin.bottom;


//Set up date formatting and years
var dateFormat = d3.time.format("%B");

//Set up scales
var xScale = d3.time.scale()
.range([0, width]);

var yScale = d3.scale.linear()
.range([ 0,height ]);

//Configure axis generators
var xAxis = d3.svg.axis()
.scale(xScale)
.orient("bottom")
.ticks(6)
.tickFormat(function (d) {
    return dateFormat(d);
})
.innerTickSize(0);

var yAxis = d3.svg.axis()
.scale(yScale)
.orient("left")
.innerTickSize(0);
var tooltip = d3.select("body")
      	.append("div")
      	.attr("class", "mytooltip");
//Configure line generator
// each line dataset must have a d.year and a d.rate for this to work.
var line = d3.svg.line()
.x(function (d) {
    return xScale(dateFormat.parse(d.month));
})
.y(function (d) {
    return yScale(+d.temperature);
});


//Create the empty SVG image
var svg = d3.select("#vis")
.append("svg")
.attr("width", fullwidth)
.attr("height", fullheight)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Add axes

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    .attr("x", width)
    .attr("y", margin.bottom / 3)
    .attr("dy", "1.5em")
    .style("text-anchor", "end")
    .attr("class", "label")
    .text("Month");

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -margin.top)
    .attr("y", -2*margin.left / 3)
    .attr("dy", "1.5em")
    .style("text-anchor", "end")
    .attr("class", "label")
    .text("Tempearture");

var months = [];

function make_data(rawdata) {

    months = d3.keys(rawdata[0]).filter(function(d){return d!="Year";});
    console.log(months);

    //Create a new, empty array to hold our restructured dataset
    var dataset = [];

    //Loop once for each row in data
    rawdata.forEach(function (d, i) {

        var monthTemperature = [];

        months.forEach(function (m) { //Loop through all the years - and get the rates for this data element

            if (d[m]) { /// What we are checking is if the "y" value - the year string from our array, which would translate to a column in our csv file - is empty or not.

                monthTemperature.push({ //Add a new object to the new rates data array - for year, rate. These are OBJECTS that we are pushing onto the array
                    year: d.Year,
                    month: m, // this is the value for, for example, d["2004"]
                    temperature:d[m]
                });
            }

        });
        dataset.push({ // At this point we are accessing one index of data from our original csv "data", above and we have created an array of year and rate data from this index. We then create a new object with the Country value from this index and the array that we have made from this index.
        year: d.Year,
        temperatures: monthTemperature// we just built this from the current index.
        });

    });

    return dataset;
}

function draw_lines(dataset) {

    //console.log(dataset);

    //Set scale domains - max and min of the years
    xScale.domain(
      d3.extent(months, function(d) {
        return dateFormat.parse(d);
      }));

      console.log("dm",xScale.domain());
    // max of rates to 0 (reversed, remember)
    yScale.domain([
        d3.max(dataset, function (d) {
            return d3.max(d.temperatures, function (d) {
                return +d.temperature;
            });
        }),
        d3.min(dataset, function(d) {
      return d3.min(d.temperatures, function(d) {
        return +d.temperature;
      });
    })
    ]);

    //Make a group for each country
    var groups = svg.selectAll("g.lines")
        .data(dataset, function(d) {return d.year;}); // key value!

    groups
        .enter()
        .append("g")
        .attr("class", "lines")
        .attr("id", function (d) {
            return "y" + d.year;
        });


    groups.exit().transition().duration(1000).attr("opacity", 0).remove();




    //Within each group, create a new line/path,
    //binding just the rates data to each one
    var lines = groups.selectAll("path.line")
        .data(function (d) { // because there's a group with data already...
            return [d.temperatures]; // it has to be an array for the line function
        });

    lines
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("d", line)
        .classed("normal", true)
        .classed("focused", false); // gives gray color

    lines.exit().transition().duration(1000).attr("opacity", 0).remove();

    svg.select('.x.axis').transition().duration(300).call(xAxis);

    // same for yAxis but with more transform and a title
    svg.select(".y.axis").transition().duration(300).call(yAxis);

    groups.append("text")
  .attr("x", function(d) {
    if (d.temperatures.length != 0) {
      var lastMonth = d.temperatures[d.temperatures.length-1].month;
      return xScale(dateFormat.parse(lastMonth));
    }
  })
  .attr("y", function(d) {
    if (d.temperatures.length != 0) {
      var lastTemperature = d.temperatures[d.temperatures.length-1].temperature;
      return yScale(+lastTemperature);
    }
  })
  .text(function(d) {
    return d.year;
  })
  .classed("hide", false)
  // .attr ("style", function(d) {
  //   // hide the labels that are too "low" to be interesting
  //   var lastValue = d.temperatures[d.temperatures.length -1].temperature;
  //   if (lastValue == 110 ) {
  //     return "display:block";
  //   }
  // });
    d3.selectAll("g.lines")
    					.on("mouseover", mouseoverFunc)
    					.on("mouseout", mouseoutFunc)
    					.on("mousemove", mousemoveFunc);
  }
              function mouseoverFunc(d) {
                d3.select(this)
                  .transition()
                  .duration(50)
                  .style("opacity", 1);
            		// line styling:
            		// this is the g element. select it, then the line inside it!
            		//console.log(d, this);
            		// d3.selectAll("path.line").classed("unfocused", true);
            		// // now undo the unfocus on the current line and set to focused.
            		// d3.select(this).select("path.line").classed("unfocused", false).classed("focused", true);
            		tooltip
            			.style("display", null) // this removes the display none setting from it
            			.html("<p>" + d.year + "</p>");
            	}
            	function mouseoutFunc() {
                d3.select(this)
                    .transition()
                    .style("opacity", 0);
            			// this removes special classes for focusing from all lines. Back to default.
                  // d3.selectAll("path.line").classed("high", true).classed("focused", true);
                  // d3.selectAll("path.line").classed("start", true).classed("focused", true);
                  // d3.selectAll("path.line").classed("low", true).classed("focused", true);
            			// d3.selectAll("path.line").classed("unfocused", false).classed("focused", false);
            			tooltip.style("display", "none");  // this sets it to invisible!
            	}

            	function mousemoveFunc(d) {
            		//console.log("events", window.event, d3.event);
            		tooltip
            			.style("top", (d3.event.pageY - 10) + "px" )
            			.style("left", (d3.event.pageX + 10) + "px");
            }
