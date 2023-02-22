import * as React from 'react';
import {createRoot} from 'react-dom/client';

import { startOrchestra, startSequencer, stopSequencer } from './orchestra';

const App: React.FC = () => {

  return (
    <div className="grid wrapper">
      <div className="cs1 ce12">
        <a
          className="button button-primary"
          href=""
          onClick={startOrchestra}
        >
          Start Orchestra
        </a>
        <div>
          <a
            className="button button-primary"
            href=""
            onClick={startSequencer}
          >
            Play
          </a>
          <a
            className="button button-primary"
            href=""
            onClick={stopSequencer}
          >
            Stop
          </a>
        </div>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
