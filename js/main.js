let myBubbleChart;
let myAreaChart;
let myWordFreqVis;
let mySwarmPlotVis;

let userInputVal = document.getElementById("user-input-keyword").value;

// load data
Promise.all([
    d3.csv("data/tweet_emojis.csv"),
    d3.csv("data/emojiWIP4.csv"),
    d3.json("data/hashtags_frequency_by_date.json"),
    d3.csv("data/tweet_text_word_frequency_not_stemmed_top100.csv"),
    d3.csv("data/animal_crossing_tweets_original_20211030_to_20211105_top1000.csv")
]).then(function(data) {
    initVisualizations(data);
}).catch(function(err) {
    console.log(err);
})

function initVisualizations(allDataArray) {
    myBubbleChart = new EmojiBubble("emojibubble", allDataArray[0], allDataArray[1]);
    myAreaChart = new StackedAreaChart("stacked-area-chart", allDataArray[2].hashtags);
    myWordFreqVis = new WordFreqVis("word-frequency-bubble-chart", allDataArray[3]);
    mySwarmPlotVis = new SwarmPlotVis("swarm-plot", allDataArray[4]);
}

// take user input of keyword or phrase searches in the swarm plot
function inputChange() {
    userInputVal = document.getElementById("user-input-keyword").value;
    mySwarmPlotVis.wrangleData();
}

function inputReset(){
    userInputVal = "";
    mySwarmPlotVis.wrangleData();
}