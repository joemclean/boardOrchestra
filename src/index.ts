import * as React from 'react';

async function init() {
  miro.board.ui.on('icon:click', async () => {
    await miro.board.ui.openPanel({url: 'app.html', height: 200});
  })};

init();

