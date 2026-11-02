(function (root) {
  'use strict';

  const PalX = (root.PalX = root.PalX || {});

  document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const game = new PalX.GameEngine({ canvas });
    const ui = new PalX.UIController(game);
    ui.init();

    root.palxGame = game;

    let lastTs = performance.now();
    function frame(ts) {
      const dt = Math.min(0.05, Math.max(0.001, (ts - lastTs) / 1000));
      lastTs = ts;
      game.update(dt);
      game.render();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
})(typeof window !== 'undefined' ? window : globalThis);
