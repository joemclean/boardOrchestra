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

init();
