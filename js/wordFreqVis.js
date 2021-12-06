
class WordFreqVis {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        console.log("data: ", data);
        this.initVis()
    }


    initVis() {
        let vis = this;

        vis.margin = {top: 10, right: 40, bottom: 10, left: 40};

        vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $('#' + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        vis.centre = {x: vis.width / 2, y: vis.height / 2};

        vis.forceStrength = 0.03;

        vis.svg = null;
        vis.bubbles = null;
        vis.labels = null;
        vis.nodes = [];

        vis.tooltip = d3.select("#word-frequency-bubble-chart")
            .append("div")
            .attr("class", "tooltip")
            .attr("id", "wordFreqTooltip");

        let charge = function charge(d){return Math.pow(d.radius, 2.0) * 0.01}

        vis.simulation = d3.forceSimulation()
            .force('charge', d3.forceManyBody().strength(charge))
            .force('x', d3.forceX().strength(vis.forceStrength).x(vis.centre.x))
            .force('y', d3.forceY().strength(vis.forceStrength).y(vis.centre.y))
            .force('collision', d3.forceCollide().radius(d => d.radius + 1));

        vis.simulation.stop();

        vis.createNodes = function createNodes (rawData) {
            vis.maxSize = d3.max(rawData, d => +d.count);

            vis.radiusScale = d3.scaleSqrt()
                .domain([0, vis.maxSize])
                .range([0, 60])

            vis.myNodes = rawData.map(d => ({
                ...d,
                radius: vis.radiusScale(+d.count),
                size: +d.count,
                x: Math.random() * 900,
                y: Math.random() * 800
            }))

            return vis.myNodes;
        }

        vis.ticked = function ticked () {
            vis.bubbles
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)

            vis.labels
                .attr('x', d => d.x)
                .attr('y', d => d.y)
        }
        vis.updateVis(vis.parentElement, vis.data);
    }

    updateVis (selector, rawData) {
        let vis = this;
        vis.nodes = vis.createNodes(rawData);

        vis.svg = d3.select("#word-frequency-bubble-chart")
            .append('svg')
            .attr('width', vis.width)
            .attr('height', vis.height)

        vis.elements = vis.svg.selectAll('.bubble')
            .data(vis.nodes, d => d.word)
            .enter()
            .append('g')

        vis.bubbles = vis.elements
            .append('circle')
            .classed('bubble', true)
            .attr('r', d => d.radius)
            .attr('fill', "#88c9a1")
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .attr("stroke", "black")
                    .attr("fill", "#017c74")
                    .attr("stroke", "black");
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                         <div style="border: thin solid grey; border-radius: 5px; background: #fff9e5; padding: 10px">
                         <p style="font-size: 10pt"><b>Keyword:</b> ${d.word}</p>
                         <p style="font-size: 10pt"><b>Word count:</b> ${d.count}</p>
                         </div>
                        `)
            })
            .on("mouseout", function (event, d) {
                d3.select(this)
                    .attr('fill', "#88c9a1")
                    .attr("stroke", "none");
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });


        vis.labels = vis.elements
            .append('text')
            .attr('dy', '.3em')
            .style('text-anchor', 'middle')
            .style('font-size', 12)
            .text(d => d.word);

        vis.simulation.nodes(vis.nodes)
            .on('tick', vis.ticked)
            .restart();
    }
}

/*
References and Inspiration:
https://github.com/d3/d3-force
https://bl.ocks.org/officeofjane/a70f4b44013d06b9c0a973f163d8ab7a
 */