import * as React from 'react';
import {createRoot} from 'react-dom/client';

import { startOrchestra, startSequencer, stopSequencer } from './orchestra';

function startOrchestraInstance() {
  startOrchestra();
}

function startOrchestraSequencer() {
  startSequencer();
}

function stopOrchestraSequencer(){
  stopSequencer();
}

class App extends React.Component {
  render(){
    return (
      <div className="grid wrapper">
        <div className="cs1 ce12">
          <a
            className="button button-primary"
            href=""
            onClick={startOrchestraInstance}
          >
            Start Orchestra
          </a>
          <div>
            <a
              className="button button-primary"
              href=""
              onClick={startOrchestraSequencer}
            >
              Play
            </a>
            <a
              className="button button-primary"
              href=""
              onClick={stopOrchestraSequencer}
            >
              Stop
            </a>
          </div>
        </div>
      </div>
    );
  };
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
