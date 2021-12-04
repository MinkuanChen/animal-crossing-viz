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
        //console.log(vis.nestedData)
        var topTenSources = vis.nestedData.sort(function (a, b) {
            return b.value - a.value;
        }).slice(0,5);


        vis.tstooltip = d3.select("#tweetsources")
            .append("div")
            .attr("class", "tstooltip")
            .attr("id", "tweetSourceTooltip");

        //console.log(topTenSources)

        const root = d3.hierarchy({values: topTenSources}, function(d) { return d.values; }).sum(function(d){ return d.value})

        // console.log(root.leaves())

        // set the dimensions and margins of the graph
        vis.margin = {top: 40, right: 10, bottom: 40, left: 10};
        vis.width =$("#tweetsources").width() - vis.margin.left - vis.margin.right;
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
             //.domain(["Nintendo Switch Share", "Twitter for iPhone", "Twitter for Android","Twitter Web App","Twitter for iPad"])
             .range(["#59b086", "#73b997" , "#7fb69d", "#8ba897","#a4d4a2"]); // comment out and change fill to one color when opacity is figured out

        vis.tweetDomain = d3.extent(topTenSources.map((d) => +d.value))
        console.log(vis.tweetDomain)
        // And a opacity scale
        vis.opacity = d3.scaleLinear()
            .domain([vis.tweetDomain])
            .range([.5,1]);

        vis.treemapLayout = d3.treemap()
            .size([vis.width, vis.height])
            .padding(4)
            .paddingOuter(20);

        vis.treemapLayout(root);
        //console.log(treemapLayout(root))
        console.log(root.leaves())
        d3.select("#tweetsources")
            .select('g')
            .selectAll("rect")
            .data(root.leaves())
            .join("rect")
            .attr('x', function (d) { return d.x0})
            .attr('y', function (d) { return d.y0})
            .attr('width', function (d) { return d.x1 - d.x0})
            //.attr('height', 20)
            .attr('height', function (d) { return d.y1 - d.y0})
            .style("stroke", "black")
            .style("fill", "#69b3a2")
            //.attr("class", ".rect")
            .style("fill", function(d){ return vis.color(d.data.key)} )
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
                    /*.html(`
                     <div style="border: thin solid grey; border-radius: 5px; background: #8ecfca; padding: 5px; width: 200px">
                     <p style="font-size: 10pt"><b>Tweet source:</b> ${d.data.key}</p>
                     <span style="font-size: 10pt"><b>Tweet source number:</b> ${d.value}</span>
                     </div>
                    `)*/
                tweetSelected = d.data.key
                //console.log(tweetSelected)
                tweetSelectedArray.push(tweetSelected);
                //console.log(tweetSelectedArray)
                updateBarVisualization(tweetSelectedArray);
            })

        /*.on("mouseover", function (event, d) {
            d3.select(this)
                .attr("fill", "#ef758a");
            vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + "px")
                .style("top", event.pageY + "px")
                .html(`
                     <div style="border: thin solid grey; border-radius: 5px; background: #8ecfca; padding: 5px; width: 200px">
                     <p style="font-size: 10pt"><b>Tweet source:</b> ${d.key}</p>
                     <span style="font-size: 10pt"><b>Tweet source number:</b> ${d.value}</span>
                     </div>
                    `)
        })
        .on("mouseout", function (event, d) {
            d3.select(this)
                .attr("fill", "black"); //function(d) {return (d)});
            vis.tooltip
                .style("opacity", 0)
                .style("left", 0)
                .style("top", 0)
                .html(``);
        });*/

        vis.svg
            .selectAll("text")
            .data(root.leaves())
            .enter()
            .append("text")
            //.merge()
            .attr("x", function(d){ return d.x0+5})
            .attr("y", function(d){ return d.y0+20})
            .text(function(d){ return d.data.key})
            .attr("font-size", "13px")
            .attr("fill", "black");

        // and to add the text labels
        vis.svg
            .selectAll("vals")
            .data(root.leaves())
            .enter()
            .append("text")
            //.merge()
            .attr("x", function(d){ return d.x0+5})
            .attr("y", function(d){ return d.y0+35})
            .text(function(d){ return d.data.value })
            .attr("font-size", "11px")
            .attr("fill", "black");
        //vis.svg.exit().remove();
    }
}
