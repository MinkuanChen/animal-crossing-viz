let myBubbleChart;
let myAreaChart;
let myWordFreqVis;
let mySwarmPlotVis;
let myDensityVis;
let mytweetsource = [];
let tweetSelectedArray = [];
let tweetSelected = "";
let myBargraph = [];
let config = [
    {key: "tweet_source", title: "Tweet Source"},
];


let parseDateDensity = d3.timeParse("%Y-%m-%d %H:%M:%S+00:00");
let userInputVal = document.getElementById("user-input-keyword").value;

// load data
Promise.all([
    d3.csv("data/tweet_emojis.csv"),
    d3.csv("data/emojiWIP4.csv"),
    d3.json("data/hashtags_frequency_by_date.json"),
    d3.csv("data/tweet_text_word_frequency_not_stemmed_top100.csv"),
    d3.csv("data/animal_crossing_tweets_original_20211030_to_20211105_top1000.csv"),
    d3.csv("data/animal_crossing_tweets_original2_20211107.csv", (row) => {
		row.tweet_id = +row.tweet_id
		row.tweet_created_at = parseDateDensity(row.tweet_created_at)
		return row
	}),
    d3.csv("data/volume_data.csv", (row) => {
		row.volume = +row.volume
		row.date = parseDateDensity(row.date)
		return row
	}),
    d3.csv("data/animal_crossing_tweets_og_20211030_to_20211105.csv"),
]).then(function(data) {
    data[5].sort(function(a, b){
        return a.tweet_created_at - b.tweet_created_at
    })
    initVisualizations(data);
}).catch(function(err) {
    console.log(err);
})

function initVisualizations(allDataArray) {
    myDensityVis = new Slider("#slider", allDataArray[5], allDataArray[6]);
    myBubbleChart = new EmojiBubble("emojibubble", allDataArray[0], allDataArray[1]);
    myAreaChart = new StackedAreaChart("stacked-area-chart", allDataArray[2].hashtags);
    myWordFreqVis = new WordFreqVis("word-frequency-bubble-chart", allDataArray[3]);
    for (i = 0; i < config.length; i++) {
        mytweetsource = new TweetSource("tweetsource", allDataArray[7], config[i]);
    }
    myBargraph = new Bargraph("bargraph", allDataArray[7],tweetSelected)
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

function clearSelection() {
    d3.selectAll(".tweet-sources")
        .attr("fill", "black");
    d3.select(".tstooltip")
        .remove();
    tweetSelected = "";
    //d3.select(".tooltip").enter()
    //redefine tooltip so that reappears?
    tweetSelectedArray = [];
    mytweetsource.bg_sourceChart();
    updateBarVisualization();
}

function updateBarVisualization() {
    myBargraph.wrangleData()
}

function brushed() {
	let selectionRange = d3.brushSelection(d3.select(".brush").node());
	let selectionDomain = selectionRange.map(myDensityVis.x.invert);
	myDensityVis.wrangleData(selectionDomain);
}

// let myBubbleChart;
// let myAreaChart;
// let myWordFreqVis;
// let mySwarmPlotVis;
// let myDensityVis;

// let parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S+00:00");
// let userInputVal = document.getElementById("user-input-keyword").value;

// // load data
// Promise.all([
//     d3.csv("data/tweet_emojis.csv"),
//     d3.csv("data/emojiWIP4.csv"),
//     d3.json("data/hashtags_frequency_by_date.json"),
//     d3.csv("data/tweet_text_word_frequency_not_stemmed_top100.csv"),
//     d3.csv("data/animal_crossing_tweets_original_20211030_to_20211105_top1000.csv"),
//     d3.csv("data/animal_crossing_tweets_original2_20211107.csv", (row) => {
// 		row.tweet_id = +row.tweet_id
// 		row.tweet_created_at = parseDate(row.tweet_created_at)
// 		return row
// 	})
// ]).then(function(data) {
//     // data[5].sort(function(a, b){
//     //     return a.tweet_created_at - b.tweet_created_at
//     // })
//     initVisualizations(data);
// }).catch(function(err) {
//     console.log(err);
// })

// function initVisualizations(allDataArray) {
//     let dateExtent = d3.extent(allDataArray[5], function(d){
//         return d.tweet_created_at
//     });
//     console.log(dateExtent);
//     myBubbleChart = new EmojiBubble("emojibubble", allDataArray[0], allDataArray[1]);
//     myAreaChart = new StackedAreaChart("stacked-area-chart", allDataArray[2].hashtags);
//     myWordFreqVis = new WordFreqVis("word-frequency-bubble-chart", allDataArray[3]);
//     mySwarmPlotVis = new SwarmPlotVis("swarm-plot", allDataArray[4]);
//     myDensityVis = new Slider("#slider", allDataArray[5], dateExtent);
// }

// // take user input of keyword or phrase searches in the swarm plot
// function inputChange() {
//     userInputVal = document.getElementById("user-input-keyword").value;
//     mySwarmPlotVis.wrangleData();
// }

// function inputReset(){
//     userInputVal = "";
//     mySwarmPlotVis.wrangleData();
// }