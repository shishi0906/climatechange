var fullwidth = 600;
var fullheight = 400;
var margin = {top:10, right: 40, bottom: 40, left: 30};
var width = fullwidth - margin.left - margin.right;
var height = fullheight - margin.top - margin.bottom;
//Set up date formatting and years
var dateFormat = d3.time.format("%B");
//Set up scales
var xScale = d3.time.scale()
          .range([ 0, width ]);
var yScale = d3.scale.linear()

          .range([ 0, height ]);
//Configure axis generators
var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(6)
        .tickFormat(function(d) {
          return dateFormat(d);
        })
        .outerTickSize([0]);
var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .outerTickSize([0]);
//Configure line generator
// each line dataset must have a d.year and a d.amount for this to work.
var line = d3.svg.line()
  .x(function(d) {
    return xScale(dateFormat.parse(d.month));
  })
  .y(function(d) {
    return yScale(+d.temperature);
  });
//Create the empty SVG image
var svg = d3.select("body")
      .append("svg")
      .attr("width", fullwidth)
      .attr("height", fullheight)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip");
//Load data
d3.csv("data/Global temperature monthly.csv", function(data) {
  //New array with all the years, for referencing later
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  // or you could get this by doing:
  // var years = d3.keys(data[0]).slice(0, 54-4); //
  //Create a new, empty array to hold our restructured dataset
  var dataset = [];
  //Loop once for each row in data
  data.forEach(function (d, i) {
    var monthTemperature = [];
    //Loop through all the years - and get the emissions for this data element
    months.forEach(function (y) {
      // If value is not empty
      if (d[y]) {
        //Add a new object to the new emissions data array - for year, amount
        monthTemperature.push({
          year: d.Year, // we can put the country in here too. It won't hurt.
          month: y,
          temperature: d[y]  // this is the value for, for example, d["2004"]
        });
      }
    });
    //Create new object with this country's name and empty array
    // d is the current data row... from data.forEach above.
    dataset.push( {
      year: d.Year,
      temperatures: monthTemperature  // we just built this!
      } );
  });
  //Uncomment to log the original data to the console
  // console.log(data);
  //Uncomment to log the newly restructured dataset to the console
  console.log(dataset);
  //Set scale domains - max and mine of the years
  xScale.domain(
    d3.extent(months, function(d) {
      return dateFormat.parse(d);
    }));
  // max of emissions to 0 (reversed, remember)
  yScale.domain([
    d3.max(dataset, function(d) {
      return d3.max(d.temperatures, function(d) {
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
  var groups = svg.selectAll("g")
    .data(dataset)
    .enter()
    .append("g");
  //Within each group, create a new line/path,
  //binding just the emissions data to each one
  groups.selectAll("path")
    .data(function(d) { // because there's a group with data already...
      return [ d.temperatures ]; // it has to be an array for the line function
    })
    .enter()
    .append("path")
    .attr("class", "line")
    .attr("d", line);
    //.classed("unfocused", true) // they are not focused till mouseover
    //.attr("id", function(d) {
      // we are attaching an id to the line using the countryname, replacing
      // the spaces with underscores so it's a valid id.
      // this will be useful when we do the mouseover and want to highlight a line too.
      //if (d[0] && d[0].length != 0) {
        // this if-test makes sure there is an array and it's not empty.
        //return d[0].month.replace(/ |,|\./g, '_');
      //}
    //})
groups
  .on("mouseover",TogetherIn)
  .on("mouseout",TogetherOut);


// Tooltip dots
var circles = groups.selectAll("circle")
          .data(function(d) { // because there's a group with data already...
                return d.temperatures; // NOT an array here.
          })
          .enter()
          .append("circle");
  circles.attr("cx", function(d) {
      return xScale(dateFormat.parse(d.month));
    })
    .attr("cy", function(d) {
      return yScale(d.temperature);
    })
    .attr("r", 1)
    .attr("id", function(d, i) {
              if (i == 0 || i == 1 || i == 2 || i == 3 || i == 4 || i == 5 || i == 6 || i == 7 || i == 8 || i == 9 || i == 10 ||i == 11) {
                  return "highlight";
              } else { return null; }
          })
    .style("opacity", 0); // this is optional - if you want visible dots or not!
  // Adding a subtle animation to increase the dot size when over it!
  circles
    .on("mouseover", mouseoverFunc)
    .on("mousemove", mousemoveFunc)
    .on("mouseout",	mouseoutFunc);
// We're putting the text label at the group level, where the country name was originally.
//We can access data here, because it's already attached!
// We use the scales to position labels at end of line.
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
  .attr("dx", "3px")
  .attr("dy", "3px")
  .text(function(d) {
    return d.year;
  })
  .classed("hide", function(d) {
    // hide the labels that are too "low" to be interesting
    var lastValue = d.temperatures[d.temperatures.length -1].temperature;
    if (lastValue == 110) {
      return false;
    } else {
      return true;
    }
  });

  /*groups.append("text")
      .datum(function(d) {
  console.log("Here", {year: d.Year, value: d.temperatures[d.temperatures.length - 1]});

      return {year: d.Year, value: d.temperatures[d.temperatures.length - 1]};
                 })
.attr("transform", function(d) {
    console.log("in transform", d);
    if (d.value) {
      return "translate(" + xScale(dateFormat.parse(d.value.month)) + "," + yScale(+d.value.month) + ")";
      }
    else {
      return null;
      }
    })
  .attr("x", 3.5)
  .attr("dy", ".35em")
  .text(function(d) {
    return d.year;
  })*/

  //Axes
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);
  function mouseoverFunc(d) {
    // this will highlight both a dot and its line.
    //var lineid = d3.select(this).attr("id");
    d3.select(this)
      .transition()
      .style("opacity", 1)
      .attr("r", 6);
    d3.select(this).select("text").classed("hide", false);

    //console.log(d);
    tooltip
      .style("display", null) // this removes the display none setting from it
      .html("<p>Year: " + d.year +
            "<br>Month: " + d.month +
            "<br>Temperature: " + d.temperature + " °F</p>");
    }
  function mousemoveFunc(d) {
    tooltip
      .style("top", (d3.event.pageY - 10) + "px" )
      .style("left", (d3.event.pageX + 10) + "px");
    }
  function mouseoutFunc(d) {
    d3.select(this)
      .transition()
      .style("opacity", 0)
      .attr("r", 3);
    //d3.selectAll("path.line").classed("unfocused", true).classed("focused", false);
    tooltip.style("display", "none");  // this sets it to invisible!
  }
  function TogetherIn(d){
      d3.select(this).select("path")
        .attr("id", "focused");
      d3.select(this).select("text")
        .attr("id", "focused");
      d3.select(this).selectAll("circle#highlight")
        .transition()
        .style("opacity", 1)
        .attr("r", 4);
      d3.select(this).select("text").classed("hide", false);

    }

  function TogetherOut(d) {
      d3.select(this).select("path")
         .attr("id", null);
      d3.select(this).select("text")
        .attr("id", null);
      d3.select(this).selectAll("circle#highlight")
        .transition()
        .style("opacity", 0)
        .attr("r", 3);
      d3.select(this).select("text").classed("hide", true);
    }

});
