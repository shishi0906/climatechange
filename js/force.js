var fullwidth = 600;
var fullheight = 400;
var margin = {top: 0, right: 50, bottom: 40, left:50};
var width = fullwidth - margin.left - margin.right;
var height = fullheight - margin.top - margin.bottom;
//Set up date formatting and years
var dateFormat = d3.time.format("%Y");
//Set up scales
var xScale = d3.time.scale()
          .range([ 0, width ]);
var yScale = d3.scale.linear()
          .range([ 0, height ]);
//Configure axis generators
var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(15)
        .tickFormat(function(d) {
          return dateFormat(d);
        })
        .outerTickSize([0])
        .innerTickSize([0]);
var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .outerTickSize([0]);
//Configure line generator
// each line dataset must have a d.year and a d.amount for this to work.
var line = d3.svg.line()
  .x(function(d) {
    return xScale(dateFormat.parse(d.year));
  })
  .y(function(d) {
    return yScale(+d.amount);
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
d3.csv("data/forces.csv", function(data) {
  //New array with all the years, for referencing later

  // or you could get this by doing:
  var years = d3.keys(data[0]).filter(function(d){return d!="allForces";}); //

  console.log(years);
  //Create a new, empty array to hold our restructured dataset
  var dataset = [];
  //Loop once for each row in data
  data.forEach(function (d, i) {
    var myForces = [];
    //Loop through all the years - and get the emissions for this data element
    years.forEach(function (y) {
      // If value is not empty
      if (d[y]) {
        //Add a new object to the new emissions data array - for year, amount
        myForces.push({
          force: d.allForces, // we can put the country in here too. It won't hurt.
          year: y,
          amount: d[y]  // this is the value for, for example, d["2004"]
        });
      }
    });
    //Create new object with this country's name and empty array
    // d is the current data row... from data.forEach above.
    dataset.push( {
      force: d.allForces,
      forces: myForces  // we just built this!
      } );
  });
  //Uncomment to log the original data to the console
  // console.log(data);
  //Uncomment to log the newly restructured dataset to the console
  //console.log(dataset);
  //Set scale domains - max and mine of the years
  xScale.domain(
    d3.extent(years, function(d) {
      return dateFormat.parse(d);
    }));
  // max of emissions to 0 (reversed, remember)
  yScale.domain([
    d3.max(dataset, function(d) {
      return d3.max(d.forces, function(d) {
        return +d.amount;
      });
    }),
    d3.min(dataset, function(d) {
      return d3.min(d.forces, function(d) {
        return +d.amount;
      });
    })
  ]);
  //Make a group for each country
  var groups = svg.selectAll("g")
    .data(dataset)
    .enter()
    .append("g")
    .on("mouseover", mouseoverFunc)  // putting these on the g nodes gets us a lot!
    .on("mouseout",	mouseoutFunc);
  //Within each group, create a new line/path,
  //binding just the emissions data to each one
  groups.selectAll("path")
    .data(function(d) { // because there's a group with data already...
      return [ d.forces ]; // it has to be an array for the line function
    })
    .enter()
    .append("path")
    .attr("class", "line")
    .attr("d", line);
// We're putting the text label at the group level, where the country name was originally.
groups.append("text")
.attr("x", function(d) {
    if (d.forces.length != 0) {
      var lastYear = d.forces[d.forces.length-1].year;
      return xScale(dateFormat.parse(lastYear));
    }
  })
  .attr("y", function(d) {
    if (d.forces.length != 0) {
      var lastForce = d.forces[d.forces.length-1].forces;
      return yScale(+lastForce);
    }
  })
  .attr("dx", "3px")
  .attr("dy", "3px")
  .text(function(d) {
	      	if (d.forces.length != 0) {
	      		var lastForce = d.forces[d.forces.length-1].forces;
	      		if (+lastForce > 287) {
	      			return d.force;
	      		}
	      	}
	      })
	      .attr("class", "linelabel");

  // .datum(function(d) {
  //   // this datum move is to access the data at the last data // point and make it easier to refer to below.
  //   return {country: d.force, value: d.forces[d.forces.length - 1]};
  // })
  // .attr("transform", function(d) {
  //   // error on some with no d.value - American Samoa, for instance.
  //   if (d.value) {
  //     return "translate(" + xScale(dateFormat.parse(d.value.year)) + "," + yScale(+d.value.amount) + ")";
  //     }
  //   else {
  //     return null;
  //     }
  //   })
  // .attr("x", 3)
  // .attr("dy", 3)
  // .text(function(d) {
  //   return d.force;
  // })
  // .classed("linelabel", true) // basic formatting of labels
  // .classed("hidden", function(d) {
  //   // hide the labels that are too "low" to be interesting
  //   if (d.value && +d.value.amount < 286) {
  //     return false;
  //   } else {
  //     return true;
  //   }
  // });
  //Axes
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

    // svg.append("g")
    //   .append("line")
    //   .attr("class","line")
    //   .attr("x1",0)
    //   .attr("y1",yScale(287.4))
    //   .attr("x2",width)
    //   .attr("y2",yScale(287.4));

  //Now we handle the functions for the hover effect:
  function mouseoverFunc(d) {
    // the "this" is the g parent node.  That means we can select it, and then select
    // the child nodes and style the]m as we want for the hover effect!
    d3.select(this).select("path").attr("id", "focused"); // overrides the class
    d3.select(this).select("text").classed("hidden", false);  // show it if "hidden"
    d3.select(this).select("text").classed("bolder", true);
    }
  function mouseoutFunc(d) {
    d3.select(this).select("path").attr("id", null); // remove the focus style
    d3.select(this).select("text").classed("bolder", false); // remove the bolding on label
    // rehide the ones that are in the low numbers
    if (+d.forces[d.forces.length-1].amount < 286) {
      d3.select(this).select("text").classed("hidden", true);
    }
  }
});
