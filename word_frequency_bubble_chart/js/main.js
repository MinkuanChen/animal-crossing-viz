function bubbleChart() {
    const width = 940;
    const height = 800;

    const centre = { x: width/2, y: height/2 };

    const forceStrength = 0.03;

    let svg = null;
    let bubbles = null;
    let labels = null;
    let nodes = [];

    function charge(d) {
        return Math.pow(d.radius, 2.0) * 0.01
    }

    const simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody().strength(charge))
        // .force('center', d3.forceCenter(centre.x, centre.y))
        .force('x', d3.forceX().strength(forceStrength).x(centre.x))
        .force('y', d3.forceY().strength(forceStrength).y(centre.y))
        .force('collision', d3.forceCollide().radius(d => d.radius + 1));

    simulation.stop();

    function createNodes(rawData) {
        const maxSize = d3.max(rawData, d => +d.count);

        const radiusScale = d3.scaleSqrt()
            .domain([0, maxSize])
            .range([0, 80])

        const myNodes = rawData.map(d => ({
            ...d,
            radius: radiusScale(+d.count),
            size: +d.count,
            x: Math.random() * 900,
            y: Math.random() * 800
        }))

        return myNodes;
    }

    let chart = function chart(selector, rawData) {
        nodes = createNodes(rawData);

        svg = d3.select(selector)
            .append('svg')
            .attr('width', width)
            .attr('height', height)

        const elements = svg.selectAll('.bubble')
            .data(nodes, d => d.word)
            .enter()
            .append('g')

        bubbles = elements
            .append('circle')
            .classed('bubble', true)
            .attr('r', d => d.radius)
            .attr('fill', "#7cc9c3")

        labels = elements
            .append('text')
            .attr('dy', '.3em')
            .style('text-anchor', 'middle')
            .style('font-size', 15)
            .text(d => d.word)

        simulation.nodes(nodes)
            .on('tick', ticked)
            .restart();
    }

    function ticked() {
        bubbles
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)

        labels
            .attr('x', d => d.x)
            .attr('y', d => d.y)
    }

    return chart;
}

// new bubble chart instance
let myBubbleChart = bubbleChart();

function display(data) {
    myBubbleChart('#word-frequency-bubble-chart', data);
}

// load data
loadData();

let data;

// Load CSV file
function loadData() {
    d3.csv("data/tweet_text_word_frequency_not_stemmed.csv", row => {
        //console.log(row);
        row.word = row.word;
        row.count = +row.count;
        return row
    }).then(csv => {
        // Store csv data in global variable
        data = csv.sort((a,b)=>b.count-a.count).slice(0,100);
        //console.log(data);
        display(data);
    });
}