import React from 'react';
//import ReactDOM from 'react-dom';
import { useLocalStore, useObserver } from "mobx-react"
import './index.css';
//import App from './App';
//import * as serviceWorker from './serviceWorker';

/* 
TODO/goals:

You are at work. You are asked to build a react/mobx prototype using SEL standards.
- reorganize stores into a nicer structure, modeling the model+domain separation suggestion.
- set up a test environment
- incrementally build a chart app
*/



/*

Context is designed to share data that can be considered “global” for a tree of React components
Any component wrapped by a Context, no matter how deep it is, can read from it.

class ThemedButton extends React.Component {
  static contextType = ThemeContext;
  render() {
    return <Button theme={this.context} />;  }
}
*/
const StoreContext = React.createContext();

const StoreProvider = ({ children }) => {
	/*
	The main store for this example.
	Stores may have:
		* data
		* functions
	Note that functions can mutate state data; hence state is mutable and granular, unlike redux/react.

	*/
	const store = useLocalStore(() => ({
		bugs: ["centipede"],
		addBug: (bug) => {
			store.bugs.push(bug);
		},
		// mobx turns this getter into a computed property, no fancy decorators
		get bugCount() { return store.bugs.length; }
	}));

	return (
	  <StoreContext.Provider value={ store }>{ children }</StoreContext.Provider>
	);
};

// Finally, building the functional component which accesses the store
const BugList = () => {
	// asking React for the closest store
	const store = React.useContext(StoreContext);

	/*
	useObserver returns some html. By wrapping it this way, BugList observes changes to the store and re-renders when they happen.
	*/
	return useObserver(() => (
		<ul>
			{ store.bugs.map(bug => 
				( <li key={ bug }>{ bug }</li> 
			))}
		</ul>
	));
};

const BugsHeader = () => {
	const store = React.useContext(StoreContext);
	
	return useObserver(() => ( <h1>{ store.bugCount } Bugs!</h1> ));
}


/*
The important thing to note about this form is that it mutates the state. No decoration or funky
syntax, it just gets the store with useContext and uses the functions on the state itself to
mutate state. It doesn't observe anything state-based, so does not need useObserver, etc.
*/
const BugsForm = () => {
	const store = React.useContext(StoreContext);
	// React based state, not mobx.
	// React.setState is a common classless pattern for creating and setting small react state: `const [bar, setBar] = React.setState("");`
	const [bug, setBug] = React.useState("");

	return (
		<form onSubmit={e => { 
			e.preventDefault();
			store.addBug(bug);
			setBug("");
		}}>
			<input 
				type="text"
				value={ bug }
				onChange={e => { 
					setBug(e.target.value); 
				}}
			/>
			<button type="submit">Add</button>
		</form>
	);
};



/*
By wrapping the main/root component like this, the provider gives access to the store all
the way down the component tree.
*/
export default function App() {
	return (
		<StoreProvider>
			<main>
				<BugsHeader />
				<BugsForm />
				<BugList />
			</main>
		</StoreProvider>
	);
};


/* old create-react-app boilerplate
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
