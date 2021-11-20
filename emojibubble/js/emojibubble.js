class EmojiBubble {

    constructor(parentElement, emojiData, emojiImageData, emojiRelationships) {
        this.parentElement = parentElement;
        this.emojiData = emojiData;
        this.emojiImageData = emojiImageData;
        this.emojiRelationships = emojiRelationships;

        this.initVis()
    }

    initVis() {
        let vis = this

        vis.radiusScale = d3.scaleSqrt().domain([10, 388]).range([10, 60]);

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .attr("id", "emojiTooltip")

        vis.forceX = d3.forceX(vis.width/2).strength(0.06);
        vis.forceY = d3.forceY(vis.height/2).strength(0.06);

        vis.forceXGroup = d3.forceX(function(d) {
            if(d.group === "heart") {
                return vis.width/4 + 150
            }
            else if (d.group === "stars") {
                return vis.width/8
            }
            else if (d.group === "sentiment") {
                return vis.width/2 + 100
            }
            else if (d.group === "seasonal") {
                return vis.width - vis.width/8 + 10
            }
            else if (d.group === "flower") {
                return vis.width - 200
            }
            else if (d.group === "plant") {
                return vis.width/8 + 100
            }
            else if (d.group === "animal") {
                return vis.width/8
            }
            else if (d.group === "misc") {
                return vis.width - 200
            }
            else if (d.group === "fruit") {
                return vis.width - 350
            }
            else if (d.group === "hand") {
                return vis.width/8 + 200
            }
            else if (d.group === "food") {
                return vis.width/5
            }
            else if (d.group === "tool") {
                return vis.width - 400
            }
            else if (d.group === "bug") {
                return vis.width/2
            }
            else if (d.group === "transportation") {
                return vis.width/2 - 100
            }
            else if (d.group === "music") {
                return vis.width/2 - 100
            }
            else {
                return vis.width/2 + 100
            }
        }).strength(0.15)

        vis.forceYGroup = d3.forceY(function(d) {
            if (d.group === "heart") {
                return vis.height/4 + 100
            }
            else if (d.group === "stars") {
                return vis.height/6 + 100
            }
            else if (d.group === "sentiment") {
                return vis.height/2
            }
            else if (d.group === "seasonal") {
                return vis.height/2
            }
            else if (d.group === "flower") {
                return vis.height/6
            }
            else if (d.group === "plant") {
                return vis.height/2
            }
            else if (d.group === "animal") {
                return vis.height - 200
            }
            else if (d.group === "misc") {
                return vis.height/2 + 200
            }
            else if (d.group === "hand") {
                return vis.height/2 + 150
            }
            else if (d.group === "food") {
                return vis.height/5
            }
            else if (d.group === "tool") {
                return vis.height/5
            }
            else if (d.group === "bug") {
                return vis.height/2 - 100
            }
            else if (d.group === "transportation") {
                return vis.height/2 + 100
            }
            else if (d.group === "music") {
                return vis.height/2 - 200
            }
            else {
                return vis.height/2
            }
        }).strength(0.15)

        vis.simulation = d3.forceSimulation()
            .force("x", vis.forceX)
            .force("y", vis.forceY)
            //.force("center", d3.forceCenter(vis.width/2, vis.height/2))
            .force("charge", d3.forceManyBody().strength(-5))
            .force("collide", d3.forceCollide(function(d) {
                return vis.radiusScale(d.count) + 1;
            }).strength(0.8))

        vis.emoji = vis.svg.append("emoji")
        vis.defs = vis.svg.append("defs")

        this.wrangleData();
    }

    wrangleData() {
        let vis = this

        for (var key in vis.emojiImageData) {
            if (vis.emojiImageData.hasOwnProperty(key)) {
                for (var key2 in vis.emojiData) {
                    if (vis.emojiData.hasOwnProperty(key2)) {
                        if(vis.emojiData[key] === undefined) {
                            vis.emojiData[key] = {}
                        }
                        if (vis.emojiData[key2].emoji === vis.emojiImageData[key].emoji) {
                            vis.emojiData[key2]["group"] = vis.emojiImageData[key].group;
                        }
                    }
                }
            }
        }
        console.log(vis.emojiData);
        console.log(vis.emojiImageData);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.circles = vis.svg.selectAll("circle")
            .data(vis.emojiData).enter()
            .append("circle")
            .attr("id", function(d) {
                return "e" + d.emoji;
            })
            .attr("r", function(d) {
                return vis.radiusScale(d.count);
            })
            .attr("fill", d => {
                return "url(#" + d.emoji + ")"
            })
            .on("mouseover", function(eve, d) {
                vis.circles
                    .attr('opacity', '.35')
                d3.select(this)
                    .attr('opacity', '1')
                for (let i = 0; i < vis.emojiRelationships[d.emoji].length; i++) {
                    console.log(vis.emojiRelationships[d.emoji][i])
                    d3.select("#e" + vis.emojiRelationships[d.emoji][i])
                        .attr('opacity', '1');
                }
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", eve.pageX + 20 + "px")
                    .style("top", eve.pageY + "px")
                    .html(`
                        <div style="color: white; opacity: 0.9; font-size: 10pt; border: #68b893; border-radius: 5px; background: #68b893; padding: 5px">
                            <h6> emoji: ${d.emoji}</h6>      
                            <h6> count: ${d.count}</h6>                  
                        </div>
                    `)
            })
            .on("mouseout", function(eve, d) {
                vis.circles
                    .attr('opacity', '1')
                d3.select(this)
                    .attr('opacity', '1')
                    .attr("stroke-width", "0px")
                    .attr("fill", d => {
                        return "url(#" + d.emoji + ")"
                    })
                vis.tooltip
                    .style("opacity", 0)
            })

        vis.defs.selectAll(".emoji_pattern")
            .data(vis.emojiImageData)
            .enter().append("pattern")
            .attr("class", "emoji_pattern")
            .attr("id", d => {return d.emoji})
            .attr("patternContentUnits", "objectBoundingBox")
            .attr("preserveAspectRatio", "none")
            .attr("height", ".9")
            .attr("width", ".9")
            .attr("x", 10)
            .attr("y", 10)
            .append("image")
            .attr("xlink:href", d => {return d.image_path})
            .attr("height", 0.800001)
            .attr("width", 0.800001);
        
        d3.select("#categorize").on("click", function() {
            vis.simulation
                .force("x", vis.forceXGroup)
                .force("y", vis.forceYGroup)
                .alphaTarget(0.5)
                .restart()
        })

        d3.select("#merge").on("click", function() {
            vis.simulation
                .force("x", vis.forceX.strength(0.06))
                .force("y", vis.forceY.strength(0.06))
                .alphaTarget(0.5)
                .restart()
        })

        vis.simulation.nodes(vis.emojiData)
            .on('tick', ticked);

        function ticked() {
            vis.circles
                .attr("cx", d => {
                    return d.x;
                })
                .attr("cy", function(d) {
                    return d.y;
                })
        }
    }
}
