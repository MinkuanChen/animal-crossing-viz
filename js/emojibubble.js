class EmojiBubble {

    constructor(parentElement, emojiData, emojiImageData) {
        this.parentElement = parentElement;
        this.emojiData = emojiData;
        this.emojiImageData = emojiImageData;

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

        vis.emojiCountData = createEmojiCount(vis.emojiData);
        vis.emojiRelationships = createEmojiRelationships(vis.emojiData);
        vis.emojiCountData = filterEmojiCount(vis.emojiCountData);
        vis.emojiCountData = convertData(vis.emojiCountData);


        function filterEmojiCount(data) {
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    if (data[key] < 5) {
                        delete data[key];
                    }
                }
            }
            return data;
        }

        function createEmojiCount(data) {
            let emojis = {}

            for (let i = 0; i < data.length; i++) {
                let tweet = data[i].tweet_emojis;
                tweet = tweet.replace(/\'/g, "").trim();
                let tweetObj = changeToObject(tweet);

                for (const key in tweetObj) {
                    if (tweetObj.hasOwnProperty(key)) {
                        if (key in emojis) {
                            emojis[key] += 1;
                        }
                        else {
                            emojis[key] = 1;
                        }
                    }
                }
            }

            console.log(emojis);
            return emojis;
        }

        function changeToObject(str) {
            str = str.replace("{", "");
            str = str.replace("}", "");
            let obj = {};
            if (str.includes(",")){
                str = str.split(",")
                for (let i = 0; i < str.length; i++) {
                    let emoji = str[i].split(":");
                    obj[emoji[0].trim()] = ('' + emoji[1]).trim();
                }
            }

            else {
                let emoji = str.split(":")
                obj[emoji[0].trim()] = emoji[1].trim();
            }

            return obj;
        }

        function convertData(data) {
            var result = [];
            for (let prop in data) {
                result.push({
                    emoji: prop,
                    count: data[prop]
                });
            }
            return result;
        }

        function createEmojiRelationships(data) {
            let emojis = {};
            console.log(data);

            for (let i = 0; i < data.length; i++) {
                let tweet = data[i].tweet_emojis;
                tweet = tweet.replace(/\'/g, "").trim();
                let tweetObj = changeToObject(tweet);

                const emojisInTweet = Object.keys(tweetObj);

                emojisInTweet.forEach(emoji => {
                    if (!(emoji in emojis)) {
                        emojis[emoji] = [];
                    }
                    emojisInTweet.forEach(emoji2 => {
                        if (emoji !== emoji2 && !(emojis[emoji].includes(emoji2))) {
                            emojis[emoji].push(emoji2);
                        }
                    })
                })
            }
            return emojis;
        }

        for (var key in vis.emojiImageData) {
            if (vis.emojiImageData.hasOwnProperty(key)) {
                for (var key2 in vis.emojiCountData) {
                    if (vis.emojiCountData.hasOwnProperty(key2)) {
                        if(vis.emojiCountData[key] === undefined) {
                            vis.emojiCountData[key] = {}
                        }
                        if (vis.emojiCountData[key2].emoji === vis.emojiImageData[key].emoji) {
                            vis.emojiCountData[key2]["group"] = vis.emojiImageData[key].group;
                        }
                    }
                }
            }
        }

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.circles = vis.svg.selectAll("circle")
            .data(vis.emojiCountData).enter()
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
                    .attr('opacity', '.15')
                d3.select(this)
                    .attr('opacity', '1')
                    .attr('stroke-width', "4px")
                    .attr('stroke', "#68b893")
                for (let i = 0; i < vis.emojiRelationships[d.emoji].length; i++) {
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
                            <h6> category: ${d.group}</h6>                  
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

        vis.simulation.nodes(vis.emojiCountData)
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
