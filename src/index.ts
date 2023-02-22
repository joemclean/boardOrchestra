import { BoardViewport, Item, PositionMixin, Rect, StickyNote, WidgetMixin } from '@mirohq/websdk-types';
import * as Tone from 'tone';
import { GainToAudio } from 'tone';


let widgetSelected: boolean = false;

const synth1 = new Tone.Synth(
  {
    oscillator:{
      type: 'triangle'
    },
    envelope: {
      attack: 1,
      decay: 1,
      sustain: 0.5,
      release: 4
    }
  }
);
const synth2 = new Tone.Synth({
  oscillator:{
    type: 'square'
  },
  envelope: {
    attack: 0.2,
    decay: 1,
    sustain: 0.5,
    release: 4
  },
});
const synth3 = new Tone.Synth();
const synth4 = new Tone.Synth();

const synth5 = new Tone.Synth(
  {
    oscillator:{
      type: 'square'
    },
    envelope: {
      attack: 0,
      decay: 0.1,
      sustain: 0.5,
      release: 0.2
    }
  }
);

const synthReverbBus = new Tone.Reverb();
synthReverbBus.decay = 5;

const hatsGain = new Tone.Gain();
const hatsVelocity = new Tone.Gain();
hatsGain.gain.value = 0.3;

const kickGain = new Tone.Gain();

const drumFilter = new Tone.Filter();
drumFilter.set( {
  frequency: 8000,
  type: "lowpass"
});

const drumReverbBus = new Tone.Reverb();
drumReverbBus.decay = 0.3;

const drumGain = new Tone.Gain();
drumGain.gain.value = 0.4;

const mainBus = new Tone.Gain().toDestination();

const synthBus = new Tone.Gain();

kickGain.connect(drumGain);
hatsGain.connect(hatsVelocity);
hatsVelocity.connect(drumFilter);
drumFilter.connect(drumReverbBus);
drumReverbBus.connect(drumGain);
drumGain.connect(mainBus);

synthBus.connect(synthReverbBus);
synthReverbBus.connect(mainBus);

class Voice {
  private synth: Tone.Synth;
  private panner: Tone.Panner;
  public gain: Tone.Gain;
  public filter: Tone.Filter;

