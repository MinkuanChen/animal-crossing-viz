
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
        console.log(vis.nestedData)
        var topTenSources = vis.nestedData.sort(function (a, b) {
            return b.value - a.value;
        }).slice(0, 10);

        let svg = d3.select("#tweetsources").append("svg")
            .attr("width", 500)
            .attr("height", 250);


        vis.tooltip = d3.select("#tweetsources")
            .append("div")
            .attr("class", "tooltip")
            .attr("id", "tweetSourceTooltip");


        svg.selectAll(".tweet-sources")
            .data(topTenSources)
            .enter()
            .append("text")
            .attr("x", 50)
            .attr("y", (d, i) => ((i * 20) + 30))
            .text((d) => {
                return d.key
            })
            .attr("font-family", "sans-serif")
            .style("font-size", "1.70em")
            .attr("class", "tweet-sources")
            .attr("fill", "black")
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .attr("fill", "#ef758a");
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 50 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                     <div style="border: thin solid grey; border-radius: 5px; background: #8ecfca; padding: 5px; width: 200px">
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
            });
            //.on("click", clicked);
    }
}