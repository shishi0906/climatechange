
function drawGrahpics(){

var margin = {top: 50, right: 80, bottom: 30, left: 50},
    width = 600 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var speed = 600;

var dateFormat = d3.time.format("%Y");

var dateDisplay = d3.time.format("%Y");

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();


var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(155)
    .tickSize(0)
    .orient("top");

// var xtickLabels = ["1850","2005"];
var years = ["1850", "1851", "1852", "1853", "1854", "1855", "1856", "1857", "1858", "1859", "1860", "1861", "1862", "1863", "1864",
"1865", "1866", "1867", "1868", "1869", "1870", "1871", "1872", "1873", "1874", "1875", "1876", "1877", "1878", "1879", "1880", "1881", "1882",
"1883", "1884", "1885", "1886", "1887", "1888", "1889", "1891", "1891", "1892", "1893", "1894", "1895", "1896", "1897", "1898", "1899", "1900",
"1901", "1902", "1903", "1904", "1905", "1906", "1907", "1908", "1909", "1910",
"1911", "1912", "1913", "1914", "1915", "1916", "1917", "1918", "1919", "1920", "1921", "1922", "1923", "1924", "1925", "1926", "1927", "1928",
"1929", "1930", "1931", "1932", "1933", "1934", "1935", "1936", "1937", "1938", "1939", "1940", "1941", "1942", "1943", "1944", "1945", "1946",
"1947", "1948", "1949", "1950", "1951", "1952", "1953", "1954", "1955", "1956", "1957", "1958", "1959", "1960", "1961", "1962", "1963", "1964",
"1965", "1966", "1967", "1968", "1969", "1970", "1971", "1972", "1973", "1974", "1975", "1976", "1977", "1978", "1979", "1980", "1981", "1982",
"1983", "1984", "1985", "1986", "1987", "1988", "1989", "1990", "1991", "1992", "1993", "1994", "1995", "1996", "1997", "1998", "1999", "2000",
"2001", "2002", "2003", "2004", "2005"];

console.log(years.length);

// to display it, you have to reformat it -- doing it twice just so you see...

xAxis.tickFormat(function(d,i){
  // show a label every five years
    if (i%10 == 0) {
     return years[i];
    } else { return "";}
    //return years[i];
  });

var yAxis = d3.svg.axis()
    .scale(y)
    .tickFormat(function(d) { return d;}) // should be a ranking of them?
    .innerTickSize(-width)
    .tickPadding(7)
    .outerTickSize(0)
    .orient("left");

var line = d3.svg.line()
    .x(function(d) { return x(d.counter); })
    .y(function(d) { return y(d.rank); });


var svg = d3.select("#graphic").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    //.call(responsivefy);

var clip = svg.append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("x","-5")
    .attr("y","-20")
    .attr("width", 0)
    .attr("height", height*1.2);

d3.csv("data/force ranking.csv", function(error, data) {

  var columns = d3.keys(data[0]).filter(function(key) { return key !== "year"; });
  color.domain(columns);

  var forces = columns.map(function(name) {
    return {
      name: name,
      values: data.map(function(d, i) {
        return {name: name, year: dateFormat.parse(d.year), counter: i, rank: +d[name]};
      })
    };
  });

  // counter starts at 1
  x.domain([1, data.length]); // number of years == steps in counter

  y.domain([
    d3.min(forces, function(c) { return d3.min(c.values, function(v) { return v.rank ; }); }),
    d3.max(forces, function(c) { return d3.max(c.values, function(v) { return v.rank ; }); })
  ].reverse());

svg.append("g")
      .attr("class", "x axis")
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor","start")
     // .attr("dx", "2.3em")
      .attr("dy", "-0.9em")
      .attr("transform",function(d){
      return "rotate(-60)";
    });

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  //timeline
  svg.append("line")
        .attr(
        {
            "class":"horizontalGrid",
            "x1" : -1,
            "x2" : width,
            "y1" : y(1) - 13, // raise it a bit manually?
            "y2" : y(1) - 13,
            "fill" : "none",
            "shape-rendering" : "crispEdges",
            "stroke" : "#e0e1e1",
            "stroke-width" : "1px",
            "stroke-dasharray": ("3, 3")
        })
        .attr("id","dotted")
        .attr("clip-path", function(d) { return "url(#clip)"; });


  //end of timeline


  var forces = svg.selectAll(".force")
      .data(forces)
    .enter().append("g")
      .attr("class", "force");


 function colorFilter(d){
    if (d.name === "Solar") {
          return "#FFD700";
      } else if (d.name === "Anthropogenic tropospheric aerosol") {
          return "#87CEEB";
      } else if (d.name === "Greenhouse gases"){
        return "#1E90FF";
      } else if (d.name === "Land use"){
        return "#00BFFF";
      } else if (d.name === "Ozone"){
        return "#FFB90F";
      }else if (d.name === "Volcanic"){
        return "#FF7F24";
      }else {
          return "#FFEC8B";}
    }

  var path = svg.selectAll(".force").append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .attr("clip-path", function(d) { return "url(#clip)"; })
      .style("stroke", colorFilter);



var circleStart = forces.append("circle")
      .attr("cx", x(1))
      .attr("cy", function(d) { return y(d.values[0].rank); })
      .style("fill", colorFilter)
      .attr("r", 2);



var circleEnd = forces.append("circle")
      .attr("cx", function(d) { return x(d.values[0].counter); })
      .attr("cy", function(d) { return y(d.values[0].rank);} )
      .style("fill", colorFilter)
      .attr("r", 2);


var timemark = forces.append("path")
                  .attr("d", d3.svg.symbol().type("triangle-up"))
                  .style("fill", "grey")
                  .attr("transform",function(d) { return "translate(" + x(d.values[0].counter) + "," + (y(1)-15) + ") rotate(-30)"; })


var round = forces.append("circle")
      .attr("transform", function(d) { return "translate(" + (x(d.values[0].counter) + 15) + "," + (y(d.values[0].rank)) + ")"; })
      .attr("x", 0)
      .attr("y",0)
      .attr("r", 10)
      .on("mouseover", function (d) {
        forces.style("opacity",0.1);
        forces.filter(function(path) {return path.name === d.name; }).style("opacity",1);
      })
      .on("mouseout", function (d) { forces.style("opacity",1); })
      .style("fill", colorFilter);


  var amounting = forces.append("text")
      .attr("transform", function(d) { return "translate(" + (x(d.values[0].counter) + 15 ) + "," + (y(d.values[0].rank) ) + ")"; })
      .attr("x", 0)
      .attr("dy", ".31em")
      .attr("text-anchor","middle")
      .on("mouseover", function (d) {
        forces.style("opacity",0.1);
        forces.filter(function(path) {return path.name === d.name; }).style("opacity",1);
      })
      .on("mouseout", function (d) { forces.style("opacity",1); })
      .style("cursor","pointer")
      .style("fill", "#ffffff")
      .style("font-weight", "bold")
      .text(function(d) { return d.values[0].rank; });


  var label = forces.append("text")
  //parse
      .attr("transform", function(d) { return "translate(" + (x(d.values[0].counter) + 20) + "," + y(d.values[0].rank) + ")"; })
      .attr("x", 8)
      .attr("dy", ".31em")
      .attr("id","label")
      .on("mouseover", function (d) {
        forces.style("opacity",0.1);
        forces.filter(function(path) {return path.name === d.name; }).style("opacity",1);
      })
      .on("mouseout", function (d) { forces.style("opacity",1); })
      .style("cursor","pointer")
      .style("stroke", colorFilter)
      .text(function(d) { return d.name; });


  var counter = 1;

  var transition = d3.transition()
    .delay(500)
    .duration(speed)
    .each("start", function start() {

      label.transition()
        .duration(speed)
        .ease('linear')
        //parse
      .attr("transform", function(d) {
        return "translate(" + (x(d.values[counter].counter) + 20) + "," + y(d.values[counter].rank) + ")"; })
      .text(function(d) { return  d.name; });

      amounting.transition()
        .duration(speed)
        .ease('linear')
        .attr("transform", function(d) { return "translate(" + (x(d.values[counter].counter) + 15) + "," + y(d.values[counter].rank)  + ")"; })
      .text(function(d,i) { return  d.values[counter].rank; });

      round.transition()
        .duration(speed)
        .ease('linear')
        .attr("transform", function(d) { return "translate(" + (x(d.values[counter].counter) + 15) + "," + y(d.values[counter].rank) + ")"; });

      circleEnd.transition()
        .duration(speed)
        .ease('linear')
        .attr("cx", function(d) { return x(d.values[counter].counter); })
        .attr("cy", function(d) { return y(d.values[counter].rank); });

      clip.transition()
        .duration(speed)
        .ease('linear')
        .attr("width", x(counter+1)+5)
        .attr("height", height*1.2);

      timemark.transition()
         .duration(speed)
         .ease('linear')
         .attr("transform",function(d) { return "translate(" + (x(d.values[counter].counter)) + "," + (y(1)-15) + ") rotate(-30)"; })


      counter += 1;

      if (counter !== data.length){
        transition = transition.transition().each("start", start);}
      });



  // combined function for each candidate
  // ids are not necessary (just use jquery selector)
    $(".forcename").on("click",function(){
      // get the name of the candidate the user clicked on
      var nameOfForce = $(this).text();
      // use d3 to change the style of all except for the clicked one
        forces.style("opacity",0.1);
        forces.filter(function(path) {
          return path.name === nameOfForce;
        }).style("opacity",1);
      });


   });


      function responsivefy(svg) {

        var container = d3.select(svg.node().parentNode),
            width = parseInt(svg.style("width")),
            height = parseInt(svg.style("height")),
            aspect = width / height;

        svg.attr("viewBox", "0 0 " + width + " " + height)
            .attr("perserveAspectRatio", "xMinYMid")
            .call(resize);

        d3.select(window).on("resize." + container.attr("#graphic"), resize);

        function resize() {
            var targetWidth = parseInt(container.style("width"));
            svg.attr("width", targetWidth * 0.8);
            svg.attr("height", Math.round(targetWidth /aspect * 0.8));
        }
    }

}
