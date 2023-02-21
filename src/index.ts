import * as Tone from 'tone';

const synth1 = new Tone.Synth().toDestination();
const synth2 = new Tone.Synth().toDestination();
const synth3 = new Tone.Synth().toDestination();
const synth4 = new Tone.Synth().toDestination();

async function init() {
  miro.board.ui.on('icon:click', async () => {
    await miro.board.ui.openPanel({url: 'app.html'});
  });

  miro.board.ui.on('experimental:items:update', (event)=> {
    console.log("Item update");
    console.log(event);
    const now = Tone.now();
    synth1.triggerAttack("C3", now);
    synth1.triggerRelease(now + 0.1);
  });

  miro.board.ui.on('selection:update', (event)=> {
    console.log("Selection update");
    console.log(event);
    if (event.items.length > 0 && event.items[0].type != "connector") {
      console.log("x: " + event.items[0].x);
      console.log("y: " + event.items[0].y);
    }
    const now = Tone.now();
    synth2.triggerAttack("G1", now);
    synth2.triggerRelease(now + 0.1);
  });

  miro.board.ui.on('items:create', (event)=> {
    console.log("Item created");
    console.log(event);
    const now = Tone.now();
    synth3.triggerAttack("G3", now);
    synth3.triggerRelease(now + 0.1);
  });

  miro.board.ui.on('items:delete', (event)=> {
    console.log("Item deleted");
    console.log(event);
    const now = Tone.now();
    synth4.triggerAttack("C2", now);
    synth4.triggerRelease(now + 0.1);
  });
}

init();
