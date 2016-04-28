
// For use with scroller_template2.html and mfreeman_scroller.js.

// function to move a selection to the front/top, from
// https://gist.github.com/trtg/3922684
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

// Settings object

var settings = {
  // could be used to save settings for styling things.
};

var data = []; // make this global



var vis = d3.select("#vis");

function focus_years(years,yearGroup) {
  console.log("in focus", years);
  // unfocus all, then focus one if given a name.
    if (years) {
    // d3.selectAll("path.line").classed("focused", false);
    // d3.selectAll("path.line").classed("normal", true);
    d3.selectAll("path.line").attr("class","line normal");
    d3.selectAll("text.label").classed("hide", true);
    years.forEach(function (d) {
        var year = d.year;
        var line = d3.select("g.lines#y" + year + " path.line");
        line.classed("focused", true);
        var text = d3.select("text#y" + year);
        text.classed("hide",false);
        if(yearGroup!=""){
          line.classed(yearGroup, true);
        }
        var lineGroup = d3.select("g.lines#y" + year);
        lineGroup.moveToFront();
    });
  }
}

var update = function(value) {
  var years = [];
  var localdata = data;
  var show_vis = true;
  var yearGroup;
  switch(value) {
    case 0:
      console.log("in case", value);
      localdata = data;
      yearGroup="";
      break;
    case 1:
      console.log("in case", value);
      localdata = data;
      years = data.filter(function(d) {
        return d.year == "2015" || d.year == "2014" || d.year == "2013";
      });
      yearGroup = "high";
      break;
    case 2:
      console.log("in case", value);
      //yScale = d3.scale.sqrt().range([margin.top, height - margin.bottom]);
      localdata = data;
      years = data.filter(function(d) {return d.year == "1880" || d.year == "1881" || d.year == "1882" ;});
      yearGroup = "start";
      break;
    case 3:
      console.log("in case", value);
      years = data.filter(function(d) {return d.year == "1909" || d.year == "1910" || d.year == "1911" || d.year == "1912";});
      yearGroup = "low";
      break;
    default:
      years = [];
      show_vis = true;
      draw_lines(localdata);
      break;
  }
  console.log("show viz", show_vis);
  if (show_vis) {
    vis.style("display", "inline-block");
  } else {
    vis.style("display", "none");
  }

  draw_lines(localdata); // we can update the data if we want in the cases. Draw before focus!
  focus_years(years, yearGroup); // this applies a highlight on a year lineGroup.

}
// setup scroll functionality

function display(error, mydata) {
  if (error) {
    console.log(error);
  } else {
    console.log(data);

    var vis = d3.select("#vis");

    data = make_data(mydata); // assign to global; call func in line_chart_refactor.js

    //console.log("after makedata", data);

    var scroll = scroller()
      .container(d3.select('#graphic'));

    // pass in .step selection as the steps
    scroll(d3.selectAll('.step'));

    // Pass the update function to the scroll object
    scroll.update(update);

    // This code hides the vis when you get past it.
    // You need to check what scroll value is a good cutoff.

    var oldScroll = 1;
    $(window).scroll(function (event) {
      var scroll = $(window).scrollTop();
      console.log("scroll", scroll);
      if (scroll >= 1500 && scroll > oldScroll) {
          vis.style("display", "none");
       } else if (scroll >= 1500 && scroll < oldScroll) {
        vis.style("display", "inline-block"); // going backwards, turn it on.
       }
      oldScroll = scroll;
    });

  }

} // end display

queue()
  .defer(d3.csv, "data/Global temperature monthly.csv")
  .await(display);
