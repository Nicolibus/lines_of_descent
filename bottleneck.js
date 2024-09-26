let introMode = true;
let introSection = 0;
let refitting = false;

let isMobile = window.innerWidth < 600
const introSections = [intro_01_population, intro_02_newGeneration,intro_03_bottleneck]
const intro = d3.select("body")
    .append("svg")
    .attr("id","intro")
// sort the colors? so that the random colors are not too different from the previous ones
// more colors? slightly different hues from the ones now?
let colors = [[212, 169, 73], [216, 165, 189], [189, 65, 16], [42, 43, 51], [55, 167, 111], [10, 101, 173], [109, 67, 136], [214, 214, 217], [41, 185, 176]];
const MOBILE_WIDTH = 768;

function getInitialData(rowWidth) {
    spawn = 0;
    const nodes = Array.from({ length: rowWidth * 2 }, (_, i) => {
        let node = {
            index: i,
            x: width / 2 + getRandom(200),
            y: height / 2 + getRandom(200),
            colorIndex: getRandomColorIndex(),
            bottleneck: false,
            spawn: Math.random() < 0.1 ? 1 : 0,
            parent: i >= rowWidth ? i - rowWidth : i,
            rowWidth: rowWidth
        }
        i >= rowWidth ? spawn += node.spawn : null;
        return node;

    });

    const links = [];
    for (let x = 0; x < 2 * rowWidth; ++x) {
        if ((x % rowWidth) > 0) links.push({ source: (x - 1), target: x, distance: cellWidth });
        if (x >= rowWidth) links.push({ source: (nodes[x].parent), target: x, distance: 6 * cellWidth });
    }
    const cells = Array.from({ length: rowWidth - 1 }, (_, i) => ({
        index: i,
        colorIndex: nodes[i + rowWidth].colorIndex,
        points: [i, i + 1, i + rowWidth + 1, i + rowWidth],
        rowWidth: rowWidth
    }));
    return { nodes, links, cells };
}


let height = window.innerHeight;
let width = window.innerWidth;

window.addEventListener("resize", function () {
    height = window.innerHeight;
    width = window.innerWidth;
});


let rowWidth = 20;

const cellWidth = 10;
// let bottleneckWidth = d3.select("#bottleneckWidth").property("value");
let bottleneckWidth = 100;
let mutationProb = d3.select("#mutationProb").property("value");
let bottleneckProb = d3.select("#bottleneckProb").property("value");
const bottleneckProbDecrease = 0.98;
let spawnProb = d3.select("#spawnProb").property("value");

let spawn = 0;
let data = getInitialData(rowWidth);

let links = data.links.map(d => Object.create(d));
let nodes = data.nodes.map(d => Object.create(d));
let cells = data.cells;

const simulation = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(-30))
    .force("link", d3.forceLink(links).strength(1).distance(d => d.distance).iterations(10))
    .alphaDecay(0.035)
    .on("tick", ticked)
    .on("end",function(){
        // if(introMode && introSection < 2){
        //     d3.select("#bottleneck").style("pointer-events","none")
        // }
        if(introMode && introSection < 3){
            console.log(introSection)
            introSections[introSection]()
        }
        
    });

// const drag = d3.drag()
//     .on("start", dragstarted)
//     .on("drag", dragged)
//     .on("end", dragended);

const svg = d3.select("#bottleneck")
    // .attr("width", width)
    // .attr("height", height)
    // .attr("viewBox", [0, 0, width, height])
    .style("background-color", "black");

const mainGroup = svg.append("g");

// let linksSvg = mainGroup
//     .append("g")
//     .selectAll(".link")
//     .data(links)
//     .join("line")
//     .attr("stroke", "white")
//     .attr("stroke-width", 1.5)
//     .attr("class", "link");

// let nodesSvg = mainGroup
//     .append("g")
//     .selectAll(".node")
//     .data(nodes)
//     .join("circle")
//     .attr("stroke", "white")
//     .attr("stroke-width", 1.5)
//     .attr("r", 5)
//     .attr("class", "node")
// // .call(drag);

