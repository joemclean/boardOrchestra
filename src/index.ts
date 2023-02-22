import { BoardViewport, Item, PositionMixin, Rect, StickyNote, WidgetMixin } from '@mirohq/websdk-types';
import * as Tone from 'tone';
import { GainToAudio } from 'tone';

const synth1 = new Tone.Synth().toDestination();
const synth2 = new Tone.Synth().toDestination();
const synth3 = new Tone.Synth().toDestination();
const synth4 = new Tone.Synth().toDestination();

const drumGain = new Tone.Gain().toDestination();

class Voice {
  private synth: Tone.Synth;
  private panner: Tone.Panner;
  private gain: Tone.Gain;

  constructor(synth: Tone.Synth) {
    this.gain = new Tone.Gain().toDestination();
    this.panner = new Tone.Panner().connect(this.gain);
    this.synth = synth.connect(this.panner);
  }

  setPan(panPosition: number) {
    this.panner.pan.rampTo(panPosition, 0.001);
  }

  play(note: string, duration: number | string, time: number) {
    this.synth.triggerAttackRelease(note, duration, time);
  };
}


class Scheduler {
  private noteSchedule: Array<string> = [];
  public synthVoice: Voice;
  note: string;

  constructor(synthVoice: Voice, note: string) {
    this.synthVoice = synthVoice;
    this.note = note;
  }

  hasScheduledNotes(): boolean {
    return (this.noteSchedule.length > 0);
  }

  scheduleNoteToPlay(){
    this.noteSchedule.push(this.note);
    console.log("schedule");
    console.log(this.noteSchedule);
  }

  playScheduledNote(duration: number | string, time: number) {
    console.log("Reaching function");
    const note = this.noteSchedule[0];
    console.log("Reaching function II");
    this.synthVoice.play(note, duration, time);
    this.noteSchedule.shift();
    console.log(this.noteSchedule);
  }
}

const createWidgetVoice = new Voice(synth1);
const deleteWidgetVoice = new Voice(synth2);
const updateSelectionVoice = new Voice(synth3);
const updateWidgetVoice = new Voice(synth4);

const createWidgetScheduler = new Scheduler(createWidgetVoice, "C3");
const deleteWidgetScheduler = new Scheduler(deleteWidgetVoice, "C4");
const updateSelectionScheduler = new Scheduler(updateSelectionVoice, "G3");
const updateWidgetScheduler = new Scheduler(updateWidgetVoice, "E3");

// create a new Tone.js MembraneSynth object to use as the kick drum
const kick = new Tone.MembraneSynth().connect(drumGain);

const hihat = new Tone.MetalSynth({
  envelope: {
    attack: 0.001,
    decay: 0.1,
    release: 0.01,
  },
  harmonicity: 5.1,
  modulationIndex: 32,
  resonance: 4000,
  octaves: 1.5,
}).connect(drumGain);

const hihat2 = new Tone.MetalSynth({
  envelope: {
    attack: 0.001,
    decay: 0.01,
    release: 0.01,
  },
  harmonicity: 5.1,
  modulationIndex: 32,
  resonance: 4000,
  octaves: 1.5,
}).connect(drumGain);

drumGain.gain.value = 0.0;


// create a new Tone.js Transport object
const transport = Tone.Transport;

// set the transport time signature to 4/4
transport.timeSignature = [4, 4];

let iterator = 0;

// create a new Tone.js Sequence object
const sequence = new Tone.Sequence((time, note) => {
  
  // check if this is the 4th beat of the measure
  if (iterator % 8 === 0) {
    // play the kick drum sound
    kick.triggerAttackRelease("C1", "8n", time);
  } else if ((iterator+4) % 8 === 0) {
    hihat.triggerAttackRelease("C1", "8n", time);
  } else {
    // this function will be called on every other sixteenth note
    hihat2.triggerAttackRelease("C1", "8n", time);
  }

  if (iterator % 8 === 0) {
    if (createWidgetScheduler.hasScheduledNotes()) {
      createWidgetScheduler.playScheduledNote("8n", time);
    };

    if (deleteWidgetScheduler.hasScheduledNotes()) {
      deleteWidgetScheduler.playScheduledNote("8n", time);
    };

    if (updateWidgetScheduler.hasScheduledNotes()) {
      updateWidgetScheduler.playScheduledNote("8n", time);
    };
  
    if (updateSelectionScheduler.hasScheduledNotes()) {
      updateSelectionScheduler.playScheduledNote("8n", time);
    };
  }

  iterator++;
}, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "16n");

// start the transport and the sequence
transport.start();
sequence.start();


function calculateStereoLocation(viewport: Rect, widget: Rect): number {
  console.log("x: " + widget.x);
  console.log("y: " + widget.y);
  const viewportOrigin = viewport.x + (viewport.width / 2);
  const widgetOrigin = widget.x + (widget.width / 2);
  const xOffset = viewportOrigin - widgetOrigin;
  var panRatio =-1 * (xOffset * 2) / viewport.width;
  panRatio = Math.min(Math.max(panRatio, -1), 1);
  console.log(panRatio);
  return panRatio;
}

async function init() {
  miro.board.ui.on('icon:click', async () => {
    await miro.board.ui.openPanel({url: 'app.html'});
  });

  miro.board.ui.on('experimental:items:update', async (event)=> {
    console.log("Item update");
    console.log(event);
    const viewport = await miro.board.viewport.get();
    if (event.items.length > 0 && event.items[0].type == "sticky_note") {
      const panRatio = calculateStereoLocation(viewport, event.items[0]);
      updateWidgetScheduler.synthVoice.setPan(panRatio);
      updateWidgetScheduler.scheduleNoteToPlay();
    }
  });

  miro.board.ui.on('selection:update', async (event)=> {
    console.log("Selection update");
    console.log(event);
    const viewport = await miro.board.viewport.get();
    if (event.items.length > 0 && event.items[0].type == "sticky_note") {
      const panRatio = calculateStereoLocation(viewport, event.items[0]);
      updateSelectionScheduler.synthVoice.setPan(panRatio);
      updateSelectionScheduler.scheduleNoteToPlay();
    }
  });

  miro.board.ui.on('items:create', async (event)=> {
    console.log("Item created");
    console.log(event);
    const viewport = await miro.board.viewport.get();
    if (event.items.length > 0 && event.items[0].type == "sticky_note") {
      const panRatio = calculateStereoLocation(viewport, event.items[0]);
      createWidgetScheduler.synthVoice.setPan(panRatio);
      createWidgetScheduler.scheduleNoteToPlay();
    }
  });

  miro.board.ui.on('items:delete', async (event)=> {
    console.log("Item deleted");
    console.log(event);
    const viewport = await miro.board.viewport.get();
    if (event.items.length > 0 && event.items[0].type == "sticky_note") {
      const panRatio = calculateStereoLocation(viewport, event.items[0]);
      deleteWidgetScheduler.synthVoice.setPan(panRatio);
      deleteWidgetScheduler.scheduleNoteToPlay();
    }
  });
}

init();
