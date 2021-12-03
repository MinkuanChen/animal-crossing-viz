class Bargraph {

    constructor(parentElement, data){
        this.displayData = data;
        this.parentElement = parentElement;
        this.bg_initVis();
    }

    bg_initVis() {
        let vis = this;

        vis.margin = {top: 40, right: 40, bottom: 40, left: 80};
        vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $('#' + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // svg drawing area
        vis.svg = d3.select("#bargraph")
            .append("svg")
            .attr("width",  vis.width  + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top  + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.tooltip = d3.select("#bargraph")
            .append("div")
            .attr("class", "bgtooltip")
            .attr("id", "topTweetTooltip");


        // Make Scales and Axis
        vis.xScale = d3.scaleBand()
            .domain(d3.range(0,10))
            .rangeRound([0, vis.width]);
        vis.xAxis = d3.axisBottom()
            .tickFormat("")
            //.tickValues([])
            .scale(vis.xScale);
        vis.yScale = d3.scaleLinear()
            //.domain([0,vis.tweetYDomain[1]]) // need to figure out how to load data in from beginning
            .range([vis.height, 0]);
        vis.yAxis = d3.axisLeft()
            .scale(vis.yScale);

        //Append x and y Axis
        vis.svg.append("g") //tick marks need to be moved to center later
            .attr("class", "x_axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(vis.xAxis);
        vis.svg.append("g")
            .attr("class", "y_axis")
            .call(vis.yAxis);

        vis.wrangleData();
    };

    wrangleData() {
        let vis = this;

        console.log(tweetSelected)

        var tweetsBySourceMap = d3.group(vis.displayData,d=>d.tweet_source);

        var tweetsBySourceMap = d3.group(vis.displayData,d=>d.tweet_source);
        console.log(vis.tweetSelectedArray)
        vis.tweetsBySourceArray= tweetsBySourceMap.get(tweetSelected)
        //vis.tweetsBySourceArray= tweetsBySourceMap.get(tweetSelectedArray)
        //console.log(vis.tweetsBySourceArray)


        if (Array.isArray(vis.tweetsBySourceArray)) {
            vis.myDisplayData = vis.tweetsBySourceArray
        } else {
            vis.myDisplayData = vis.displayData
        }

        let yMax = 0;
        var pick = d3.select("#ranking-type").property("value");
        //console.log(pick)
        var topDataTweets = vis.myDisplayData.sort(function(a, b) {
            return d3.descending(+a.tweet_retweet_count, +b.tweet_retweet_count);
        }).slice(0, 10);//top 10 here
        var topDataFavorites = vis.myDisplayData.sort(function(a, b) {
            return d3.descending(+a.tweet_favorite_count, +b.tweet_favorite_count);
        }).slice(0, 10);//top 10 here

        if (pick === "favorites") {
            yMax = d3.max(topDataFavorites, d => d.tweet_favorite_count);
            vis.favorites = topDataFavorites;
            vis.graphData = vis.favorites;
            vis.selectedVar = "tweet_favorite_count"
        } else {
            yMax = d3.max(topDataTweets, d => d.tweet_retweet_count);
            vis.retweets = topDataTweets;
            vis.graphData = vis.retweets;
            vis.selectedVar = "tweet_retweet_count"
        }
        vis.tweetYDomain = d3.extent(vis.graphData.map((d) => +d[vis.selectedVar]));
        //vis.tweetAmountXDomain = lesser of 0-10 or max number of non 0 responses
        vis.yMax = yMax
        vis.updateVis();

    }

    updateVis() {
        let vis = this;
        console.log(vis.tweetYDomain[1])
        //update domain
        vis.yScale
            .domain([0,vis.tweetYDomain[1]]);
        //vis.xScale.domain([0,vis.tweetAmountXDomain);

        //draw bars
        vis.bars = vis.svg.selectAll("rect").data(vis.graphData)

        vis.bars
            .enter()
            .append("rect")
            .merge(vis.bars)
            //.transition()
            //.duration(1000)
            .attr("x", function(d,i) { return (vis.xScale(i)+5)})
            .attr("y", function(d) {return vis.yScale(+d[vis.selectedVar])})
            .attr("width", (vis.xScale.bandwidth()-10))
            .attr("height", d => vis.height - vis.yScale(+d[vis.selectedVar]))
            .attr("fill", "#69b3a2")
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .attr("fill", "#ef758a");
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 25 + "px")
                    .style("width", "400px")
                    .style("heigth", "50px")
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
                    .attr("fill", "#69b3a2"); //function(d) {return (d)});
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .transition()
            .duration(2000)
        vis.bars.exit().remove();

        // update y axis
        vis.svg.select(".y_axis").call(vis.yAxis)
    }
}