let cellsSvg = mainGroup
    .append("g")
    .selectAll(".cell")
    .data(cells)
    .join("polygon")
    .attr("points", d => { let p = d.points.map(i => [nodes[i].x, nodes[i].y].join(",")).join(" "); return p; })
    .attr("fill", d => `rgba(${colors[d.colorIndex][0]}, ${colors[d.colorIndex][1]}, ${colors[d.colorIndex][2]}, 1)`)
    .attr("data-position", d => d.index)
    // .attr("data-rowMax", d => console.log(d))
    .attr("data-rowMax", d => d.rowWidth)
    .attr("data-isBottleneck", d => d.bottleneck)
    // .attr("stroke", d => `rgba(${colors[d.colorIndex][0]}, ${colors[d.colorIndex][1]}, ${colors[d.colorIndex][2]}, 1)`)
    .attr("class", "cell");

function ticked() {

    mutationProb = d3.select("#mutationProb").property("value");
    bottleneckProb = d3.select("#bottleneckProb").property("value");
    spawnProb = d3.select("#spawnProb").property("value");
    // bottleneckWidth = d3.select("#bottleneckWidth").property("value");
    bottleneckWidth = 100;

    svg
        .selectAll(".link")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    svg
        .selectAll(".node")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    svg
        .selectAll(".cell")
        .attr("points", d => d.points.map(i => [nodes[i].x, nodes[i].y].join(",")).join(" "));
}

function getRandom(variance) {
    return (Math.random() - 0.5) * variance;
}

function getRandomColorIndex() {
    return Math.floor(Math.random() * colors.length);
}

function getParentClamp(i) {
    return Math.max(Math.min(nodes.length - rowWidth + i, nodes.length - 1), nodes.length - rowWidth);
}

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    const randNumber = Math.random();
    return Math.floor(randNumber * (maxFloored - minCeiled + 1) + minCeiled); // The maximum and the minimum are inclusive
}

function getRandomParentColorIndex() {
    // let offset = getRandomInt(-1, 1);
    let offset = 0;
    let offsetParentIndex = getParentClamp(currentIndex + offset);
    parentIndex = nodes[offsetParentIndex].colorIndex === -1 ? getParentClamp(currentIndex) : offsetParentIndex;
    return Math.random() < mutationProb ? getRandomColorIndex() : nodes[parentIndex].colorIndex;
}


let currentParent, targetSpawn, currentIndex;

function getParent() {
    if (targetSpawn > 0) {
        targetSpawn--;
    }
    else {
        currentIndex++;
        currentParent = getParentClamp(currentIndex);
        targetSpawn = nodes[currentParent].spawn;
    }
    return currentParent;
}

function getColorFromTree(colorTree, node) {
    if (node.colorTreeIndex === -1)
        return -1;
    let colorBranch = Array.from(colorTree[node.colorTreeIndex]);
    let index = getRandomInt(0, colorBranch.length - 1);
    return colorBranch[index];
}

