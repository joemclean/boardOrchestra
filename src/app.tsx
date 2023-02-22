import * as React from 'react';
import {createRoot} from 'react-dom/client';

import * as Tone from 'tone';

async function startOrchestra() {
  await Tone.start();
	console.log('audio is ready');
}

const App: React.FC = () => {

  return (
    <div className="grid wrapper">
      <div className="cs1 ce12">
        <p>Make music together.</p>
        <p>
          Create widgets on the board to try it out.
        </p>
      </div>
      <div className="cs1 ce12">
        <a
          className="button button-primary"
          href=""
          onClick={startOrchestra}
        >
          Start Orchestra
        </a>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
