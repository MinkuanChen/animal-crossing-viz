// init global variables & switches
let mySwarmPlotVis;

//let selectedCategory = $('#categorySelector').val();
let selectedCategory = document.getElementById("#categorySelector").value
console.log(selectedCategory);
let data;

loadData()
function loadData() {
    d3.csv("data/animal_crossing_tweets_original_20211030_to_20211105_top1000.csv").then(csvData => {
        data = csvData;
        initMainPage(data);
    })
}

// initMainPage
function initMainPage(data) {
    // init mySwarmPlotVis from SwarmPlotVis class
    mySwarmPlotVis = new SwarmPlotVis("swarm-plot", data);
}

// category selection
function categoryChange() {
    selectedCategory = document.getElementById("#categorySelector").value
    mySwarmPlotVis.wrangleData();
}