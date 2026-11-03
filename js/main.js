(function (root) {
  'use strict';

  const PalX = (root.PalX = root.PalX || {});

  document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const game = new PalX.GameEngine({ canvas });
    const ui = new PalX.UIController(game);
    ui.init();

    root.palxGame = game;
    console.log('%c【仙劍X：燼月長歌】v2.5.0 · 物理雙足貼地與高畫質重構版已載入', 'background:#071023; color:#4fc3f7; font-size:14px; font-weight:bold; padding:4px 8px; border:1px solid #4fc3f7; border-radius:4px;');

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
