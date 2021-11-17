
// let margin = {top: 40, right: 40, bottom: 60, left: 60};

// let width = 1200 - margin.left - margin.right,
// 	height = 500 - margin.top - margin.bottom;

// let svg = d3.select("#densityDiv").append("svg")
// 	.attr("width", width + margin.left + margin.right)
// 	.attr("height", height + margin.top + margin.bottom)
// 	.append("g")
// 	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

		// updateVis(data)
	})
}

// function updateVis(data) {
// 	let extent = d3.extent(data, function(d){
// 		return d.tweet_id
// 	})
// 	let xScale = d3.scaleLinear()
// 		.domain(extent)
// 		.range([margin.left, width])

// 	let circles = svg.selectAll("circle")
// 		.data(data)
	
// 	circles = circles.enter()
// 		.append("circle")
// 		.attr("fill", "blue")
// 		.attr("r", 10)
// 		.attr("cx", function(d) { return xScale(d.tweet_id) })
// 		.attr("cy", function(d) { return 150 })
// 		.style("stroke", "black")
	
// }

// function onSelectionChange(data, start_time){

// 	filteredData = data.filter(function (d) {
// 		let newDateObj = new Date(start_time.getTime() + 5*60000)
// 		return d.tweet_created_at >= start_time && d.tweet_created_at <= newDateObj;
// 	});
// 	return filteredData

// }