class Bargraph {

    constructor(parentElement, data){
        this.displayData = data;
        this.parentElement = parentElement;
        this.bg_initVis();
    }

    bg_initVis() {
        let vis = this;

        vis.margin = {top: 10, right: 40, bottom: 40, left: 80};
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
        var tweetsBySourceMap = d3.group(vis.displayData,d=>d.tweet_source);
        vis.tweetsBySourceArray= tweetsBySourceMap.get(tweetSelected)
        if (vis.tweetsBySourceArray == undefined) {
            var finalArray = [];
            mergedArray=[];
            console.log(finalArray)
        } else {
            mergedArray.push(vis.tweetsBySourceArray)
            finalArray = [].concat.apply([], mergedArray);
            finalArray = finalArray.filter(function( element ) {
                return element !== undefined;
            });
        }
        var distinctArray = (value, index, self) => {
            return self.indexOf(value) === index;
        }

        var distinctArray = finalArray.filter(distinctArray);

        if (finalArray.length == []) {
            vis.myDisplayData = vis.displayData
        } else {
            vis.myDisplayData = distinctArray
        }
        console.log(vis.myDisplayData)
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
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .attr("fill", "#ef758a");
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + -485 + "px")
                    .style("width", "600px")
                    //.style("height", "10px")
                    .style("top", event.pageY + 15 + "px")
                    .html(`
                         <div style="border: thin solid grey; border-radius: 5px; background: #8ecfca; padding: 5px">
                         <p style="font-size: 12pt">${d.tweet_text}</p>
                         <p style="font-size: 9pt"><b>Number of retweets:</b> ${d.tweet_retweet_count}</p>
                         <p style="font-size: 9pt"><b>Number of favorites:</b> ${d.tweet_favorite_count}</p>
                         <p style="font-size: 9pt"><b>Created at:</b> ${d.tweet_created_at}</p>
                         <p style="font-size: 9pt"><b>Tweet source:</b> ${d.tweet_source}</p>
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
            .duration(800)
            .attr("x", function(d,i) { return (vis.xScale(i)+5)})
            .attr("y", function(d) {return vis.yScale(+d[vis.selectedVar])})
            .attr("width", (vis.xScale.bandwidth()-10))
            .attr("height", d => vis.height - vis.yScale(+d[vis.selectedVar]))
            .attr("fill", "#69b3a2")
        vis.bars.exit().remove();

        // update y axis
        vis.svg.select(".y_axis").transition().duration(800).call(vis.yAxis)
    }
}