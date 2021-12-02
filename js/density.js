

class Slider {

	constructor(parentElement, data, volume_data){
		this.dateExtent = d3.extent(data, function(d){
			return d.tweet_created_at
		})
		this.displayData = data
		this.volume_data = volume_data
		this.parentElement = parentElement
		this.initVis()
	}

	initVis(){
		let vis = this
		vis.margin = {top: 40, right: 40, bottom: 60, left: 60};

		// vis.width = 1200 - vis.margin.left - vis.margin.right,
		vis.width = $(vis.parentElement).width() - vis.margin.left - vis.margin.right,
		vis.height = 500 - vis.margin.top - vis.margin.bottom;

		vis.formatDateIntoYear = d3.timeFormat("%Y-%m-%d %H:%M:%S");
		vis.formatDate = d3.timeFormat("%Y-%m-%d %H:%M:%S");

		vis.startDate = vis.dateExtent[0],
		vis.endDate = vis.dateExtent[1];
		
		vis.graph = d3.select(vis.parentElement)
			.append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", 300)

		vis.x = d3.scaleTime()
			.domain([vis.startDate, vis.endDate])
			.range([0, vis.width])
			// .clamp(true);

		vis.y = d3.scaleLinear()
			.domain([0, 30])
			.range([0, 200])
		
		vis.area = d3.area()
			.x(function(d) {
				return vis.x(d.date) })
			.y0(vis.height-150)
			.y1(function(d) { 
				return vis.y(vis.height-360-d.volume) })


		// vis.brush.append("path")
		// 	.datum(vis.volume_data)
		// 	.attr("fill", "none")
		// 	.attr("stroke", "steelblue")
		// 	.attr("stroke-width", 1.5)
		// 	.attr("d", d3.line()
		// 		.x(function(d) { return vis.x(d.date) })
		// 		.y(function(d) { return vis.y(d.volume) })
		// 		// .curve(d3.curveMonotoneX)
		// 	)

		// vis.area.curve(d3.curveLinear)

		vis.graph.append("path")
			.datum(function(){
				return vis.volume_data 
			} )
			.attr("fill", "#ccc")
			.attr("d", vis.area);

		// Initialize brush component
		vis.brush = d3.brushX()
			.extent([[0, 0], [vis.width,vis.height-150]])
			.on("brush", brushed);

		vis.graph.insert("g")
			.attr("class", "ticks")
			.attr("transform", "translate(10," + 250 + ")")
			.selectAll("text")
			.data(vis.x.ticks(10))
			.enter()
			.append("text")
			.attr("x", vis.x)
			.attr("y", 20)
			.attr("text-anchor", "middle")
			.text(function(d) { 
				return vis.formatDateIntoYear(d) })

		vis.graph.append("g")
			.attr("class", "x brush")
			.call(vis.brush, [0,200])
		.selectAll("rect")
			.attr("y", -150)
			.attr("height", vis.height );

		// !!Now instantiate the plot
		vis.svg = d3.select("#densityDiv").append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", 200)
			.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + 0 + ")");

		vis.parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S+00:00");

		let tmpData = vis.displayData.filter(function (d) {
			vis.newDateObj = new Date(vis.displayData[0].tweet_created_at.getTime() + 1*60000)
			return d.tweet_created_at >= vis.displayData[0].tweet_created_at && d.tweet_created_at <= vis.newDateObj;
		});

		vis.extent = d3.extent(tmpData, function(d){
			return d.tweet_created_at
		})
		vis.xScale = d3.scaleLinear()
			.domain(vis.extent)
			.range([vis.margin.left, vis.width])

		vis.sourceExtent = d3.extent(vis.displayData, function(d){
			return d.tweet_source
		})
		
		vis.colorScale = d3.scaleOrdinal()
			.domain(vis.sourceExtent)
			.range(["red", "blue", "green", "yellow", "orange", "purple", "pink"]);

		vis.barExtent = [5, 35]

		vis.barColorScale = d3.scaleLinear()
			.domain(vis.barExtent)
			.range(["blue", "red"])
			 
		vis.circles = vis.svg.selectAll("circle")
			.data(vis.displayData)
		
