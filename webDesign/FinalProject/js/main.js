let myBubbleChart;
let density;
let parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S+00:00");

// load data
Promise.all([
    d3.csv("data/tweet_emojis.csv"),
    d3.csv("data/emojiWIP4.csv"),
    d3.csv("data/animal_crossing_tweets_original2_20211107.csv"),
    d3.csv("data/animal_crossing_tweets_original_20211030_to_20211105_top1000.csv", (row) => {
		row.tweet_id = +row.tweet_id
		row.tweet_created_at = parseDate(row.tweet_created_at)
		return row
	})
]).then(function(data) {
    console.log(data)
    data[2].sort(function(a, b){
        return a.tweet_created_at - b.tweet_created_at
    })
    initVisualizations(data);
}).catch(function(err) {
    console.log(err);
})


function initVisualizations(allDataArray) {
    let dateExtent = d3.extent(allDataArray[2], function(d){
        return d.tweet_created_at
    })
    density = new Slider("#slider", allDataArray[2], dateExtent);
    myBubbleChart = new EmojiBubble("emojibubble", allDataArray[0], allDataArray[1]);
}
