
let parseDate = d3.timeParse("%Y-%m-%d");
let formatDate = d3.timeFormat("%Y-%m-%d");

class StackedAreaChart {

constructor(parentElement, data) {
    this.parentElement = parentElement;
    this.data = data;
    this.displayData = [];

    let colors = ['#68b893', '#ef758a', '#8ecfca', '#ff7c69', '#a4d4a2', '#febdc3', '#7cc9c3', '#fcea64', '#88c9a1', '#017c74'];

    this.dataCategories = Object.keys(this.data[0]).filter(d=>d !== "date")
	console.log("dataCategories are", this.dataCategories);

    let colorArray = this.dataCategories.map( (d,i) => {
        return colors[i%15]
    })
    this.colorScale = d3.scaleOrdinal()
        .domain(this.dataCategories)
        .range(colorArray);
    this.initVis();
}

	initVis(){
		let vis = this;

		vis.margin = {top: 10, right: 40, bottom: 40, left: 80};

		vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
		vis.height = $('#' + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

		vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

		vis.svg.append("defs").append("clipPath")
			.attr("id", "clip")
			.append("rect")
			.attr("width", vis.width)
			.attr("height", vis.height);

		vis.x = d3.scaleTime()
			.range([0, vis.width])
			.domain(d3.extent(vis.data, d=> parseDate(d.date)));

		console.log("domain is",vis.x.domain());

		vis.y = d3.scaleLinear()
			.range([vis.height, 25]);

		vis.xAxis = d3.axisBottom()
			.scale(vis.x)
			.ticks(7)
			.tickFormat(formatDate);

		vis.yAxis = d3.axisLeft()
			.scale(vis.y);

		vis.svg.append("g")
			.attr("class", "x-axis axis")
			.attr("transform", "translate(0," + vis.height + ")");

		vis.svg.append("g")
			.attr("class", "y-axis axis");

			let stack = d3.stack()
				.keys(vis.dataCategories);

			vis.stackedData = stack(vis.data);


            vis.area = d3.area()
				.curve(d3.curveBasis)
				.x(d=>{
					return vis.x(parseDate(d.data.date))})
				.y0(d=> {
					return vis.y(d[0]);
				})
				.y1(d=>{
					return vis.y(d[1]);
				});


			vis.svg.append("text")
				.attr("x", 10)
				.attr("y", 10)
				.attr("class", "tooltip-text")
				.style("opacity", 0);

		vis.tooltip = d3.select("#stacked-area-chart")
			.append("div")
			.attr("class", "tooltip")
			.attr("id", "stackedAreaChartTooltip");

            vis.wrangleData();

	}

	wrangleData(){
		let vis = this;
        
        vis.displayData = vis.stackedData;

        vis.updateVis();
	}


	updateVis(){
		let vis = this;
console.log("display data is",vis.displayData);
		vis.y.domain([0, d3.max(vis.displayData, function(d) {
            return d3.max(d, function(e) {
                return e[1];
            });
        })
        ]);

		let categories = vis.svg.selectAll(".area")
			.data(vis.displayData);

		categories.enter().append("path")
			.attr("class", "area")
			.merge(categories)
			.style("fill", function(d) {
				console.log("d is: ", d);
				return vis.colorScale(d);
			})
			.attr("d", function(d) {return vis.area(d)})
			.on("mouseover", (event, d)=>{
				d3.select(".tooltip-text")
					.text(d.key)
					.style("opacity", 1);
				//console.log(d.key);
				vis.tooltip
					.style("opacity", 1)
					.style("left", event.pageX + 20 + "px")
					.style("top", event.pageY + "px")
					.html(`
                         <div style="border: thin solid grey; border-radius: 25px; background: #fff9e5; padding: 10px">
                         <p style="font-size: 10pt"><b>Hashtag:</b> #${d.key}</p>
                         </div>
                        `)
			})
			.on("mouseout", (event)=>{
				d3.select(".tooltip-text")
				.style("opacity",0);
				vis.tooltip
					.style("opacity", 0)
					.style("left", 0)
					.style("top", 0)
					.html(``);
			});

		categories.exit().remove();

		vis.svg.select(".x-axis")
			.call(vis.xAxis);
		vis.svg.select(".y-axis").call(vis.yAxis);
	}
}