

class Slider {

	constructor(parentElement, data, dateExtent){
		this.dateExtent = dateExtent
		this.displayData = data
		this.parentElement = parentElement
		this.initVis()
	}

	initVis(){
		let vis = this
		vis.margin = {top: 40, right: 40, bottom: 60, left: 60};

		vis.width = 1200 - vis.margin.left - vis.margin.right,
		vis.height = 500 - vis.margin.top - vis.margin.bottom;

		vis.formatDateIntoYear = d3.timeFormat("%Y-%m-%d %H:%M:%S");
		vis.formatDate = d3.timeFormat("%Y-%m-%d %H:%M:%S");

		vis.startDate = vis.dateExtent[0],
			vis.endDate = vis.dateExtent[1];
		
		vis.slider = d3.select(vis.parentElement)
				.append("svg")
				.attr("width", vis.width + vis.margin.left + vis.margin.right)
				.attr("height", 300);
				
		vis.x = d3.scaleTime()
				.domain([vis.startDate, vis.endDate])
				.range([0, vis.width])
				.clamp(true);
		
		vis.slider = vis.slider.append("g")
				.attr("class", "slider")
				.attr("transform", "translate(" + vis.margin.left + "," + vis.height / 2 + ")");
		
		vis.slider.append("line")
			.attr("class", "track")
			.attr("x1", vis.x.range()[0])
			.attr("x2", vis.x.range()[1])
			.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
			.attr("class", "track-inset")
			.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
			.call(d3.drag()
				.on("start.interrupt", function() { vis.slider.interrupt(); })
				.on("start drag", function(event) { 
					vis.label.attr("x", vis.x(vis.x.invert(event.x)))
						.text(vis.formatDate(vis.x.invert(event.x)))
					vis.handle.attr("cx", vis.x(vis.x.invert(event.x)));
					vis.wrangleData(vis.x.invert(event.x))
				}))
		
		vis.slider.insert("g", ".track-overlay")
				.attr("class", "ticks")
				.attr("transform", "translate(0," + 20 + ")")
				.selectAll("text")
				.data(vis.x.ticks(10))
				.enter()
				.append("text")
				.attr("x", vis.x)
				.attr("y", 10)
				.attr("text-anchor", "middle")
				.text(function(d) { 
					return vis.formatDateIntoYear(d); })
		
		vis.label = vis.slider.append("text")  
				.attr("class", "label")
				.attr("text-anchor", "middle")
				.text(vis.formatDate(vis.startDate))
				.attr("transform", "translate(0," + (-25) + ")")
		
		vis.handle = vis.slider.insert("circle", ".track-overlay")
				.attr("class", "handle")
				.attr("r", 9);


		// !!Now instantiate the plot
		vis.svg = d3.select("#densityDiv").append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", 200)
			.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + 0 + ")");

		vis.parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S+00:00");

		let tmpData = vis.displayData.filter(function (d) {
			vis.newDateObj = new Date(vis.displayData[0].tweet_created_at.getTime() + 5*60000)
			return d.tweet_created_at >= vis.displayData[0].tweet_created_at && d.tweet_created_at <= vis.newDateObj;
		});

		vis.extent = d3.extent(tmpData, function(d){
			return d.tweet_id
		})
		vis.xScale = d3.scaleLinear()
			.domain(vis.extent)
			.range([vis.margin.left, vis.width])
	
		vis.circles = vis.svg.selectAll("circle")
			.data(vis.displayData)
		
		vis.circles = vis.circles.enter()
			.append("circle")
			.attr("fill", "blue")
			.attr("r", 10)
			.attr("cx", function(d) { return vis.xScale(d.tweet_id) })
			.attr("cy", function(d) { return 150 })
			.style("stroke", "black")

		// !!Now instantiate the bar graph
		vis.bar = d3.select("#bar").append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", 100)
			.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + 0 + ")");
			
		vis.barExtent = [0, 200]
		vis.barScale = d3.scaleLinear()
			.domain(vis.barExtent)
			.range([vis.margin.left, vis.width])
		
		vis.barfluc = vis.bar.selectAll("rect")
			.data(vis.displayData)

		vis.barfluc = vis.barfluc.enter()
			.append("rect")
			.attr("fill", "blue")
			.attr("width", vis.width/2)
            .attr("height", 10)
            .attr("x", 50)
            .attr("y", 50)

	}
	wrangleData(start_time){
		let vis = this
		vis.filteredData = vis.displayData
		vis.filteredData = vis.displayData.filter(function (d) {
			vis.newDateObj = new Date(start_time.getTime() + 5*60000)
			return d.tweet_created_at >= start_time && d.tweet_created_at <= vis.newDateObj;
		});
		vis.updateVis()
	}

	updateVis(){
		let vis = this
		// !! Update circles
		vis.extent = d3.extent(vis.filteredData, function(d){
			return d.tweet_id
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
			.attr("fill", "blue")
			.attr("r", 10)
			.attr("cx", function(d) { 
				return vis.xScale(d.tweet_id) })
			.attr("cy", function(d) { return 150 })
			.style("stroke", "black")

		// !!Update bar
		vis.barfluc = vis.bar.selectAll("rect")
			.data(vis.filteredData)
		
		vis.barfluc.exit().remove()

		vis.barfluc = vis.barfluc.enter()
			.append("rect")
			.merge(vis.barfluc)
			.attr("fill", function(){
				if (vis.barScale(vis.filteredData.length) < 500){
					return "blue"
				}
				return "red"
			})
			.attr("width", vis.barScale(vis.filteredData.length))
            .attr("height", 10)
            .attr("x", 50)
            .attr("y", 50)
	}
}