function fitInScreen(){
    refitting = true
    const populations = d3.select("#bottleneck").select("g").node().getBoundingClientRect()
    svg.transition().call(zoom.scaleBy, 0.8)
    
    setTimeout(() => {
        if(introMode && introSection < 3 && (populations.x < 0 || populations.y < 0 || populations.x+populations.width > window.innerWidth || populations.y+populations.height > window.innerHeight)){
            d3.select("#bottleneck").style("pointer-events","none")
            svg.transition().call(fitInScreen())
        }else{
            d3.select("#bottleneck").style("pointer-events","all")
            refitting = false
        }
    }, 400);
    
}
function checkBottleneck(){
    const bottleneck = d3.select("#bottleneck")
        .selectAll("polygon")
        .nodes()
        .find(node =>node.getAttribute("fill") === "rgba(0,0,0,0)" && +node.getAttribute("data-position") !== 0 && +node.getAttribute("data-position") !== +node.getAttribute("data-rowMax")   )
        //.find(node => console.log(node.getAttribute("data-position") , +node.getAttribute("data-rowMax"))  )
        ?.getBoundingClientRect()
    return bottleneck;
}
function addRow() {
    if(introMode && checkBottleneck() && introSection <= 2){
        console.log("LOCK")
        d3.select("#bottleneck").style("pointer-events","none")
    }
    d3.select("#intro").selectAll("*").transition().attr("opacity",0).remove()
    const populations = d3.select("#bottleneck").select("g").node().getBoundingClientRect()
    console.log(introSection)
    if(introSection < 2 && introMode){
        d3.select("#bottleneck").style("pointer-events","none")
    }
        if( introMode && introSection <= 2 && (populations.x < 0 || populations.y < 0 || populations.x+populations.width > window.innerWidth || populations.y+populations.height > window.innerHeight)){
            fitInScreen()
        }
    
    // create new nodes
    let newNodes = [];
    let newSpawn = 0;
    currentParent = 0;
    targetSpawn = 0;
    currentIndex = -1;

    // list of lists of colors divided by bottleneck
    let colorTree = []
    let currentColorBranch = new Set();
    let currentColorTreeIndex = 0;

    newNodes = Array.from({ length: rowWidth + spawn }, (_, i) => {
        let parent = getParent()
        let bottleneck = nodes[parent].bottleneck || Math.random() < bottleneckProb
        let color = bottleneck ? -1 : getRandomParentColorIndex()

        if (!bottleneck)
            currentColorBranch.add(color);
        else {
            colorTree.push(currentColorBranch);
            currentColorBranch = new Set();
            currentColorTreeIndex++;
        }

        let node = {
            index: nodes.length + i,
            // in the viscinity of the parent node
            x: nodes[parent].x + getRandom(200),
            y: nodes[parent].y + getRandom(200),
            // if the parent is a bottleneck or with a small probability, the new node is a bottleneck
            bottleneck: bottleneck,
            colorIndex: color,
            spawn: Math.random() < spawnProb && !bottleneck ? 1 : 0,
            parent: parent,
            colorTreeIndex: bottleneck ? -1 : currentColorTreeIndex,
            colorBranch: currentColorBranch
        }
        newSpawn += node.spawn;
        return node;
    });

    // prevent genesis spawn
    if (newNodes[newNodes.length - 2].bottleneck) {
        newNodes[newNodes.length - 1].bottleneck = true
        newNodes[newNodes.length - 1].spawn = 0;
        newNodes[newNodes.length - 1].colorTreeIndex = -1;
    }

    colorTree.push(currentColorBranch);

    // create new links and cells
    const newLinks = [];
    const newCells = [];
    let cell = [];
    let connected = false;
    let offset = 0;


    for (let x = 0; x < rowWidth + spawn; ++x) {
        // create links
        // if it's a bottleneck then create a weaker link
        let distance = newNodes[x].bottleneck ? bottleneckWidth : cellWidth;
        // create the link to the right
        if (x < rowWidth + spawn - 1) newLinks.push({ source: (newNodes[x + 1].index), target: newNodes[x].index, distance: distance });
        // create the link to the parent
        let parentIndex = newNodes[x].parent;
        newLinks.push({ source: (nodes[parentIndex].index), target: newNodes[x].index, distance: 6 * cellWidth })
        // create the cells
        // if there is a node to the right
        if (x < rowWidth + spawn) {
            // add the nodes to the cell alternately to create rectangles
            if (x % 2 === 0) {
                cell.push(nodes[parentIndex].index);
                cell.push(newNodes[x].index);
                if (x > 0) {
                    let color = getColorFromTree(colorTree, newNodes[x - 1]);
                    newNodes[x - 1].colorIndex = color
                    // newCells.push({ colorIndex: newNodes[x - 1].colorIndex, points: cell });
                    newCells.push({ index:x , colorIndex: color, points: cell, rowWidth: rowWidth });
                    cell = [];
                    cell.push(nodes[parentIndex].index);
                    cell.push(newNodes[x].index);
                }
            }
            else {
                cell.push(newNodes[x].index);
                cell.push(nodes[parentIndex].index);
                let color = getColorFromTree(colorTree, newNodes[x - 1]);
                newNodes[x - 1].colorIndex = color
                // newCells.push({ colorIndex: newNodes[x - 1].colorIndex, points: cell });
                newCells.push({ index:x, colorIndex: color, points: cell, rowWidth: rowWidth });
                cell = [];
                cell.push(newNodes[x].index);
                cell.push(nodes[parentIndex].index);
            }
        }
    }

    // fix position of old nodes
    // nodes.forEach(node => {
    //     node.fx = node.x;
    //     node.fy = node.y;
    // });

    // add new cells
    // const newCells = Array.from({ length: rowWidth }, (_, i) => ({
    //     colorIndex: newNodes[i].bottleneck ? -1 : getRandomIndex(),
    //     points: [nodes.length - rowWidth + i, nodes.length - rowWidth + i + 1, nodes.length + i + 1, nodes.length + i]
    // }));

    cells.push(...newCells);

    // update simulation data
    nodes.push(...newNodes);
    links.push(...newLinks);
    simulation.nodes(nodes);
    simulation.force("link").links(links);

    rowWidth += spawn;
    spawn = newSpawn;
    bottleneckProb *= bottleneckProbDecrease;


    // update svg
    // nodesSvg = nodesSvg.data(nodes);
    // nodesSvg.exit().remove();
    // nodesSvg = nodesSvg.enter()
    //     .append("circle")
    //     .attr("stroke", "white")
    //     .attr("stroke-width", 1.5)
    //     .attr("r", 5)
    //     .attr("class", "node")
    //     // .call(drag)
    //     .merge(nodesSvg);

    // linksSvg = linksSvg.data(links);
    // linksSvg.exit().remove();
    // linksSvg = linksSvg.enter().append("line")
    //     .attr("stroke", "white")
    //     .attr("stroke-width", 1.5)
    //     .attr("class", "link")
    //     .merge(linksSvg);

    let colorVariance = 0.;
    cellsSvg = cellsSvg.data(cells);
    cellsSvg.exit().remove();
    cellsSvg = cellsSvg.enter().append("polygon")
        .attr("points", d => { let p = d.points.map(i => [nodes[i].x, nodes[i].y].join(",")).join(" "); return p; })
        .attr("fill", d => d.colorIndex === -1 ? `rgba(0,0,0,0)` : `rgba(${colors[d.colorIndex][0] * (1 + getRandom(-colorVariance, colorVariance))}, ${colors[d.colorIndex][1] * (1 + getRandom(-colorVariance, colorVariance))}, ${colors[d.colorIndex][2] * (1 + getRandom(-colorVariance, colorVariance))}, 1)`)
        // .attr("stroke", d => d.colorIndex === -1 ? `rgba(0,0,0,0)` : `rgba(${colors[d.colorIndex][0]}, ${colors[d.colorIndex][1]}, ${colors[d.colorIndex][2]}, 1)`)
        .attr("data-position", d => d.index)
        .attr("data-rowMax", d => d.rowWidth)
        .attr("data-isBottleneck", d => d.bottleneck)
        .attr("class", "cell")
        .merge(cellsSvg);

    // restart simulation
    simulation.alpha(1).restart();
}

