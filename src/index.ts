import * as Tone from 'tone';

const synth = new Tone.Synth().toDestination();

async function init() {
  miro.board.ui.on('icon:click', async () => {
    await miro.board.ui.openPanel({url: 'app.html'});
  });

  miro.board.ui.on('experimental:items:update', (event)=> {
    console.log(event);
    synth.triggerAttackRelease("C3", "16n");
  });

  miro.board.ui.on('selection:update', (event)=> {
    console.log(event);
    synth.triggerAttackRelease("G3", "16n");
  });
}

init();
