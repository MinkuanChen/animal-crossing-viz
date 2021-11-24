
class SwarmPlotVis {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        console.log("data: ",data);
        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 40, right: 40, bottom: 40, left: 40};

        vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $('#' + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        vis.svg = d3
            .select("#" + vis.parentElement)
            .append("svg")
            .attr("height", vis.height)
            .attr("width", vis.width);

        let tweetCreatedDate = Array.from(new Set(vis.data.map((d) => d.tweet_created_date)));
        tweetCreatedDate.sort();
        console.log(tweetCreatedDate);

        vis.xCoords = tweetCreatedDate.map((d, i) => 50 + i * vis.width/7);
        vis.xScale = d3.scaleOrdinal().domain(tweetCreatedDate).range(vis.xCoords);

        vis.yScale = d3
            .scaleLinear()
            .domain(d3.extent(vis.data.map((d) => Math.sqrt(+d["tweet_retweet_count"]))))
            .range([vis.height-100, 100]);

        vis.color = d3.scaleOrdinal().domain(tweetCreatedDate).range(['#a4d4a2', '#ff7c69', '#f1bdc3', '#7cc9c3', '#f5c24c', '#68b893', '#ef758a']);

        vis.tweetLikesDomain = d3.extent(vis.data.map((d) => d["tweet_favorite_count"]));

        vis.tweetLikesDomain = vis.tweetLikesDomain.map((d) => Math.sqrt(d));

        vis.size = d3.scaleLinear().domain(vis.tweetLikesDomain).range([1, 16]);

        vis.svg
            .call(d3.axisBottom(vis.xScale))
            .attr("transform", "translate(0," + vis.height-20 + ")");

        vis.svg.append("text")
            .style("text-anchor", "middle")
            .text("Tweet Created Date")
            .attr("transform", "translate(" + (vis.width/2) + " ," + (vis.height + 20) + ")");

        vis.tooltip = d3.select("#swarm-plot")
            .append("div")
            .attr("class", "tooltip")
            .attr("id", "swarmPlotTooltip");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.filteredData = [];

        if (userInputVal ==="") {
            vis.filteredData = vis.data;

        } else if (userInputVal!==""){
            vis.data.forEach(row => {
                if (row.tweet_text.includes(userInputVal)) {
                    vis.filteredData.push(row);
                }
            });
        }

        console.log(userInputVal);
        console.log("filtered data: ", vis.filteredData);
        vis.updateVis();
    }

    updateVis () {
        let vis = this;
        let tweetCreatedDate = Array.from(new Set(vis.filteredData.map((d) => d.tweet_created_date)));
        tweetCreatedDate.sort();
        console.log(tweetCreatedDate);

        vis.dots = vis.svg.selectAll(".swarm-bubble")
            .data(vis.filteredData)

            vis.dotsSearched = vis.dots
            .enter()
            .append("circle")
            .attr("class", "swarm-bubble")
            .attr("stroke", "black");

            vis.dots.merge(vis.dotsSearched)
            .attr("fill", (d) => vis.color(d.tweet_created_date))
            .attr("r", (d) => vis.size(Math.sqrt(d["tweet_favorite_count"])))
            .attr("cx", (d) => vis.xScale(d.tweet_created_date))
            .attr("cy", (d) => vis.yScale(d.tweet_retweet_count))
         .on("mouseover", function (event, d) {
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
                         <div style="border: thin solid grey; border-radius: 25px; background: #fff9e5; padding: 10px">
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
                    .attr("fill", function(d) {return vis.color(d.tweet_created_date)});
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

        vis.dots
            .exit()
            .remove();

        let simulation = d3.forceSimulation(vis.filteredData)

            .force("x", d3.forceX((d) => {
                return vis.xScale(d.tweet_created_date);
            }).strength(0.5))

            .force("y", d3.forceY((d) => {
                return vis.yScale(d.tweet_retweet_count);
            }).strength(1))

            .force("collide", d3.forceCollide((d) => {
                return vis.size(Math.sqrt(d["tweet_favorite_count"]));
            }))

            .alphaDecay(0)
            .alpha(0.3)
            .on("tick", tick);

        function tick() {
            d3.selectAll(".swarm-bubble")
                .attr("cx", function(d) {return d.x})
                .attr("cy", function(d) {return d.y});
        }


        vis.init_decay = setTimeout(function () {
            simulation.alphaDecay(0.1);
        }, 500);


    }
}


//References: https://github.com/d3/d3-force