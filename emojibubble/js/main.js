Promise.all([
    d3.csv("data/tweet_emojis.csv"),
    d3.csv("data/emojiWIP2.csv")
]).then(function(data) {
    initEmoji(data);
}).catch(function(err) {
    console.log(err);
})

function initEmoji(allDataArray) {
    let emojiCountData = createEmojiCount(allDataArray[0]);
    filterEmojiCount(emojiCountData);
    drawVisualization(emojiCountData, allDataArray[1]);
}

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
    console.log(data);

    for (let i = 0; i < data.length; i++) {
        let tweet = data[i].tweet_emojis;
        tweet = tweet.replace(/\'/g, "").trim();
        //console.log(changeToObject(tweet));
        let tweetObj = changeToObject(tweet);

        for (const key in tweetObj) {
            if (tweetObj.hasOwnProperty(key)) {
                //console.log(key + "-->" + tweetObj[key]);
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

function drawVisualization(emojiData, emojiImageData) {

    var eData = convertData(emojiData);
    var radiusScale = d3.scaleSqrt().domain([10, 388]).range([10, 50]);

    var svg = d3.select("#emojibubble")
        .append("svg")
        .attr("height", 700) //height
        .attr("width", 700) //width
        .append("g")
        .attr("transform", "translate(0,0)");

    var simulation = d3.forceSimulation()
        .force("x", d3.forceX(700/2).strength(0.05))
        .force("y", d3.forceY(700/2).strength(0.05))
        .force("charge", d3.forceManyBody().strength(-12))
        .force("collide", d3.forceCollide(function(d) {
            return radiusScale(d.count) + 2;
        }).strength(0.8))

    //console.log(data);

    var circles = svg.selectAll("circle")
        .data(eData).enter()
        .append("circle")
        .attr("r", function(d) {
            return radiusScale(d.count);
        })
        .attr("fill", d => {
            return "url(#" + d.emoji + ")"
        });

    var defs = svg.append("defs")

    defs.selectAll(".emoji_pattern")
        .data(emojiImageData)
        .enter().append("pattern")
        .attr("class", "emoji_pattern")
        .attr("id", d => {return d.emoji})
        .attr("patternContentUnits", "objectBoundingBox")
        .attr("height", "100%")
        .attr("width", "100%")
        .append("image")
        .attr("xlink:href", d => {return d.image_path})
        .attr("height", 1)
        .attr("width", 1);


    simulation.nodes(eData)
        .on('tick', ticked);

    function ticked() {
        circles
            .attr("cx", d => {
                return d.x;
            })
            .attr("cy", function(d) {
                return d.y;
            })
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
}



