console.log("Top of file");

import { useState, useEffect } from 'react';
import {createRoot} from 'react-dom/client';

import { Orchestra } from './orchestra';
import CountdownTimer from "./timer";

const orchestra = new Orchestra();

window.addEventListener('storage', function(e) {
  console.log('Local storage changed:', e.key, e.oldValue, e.newValue);
});

const App: React.FC = () => {

  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleStorageChange = (e: any) => {
    console.log('Local storage changed:', e.key, e.oldValue, e.newValue);
    if (e.newValue === "moveWidget") {
      moveWidget();
    }
    if (e.newValue === "deleteWidget") {
      deleteWidget();
    }
    if (e.newValue === "createWidget") {
      createWidget();
    }
    
    // Update state or do something else in response to the change
  };


  return (
    <div className="grid wrapper">
      <CountdownTimer onStart={() => {orchestra.startSequencer()}} onReset={() => {orchestra.stopSequencer()}}/>
    </div>
  );
};

  function moveWidget() {
    // const viewport = await miro.board.viewport.get();
    // if (event.items.length > 0 && event.items[0].type == "sticky_note") {
    //   const panRatio = orchestra.calculateStereoLocation(viewport, event.items[0]);
    //   orchestra.updateWidgetScheduler.synthVoice.setPan(panRatio);
    // }
    if (Math.random() > 0.5) {
      orchestra.updateWidgetScheduler.scheduleNoteToPlay("E5");
      orchestra.updateWidgetScheduler.scheduleNoteToPlay("A5");
    } else {
      orchestra.updateWidgetScheduler.scheduleNoteToPlay("A5");
      orchestra.updateWidgetScheduler.scheduleNoteToPlay("G5");
    }
  };

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

function createWidget() {
  // const viewport = await miro.board.viewport.get();
  // // if (event.items.length > 0 && event.items[0].type == "sticky_note") {
  // //   const panRatio = orchestra.calculateStereoLocation(viewport, event.items[0]);
  // //   orchestra.createWidgetScheduler.synthVoice.setPan(panRatio);
  // // }
  orchestra.createWidgetScheduler.scheduleNoteToPlay("G2");
};

 function deleteWidget() {
  // const viewport = await miro.board.viewport.get();
  // if (event.items.length > 0 && event.items[0].type == "sticky_note") {
  //   const panRatio = orchestra.calculateStereoLocation(viewport, event.items[0]);
  //   orchestra.deleteWidgetScheduler.synthVoice.setPan(panRatio);
  // }
  orchestra.deleteWidgetScheduler.scheduleNoteToPlay("C2");
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
