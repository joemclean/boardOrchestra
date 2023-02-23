console.log("Top of file");

import * as React from 'react';
import {createRoot} from 'react-dom/client';

import { Orchestra } from './orchestra';
import CountdownTimer from "./timer";

const orchestra = new Orchestra();

const App: React.FC = () => {

  return (
    <div className="grid wrapper">
      <CountdownTimer onStart={() => {orchestra.startSequencer()}} onReset={() => {orchestra.stopSequencer()}}/>
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
        orchestra.updateSelectionScheduler.scheduleNoteToPlay("C3");
        orchestra.updateSelectionScheduler.scheduleNoteToPlay("E3");
      }
      orchestra.updateSelectionScheduler.scheduleNoteToPlay("G3");
    } else {
      orchestra.widgetSelected = false;
      orchestra.updateSelectionScheduler.scheduleNoteToPlay("G3");
      orchestra.updateSelectionScheduler.scheduleNoteToPlay("E3");
      orchestra.updateSelectionScheduler.scheduleNoteToPlay("C3");
    }
  });

  miro.board.ui.on('items:create', async (event)=> {
    const viewport = await miro.board.viewport.get();
    if (event.items.length > 0 && event.items[0].type == "sticky_note") {
      const panRatio = orchestra.calculateStereoLocation(viewport, event.items[0]);
      orchestra.createWidgetScheduler.synthVoice.setPan(panRatio);
    }
    orchestra.createWidgetScheduler.scheduleNoteToPlay("G2");
  });

  miro.board.ui.on('items:delete', async (event)=> {
    const viewport = await miro.board.viewport.get();
    if (event.items.length > 0 && event.items[0].type == "sticky_note") {
      const panRatio = orchestra.calculateStereoLocation(viewport, event.items[0]);
      orchestra.deleteWidgetScheduler.synthVoice.setPan(panRatio);
    }
    orchestra.deleteWidgetScheduler.scheduleNoteToPlay("C2");
  });

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