svg.on("click", addRow);

// function dragstarted(event) {
//     if (!event.active) simulation.alphaTarget(0.3).restart();
//     event.subject.fx = event.subject.x;
//     event.subject.fy = event.subject.y;
// }

// function dragged(event) {
//     event.subject.fx = event.x;
//     event.subject.fy = event.y;
// }

// function dragended(event) {
//     if (!event.active) simulation.alphaTarget(0);
//     event.subject.fx = null;
//     event.subject.fy = null;
// }

//ZOOM and PAN
const zoom = d3.zoom().on("zoom", zoomed);
let group = svg.call(zoom).on("dblclick.zoom", null).select("g");


function zoomed(e) {
    !refitting && d3.select("#intro").selectAll("*").remove()
    const { x, y, k } = e.transform;
    group.attr(
        "transform",
        "translate(" + x + "," + y + ")" + " scale(" + k + ")"
    );
  
}
document.addEventListener('DOMContentLoaded', function () {
    var lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        var now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    document.addEventListener('dblclick', function (event) {
        event.preventDefault();
    });
});

d3.select("#resetParam").on("click", function () {
    d3.select(this).classed("hide", true)
    d3.select("#mutationProb").property("value", 0);
    d3.select("#bottleneckProb").property("value", 0.005);
    d3.select("#spawnProb").property("value", 0.05);
    // d3.select("#bottleneckWidth").property("value", 100);
    mutationProb = d3.select("#mutationProb").property("value");
    bottleneckProb = d3.select("#bottleneckProb").property("value");
    bottleneckWidth = 100;
    spawnProb = d3.select("#spawnProb").property("value");
});

