import * as React from 'react';
import {createRoot} from 'react-dom/client';

import * as Tone from 'tone';

import { startSequencer, stopSequencer } from './orchestra';

async function startOrchestra() {
  await Tone.start();
  Tone.Transport.start();
	console.log('audio is ready');
}

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
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
