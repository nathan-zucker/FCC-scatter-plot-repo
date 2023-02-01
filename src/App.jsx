import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import * as d3 from 'd3'

//https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json

function App() {
  const [count, setCount] = useState(0)

  useEffect(()=>{

    const req = new XMLHttpRequest();
    req.open("GET", "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json", true);
    req.send();
    req.onload = () => {
      const json = JSON.parse(req.responseText);
      renderChart(json)
    }
  },[])

  function mouseoverHandler(e) {

    let data = e.srcElement.__data__


    d3.select("#tooltip")
    .html(""+data.Name+" ("+data.Nationality+")"+
    "<br/>YEAR: "+d3.timeFormat("%x")(data.Year).split('/')[2]+
    " TIME: "+data.Time.toString().match(/\d\d:\d\d:\d\d/).toString().split(':').slice(1).join(':')+
    "<br/><br/>DOPING: "+data.Doping+"")
    .attr("data-year", data.Year)
    .style("z-index", 1)
    .transition()
    .style("opacity", 0.85)
    

    console.log("mouseover", data)
  }
  function mousemoveHandler(e) {
    console.log("move",e)
    d3.select("#tooltip")
    .style("top", ( e.clientY - 50 )+"px")
    .style("left", ( e.clientX + 30 )+"px")
  }
  function mouseoutHandler() {
    d3.select("#tooltip")
    .transition()
    .style("opacity", 0)
    .style("z-index", -1)
  }

  function renderChart(json){

    const times = json.map(e=>new Date("2000-01-01T00:"+e.Time))
    const years = json.map(e=>new Date(e.Year+"-01-01"))
    const doping = json.map(e=>{
      if(e.Doping === '') {
        return e.Name+" has a clean record"
      } else { return e.Doping } 
    })
   
    const w = 700
    const h = 480
    const padding = 80

    let data = []
    for (let i=0; i<json.length; i++) {
      data.push(Object.assign({}, json[i], {
        Year: years[i],
        Time: times[i],
        Doping: doping[i]
      }))
    }

    console.log(data)

    const xScale = d3.scaleTime()
      .domain([new Date("1993-06-01"), new Date("2016-01-01")])
      .range([padding, w - padding])

    const yScale = d3.scaleTime()
      .domain([new Date("2000-01-01T00:36:30"), new Date("2000-01-01T00:40:00")])
      .range([padding, h-padding])

    

    d3.select(".App").selectAll("svg").remove()

    const svg = d3.select("#chart").append("svg")
    .attr("width", w)
    .attr("height", h)

    const xAxis = d3.axisBottom(xScale);
    svg.append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(0,"+(h-padding)+")")
    .call(xAxis)
    

    const yAxis = d3.axisLeft(yScale)
    .tickFormat(d3.timeFormat("%M:%S"))
    svg.append("g")
    .attr("id", "y-axis")
    .attr("transform", "translate("+ padding +",0)")
    .call(yAxis)

// Y-AXIS LABEL
    svg.append("text")
    .attr("fill", "whitesmoke")
    .attr("class", "y-label")
    .attr("text-anchor", "middle")
    .attr("height", "1rem")
    .attr("x", -( h / 2 ) +"px")
    .attr("y", "30px")
    .attr("transform", "rotate(-90)")    
    .text("finishing time (mm:ss)")

// Z-AXIS LABEL
    svg.append("text")
    .attr("fill", "whitesmoke")
    .attr("class", "y-label")
    .attr("text-anchor", "middle")
    .attr("height", "1rem")
    .attr("x", (w / 2)+"px")
    .attr("y", ( h - 30 )+"px")
    .text("year of Alpe d'Huez race")

    svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .on("mouseover", mouseoverHandler)
    .on("mousemove", mousemoveHandler)
    .on("mouseout", mouseoutHandler)
    .attr("class", "dot")
    .attr("data-xvalue", d=>d.Year)
    .attr("data-yvalue", d=>d.Time)
    .attr("cx", d=>xScale(d.Year) )
    .attr("cy", d=>yScale(d.Time) )
    .attr("r", 6)
    .style("fill", d => {
      if (d.Doping.toString().match(/(clean record)/)){
        return "green"
      } else {
        return "orangered"
      }
    })

    
  }

  return (
    <div className="App">
  
      <div id="legend">
        <p><span id="key" className='green'></span>no PED use<br/>
        <span id="key" className='red'></span>DOPING
        </p>
      </div>
  
      <div id="tooltip"></div>
      <h1 id="title"></h1>
      <div id="chart"></div>
    </div>
  )
}

export default App