		vis.circles = vis.circles.enter()
			.append("circle")
			.attr("fill", function(d){
				return vis.colorScale(d.tweet_source)
			})
			.attr("r", 10)
			.attr("cx", function(d) { return vis.xScale(d.tweet_created_at) })
			.attr("cy", function(d) { return 150 })
			.style("stroke", "black")
			.style("opacity", function(d){
				if (vis.xScale(d.tweet_created_at) <= vis.width/3)
					return vis.xScale(d.tweet_created_at)/(vis.width/3)
				else if (vis.xScale(d.tweet_created_at) >= vis.width-(vis.width/3)){
					return ((vis.width-vis.xScale(d.tweet_created_at))/(vis.width/3))
				}
				else{
					return 1
				}
			})
		// !!Now instantiate the bar graph
		vis.bar = d3.select("#bar").append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", 100)
			.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + 0 + ")");
			
		vis.barScale = d3.scaleLinear()
			.domain(vis.barExtent)
			.range([vis.margin.left, vis.width])
		
		vis.barfluc = vis.bar.selectAll("rect")
			.data(tmpData)

		vis.barfluc = vis.barfluc.enter()
			.append("rect")
			.attr("fill", function(d){
				return vis.barColorScale(tmpData.length)
			})
			.attr("width", vis.width/2)
            .attr("height", 10)
            .attr("x", 50)
            .attr("y", 50)

		// !! Instantiate Count
		console.log(tmpData.length)
		document.getElementById('count').innerText = "Number of tweets in time block: " + tmpData.length
		document.getElementById('info').innerText = "Number of tweets per minute (as shown by the bar below): " + tmpData.length/2

	}
	wrangleData(selectionDomain){
		let vis = this
		vis.start = selectionDomain[0]
		vis.end = selectionDomain[1]
		vis.minutes = Math.round(((vis.end-vis.start) / 60000))
		vis.filteredData = vis.displayData
		vis.filteredData = vis.displayData.filter(function (d) {
			// vis.newDateObj = new Date(start_time.getTime() + 1*60000)
			return d.tweet_created_at >= vis.start && d.tweet_created_at <= vis.end;
		});
		vis.updateVis()
	}

	updateVis(){
		let vis = this
		// !! Update circles
		vis.extent = d3.extent(vis.filteredData, function(d){
			return d.tweet_created_at
		})

		vis.xScale = d3.scaleLinear()
			.domain(vis.extent)
			.range([vis.margin.left,vis.width])
	
		vis.circles = vis.svg.selectAll("circle")
			.data(vis.filteredData)
		
		vis.circles.exit().remove()

		vis.circles = vis.circles.enter()
			.append("circle")
			.merge(vis.circles)
			// .transition()
			// .duration(50)
			.attr("fill", function(d){
				return vis.colorScale(d.tweet_source)
			})
			.attr("r", 10)
			.attr("cx", function(d) { 
				return vis.xScale(d.tweet_created_at) })
			.attr("cy", function(d) { return 150 })
			.style("stroke", "black")
			.style("opacity", function(d){
				if (vis.xScale(d.tweet_created_at) <= vis.width/3)
					return vis.xScale(d.tweet_created_at)/(vis.width/3)
				else if (vis.xScale(d.tweet_created_at) >= vis.width-(vis.width/3)){
					return ((vis.width-vis.xScale(d.tweet_created_at))/(vis.width/3))
				}
				else{
					return 1
				}
			})

		// !!Update bar
		vis.barfluc = vis.bar.selectAll("rect")
			.data(vis.filteredData)
		
		vis.barfluc.exit().remove()

		vis.barfluc = vis.barfluc.enter()
			.append("rect")
			.merge(vis.barfluc)
			.attr("fill", function(d){
				return vis.barColorScale(vis.filteredData.length/vis.minutes)
			})
			.attr("width", vis.barScale(vis.filteredData.length/vis.minutes))
            .attr("height", 10)
            .attr("x", 50)
            .attr("y", 50)
		// !! Update Count
		
		document.getElementById('count').innerText = "Number of tweets in " + vis.minutes + " minute time block: " + vis.filteredData.length
		document.getElementById('info').innerText = "Number of tweets per minute (as shown by the bar below): " + Math.round(vis.filteredData.length/vis.minutes)
	}

}