d3.select("#resetSim").on("click", function () {
    this.innerHTML = "Restart Simulation"
    d3.select("#bottleneck").style("pointer-events","all")
    introMode = false
    d3.select("#intro")
        .style("opacity",0)
        .style("pointer-events","none")
    // get new data
    rowWidth = 20;
    spawn = 0;

    data = getInitialData(rowWidth);

    links = data.links.map(d => Object.create(d));
    nodes = data.nodes.map(d => Object.create(d));
    cells = data.cells;

    d3.select('#bottleneck')
        .call(zoom.scaleTo, 1)
	    .call(zoom.translateTo, 0.5 * width, 0.5 * height);

    // update svg
    mainGroup.selectAll("*").remove();
    cellsSvg = mainGroup
        .append("g")
        .selectAll(".cell")
        .data(cells)
        .join("polygon")
        .attr("points", d => { let p = d.points.map(i => [nodes[i].x, nodes[i].y].join(",")).join(" "); return p; })
        .attr("fill", d => `rgba(${colors[d.colorIndex][0]}, ${colors[d.colorIndex][1]}, ${colors[d.colorIndex][2]}, 1)`)
        .attr("data-position", d => d.index)
        .attr("data-rowMax", d => d.rowWidth)
        // .attr("stroke", d => `rgba(${colors[d.colorIndex][0]}, ${colors[d.colorIndex][1]}, ${colors[d.colorIndex][2]}, 1)`)
        .attr("class", "cell");

    // update and restart the simulation
    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(1).restart();
});

d3.select("#container2").on("click", function (e) {
    if (width < MOBILE_WIDTH) {
    }
    else {
        // open a new window
        window.open("https://www.nature.com/nature/volumes/613/issues/7944", "_blank");

    }
});

d3.selectAll(".slider")
    .on("mousedown", function () {
        d3.select(this).classed("grabbing", true)
    })
    .on("mouseup", function () {
        d3.select(this).classed("grabbing", false)
        d3.select("#resetParam").classed("hide", false)
    })
    .on("touchstart", function () {
        d3.select(this).classed("grabbing", true)
    })
    .on("touchend", function () {
        d3.select(this).classed("grabbing", false)
        d3.select("#resetParam").classed("hide", false)
    })

    
    function correctHeight(y){
        console.log("correction",y)
        if(y > window.innerHeight - 150) return window.innerHeight - 150
        if(y < 100) return 100
        return y
    }
    d3.select("#bottleneck").style("pointer-events","none")  
    function intro_01_population(){
        
        introSection++
        
        const generation = d3.select("#bottleneck")
        .select(".cell").node().parentElement.getBoundingClientRect()
        
        const intro = d3.select("#intro")
            
        const individual = d3.select("#bottleneck")
        .selectAll(".cell").nodes()[5].getBoundingClientRect()
        
        
        intro
        .append("line")
            .attr("fill","white")
            .attr("x1",individual.x+(individual.width/2))
            .attr("y1",individual.y)
            
            .attr("x2",individual.x+(individual.width/2))
            .attr("y2",individual.y)
            .transition()
            .attr("x1",individual.x+(individual.width/2)+25)
            .attr("y1",correctHeight(generation.y)-30)
            .attr("stroke","white")
            
        intro
        .append("text")
            .text("Every cell is an individual")
            .attr("filter","url(#shadow)")
            .attr("fill","white")
            .attr("text-anchor","middle")
            .attr("x",individual.x+(individual.width/2)+25)
            .attr("y",correctHeight(generation.y)-35)
            .attr("opacity",0)
            .transition()
            .duration(300)
            .attr("opacity",1)

        setTimeout(() => {
            intro
            .append("text")
                .text("and this is our original population.")
                .attr("filter","url(#shadow)")
                .attr("fill","white")
                .attr("x",generation.x)
                .attr("y",correctHeight(generation.y+generation.height)+20)
                .attr("opacity",0)
                .transition()
                .duration(300)
                .attr("opacity",1)
            intro
            .append("text")
                .text(`If you ${isMobile?"tap":"click"}, a new generation will be born...`)
                .classed("cta",true)
                .attr("filter","url(#shadow)")
                .attr("fill","white")
                .attr("x",isMobile?window.innerWidth/8:generation.x)
                .attr("y",correctHeight(generation.y+generation.height)+45)
                .attr("opacity",0)
                .transition()
                .delay(2000)
                .attr("opacity",1)

                setTimeout(() => {
                    d3.select("#bottleneck").style("pointer-events","all")
                    
                }, 2500);
                //d3.select("#bottleneck").style("pointer-events","all")
        }, 1500);
    }

    function intro_02_newGeneration(){
        d3.select("#bottleneck").style("pointer-events","none")
        introSection++
        const generation = d3.select("#bottleneck")
        .select(".cell").node().parentElement.getBoundingClientRect()
        
        const intro = d3.select("#intro")
            
        const individual = d3.select("#bottleneck")
        .selectAll(".cell").nodes()[5].getBoundingClientRect()
        intro
        .append("text")
            .text("Here's a new generation.")
            .attr("filter","url(#shadow)")
            .attr("fill","white")
            .attr("x",isMobile?window.innerWidth/8:generation.x)
            .attr("y",correctHeight(generation.y+generation.height)+20)
            .attr("opacity",0)
            .transition()
            .duration(300)
            .attr("opacity",1)
        intro
        .append("text")
            .text("Individuals are colored based on their genes")
            .attr("filter","url(#shadow)")
            .attr("fill","white")
            .attr("x",isMobile?window.innerWidth/8:generation.x)
            .attr("y",correctHeight(generation.y+generation.height)+45)
            .attr("opacity",0)
            .transition()
            .delay(1000)
            .duration(300)
            .attr("opacity",1)
        intro
        .append("text")
            .text("and therefore colors are likely to be inherited.")
            .attr("filter","url(#shadow)")
            .attr("fill","white")
            .attr("x",isMobile?window.innerWidth/8:generation.x)
            .attr("y",correctHeight(generation.y+generation.height)+70)
            .attr("opacity",0)
            .transition()
            .delay(2000)
            .duration(300)
            .attr("opacity",1)
        intro
        .append("text")
            .text(`${isMobile?"Tap":"Click"} again for new generations...`)
            .classed("cta",true)
            .attr("filter","url(#shadow)")
            .attr("fill","white")
            .attr("x",isMobile?window.innerWidth/8:generation.x)
            .attr("y",correctHeight(generation.y+generation.height)+95)
            .attr("opacity",0)
            .transition()
            .delay(3500)
            .duration(300)
            .attr("opacity",1)
            

        setTimeout(() => {
            d3.select("#bottleneck").style("pointer-events","all")
            
        }, 3500);
    }

