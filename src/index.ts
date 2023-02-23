import * as React from 'react';

async function init() {
  miro.board.ui.on('icon:click', async () => {
    await miro.board.ui.openPanel({url: 'app.html', height: 200});
  });

  miro.board.ui.on('items:create', async (event) => {
    console.log("firing create");
    localStorage.setItem('storage', 'createWidget');
    window.dispatchEvent(new Event('storage'));
  });

  miro.board.ui.on('items:delete', async (event) => {
    console.log("firing delete");
    localStorage.setItem('storage', 'deleteWidget');
    window.dispatchEvent(new Event('storage'));
  });

  miro.board.ui.on('experimental:items:update', async (event) => {
    console.log("firing delete");
    localStorage.setItem('storage', 'moveWidget');
    window.dispatchEvent(new Event('storage'));
  });
}

init();

