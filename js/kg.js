
$(document).on('click','.bookmark-ok',function (){
    $(this).parents('#fancybox-container-3').remove();
})
$('#sub').click(function(){
    $.ajax({
        dataType:"json",
        url: 'https://api.ownthink.com/kg/knowledge?entity=' + $('#search').val(),
        type: 'GET',
        success: function(response) {
            if (response.message == "error"){
                $('body').append('' +
                    '<div class="fancybox-container fc-container fancybox-is-modal fancybox-is-open" role="dialog" tabindex="-1" id="fancybox-container-3" style="transition-duration: 350ms;">' +
                    '   <div class="fancybox-bg"></div>' +
                    '   <div class="fancybox-inner">' +
                    '       <div class="fancybox-stage">' +
                    '           <div class="fancybox-slide fancybox-slide--html fancybox-slide--current fancybox-slide--complete" style="">' +
                    '               <div class="fc-content fancybox-content" style="">' +
                    '                   <h3>精神升华中～</h3>' +
                    '                   <p>等我学会这个知识点 我再告诉你吧</p>' +
                    '                   <p class="tright">' +
                    '                       <button data-value="1" data-fancybox-close="" class="bookmark-ok">OK</button>' +
                    '                   </p>' +
                    '               </div>' +
                    '           </div>' +
                    '       </div>' +
                    '    </div>' +
                    '</div>');
                return;
            }
            $('svg').remove();
            var links = []
            for(avp in response.data.avp)
                if(response.data.avp[avp][1] != response.data.entity)
                    links.push({'source': response.data.entity, 'target': response.data.avp[avp][1], 'type': 'resolved', 'rela': response.data.avp[avp][0]})
            var nodes = {};
            links.forEach(function(link)
            {
              link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
              link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
            });
            var width = 800, height = 800;
            var force = d3.layout.force()
                .nodes(d3.values(nodes))
                .links(links)
                .size([width, height])
                .linkDistance(180)
                .charge(-1500)
                .on("tick", tick)
                .start();
            var svg = d3.select("#page").append("svg")
                .attr("width", width)
                .attr("height", height);
            var marker=
                svg.append("marker")
                .attr("id", "resolved")
                .attr("markerUnits","userSpaceOnUse")
                .attr("viewBox", "0 -5 10 10")
                .attr("refX",32)
                .attr("refY", -1)
                .attr("markerWidth", 10)
                .attr("markerHeight", 10)
                .attr("orient", "auto")
                .attr("stroke-width",2)
                .append("path")
                .attr("d", "M0,-5L10,0L0,5")
                .attr('fill','#000000');
            var edges_line = svg.selectAll(".edgepath")
                .data(force.links())
                .enter()
                .append("path")
                .attr({
                      'd': function(d) {return 'M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y},
                      'class':'edgepath',
                      'id':function(d,i) {return 'edgepath'+i;}})
                .style("stroke",function(d){
                     var lineColor;
                     lineColor="#B43232";
                     return lineColor;
                 })
                .style("pointer-events", "none")
                .style("stroke-width",0.5)
                .attr("marker-end", "url(#resolved)" );
            var edges_text = svg.append("g").selectAll(".edgelabel")
            .data(force.links())
            .enter()
            .append("text")
            .style("pointer-events", "none")
            .attr({  'class':'edgelabel',
                           'id':function(d,i){return 'edgepath'+i;},
                           'dx':80,
                           'dy':0
                           });
            edges_text.append('textPath')
            .attr('xlink:href',function(d,i) {return '#edgepath'+i})
            .style("pointer-events", "none")
            .text(function(d){return d.rela;});
            var circle = svg.append("g").selectAll("circle")
                .data(force.nodes())
                .enter().append("circle")
                .style("fill",function(node){
                    var color;
                    var link=links[node.index];
                    color="#F9EBF9";
                    return color;
                })
                .style('stroke',function(node){
                    var color;
                    var link=links[node.index];
                    color="#A254A2";
                    return color;
                })
                .attr("r", 28)
                .on("click",function(node)
                {
                    $('#search').val(node.name);
                    $('#sub').click();
                    edges_line.style("stroke-width",function(line){
                        console.log(line);
                        if(line.source.name==node.name || line.target.name==node.name){
                            return 4;
                        }else{
                            return 0.5;
                        }
                    });
                })
                .call(force.drag);
            var text = svg.append("g").selectAll("text")
                .data(force.nodes())
                .enter()
                .append("text")
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
                .style('fill',function(node){
                    var color;
                    var link=links[node.index];
                    color="#A254A2";
                    return color;
                }).attr('x',function(d){
                    var re_en = /[a-zA-Z]+/g;
                    if(d.name.match(re_en)){
                         d3.select(this).append('tspan')
                         .attr('x',0)
                         .attr('y',2)
                         .text(function(){return d.name;});
                    }
                    else if(d.name.length<=4){
                         d3.select(this).append('tspan')
                        .attr('x',0)
                        .attr('y',2)
                        .text(function(){return d.name;});
                    }else{
                        var top=d.name.substring(0,4);
                        var bot=d.name.substring(4,d.name.length);
                        d3.select(this).text(function(){return '';});
                        d3.select(this).append('tspan')
                            .attr('x',0)
                            .attr('y',-7)
                            .text(function(){return top;});
                        d3.select(this).append('tspan')
                            .attr('x',0)
                            .attr('y',10)
                            .text(function(){return bot;});
                    }
                });
            function tick() {
              circle.attr("transform", transform1);
              text.attr("transform", transform2);
              edges_line.attr('d', function(d) {
                  var path='M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y;
                  return path;
              });

              edges_text.attr('transform',function(d,i){
                    if (d.target.x<d.source.x){
                        bbox = this.getBBox();
                        rx = bbox.x+bbox.width/2;
                        ry = bbox.y+bbox.height/2;
                        return 'rotate(180 '+rx+' '+ry+')';
                    }
                    else {
                        return 'rotate(0)';
                    }
               });
            }
            function linkArc(d) {
              return 'M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y
            }
            function transform1(d) {
              return "translate(" + d.x + "," + d.y + ")";
            }
            function transform2(d) {
                  return "translate(" + (d.x) + "," + d.y + ")";
            }
        },
    });
})