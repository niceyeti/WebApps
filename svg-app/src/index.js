import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


class XYPoint {
	constructor(x, y, opacity){
		this.X = x;
		this.Y = y;
		this.opacity = opacity;
	}

	getPath(){
		// TODO
		return "";
	}

	getTranslation(){
		return "translate("+Math.floor(this.X)+","+Math.floor(this.Y)+")";
	}
}

/* A functional component
function Square(props) {
  return (
	<button className="square" onClick={props.onClick}>
	  {props.value}
	</button>
  );
}
*/



/*
	Test 1: Build the most'ish inefficient version: update all points every second to new data


*/
class XYChart extends React.Component {

  // Passes down two props from board to Square: value and onClick. Square then accesses these via this.props, above. 
  renderXYPoint(xyPoint, i) {
	var d = xyPoint.getPath();
	var translation = xyPoint.getTranslation();	

    return ( <g transform={translation} key={i}>
				<path d={d} stroke="white" strokeWidth="1" />
				<circle cx="0" cy="0" r="6" stroke="white" style={{opacity: xyPoint.opacity}} strokeWidth="1" fill="yellow" onClick={() => this.handleClick()} />
			 </g> );
  }

	handleClick(){
		alert("clicked");
	}

	buildMarkers(xyPoints) {
		var markers = [];
		for(var i = 0; i < xyPoints.length; i++){
			markers.push( this.renderXYPoint(xyPoints[i], i) );
		}
		return markers;
	}

	render() {
		return (
			<svg width={this.props.width} height={this.props.height}>
				{/* Transform into euclidean coordinates */}
				<g transform={"scale(1,-1) translate(0,-"+this.props.height+")"}>
				{ this.buildMarkers(this.props.xyPoints) }
				</g>
		  </svg>
		);
	}
}



// Does requests, etc.
class XYChartApp extends React.Component {
	constructor(props){
		super(props);

		this.numPoints = 100;
		this.xMax = 500;
		this.yMax = 500;
		this.updateIntervalMS = 3000;
		this.updateFoo = this.historicUpdate;

		// Begin recursive updates
		setTimeout(this.update.bind(this), this.updateIntervalMS);

		this.state = {
			// The XY point models
			xyPoints: Array(this.numPoints).fill(new XYPoint(0,0,0))
		};
	}

	getRandomXYPoints(numPoints){
		var newPoints = []
		// update the points
		for(var i = 0; i < numPoints; i++){
			var x = Math.random() * this.xMax;
			var y = Math.random() * this.yMax;
			var opacity = Math.random();
			var xyPoint = new XYPoint(x, y, opacity);
			newPoints.push(xyPoint);
		}
		return newPoints;
	}

	/*********** the update strategies *********************************/
	// Appends a new xy point, removes the oldest.
	realtimeUpdate(){
		// pop the first item, append a new one, keeping most of the elements the same
		var xyPoints = this.state.xyPoints.slice(1);
		var newPoint = this.getRandomXYPoints(1)[0];
		xyPoints.push(newPoint);

		this.setState({xyPoints: xyPoints});
	}
	historicUpdate(){
		this.setState({xyPoints: this.getRandomXYPoints(this.numPoints)});
	}
	/*******************************************************************/

	update(){
		//this.setState({xyPoints: this.getRandomXYPoints(this.numPoints)});
		this.updateFoo();
		setTimeout(this.update.bind(this), this.updateIntervalMS);
	}

  render() {
    return (
      <div>
		<div style={{"display": "flex"}}>
			<button onClick={() => this.updateFoo = this.realtimeUpdate} style={{"padding":"5px"}}>Realtime</button>
			<button onClick={() => this.updateFoo = this.historicUpdate} style={{"padding":"5px"}}>Historic</button>
		</div>
        <div className="xy-chart">
          <XYChart xyPoints={this.state.xyPoints} width={this.xMax.toString()} height={this.yMax.toString()} />
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <XYChartApp />,
  document.getElementById('root')
);

