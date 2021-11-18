
let parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S+00:00");

let slider

initVis()


function initVis(){
	d3.csv("data/animal_crossing_tweets_original2_20211107.csv", (row) => {
		row.tweet_id = +row.tweet_id
		row.tweet_created_at = parseDate(row.tweet_created_at)
		return row
	}).then((data) => {
		console.log(data)
		data.sort(function(a, b){
			return a.tweet_created_at - b.tweet_created_at
		})
		let dateExtent = d3.extent(data, function(d){
			return d.tweet_created_at
		})
		slider = new Slider("#slider", data, dateExtent)

	})
}
