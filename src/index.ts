import * as React from 'react';

async function init() {
  miro.board.ui.on('icon:click', async () => {
    await miro.board.ui.openPanel({url: 'app.html', height: 200});
  })};

  miro.board.ui.on('items:create', async (event) => {
    localStorage.setItem('eventStream', 'createWidget');
  })

  miro.board.ui.on('items:delete', async (event) => {
    localStorage.setItem('eventStream', 'createWidget');
  })

init();

