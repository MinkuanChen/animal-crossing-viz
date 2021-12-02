
let parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S+00:00");

let slider

initVis()


function initVis(){
	Promise.all([
	d3.csv("data/volume_data.csv", (row) => {
		row.volume = +row.volume
		row.date = parseDate(row.date)
		return row
	}),
	d3.csv("data/animal_crossing_tweets_original2_20211107.csv", (row) => {
		row.tweet_id = +row.tweet_id
		row.tweet_user_followers_countc = +row.tweet_user_followers_count
		row.tweet_created_at = parseDate(row.tweet_created_at)
		return row
	})]).then((data) => {
		console.log(data)
		data[1].sort(function(a, b){
			return a.tweet_created_at - b.tweet_created_at
		})
		
		slider = new Slider("#slider", data[1], data[0])

	})
}

function brushed() {
	let selectionRange = d3.brushSelection(d3.select(".brush").node());

	let selectionDomain = selectionRange.map(slider.x.invert);

	slider.wrangleData(selectionDomain);
}