var height = 600;
var width = 900;
var margin = {left: 100, right: 50, top: 40, bottom: 0};
var scaleWidth = width - margin.left;
var scaleHeight = height - margin.top;

var tree = d3.tree().size([width, height]);
d3.json('data.json').get(function(error, data){

    var svg = d3.select('#container').append('svg').attr('width', width).attr('height', height);

    var allProjects = d3.set(data, function(d){
        return d.project;
    }).values();

    var radiusScale = d3.scaleSqrt().range(d3.extent(data, function(d) { 
        return d.total; 
    })).domain([0, scaleWidth]);

    var xScale = d3.scalePoint().domain(allProjects).range([0, scaleWidth]);

    var yScale = d3.scalePoint().domain(data.map(function(d) { 
        return d.project; 
    })).range([scaleHeight, 0]);

    var colorOrdinal  = d3.scaleOrdinal()
        .domain(data.map(function(d) { 
            return d.project; 
        }))
        .range([ "rgb(153, 107, 195)", "rgb(56, 106, 197)", "rgb(93, 199, 76)", "rgb(223, 199, 31)", "rgb(234, 118, 47)"]);

    //Create a radial gradient for each project
    var colorGradients = svg.append("defs").selectAll("radialGradient")
        .data(allProjects)
        .enter().append("radialGradient")
        .attr("id", function(d){return "gradient-" + d }) //unique id project
        .attr("cx", "35%")	//Move the x-center location towards the left
        .attr("cy", "35%")	//Move the y-center location towards the top
        .attr("r", "60%");	//Increase the size of the "spread" of the gradient

    colorGradients.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", function(d) { return d3.rgb(colorOrdinal(d)).brighter(1); });
    //Then the actual color almost halfway
    colorGradients.append("stop")
        .attr("offset", "50%")
        .attr("stop-color", function(d) { return colorOrdinal(d); }); 
    //Finally a darker color at the outside
    colorGradients.append("stop")
        .attr("offset",  "100%")
        .attr("stop-color", function(d) { return d3.rgb(colorOrdinal(d)).darker(1.75); });

    var chartGroup = svg.append('g').attr('transform', 'translate('+margin.left+','+margin.top+')');


        svg.append("g")
        .attr("class", "legendOrdinal")
        .attr("transform", "translate(20,20)");

        var legendOrdinal = d3.legendColor()
            .shape("path", d3.symbol().type(d3.symbolTriangle).size(150)())
            .shapePadding(5)
            .scale(colorOrdinal);

        svg.select(".legendOrdinal")
            .call(legendOrdinal);

    var simulation = d3.forceSimulation()
        //Force(name, definetheforce)
        .force('forceX', d3.forceX(function(d){return (xScale(d.project));}))
        .force('forceY', d3.forceY(height / 2).strength(0.025))
        .force('collide', d3.forceCollide(function(d){return radiusScale(d.total);}))
        ;
    var bubbles = chartGroup.selectAll('g')
        .data(data)
        .enter().append('g')
        .attr('class', function(d,i){
            return 'group-'+i;
        })
        .on('mouseover', function(d,i){
            d3.select('.group-'+i +' .label').transition()
            .duration(500)
            .attr('opacity', 1)
        })
        .on('mouseout', function(d,i){
            d3.select('.group-'+i +' .label').transition()
            .duration(500)
            .attr('opacity', 0)
        })
        ;

    var circles = bubbles.append('circle')
        .attr('class', '.circles')
        .attr('r', function(d){ 
            return radiusScale(d.total);
        })
        .attr('fill', function(d){
            return "url(#gradient-" + d.project + ")";
        })
        ;

        simulation.nodes(data)
            .on('tick', ticked)
            ;

    var labels = bubbles.append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .attr("font-size", "12px")
        .text(function(d) { return d.name; })
        .attr('opacity', 0)
        ;
        function ticked(){
            circles
                .attr('cx', function(d){return d.x})
                .attr('cy', function(d){return d.y})
                ;
            labels 
                .attr("x", function(d) { return d.x; }) 
                .attr("y", function(d) { return d.y; })
                ;
        }

})