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
    console.log(event);
    synth1.triggerAttackRelease("C3", "16n");
  });

  miro.board.ui.on('selection:update', (event)=> {
    console.log(event);
    synth2.triggerAttackRelease("C5", "32n");
  });

  miro.board.ui.on('items:create', (event)=> {
    console.log(event);
    synth3.triggerAttackRelease("G3", "16n");
  });

  miro.board.ui.on('items:delete', (event)=> {
    console.log(event);
    synth4.triggerAttackRelease("C2", "8n");
  });
}

init();
