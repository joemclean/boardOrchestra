console.log("Top of file");

import * as React from 'react';
import {createRoot} from 'react-dom/client';

import { Orchestra } from './orchestra';

const orchestra = new Orchestra();

function startOrchestraInstance(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
  event.preventDefault();
  orchestra.startOrchestra();
}

function startOrchestraSequencer(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
  event.preventDefault();
  orchestra.startSequencer();
}

function stopOrchestraSequencer(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>){
  event.preventDefault();
  orchestra.stopSequencer();
}

const App: React.FC = () => {

  return (
    <div className="grid wrapper">
      <div className="cs1 ce12">
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
  );
};

miro.board.ui.on('experimental:items:update', async (event)=> {
  const viewport = await miro.board.viewport.get();
  if (event.items.length > 0 && event.items[0].type == "sticky_note") {
    const panRatio = orchestra.calculateStereoLocation(viewport, event.items[0]);
    orchestra.updateWidgetScheduler.synthVoice.setPan(panRatio);
  }
  if (Math.random() > 0.5) {
    orchestra.updateWidgetScheduler.scheduleNoteToPlay("E5");
    orchestra.updateWidgetScheduler.scheduleNoteToPlay("A5");
  } else {
    orchestra.updateWidgetScheduler.scheduleNoteToPlay("A5");
    orchestra.updateWidgetScheduler.scheduleNoteToPlay("G5");
  }
});

miro.board.ui.on('selection:update', async (event)=> {
  const viewport = await miro.board.viewport.get();
  if (event.items.length > 0 && event.items[0].type == "sticky_note") {
    const panRatio = orchestra.calculateStereoLocation(viewport, event.items[0]);
    orchestra.updateSelectionScheduler.synthVoice.setPan(panRatio);
  }
  if (event.items.length > 0) {
    orchestra.widgetSelected = true;
    // more notes for multiselect
    if (event.items.length > 1) {
      orchestra.updateSelectionScheduler.scheduleNoteToPlay("C4");
      orchestra.updateSelectionScheduler.scheduleNoteToPlay("E4");
    }
    orchestra.updateSelectionScheduler.scheduleNoteToPlay("G4");
  } else {
    orchestra.widgetSelected = false;
    orchestra.updateSelectionScheduler.scheduleNoteToPlay("G4");
    orchestra.updateSelectionScheduler.scheduleNoteToPlay("E4");
    orchestra.updateSelectionScheduler.scheduleNoteToPlay("C4");
  }
});

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
