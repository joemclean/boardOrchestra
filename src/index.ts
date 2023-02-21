import { BoardViewport, Item, PositionMixin, Rect, StickyNote, WidgetMixin } from '@mirohq/websdk-types';
import * as Tone from 'tone';

const panner1 = new Tone.Panner().toDestination();
const panner2 = new Tone.Panner().toDestination();
const panner3 = new Tone.Panner().toDestination();
const panner4 = new Tone.Panner().toDestination();

const synth1 = new Tone.Synth().connect(panner1);
const synth2 = new Tone.Synth().connect(panner2);
const synth3 = new Tone.Synth().connect(panner3);
const synth4 = new Tone.Synth().connect(panner4);

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
    }
    const now = Tone.now();
    synth1.triggerAttack("C3", now);
    synth1.triggerRelease(now + 0.1);
  });

  miro.board.ui.on('selection:update', async (event)=> {
    console.log("Selection update");
    console.log(event);
    const viewport = await miro.board.viewport.get();
    if (event.items.length > 0 && event.items[0].type == "sticky_note") {
      const panRatio = calculateStereoLocation(viewport, event.items[0]);
      setPan(panner2, panRatio);
    }
    const now = Tone.now();
    synth2.triggerAttack("G1", now);
    synth2.triggerRelease(now + 0.1);
  });

  miro.board.ui.on('items:create', async (event)=> {
    console.log("Item created");
    console.log(event);
    const viewport = await miro.board.viewport.get();
    if (event.items.length > 0 && event.items[0].type == "sticky_note") {
      const panRatio = calculateStereoLocation(viewport, event.items[0]);
      setPan(panner3, panRatio);
    }

    const now = Tone.now();
    synth3.triggerAttack("G3", now);
    synth3.triggerRelease(now + 0.1);
  });

  miro.board.ui.on('items:delete', async (event)=> {
    console.log("Item deleted");
    console.log(event);
    const viewport = await miro.board.viewport.get();
    if (event.items.length > 0 && event.items[0].type == "sticky_note") {
      const panRatio = calculateStereoLocation(viewport, event.items[0]);
      setPan(panner4, panRatio);
    }
    const now = Tone.now();
    synth4.triggerAttack("C2", now);
    synth4.triggerRelease(now + 0.1);
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

// create a new Tone.js MembraneSynth object to use as the kick drum
const kick = new Tone.MembraneSynth().toDestination();

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
}).toDestination();

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
}).toDestination();

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
    console.log("Event fired at time: " + time);
  }
  iterator++;
}, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "16n");

// start the transport and the sequence
transport.start();
sequence.start();

init();