function intro_03_bottleneck(){
    
    
    const generations = d3.select("#bottleneck")
    .select(".cell").node().parentElement.getBoundingClientRect()
    
    const intro = d3.select("#intro")
    
    // console.log(d3.select("#bottleneck")
    // .selectAll("polygon")
    // .nodes())
    
        
    if(checkBottleneck()){
        console.log("A_03")
        const bottleneck = d3.select("#bottleneck")
            .selectAll("polygon")
            .nodes()
            .find((node,n,l) =>node.getAttribute("fill") === "rgba(0,0,0,0)" && +node.getAttribute("data-position") !== 0 && +node.getAttribute("data-position") !== +node.getAttribute("data-rowMax") && (l[n-1]? (console.log(l[n-1]),l[n-1].getAttribute("data-isBottleneck") !== "true") : false)  )
            //.find(node => console.log(node.getAttribute("data-position") , +node.getAttribute("data-rowMax"))  )
            ?.getBoundingClientRect()

        d3.select("#bottleneck").style("pointer-events","none")
        intro
        .append("line")
            .attr("filter","url(#shadow)")
            .attr("fill","white")
            .attr("x1",bottleneck.left+(bottleneck.width/2))
            .attr("y1",bottleneck.top+(bottleneck.height/2))
            
            .attr("x2",bottleneck.left+(bottleneck.width/2))
            .attr("y2",bottleneck.top+(bottleneck.height/2))
            .transition()
            .attr("y1", 138)
            .attr("x1",window.innerWidth / 2)
            .attr("stroke","white")

        intro
            .append("text")
                .attr("filter","url(#shadow)")
                .text("The population split!")
                .attr("fill","white")
                .attr("y", 60)
                .attr("x",isMobile?window.innerWidth / 6:window.innerWidth / 3)
                .attr("opacity",0)
                .transition()
                .delay(300)
                .duration(300)
                .attr("opacity",1)
        intro
            .append("text")
                .text("Future generations will only inherit colors")
                .attr("filter","url(#shadow)")
                .attr("fill","white")
                .attr("y", 85)
                .attr("x",isMobile?window.innerWidth / 6:window.innerWidth / 3)
                .attr("opacity",0)
                .transition()
                .delay(300)
                .duration(300)
                .attr("opacity",1)
        intro
            .append("text")
                .text("from the ancestors within their group.")
                .attr("filter","url(#shadow)")
                .attr("fill","white")
                .attr("y", 110)
                .attr("x",isMobile?window.innerWidth / 6:window.innerWidth / 3)
                .attr("opacity",0)
                .transition()
                .delay(300)
                .duration(300)
                .attr("opacity",1)
        intro
            .append("text")
                .text("This a Genetic Bottleneck")
                .attr("filter","url(#shadow)")
                .attr("fill","white")
                .classed("bottleneck-label",true)
                .attr("y", 135)
                .attr("x",isMobile?window.innerWidth / 6:window.innerWidth / 3)
                .attr("opacity",0)
                .transition()
                .delay(300)
                .duration(300)
                .attr("opacity",1)

            setTimeout(() => {
                
                d3.select("#bottleneck").style("pointer-events","all")
                intro
                    .append("text")
                        .text(`${isMobile?"tap":"click"} more to see how it evolves...`)
                        .classed("cta",true)
                        .attr("filter","url(#shadow)")
                        .attr("fill","white")
                        
                        //.attr("y", window.innerHeight-50 < generations.y+generations.height+25 ? generations.y+generations.height+25 : window.innerHeight-50 )
                        .attr("y",correctHeight(generations.y+generations.height)+50 )
                        .attr("x",window.innerWidth / 3)
                        .attr("opacity",0)
                        .transition()
                        .delay(300)
                        .duration(300)
                        .attr("opacity",1)

                d3.select("#resetSim").text("Reset Simulation")
            }, 2000);

            introSection++
    }else{
        const generation = d3.select("#bottleneck")
        .select(".cell").node().parentElement.getBoundingClientRect()
        
        const intro = d3.select("#intro")
        intro
        .append("text")
            .text(`${isMobile?"Tap":"Click"} again for new generations`)
            .classed("cta",true)
            .attr("filter","url(#shadow)")
            .attr("fill","white")
            .attr("x",isMobile?window.innerWidth/8:generation.x)
            .attr("y",correctHeight(generation.y+generation.height)+95)
            .attr("opacity",0)
            .transition()
            .delay(1500)
            .duration(300)
            .attr("opacity",1)
    }
    
            
       
}

 d3.selectAll(".container").on("click",function(e){
    e.stopPropagation()
    d3.selectAll(".popup").style("display","none")
    if(!isMobile)d3.select("#popupMenu").style("display","block")
    d3.select(this).select(".popup")
        .style("display","block")
        .on("click",function(e){
            e.stopPropagation()
            d3.selectAll(".input").style("display","none")
        })
    })

