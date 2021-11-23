class Bargraph {

    constructor(parentElement, data){
        this.displayData = data;
        this.parentElement = parentElement;
        this.wrangleData();
        this.bg_initVis();
    }

    bg_initVis() {
        let vis = this;
        // Define dimensions of vis... need to make margins more responsive
        /* var margin = { top: 30, right: 50, bottom: 30, left: 50 },
             width  = 550 - margin.left - margin.right,
             height = 250 - margin.top  - margin.bottom;*/


        vis.margin = {top: 40, right: 40, bottom: 40, left: 80};
        vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $('#' + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // svg drawing area
        var svg = d3.select("#bargraph")
            .append("svg")
            .attr("width",  vis.width  + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top  + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        console.log(vis.graphData)

        let selectedVar = "tweet_retweet_count" // "tweet_favorite_count"//

        let tweetDomain = d3.extent(vis.graphData.map((d) => +d[selectedVar]));
        console.log(tweetDomain[1])

        // Make x scale
        var xScale = d3.scaleLinear()
            .domain([0,9])
            .range([0, vis.width]);
        // Make x-axis and add to canvas
        var xAxis = d3.axisBottom()
            .scale(xScale);

        svg.append("g") //tick marks need to be moved to center later
            .attr("class", "x axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(xAxis);


        // Make y scale, the domain will be defined on bar update
        var yScale = d3.scaleLinear()
            .domain([0, tweetDomain[1]])
            .range([vis.height, 0]);
        vis.yScale = yScale
        // Make y-axis and add to canvas
        var yAxis = d3.axisLeft()
            .scale(yScale);
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);


        console.log(tweetDomain)

        console.log(vis.graphData)
        var bars = svg.selectAll("rect").data(vis.graphData)
        bars
            .enter()
            .append("rect") // Add a new rect for each new elements
            .merge(bars) // get the already existing elements as well
            .transition() // and apply changes to all of them
            .duration(1000)
            .attr("x", function(d,i) { return xScale(i)})
            .attr("y", d => vis.height - yScale(+d[selectedVar])) //graphData value yScale(vis.graphData.map((d) => +d[selectedVar])))//
            .attr("width",  10) //xScale.bandwidth()/10)
            .attr("height", d => yScale(+d[selectedVar]))
            //.attr("height", function(d) { return height - yScale(d.tweetDomain);}) //function (d) {return vis.height - yScale(d.graphData)})//how much data)
            .attr("fill", "#69b3a2")

        /*
        vis.chart = d3.selectAll("#bargraph").data(vis.graphData);

        vis.chart.enter().append("g")
             .attr("class","rects")
             .merge(vis.chart)
             .transition()
             .duration(800)
             .attr("x", (50))
             .attr("width", xScale)
             .attr("y", (30))
             .attr("height",50)
             .attr("fill", "purple");*/

        //vis.chart.exit().remove();

        vis.wrangleData();
        //vis.updateVis();
    };

    wrangleData() {
        let vis = this;
        let yMax = 0;
        var pick = d3.select("#ranking-type").property("value");
        console.log(pick)
        var topDataTweets = vis.displayData.sort(function(a, b) {
            return d3.descending(+a.tweet_retweet_count, +b.tweet_retweet_count);
        }).slice(0, 10);//top 10 here
        var topDataFavorites = vis.displayData.sort(function(a, b) {
            return d3.descending(+a.tweet_favorite_count, +b.tweet_favorite_count);
        }).slice(0, 10);//top 10 here

        if (pick === "retweets") {
            yMax = d3.max(topDataTweets, d => d.tweet_retweet_count);
            vis.retweets = topDataTweets;
            vis.graphData = vis.retweets;
            //vis.x.domain = x.domain(vis.graphData.map(d=> d.tweet_retweet_count));
            /* vis.myData = d3.map(vis.retweets);
             vis.graphData = map.values();*/
        } else {
            yMax = d3.max(topDataFavorites, d => d.tweet_favorite_count);
            vis.favorites = topDataFavorites;
            vis.graphData = vis.favorites;
            /* vis.myData = d3.map(vis.favorites);
             vis.graphData = map.values();*/
        }
        //console.log(vis.x.domain)
        vis.yMax = yMax
        //vis.updateVis();
    }

    /*updateVis() {
        let vis = this;
        //console.log(vis.retweets)
        console.log(vis.graphData)
        // Scales and axes
        //update domain
        /!* vis.x.domain(d3.extent(vis.displayData, function(d) {return d.date;}));
         vis.y.domain(0(vis.displayData, function(d) {return d.value;}));*!/

        // update axes

        vis.x = d3.scaleLinear()
            .range([0, vis.width]);

        vis.y = d3.scaleBand()
            .range([vis.height, 0]);

        vis.yAxis = d3.axisLeft()
            .scale(vis.yScale)
            .ticks(10);

        vis.xAxis = d3.axisBottom()
            .scale(vis.xScale)

        vis.x.domain([0,9])
        vis.y.domain([0,vis.yMax])//yMax


        // Update the Y axis
        /!*y.domain([0, d3.max(data, function(d) { return d.value }) ]);
        yAxis.transition().duration(1000).call(d3.axisLeft(y));*!/


        // draw rectangles

        /!*vis.xCol2 = 650;
        vis.barY = d3.scaleBand()
            .range([vis.height, 0]);

        vis.barX = d3.scaleLinear()
            .range([0, vis.width]);

        vis.svgCol2 = vis.svg.append("g")
            .attr("class", "map-col2")
            .attr("transform", "translate(" + vis.xCol2 +
                ",-120)");

        vis.svgCol2.append("text")
            .attr("class", "bar-title")
            .text('Top 3 countries by Gross Revenue')
            .attr("x", 0)
            .attr("y", 120)
            .attr("fill", "gray")
            .style("font-size", 15)
            .style("text-decoration", 'underline');

        vis.svgCol2.append("text")
            .attr("class", "pie-title")
            .text('Gross Revenue Composition')
            .attr("x", 310)
            .attr("y", 30)
            .attr("fill", "gray")
            .style("font-size", 13)
            .style("text-decoration", 'underline')
            .call(wrap, 100);

        vis.svgCol2.append("text")
            .attr("class", "col2-text")
            .text('IMDB')
            .attr("x", 0)
            .attr("y", 70)
            .attr("fill", "black")
            .style("font-size", 15);

        vis.svgCol2.append("text")
            .attr("class", "col2-text")
            .text('Metacritic')
            .attr("x", 0)
            .attr("y", 90)
            .attr("fill", "black")
            .style("font-size", 13);

        var options = {
            max_value: 5,
            step_size: 0.1,
            initial_value: 5,
        }
        var options2 = {
            max_value: 5,
            step_size: 0.1,
            initial_value: 5,
        }

        $(".stars-imdb").rate(options);
        $(".stars-meta").rate(options2);

        vis.mapGroup = vis.svg.append("g")
            .attr('class', 'map');

        vis.svg.append("g")
            .append("text")
            .attr("class", "legend-text")
            .text('Gross Revenue ($)')
            .attr("x", 23)
            .attr("y", -10)
            .attr("fill", "black")
            .style("font-size", 15);


        vis.barX.domain(d3.extent(vis.topGross, function(d) {
            return d.value;
        }));
        var keys = vis.topGross.map((d) => d.Market);

        vis.barY.domain(keys);
        var rects = vis.svgCol2.selectAll(".rects")
            .data(vis.topGross);

        rects.enter()
            .append("rect")
            .attr("class", "rects")
            .merge(rects)
            .transition()
            .duration(800)
            .attr("y", function(d, i) {
                return 140 + i * 20;
            })
            .attr("x", function(d) {
                return 40;
            })
            .attr("width", function(d) {
                return d.Gross / 3000000;
            })
            .attr("height", function(d) {
                return 15;
            })
            .attr("fill", (d) => {
                return vis.color(d.Gross);
            });
        rects.exit().remove();*!/

        /!*
                vis.chart = d3.selectAll("#bargraph").data(vis.graphData);

                vis.chart.enter().append("g")
                    .attr("class","rects")
                    .merge(vis.chart)
                    .transition()
                    .duration(800)
                    .attr("x", (50))
                    .attr("width", vis.xScale)
                    .attr("y", function(d) { return vis.yScale(d); })
                    .attr("height",50)
                    .attr("fill", "purple");

                vis.chart.exit().remove();*!/
        //draw labels
        /!*
                var barLables = vis.svg.selectALl(".bar-label")
                    .data(vis.displayData);

                barLabels.enter().append()*!/


        /!*.on("mouseover", function (event, d) {
            d3.select(this)
                .attr("stroke", "black")
                .attr("fill", "#fff9e5")
                .attr("stroke", "black")
            console.log(d.tweet_text, d.tweet_created_date);
            vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY + "px")
                .html(`
                         <div style="border: thin solid grey; border-radius: 5px; background: #8ecfca; padding: 20px">
                         <p style="font-size: 15pt">${d.tweet_text}</p>
                         <p style="font-size: 10pt"><b>Number of retweets:</b> ${d.tweet_retweet_count}</p>
                         <p style="font-size: 10pt"><b>Number of favorites:</b> ${d.tweet_favorite_count}</p>
                         <p style="font-size: 10pt"><b>Created at:</b> ${d.tweet_created_at}</p>
                         <p style="font-size: 10pt"><b>Tweet source:</b> ${d.tweet_source}</p>
                         </div>
                        `)
        })
        .on("mouseout", function (event, d) {
                d3.select(this)
                    .attr("fill", function(d) {return color(d.tweet_created_date)});
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });*!/

        // Update the visualization
        //vis.wrangleData();
    }*/

}