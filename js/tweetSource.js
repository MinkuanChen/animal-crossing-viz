class TweetSource {

    constructor(parentElement, data, config) {
        this.displayData = data;
        this.parentElement = parentElement;
        this.config = config;
        this.bg_sourceChart();

    }

    bg_sourceChart() {
        let vis = this;
        let nestedData = d3.rollup(vis.displayData, leaves => leaves.length, d => d[vis.config.key]);
        vis.nestedData = Array.from(nestedData, ([key, value]) => ({key, value}))

        var topTenSources = vis.nestedData.sort(function (a, b) {
            return b.value - a.value;
        }).slice(0,5);

        vis.tstooltip = d3.select("#tweetsources")
            .append("div")
            .attr("class", "tstooltip")
            .attr("id", "tweetSourceTooltip");

        const root = d3.hierarchy({values: topTenSources}, function(d) { return d.values; }).sum(function(d){ return d.value})

        // set the dimensions and margins of the graph
        vis.margin = {top: 30, right: 20, bottom: 40, left: 20};
        vis.width = $("#tweetsources").width() - vis.margin.left - vis.margin.right;
        vis.height =$("#tweetsources").height() - vis.margin.top - vis.margin.bottom;

        // append the svg object to the body of the page
        vis.svg = d3.select("#tweetsources")
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


        // prepare a color scale
        vis.color = d3.scaleOrdinal()
             .range(["#017c74"]);

        vis.tweetDomain = d3.extent(topTenSources.map((d) => +d.value))

        // And a opacity scale
        vis.opacity = d3.scaleOrdinal()
            .domain([vis.tweetDomain])
            .range([1,.8,.6,.4,.3,.2]);

        vis.treemapLayout = d3.treemap()
            .size([vis.width, vis.height])
            .padding(4)
            .paddingOuter(20);

        vis.treemapLayout(root);
        //treemap format adapted from Mike Bostock. Published source noted at the bottom
        d3.select("#tweetsources")
            .select('g')
            .selectAll("rect")
            .data(root.leaves())
            .join("rect")
            .attr('x', function (d) { return d.x0})
            .attr('y', function (d) { return d.y0})
            .attr('width', function (d) { return d.x1 - d.x0})
            .attr('height', function (d) { return d.y1 - d.y0})
            .style("stroke", "black")
            .style("fill", "#69b3a2")
            .style("fill", function(d){ return vis.color(d.data.key)})
            .style("opacity", function(d){ return vis.opacity(d.data.key)})
            .on('click', function(event, d) {
                d3.selectAll(".rect")
                    .attr("fill", "black");
                d3.select(this)
                    .style("fill", "#ef758a");
                vis.tstooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + -200 + "px")
                    .style("top", event.pageY + "px")
                tweetSelected = d.data.key
                tweetSelectedArray.push(tweetSelected);
                updateBarVisualization(tweetSelectedArray);
            })

        //add the text and value labels
        d3.select("#tweetsources")
            .select('g')
            .selectAll("text")
            .data(root.leaves())
            .enter()
            .append("text")
            .attr("x", function(d){ return d.x0+5})
            .attr("y", function(d){ return d.y0+20})
            .text(function(d){ return d.data.key})
            .attr("font-size", "10px")
            .attr("fill", "black");

        d3.select("#tweetsources")
            .select('g')
            .selectAll("vals")
            .data(root.leaves())
            .enter()
            .append("text")
            .attr("x", function(d){ return d.x0+5})
            .attr("y", function(d){ return d.y0+35})
            .text(function(d){ return d.data.value })
            .attr("font-size", "9px")
            .attr("fill", "black");
    }
}

/*
References and Inspiration:
https://observablehq.com/@d3/treemap
 */
