import logo from './logo.svg';
import './App.css';
import Company from './components/Company';
import CTY from './components/CTY';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Company/>
        {/* <CTY/> */}
      </header>
    </div>
  );
}

export default App;
