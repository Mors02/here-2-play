import { BrowserRouter } from 'react-router-dom';

import Homepage from './Home/Homepage';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header>
          <div>
            <Sidebar>
              <Homepage />
            </Sidebar> 
          </div>
        </header>
      </div>
    </BrowserRouter>
  );
}

export default App;