d3.select("body")
    .on("click",()=>{
        d3.selectAll(".popupMenuInfo").style("display","none")
        d3.selectAll(".popup").style("display","none")
        if(!isMobile)d3.select("#popupMenu").style("display","block")
    })
if(isMobile)d3.select("#paramOk").on("click",()=>d3.selectAll(".popup").style("display","none"))
d3.select("#popupMenu")

        // d3.select("#elementMenu").on("click",function(){
        //     d3.select("#popupMenu").style("display","block")
        // })

d3.select("#startTutorial").on("click",()=>{
    window.location.reload()
})

if(isMobile){


d3.selectAll(".menuOptionInfoContainer").on("click",function(e){
    e.stopPropagation()
    d3.selectAll(".popupMenuInfo").style("display","none")
    d3.select(this).select(".popupMenuInfo").style("display","block")
    d3.select(this).select(".closePopup").style("display","inline-block")
    d3.select(this).select(".menuOptionInfo")
        .style("opacity","0")
        .style("pointer-events","none")
})
d3.selectAll(".closePopup").on("click",function(e){
    e.stopPropagation()
    d3.select(this).style("display","none")
    d3.select(this.parentElement).select(".menuOptionInfo")
    .style("opacity","1")
    .style("pointer-events","all")
    
    d3.select(this.parentElement).select(".popupMenuInfo").style("display","none")
})
}else{
    d3.selectAll(".menuOptionInfoContainer")
    .on("mouseover",function(e){
       
        
        d3.select(this).select(".popupMenuInfo").style("display","block")
    })
    .on("mouseout",function(e){
        
        
        d3.select(this).select(".popupMenuInfo").style("display","none")
    })
}
