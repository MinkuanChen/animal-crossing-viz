
class SwarmPlotVis {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        console.log("data: ",data);
        this.initVis()
    }

    initVis(data) {
        let vis = this;
        vis.width = 1500;
        vis.height = 1000;
        vis.svg = d3
            .select("#swarm-plot")
            .append("svg")
            .attr("height", vis.height)
            .attr("width", vis.width);

        let tweetCreatedDate = Array.from(new Set(vis.data.map((d) => d.tweet_created_date)));
        tweetCreatedDate.sort();
        console.log(tweetCreatedDate);

        let xCoords = tweetCreatedDate.map((d, i) => 100 + i * 200);
        let xScale = d3.scaleOrdinal().domain(tweetCreatedDate).range(xCoords);

        let yScale = d3
            .scaleLinear()
            .domain(d3.extent(vis.data.map((d) => +d["tweet_retweet_count"])))
            .range([vis.height - 200, 200]);

        let color = d3.scaleOrdinal().domain(tweetCreatedDate).range(['#a4d4a2', '#ff7c69', '#017c74', '#786951', '#f5c24c', '#68b893', '#ef758a']);
        let tweetLikesDomain = d3.extent(vis.data.map((d) => d["tweet_favorite_count"]));

        tweetLikesDomain = tweetLikesDomain.map((d) => Math.sqrt(d));

        let size = d3.scaleLinear().domain(tweetLikesDomain).range([3, 8]);

        vis.tooltip = d3.select("#swarm-plot")
            .append("div")
            .attr("class", "tooltip")
            .attr("id", "swarmPlotTooltip");


        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.filteredData = [];

        /*
        if (selectedCategory == "keywordHalloween") {

            vis.data.forEach(row => {
                // and push rows with proper dates into filteredData
                if (row.tweet_text.includes("Halloween")) {
                    vis.filteredData.push(row);
                }
            });
        } else if (selectedCategory == "keywordUpdate") {
            vis.data.forEach(row => {
                if (row.tweet_text.includes("update")) {
                    vis.filteredData.push(row);
                }
            });
        } else if (selectedCategory=="all"){
            vis.filteredData = vis.data;
        }
         */
        if (selectedCategory !== "") {
            vis.data.forEach(row => {
                // and push rows with proper dates into filteredData
                if (row.tweet_text.includes(selectedCategory)) {
                    vis.filteredData.push(row);
                }
            });
        } else if (selectedCategory==""){
            vis.filteredData = vis.data;
        }

        console.log("filtered data: ", vis.filteredData);
        vis.updateVis();
    }

    updateVis () {
        let vis = this;
        let tweetCreatedDate = Array.from(new Set(vis.filteredData.map((d) => d.tweet_created_date)));
        tweetCreatedDate.sort();
        console.log(tweetCreatedDate);

        let xCoords = tweetCreatedDate.map((d, i) => 100 + i * 200);
        let xScale = d3.scaleOrdinal().domain(tweetCreatedDate).range(xCoords);

        let yScale = d3
            .scaleLinear()
            .domain(d3.extent(vis.filteredData.map((d) => +d["tweet_retweet_count"])))
            .range([vis.height - 200, 200]);

        let color = d3.scaleOrdinal().domain(tweetCreatedDate).range(['#a4d4a2', '#ff7c69', '#017c74', '#786951', '#f5c24c', '#68b893', '#ef758a', '#8ecfca', '#fff9e5', '#fcea64', '#88c9a1', '#febdc3', '#7cc9c3', '#f8eebc', '#f7d359']);
        let tweetLikesDomain = d3.extent(vis.filteredData.map((d) => d["tweet_favorite_count"]));

        tweetLikesDomain = tweetLikesDomain.map((d) => Math.sqrt(d));

        let size = d3.scaleLinear().domain(tweetLikesDomain).range([2, 8]);

        vis.dotsEnter = vis.svg.selectAll(".circ")
            .data(vis.filteredData)

            vis.dotsEnter
            .enter()
            .append("circle")
            .attr("class", "circ")
            .merge(vis.dotsEnter)
            .attr("stroke", "black")
            .attr("fill", (d) => color(d.tweet_created_date))
            .attr("r", (d) => size(Math.sqrt(d["tweet_favorite_count"])))
            .attr("cx", (d) => xScale(d.tweet_created_date))
            .attr("cy", (d) => yScale(d.tweet_retweet_count))
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
            });

        vis.dotsEnter.exit().remove();

        let simulation = d3.forceSimulation(vis.filteredData)

            .force("x", d3.forceX((d) => {
                return xScale(d.tweet_created_date);
            }).strength(0.2))

            .force("y", d3.forceY((d) => {
                return yScale(d.tweet_retweet_count);
            }).strength(1))

            .force("collide", d3.forceCollide((d) => {
                return size(Math.sqrt(d["tweet_favorite_count"]));
            }))

            .alphaDecay(0)
            .alpha(0.3)
            .on("tick", tick);

        function tick() {
            d3.selectAll(".circ")
                .attr("cx", (d) => d.x)
                .attr("cy", (d) => d.y);
        }

        vis.init_decay = setTimeout(function () {
            console.log("start alpha decay");
            simulation.alphaDecay(0.1);
        }, 800);

    }
}
