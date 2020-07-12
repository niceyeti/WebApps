import React from 'react';
import ReactDOM from 'react-dom';

import mobx, { observable, action, computed, decorate } from 'mobx';
//import DevTools from 'mobx-react-devtools';
import { observer, Provider, inject } from 'mobx-react';


import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';


/****************** Models *********************************************/
class XYPoint {
	constructor(x, y, opacity, uniqId){
		this.X = x;
		this.Y = y;
		this.opacity = opacity;
		this.uniqId = uniqId;
	}

	getPath(){
		// TODO
		return "";
	}

	getTranslation(){
		return "translate("+Math.floor(this.X)+","+Math.floor(this.Y)+")";
	}
}

/**********************************************************************/





/****************** Stores *********************************************/

class XYDataStore{
	constructor(){
		this.xyPoints = [];
		this.numPoints = 2000;
		// TODO: factor these out, added them hastily to get something working
		this.xMax = 500;
		this.yMax = 500;
	}

	// Hmm...consider: these functions could actually be passed into the state, where the statewould only be the update function/algorithm.
	// Appends a new xy point, removes the oldest.
	realtimeUpdate(){
		// pop the first item, append a new one, keeping most of the elements the same
		console.log("realtime update");
		this.xyPoints.shift();
		var newPoint = this.getRandomXYPoints(1)[0];
		this.xyPoints.push(newPoint);
	}

	// reset entire point set
	historicUpdate(){
		console.log("historic update");
		this.xyPoints.replace( this.getRandomXYPoints(this.numPoints) );
	}

	getRandomXYPoints(numPoints){
		var newPoints = [];
		// update the points
		for(var i = 0; i < numPoints; i++){
			var x = Math.random() * this.xMax;
			var y = Math.random() * this.yMax;
			var opacity = Math.random();
			var id = opacity;
			var xyPoint = new XYPoint(x, y, opacity, id);
			newPoints.push(xyPoint);
		}
		console.log("Got "+newPoints.length+" points");

		return newPoints;
	}
}
// Manual method for making store attributes/methods observable and reactive
decorate(XYDataStore, {
	xyPoints: observable,
	realtimeUpdate: action.bound,
	historicUpdate: action.bound
});

/***********************************************************************/




/*

*/
const XYChart = observer(class XYChart extends React.Component {
  // Passes down two props from board to Square: value and onClick. Square then accesses these via this.props, above. 
  renderXYPoint(xyPoint){
	var d = xyPoint.getPath();
	var translation = xyPoint.getTranslation();
    return ( <g transform={translation} key={xyPoint.uniqId}>
				<path d={d} stroke="white" strokeWidth="1" />
				<circle cx="0" cy="0" r="6" stroke="white" style={{opacity: xyPoint.opacity}} strokeWidth="1" fill="yellow" onClick={() => this.handleClick()} />
			 </g> );
  }

	handleClick(){
		alert("clicked");
	}

	buildMarkers(xyPoints){
		var markers = [];
		for(var i = 0; i < xyPoints.length; i++){
			markers.push( this.renderXYPoint(xyPoints[i], i) );
		}
		return markers;
	}

	render(){
		return (
			<svg width={this.props.width} height={this.props.height}>
				{/* Transforms coordinate system into euclidean coordinates */}
				<g transform={"scale(1,-1) translate(0,-"+this.props.height+")"}>
				{ this.buildMarkers(this.props.xyPoints) }
				</g>
		  </svg>
		);
	}
});




const XYChartApp = inject("rootStore")(observer(class XYChartApp extends React.Component {
	constructor(props){
		super(props);
		console.log(JSON.stringify(props));
		this.pointStore = props.rootStore;
		this.updateFoo = props.rootStore.historicUpdate;
		this.numPoints = 1000;
		this.xMax = 500;
		this.yMax = 500;
		this.updateIntervalMS = 3000;
		this.updateTimer = 0;
	}

	componentDidMount(){
		// Begin recursive updates
		this.updateTimer = setTimeout(this.update.bind(this), this.updateIntervalMS);		
	}

	componentWillUnmount(){
		clearTimeout(this.updateTimer);
	}

	update(){
		this.updateFoo();
		this.updateTimer = setTimeout(this.update.bind(this), this.updateIntervalMS);
	}

  render(){
    return (
      <div>
		<div style={{"display": "flex"}}>
			<button onClick={() => this.updateFoo = this.pointStore.realtimeUpdate} style={{"padding":"5px"}}>Realtime</button>
			<button onClick={() => this.updateFoo = this.pointStore.historicUpdate} style={{"padding":"5px"}}>Historic</button>
		</div>
        <div className="xy-chart">
          <XYChart xyPoints={this.pointStore.xyPoints} width={this.xMax.toString()} height={this.yMax.toString()} />
        </div>
      </div>
    );
  }
}));


// ========================================

const rootStore = new XYDataStore();

ReactDOM.render(
  <React.StrictMode>
    <Provider rootStore={rootStore}>
      <XYChartApp />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);


/*
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
*/
