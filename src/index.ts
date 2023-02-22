import { BoardViewport, Item, PositionMixin, Rect, StickyNote, WidgetMixin } from '@mirohq/websdk-types';
import * as Tone from 'tone';
import { GainToAudio } from 'tone';

const panner1 = new Tone.Panner().toDestination();
const panner2 = new Tone.Panner().toDestination();
const panner3 = new Tone.Panner().toDestination();
const panner4 = new Tone.Panner().toDestination();

const synth1 = new Tone.Synth().toDestination();
const synth2 = new Tone.Synth().toDestination();
const synth3 = new Tone.Synth().toDestination();
const synth4 = new Tone.Synth().toDestination();

const drumGain = new Tone.Gain().toDestination();

let note1scheduler = 0;
let note2scheduler = 0;
let note3scheduler = 0;
let note4scheduler = 0;

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

drumGain.gain.value = 0.1;

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
      setPan(panner1, panRatio);
      note1scheduler = 1;
    }
  });

  miro.board.ui.on('selection:update', async (event)=> {
    console.log("Selection update");
    console.log(event);
    const viewport = await miro.board.viewport.get();
    if (event.items.length > 0 && event.items[0].type == "sticky_note") {
      const panRatio = calculateStereoLocation(viewport, event.items[0]);
      setPan(panner2, panRatio);
      note2scheduler = 1;
    }
  });

  miro.board.ui.on('items:create', async (event)=> {
    console.log("Item created");
    console.log(event);
    const viewport = await miro.board.viewport.get();
    if (event.items.length > 0 && event.items[0].type == "sticky_note") {
      const panRatio = calculateStereoLocation(viewport, event.items[0]);
      setPan(panner3, panRatio);
      note3scheduler = 1;
    }
  });

  miro.board.ui.on('items:delete', async (event)=> {
    console.log("Item deleted");
    console.log(event);
    const viewport = await miro.board.viewport.get();
    if (event.items.length > 0 && event.items[0].type == "sticky_note") {
      const panRatio = calculateStereoLocation(viewport, event.items[0]);
      setPan(panner4, panRatio);
      note4scheduler = 1;
    }
  });
}

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

function setPan(panner: Tone.Panner, panRatio: number){
  panner.pan.rampTo(panRatio, 0.001);
}

// create a new Tone.js Transport object
const transport = Tone.Transport;

// set the transport time signature to 4/4
transport.timeSignature = [4, 4];


// create a new Tone.js Sequence object
let iterator = 0;

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
    if (note1scheduler == 1) {
      synth1.triggerAttackRelease("C3", "8n", time);
      note1scheduler = 0;
      console.log("note1");
    };
  
    if (note2scheduler == 1) {
      synth2.triggerAttackRelease("G1", "8n", time);
      note2scheduler = 0;
      console.log("note2");
    };
  
    if (note3scheduler == 1) {
      synth3.triggerAttackRelease("G3", "8n", time);
      note3scheduler = 0;
      console.log("note3");
    };
  
    if (note4scheduler == 1) {
      synth4.triggerAttackRelease("C2", "8n", time);
      synth4.triggerRelease(time + 0.1);
      note4scheduler = 0;
      console.log("note4");
    };
    
  }

  iterator++;
}, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "16n");

// start the transport and the sequence
transport.start();
sequence.start();

init();
