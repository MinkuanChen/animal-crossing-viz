let myBubbleChart;

// load data
Promise.all([
    d3.csv("data/tweet_emojis.csv"),
    d3.csv("data/emojiWIP4.csv")
]).then(function(data) {
    initVisualizations(data);
}).catch(function(err) {
    console.log(err);
})

function initVisualizations(allDataArray) {
    myBubbleChart = new EmojiBubble("emojiGraph", allDataArray[0], allDataArray[1]);
}
