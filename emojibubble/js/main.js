let myBubbleChart;

function updateAllVisualizations() {
    myBubbleChart.wrangleData()
}

// load data
Promise.all([
    d3.csv("data/tweet_emojis.csv"),
    d3.csv("data/emojiWIP4.csv")
]).then(function(data) {
    initEmoji(data);
}).catch(function(err) {
    console.log(err);
})

function initEmoji(allDataArray) {
    let emojiCountData = createEmojiCount(allDataArray[0]);
    let emojiRelationships = createEmojiRelationships(allDataArray[0]);
    filterEmojiCount(emojiCountData);
    //console.log(convertData(emojiCountData));
    myBubbleChart = new EmojiBubble("emojibubble", convertData(emojiCountData), allDataArray[1], emojiRelationships);
    //drawVisualization(emojiCountData, allDataArray[1]);
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
        //console.log(data[i].tweet_emojis);
        tweet = tweet.replace(/\'/g, "").trim();
        //console.log(changeToObject(tweet));
        let tweetObj = changeToObject(tweet);

        const emojisInTweet = Object.keys(tweetObj);
        //console.log(emojisInTweet);

        emojisInTweet.forEach(emoji => {
            if (!(emoji in emojis)) {
                emojis[emoji] = [];
            }
            emojisInTweet.forEach(emoji2 => {
                if (emoji !== emoji2 && !(emojis[emoji].includes(emoji2))) {
                    //console.log(emojis[emoji]);
                    emojis[emoji].push(emoji2);
                }
            })
        })
    }

    console.log(emojis);
    return emojis;
}