  constructor(synth: Tone.Synth) {
    this.synth = synth;
    this.gain = new Tone.Gain();
    this.panner = new Tone.Panner();
    this.filter = new Tone.Filter();
    this.synth.connect(this.gain.connect(this.panner.connect(this.filter.connect(synthBus))));
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

  constructor(synthVoice: Voice) {
    this.synthVoice = synthVoice;
  }

  hasScheduledNotes(): boolean {
    return (this.noteSchedule.length > 0);
  }

  scheduleNoteToPlay(note: string){
    this.noteSchedule.push(note);
  }

  playScheduledNote(duration: number | string, time: number) {
    const note = this.noteSchedule[0];
    this.synthVoice.play(note, duration, time);
    this.noteSchedule.shift();
  }
}

const createWidgetVoice = new Voice(synth1);
const deleteWidgetVoice = new Voice(synth2);
const updateSelectionVoice = new Voice(synth3);
const updateWidgetVoice = new Voice(synth4);
const bassline = new Voice(synth5);

const createWidgetScheduler = new Scheduler(createWidgetVoice);
const deleteWidgetScheduler = new Scheduler(deleteWidgetVoice);
const updateSelectionScheduler = new Scheduler(updateSelectionVoice);
const updateWidgetScheduler = new Scheduler(updateWidgetVoice);
const basslineScheduler = new Scheduler(bassline);

createWidgetVoice.filter.set({
  frequency: 5000,
  type: "lowpass"
});

bassline.filter.set({
  frequency: 300,
  type: "lowpass"
});

bassline.gain.gain.value = 0.3;

// create a new Tone.js MembraneSynth object to use as the kick drum
const kick = new Tone.MembraneSynth().connect(kickGain);

const hihat = new Tone.MetalSynth({
  envelope: {
    attack: 0.001,
    decay: 0.05,
    release: 0.01,
  },
  harmonicity: 5.1,
  modulationIndex: 32,
  resonance: 4000,
  octaves: 3,
}).connect(hatsGain);

const hihat2 = new Tone.MetalSynth({
  envelope: {
    attack: 0.001,
    decay: 0.005,
    release: 0.01,
  },
  harmonicity: 5.1,
  modulationIndex: 32,
  resonance: 4000,
  octaves: 1.5,
}).connect(hatsGain);


// create a new Tone.js Transport object
const transport = Tone.Transport;

// set the transport time signature to 4/4
transport.timeSignature = [4, 4];

let iterator = 0;

// create a new Tone.js Sequence object
const sequence = new Tone.Sequence((time, note) => {
  
  // Autogen drums
  if (Math.random() > 0.1 && widgetSelected) {
    hihat2.triggerAttackRelease("C1", "8n", time);
  }
  hatsGain.gain.value = (Math.random() + 1 / 2);
  if (iterator % 8 === 0) {
    kick.triggerAttackRelease("C1", "8n", time);
    hatsGain.gain.value = (Math.random() + 1 / 2);
  } else if ((iterator+4) % 8 === 0) {
    hihat.triggerAttackRelease("C1", "8n", time);
  } else {
  }


  if (iterator % 1 === 0) {
    if (updateSelectionScheduler.hasScheduledNotes()) {
      updateSelectionScheduler.playScheduledNote("8n", time);
    };
  }

  if (iterator % 8 === 0) {
    if (createWidgetScheduler.hasScheduledNotes()) {
      createWidgetScheduler.playScheduledNote("2n", time);
    };

    if (deleteWidgetScheduler.hasScheduledNotes()) {
      deleteWidgetScheduler.playScheduledNote("8n", time);
    };
  }

  if ((iterator + 2) % 4 === 0) {
    if (updateWidgetScheduler.hasScheduledNotes()) {
      updateWidgetScheduler.playScheduledNote("8n", time);
    };
  }

  if (iterator % 1 === 0) {
  basslineScheduler.scheduleNoteToPlay("C2");
  if (basslineScheduler.hasScheduledNotes()) {
    basslineScheduler.playScheduledNote("64n", time);
    bassline.gain.gain.value = ((4 - iterator % 4) / 4) * 0.4;
  };
  }

  iterator++;
}, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "16n");

// start the transport and the sequence
// export function startOrchestra() {
//   transport.start();
//   sequence.start();
// }
transport.start();
sequence.start();

function calculateStereoLocation(viewport: Rect, widget: Rect): number {
  const viewportOrigin = viewport.x + (viewport.width / 2);
  const widgetOrigin = widget.x + (widget.width / 2);
  const xOffset = viewportOrigin - widgetOrigin;
  var panRatio =-1 * (xOffset * 2) / viewport.width;
  panRatio = Math.min(Math.max(panRatio, -1), 1);
  return panRatio;
}

async function init() {
  miro.board.ui.on('icon:click', async () => {
    await miro.board.ui.openPanel({url: 'app.html'});
  });

  miro.board.ui.on('experimental:items:update', async (event)=> {
    const viewport = await miro.board.viewport.get();
    if (event.items.length > 0 && event.items[0].type == "sticky_note") {
      const panRatio = calculateStereoLocation(viewport, event.items[0]);
      updateWidgetScheduler.synthVoice.setPan(panRatio);
    }
    if (Math.random() > 0.5) {
      updateWidgetScheduler.scheduleNoteToPlay("E5");
    updateWidgetScheduler.scheduleNoteToPlay("A5");
    } else {
      updateWidgetScheduler.scheduleNoteToPlay("A5");
    updateWidgetScheduler.scheduleNoteToPlay("G5");
    }
  });

  miro.board.ui.on('selection:update', async (event)=> {
    const viewport = await miro.board.viewport.get();
    if (event.items.length > 0 && event.items[0].type == "sticky_note") {
      const panRatio = calculateStereoLocation(viewport, event.items[0]);
      updateSelectionScheduler.synthVoice.setPan(panRatio);
    }
    if (event.items.length > 0) {
      widgetSelected = true;
      // more notes for multiselect
      if (event.items.length > 1) {
        updateSelectionScheduler.scheduleNoteToPlay("C3");
        updateSelectionScheduler.scheduleNoteToPlay("E3");
      }
      updateSelectionScheduler.scheduleNoteToPlay("G3");
    } else {
      widgetSelected = false;
      updateSelectionScheduler.scheduleNoteToPlay("G3");
      updateSelectionScheduler.scheduleNoteToPlay("E3");
      updateSelectionScheduler.scheduleNoteToPlay("C3");
    }
  });

  miro.board.ui.on('items:create', async (event)=> {
    const viewport = await miro.board.viewport.get();
    if (event.items.length > 0 && event.items[0].type == "sticky_note") {
      const panRatio = calculateStereoLocation(viewport, event.items[0]);
      createWidgetScheduler.synthVoice.setPan(panRatio);
    }
    createWidgetScheduler.scheduleNoteToPlay("G2");
  });

  miro.board.ui.on('items:delete', async (event)=> {
    const viewport = await miro.board.viewport.get();
    if (event.items.length > 0 && event.items[0].type == "sticky_note") {
      const panRatio = calculateStereoLocation(viewport, event.items[0]);
      deleteWidgetScheduler.synthVoice.setPan(panRatio);
    }
    deleteWidgetScheduler.scheduleNoteToPlay("C2");
  });
}

init();
