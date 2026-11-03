(function (root) {
  'use strict';

  const PalX = (root.PalX = root.PalX || {});

  class UIController {
    constructor(game) {
      this.game = game;
      this.game.ui = this;
      this.dialogueQueue = [];
      this.dialogueCallback = null;
      this.typingTimer = null;
      this.currentFullText = '';
      this.isTyping = false;
      this.selectedMenuTab = 'status';
      this.selectedHeroId = 'luxiao';
      this.guSlotA = null;
      this.guSlotB = null;
      this.battleSubMode = null; // 'skill' | 'item' | 'throw'
      this.victoryCallback = null;
    }

    init() {
      this.bindTitleEvents();
      this.bindCanvasAndInputEvents();
      this.bindBattleEvents();
      this.bindMenuEvents();
      this.startTitleBackdropLoop();
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());
      window.addEventListener('orientationchange', () => setTimeout(() => this.resizeCanvas(), 80));
    }

    resizeCanvas() {
      const viewport = document.querySelector('.canvas-viewport');
      const canvas = this.game.canvas;
      if (!canvas) return;
      const vw = (viewport && viewport.clientWidth > 0) ? viewport.clientWidth : window.innerWidth;
      const vh = (viewport && viewport.clientHeight > 0) ? viewport.clientHeight : window.innerHeight;
      if (vw <= 0 || vh <= 0) return;

      // 經典仙劍 2.5D 黃金鏡頭比例：適度拉近視角，人物與精緻場景主體突出，杜絕遠景螻蟻感
      let logicalW = 620;
      if (vw < 640 || vh > vw) {
        logicalW = Math.max(380, Math.min(480, Math.round(vw * 0.95)));
      }
      this.game.logicalW = logicalW;

      // 原生 High-DPI / DevicePixelRatio 像素緩衝區支持，消弭瀏覽器拉伸模糊，畫面極致銳利清晰
      const dpr = Math.min(2.5, window.devicePixelRatio || 1);
      const targetW = Math.round(vw * dpr);
      const targetH = Math.round(vh * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      this.game.logicalH = targetH / (targetW / logicalW);

      const tCanvas = document.getElementById('title-canvas');
      if (tCanvas) {
        const tw = Math.round(window.innerWidth * dpr);
        const th = Math.round(window.innerHeight * dpr);
        if (tCanvas.width !== tw || tCanvas.height !== th) {
          tCanvas.width = tw;
          tCanvas.height = th;
        }
      }
    }

    // =========================================================================
    // 標題畫面與背景意境動畫
    // =========================================================================
    bindTitleEvents() {
      const btnNew = document.getElementById('btn-title-new');
      const btnLoad = document.getElementById('btn-title-load');
      const btnLore = document.getElementById('btn-title-lore');

      btnNew.addEventListener('click', () => {
        PalX.audio.resume();
        PalX.audio.sfx('confirm');
        this.game.startNewGame();
      });

      btnLoad.addEventListener('click', () => {
        PalX.audio.resume();
        PalX.audio.sfx('cursor');
        this.openMenuModal('system', true);
      });

      btnLore.addEventListener('click', () => {
        PalX.audio.resume();
        PalX.audio.sfx('cursor');
        this.openMenuModal('lore', true);
      });
    }

    startTitleBackdropLoop() {
      const tCanvas = document.getElementById('title-canvas');
      if (!tCanvas) return;
      const tCtx = tCanvas.getContext('2d');
      let t = 0;
      const drawTitleBg = () => {
        const titleEl = document.getElementById('title-screen');
        if (titleEl && !titleEl.classList.contains('hidden')) {
          t += 0.016;
          const w = tCanvas.width;
          const h = tCanvas.height;
          const bgImg = PalX.graphics && PalX.graphics.getAsset
            ? PalX.graphics.getAsset('backdrops/bg_title.jpg')
            : null;

          if (bgImg) {
            // AI生成仙俠山水背景 + 細膩呼吸緩推鏡頭
            const zoom = 1.02 + Math.sin(t * 0.35) * 0.015;
            const dw = w * zoom;
            const dh = h * zoom;
            const dx = (w - dw) * 0.5 + Math.cos(t * 0.25) * 5;
            const dy = (h - dh) * 0.5;
            tCtx.drawImage(bgImg, dx, dy, dw, dh);
            // 微暗邊角襯托標題書法金字
            const vig = tCtx.createRadialGradient(w * 0.5, h * 0.48, w * 0.16, w * 0.5, h * 0.5, w * 0.72);
            vig.addColorStop(0, 'rgba(6, 14, 30, 0.08)');
            vig.addColorStop(1, 'rgba(4, 10, 22, 0.45)');
            tCtx.fillStyle = vig;
            tCtx.fillRect(0, 0, w, h);
          } else {
            const g = tCtx.createLinearGradient(0, 0, 0, h);
            g.addColorStop(0, '#071124');
            g.addColorStop(0.55, '#152c4f');
            g.addColorStop(1, '#1d3e5e');
            tCtx.fillStyle = g;
            tCtx.fillRect(0, 0, w, h);
          }

          // 飛劍流光與桃花雪瓣粒子
          const sx = ((t * 115) % (w + 320)) - 160;
          const sy = h * 0.32 - Math.sin(t * 1.5) * 18;
          const sg = tCtx.createLinearGradient(sx - 55, sy + 12, sx, sy);
          sg.addColorStop(0, 'rgba(128, 222, 234, 0)');
          sg.addColorStop(1, 'rgba(224, 247, 250, 0.85)');
          tCtx.strokeStyle = sg;
          tCtx.lineWidth = 2.6;
          tCtx.beginPath();
          tCtx.moveTo(sx - 55, sy + 12);
          tCtx.lineTo(sx, sy);
          tCtx.stroke();

          tCtx.fillStyle = 'rgba(248, 187, 208, 0.75)';
          for (let i = 0; i < 26; i++) {
            const px = (i * 89 + t * (22 + (i % 5) * 6)) % w;
            const py = (i * 53 + t * (18 + (i % 4) * 5)) % h;
            tCtx.save();
            tCtx.translate(px, py);
            tCtx.rotate(t * 1.5 + i);
            tCtx.beginPath();
            tCtx.ellipse(0, 0, 3.2, 1.8, 0, 0, Math.PI * 2);
            tCtx.fill();
            tCtx.restore();
          }
        }
        requestAnimationFrame(drawTitleBg);
      };
      requestAnimationFrame(drawTitleBg);
    }

    hideTitleScreen() {
      document.getElementById('title-screen').classList.add('hidden');
      document.getElementById('game-stage').classList.remove('hidden');
      this.resizeCanvas();
    }

    showTitleScreen() {
      document.getElementById('title-screen').classList.remove('hidden');
      document.getElementById('game-stage').classList.add('hidden');
      this.resizeCanvas();
      PalX.audio.playMusic('title');
    }

    // =========================================================================
    // 地圖立繪精準碰撞檢測、點擊/長按拖曳引導、8向鍵盤與 360度虛擬搖桿
    // =========================================================================
    getCanvasCoords(ev) {
      const canvas = this.game.canvas;
      const rect = canvas.getBoundingClientRect();
      const logicalW = this.game.logicalW || canvas.width;
      const logicalH = this.game.logicalH || canvas.height;
      return {
        sx: ((ev.clientX - rect.left) / Math.max(1, rect.width)) * logicalW,
        sy: ((ev.clientY - rect.top) / Math.max(1, rect.height)) * logicalH
      };
    }

    hitTestMapObject(sx, sy) {
      if (!this.game.state || this.game.battle.active) return null;
      const map = PalX.MAPS[this.game.state.mapId];
      if (!map) return null;
      const canvas = this.game.canvas;
      const lw = this.game.logicalW || canvas.width;
      const lh = this.game.logicalH || canvas.height;
      const flags = this.game.state.flags || {};

      // 由前景至背景排序，確保視覺在最前方的 NPC / 寶箱 / 首領優先命中
      const activeObjs = map.objects.filter((obj) => {
        if (obj.requireFlag && !flags[obj.requireFlag]) return false;
        if (obj.hideFlag && flags[obj.hideFlag]) return false;
        return true;
      }).sort((a, b) => (b.x + b.y) - (a.x + a.y));

      for (const obj of activeObjs) {
        const pt = PalX.graphics.tileToScreen(obj.x, obj.y, this.game.camX, this.game.camY, lw, lh);
        let halfW = 20;
        let topH = 40;
        let botH = 12;
        if (obj.type === 'boss') {
          halfW = 36; topH = 92; botH = 14;
        } else if (obj.type === 'npc') {
          halfW = 22; topH = 58; botH = 12;
        } else if (obj.type === 'statue') {
          const broken = obj.flag && flags[obj.flag];
          halfW = 22; topH = broken ? 38 : 56; botH = 12;
        } else if (obj.type === 'chest' || obj.type === 'jar' || obj.type === 'barrel') {
          halfW = 20; topH = 36; botH = 11;
        } else if (obj.type === 'portal') {
          halfW = obj.sprite === 'boat' ? 34 : 26;
          topH = obj.sprite === 'boat' ? 34 : 26;
          botH = 14;
        } else if (obj.type === 'switch') {
          halfW = 24; topH = 24; botH = 12;
        }
        if (sx >= pt.x - halfW && sx <= pt.x + halfW && sy >= pt.y - topH && sy <= pt.y + botH) {
          return obj;
        }
      }
      return null;
    }

    updatePointerSteerFromScreen(sx, sy) {
      if (!this.game.state || this.game.battle.active || this.game.dialogueActive || this.game.modalActive) {
        this.game.pointerSteerVec = { x: 0, y: 0 };
        return;
      }
      const canvas = this.game.canvas;
      const lw = this.game.logicalW || canvas.width;
      const lh = this.game.logicalH || canvas.height;
      const rp = this.game.renderPlayer || this.game.playerPos;
      const heroPt = PalX.graphics.tileToScreen(rp.x, rp.y, this.game.camX, this.game.camY, lw, lh);
      const dx = sx - heroPt.x;
      const dy = (sy + 10) - heroPt.y;
      if (Math.hypot(dx, dy) > 16) {
        this.game.pointerSteerVec = { x: dx, y: dy };
      } else {
        this.game.pointerSteerVec = { x: 0, y: 0 };
      }
    }

    handleCanvasTap(sx, sy) {
      const canvas = this.game.canvas;
      const lw = this.game.logicalW || canvas.width;
      const lh = this.game.logicalH || canvas.height;
      if (this.game.showMiniMap && this.game.miniMapRect) {
        const mm = this.game.miniMapRect;
        if (sx >= mm.x && sx <= mm.x + mm.w && sy >= mm.y && sy <= mm.y + mm.h) {
          this.game.showMiniMap = !this.game.showMiniMap;
          PalX.audio.sfx('cursor');
          this.toast(this.game.showMiniMap ? '小地圖已開啟' : '小地圖已收起');
          return;
        }
      }
      if (this.game.battle.active) {
        // 戰鬥中點擊敵人切換鎖定目標（擴大首領立繪命中範圍）
        const b = this.game.battle;
        b.enemies.forEach((en, idx) => {
          if (en.dead) return;
          const pos = PalX.graphics.getEnemyBattlePos(idx, b.enemies.length, lw, lh);
          const hitR = en.isBoss ? 72 : 52;
          const centerOffset = en.isBoss ? 52 : 32;
          if (Math.hypot(sx - pos.x, sy - (pos.y - centerOffset)) < hitR) {
            b.selectedEnemyIdx = idx;
            PalX.audio.sfx('cursor');
            this.updateBattleHud();
          }
        });
        return;
      }

      const hitObj = this.hitTestMapObject(sx, sy);
      const tile = PalX.graphics.screenToTile(sx, sy, this.game.camX, this.game.camY, lw, lh);
      this.game.handleMapClick(tile.x, tile.y, hitObj);
    }

    bindCanvasAndInputEvents() {
      const canvas = this.game.canvas;
      let pActive = false;
      let pId = null;
      let pDownTime = 0;
      let pStartSX = 0;
      let pStartSY = 0;
      let pCurSX = 0;
      let pCurSY = 0;
      let pDragging = false;
      let holdTimer = null;

      const clearHoldSteer = () => {
        pActive = false;
        pId = null;
        pDragging = false;
        if (holdTimer) {
          clearInterval(holdTimer);
          holdTimer = null;
        }
        this.game.pointerSteerVec = { x: 0, y: 0 };
      };

      canvas.addEventListener('pointerdown', (ev) => {
        if (ev.button && ev.button !== 0) return;
        PalX.audio.resume();
        const { sx, sy } = this.getCanvasCoords(ev);
        pActive = true;
        pId = ev.pointerId;
        pDownTime = performance.now();
        pStartSX = sx;
        pStartSY = sy;
        pCurSX = sx;
        pCurSY = sy;
        pDragging = false;

        try { canvas.setPointerCapture(ev.pointerId); } catch (_) {}

        if (holdTimer) clearInterval(holdTimer);
        holdTimer = setInterval(() => {
          if (!pActive) return;
          if (performance.now() - pDownTime >= 155 && !this.game.battle.active && !this.game.dialogueActive && !this.game.modalActive) {
            pDragging = true;
            this.updatePointerSteerFromScreen(pCurSX, pCurSY);
          }
        }, 32);
      });

      canvas.addEventListener('pointermove', (ev) => {
        const { sx, sy } = this.getCanvasCoords(ev);
        pCurSX = sx;
        pCurSY = sy;

        if (!this.game.battle.active && this.game.state) {
          const lw = this.game.logicalW || canvas.width;
          const lh = this.game.logicalH || canvas.height;
          const hObj = this.hitTestMapObject(sx, sy);
          const hTile = PalX.graphics.screenToTile(sx, sy, this.game.camX, this.game.camY, lw, lh);
          this.game.hoverObj = hObj;
          this.game.hoverTile = hTile;
          canvas.style.cursor = pDragging ? 'grabbing' : (hObj ? 'pointer' : 'crosshair');
        } else {
          this.game.hoverObj = null;
          this.game.hoverTile = null;
          canvas.style.cursor = 'pointer';
        }

        if (pActive && ev.pointerId === pId) {
          if (!pDragging && Math.hypot(sx - pStartSX, sy - pStartSY) >= 14) {
            pDragging = true;
          }
          if (pDragging) {
            this.updatePointerSteerFromScreen(sx, sy);
          }
        }
      });

      const onPointerEnd = (ev) => {
        if (!pActive || (pId !== null && ev.pointerId !== pId)) return;
        const { sx, sy } = this.getCanvasCoords(ev);
        const wasDrag = pDragging;
        try { canvas.releasePointerCapture(ev.pointerId); } catch (_) {}
        clearHoldSteer();
        canvas.style.cursor = this.game.hoverObj ? 'pointer' : 'crosshair';

        if (!wasDrag) {
          this.lastPointerTapTime = performance.now();
          this.handleCanvasTap(sx, sy);
        }
      };

      canvas.addEventListener('pointerup', onPointerEnd);
      canvas.addEventListener('pointercancel', clearHoldSteer);
      canvas.addEventListener('pointerleave', () => {
        if (!pActive) {
          this.game.hoverObj = null;
          this.game.hoverTile = null;
        }
      });

      // 備援支援純合成 click 事件
      canvas.addEventListener('click', (ev) => {
        if (performance.now() - (this.lastPointerTapTime || 0) < 280) return;
        PalX.audio.resume();
        const { sx, sy } = this.getCanvasCoords(ev);
        this.handleCanvasTap(sx, sy);
      });

      window.addEventListener('blur', () => {
        this.game.keysDown = {};
        this.game.virtualSteerVec = { x: 0, y: 0 };
        clearHoldSteer();
      });

      window.addEventListener('keydown', (ev) => {
        this.game.keysDown[ev.code] = true;

        // 詩卷過場時按任意鍵跳過
        const poetryEl = document.getElementById('poetry-overlay');
        if (poetryEl && !poetryEl.classList.contains('hidden')) {
          if (ev.code === 'Space' || ev.code === 'Enter' || ev.code === 'Escape') {
            ev.preventDefault();
            poetryEl.click();
          }
          return;
        }

        // 戰勝面板按空白或Enter關閉
        const vicEl = document.getElementById('victory-modal');
        if (vicEl && !vicEl.classList.contains('hidden')) {
          if (ev.code === 'Space' || ev.code === 'Enter') {
            ev.preventDefault();
            document.getElementById('btn-victory-ok').click();
          }
          return;
        }

        // 對話進行中按空白鍵或Enter推進
        if (this.game.dialogueActive) {
          if (ev.code === 'Space' || ev.code === 'Enter') {
            ev.preventDefault();
            this.advanceDialogue();
          }
          return;
        }

        // 戰鬥經典仙劍1快捷鍵 (A 圍攻 / F 最強仙術 / D 防禦 / R 重複 / Q 逃跑 / E 物品 / W 投擲)
        if (this.game.battle.active && this.game.battle.phase === 'input') {
          if (ev.code === 'KeyA') this.game.battle.submitPlayerAction({ type: 'siege' });
          else if (ev.code === 'KeyF') this.game.battle.submitPlayerAction({ type: 'strongest' });
          else if (ev.code === 'KeyD') this.game.battle.submitPlayerAction({ type: 'defend' });
          else if (ev.code === 'KeyR') this.game.battle.submitPlayerAction({ type: 'repeat' });
          else if (ev.code === 'KeyQ') this.game.battle.submitPlayerAction({ type: 'flee' });
          else if (ev.code === 'KeyE') this.openBattleDrawer('item');
          else if (ev.code === 'KeyW') this.openBattleDrawer('throw');
          else if (ev.code === 'Escape') this.closeBattleDrawer();
          return;
        }

        // 地圖探索快捷鍵
        if (!document.getElementById('game-stage').classList.contains('hidden')) {
          if (ev.code === 'Escape') {
            ev.preventDefault();
            if (this.game.modalActive) this.closeModal();
            else this.openMenuModal('status');
          } else if ((ev.code === 'Space' || ev.code === 'Enter') && !this.game.modalActive) {
            ev.preventDefault();
            this.game.interactNearby();
          }
        }
      });

      window.addEventListener('keyup', (ev) => {
        this.game.keysDown[ev.code] = false;
      });

      // 頂部工具列小地圖與選單按鈕
      const btnMinimap = document.getElementById('btn-hud-minimap');
      if (btnMinimap) {
        btnMinimap.addEventListener('click', () => {
          PalX.audio.sfx('cursor');
          this.game.showMiniMap = !this.game.showMiniMap;
          this.toast(this.game.showMiniMap ? '小地圖已開啟' : '小地圖已收起');
        });
      }

      const btnVmap = document.getElementById('btn-vmap');
      if (btnVmap) {
        btnVmap.addEventListener('click', () => {
          PalX.audio.sfx('cursor');
          this.game.showMiniMap = !this.game.showMiniMap;
          this.toast(this.game.showMiniMap ? '小地圖已開啟' : '小地圖已收起');
        });
      }

      document.getElementById('btn-hud-menu').addEventListener('click', () => {
        PalX.audio.sfx('cursor');
        this.openMenuModal('status');
      });

      document.getElementById('btn-hud-audio').addEventListener('click', (ev) => {
        const on = PalX.audio.toggle();
        ev.currentTarget.innerHTML = `<img src="assets/ui_icons/${on ? 'music' : 'music_off'}.svg" class="hud-inline-icon" alt=""> 仙樂${on ? '開' : '關'}`;
      });

      // 360度絲滑虛擬搖桿（支援按住任意方位與連續拖曳走位）
      const joyPad = document.getElementById('vjoy-pad');
      const joyKnob = document.getElementById('vjoy-knob');
      if (joyPad && joyKnob) {
        let joyActive = false;
        let joyPid = null;
        const maxRadius = 30;

        const updateJoy = (ev) => {
          const rect = joyPad.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          let dx = ev.clientX - cx;
          let dy = ev.clientY - cy;
          const dist = Math.hypot(dx, dy);
          if (dist > maxRadius) {
            dx = (dx / dist) * maxRadius;
            dy = (dy / dist) * maxRadius;
          }
          joyKnob.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
          if (dist > 6) {
            this.game.virtualSteerVec = { x: dx / maxRadius, y: dy / maxRadius };
          } else {
            this.game.virtualSteerVec = { x: 0, y: 0 };
          }
        };

        const resetJoy = (ev) => {
          if (!joyActive || (joyPid !== null && ev && ev.pointerId != null && ev.pointerId !== joyPid)) return;
          joyActive = false;
          joyPid = null;
          joyPad.classList.remove('active');
          joyKnob.style.transform = 'translate(0px, 0px)';
          this.game.virtualSteerVec = { x: 0, y: 0 };
        };

        joyPad.addEventListener('pointerdown', (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          PalX.audio.resume();
          joyActive = true;
          joyPid = ev.pointerId;
          joyPad.classList.add('active');
          try { joyPad.setPointerCapture(ev.pointerId); } catch (_) {}
          updateJoy(ev);
        });

        joyPad.addEventListener('pointermove', (ev) => {
          if (!joyActive || ev.pointerId !== joyPid) return;
          ev.preventDefault();
          updateJoy(ev);
        });

        joyPad.addEventListener('pointerup', resetJoy);
        joyPad.addEventListener('pointercancel', resetJoy);
      }

      // 調查鈕與御風疾行切換鈕
      const btnAct = document.getElementById('btn-vact');
      if (btnAct) {
        btnAct.addEventListener('click', (ev) => {
          ev.stopPropagation();
          PalX.audio.resume();
          this.game.interactNearby();
        });
      }

      const btnSprint = document.getElementById('btn-vsprint');
      if (btnSprint) {
        btnSprint.addEventListener('click', (ev) => {
          ev.stopPropagation();
          PalX.audio.resume();
          this.game.sprintToggle = !this.game.sprintToggle;
          btnSprint.classList.toggle('active', this.game.sprintToggle);
          PalX.audio.sfx('cursor');
          this.toast(this.game.sprintToggle ? '御風疾行：開啟（亦可按住 Shift）' : '御風疾行：常速漫步');
        });
      }

      // 對話框點擊推進
      document.getElementById('dialogue-box').addEventListener('click', (ev) => {
        if (ev.target.closest('.choice-btn')) return;
        this.advanceDialogue();
      });
    }

    // =========================================================================
    // 頂部 HUD 狀態更新
    // =========================================================================
    updateTopHud() {
      const st = this.game.state;
      if (!st) return;
      const map = PalX.MAPS[st.mapId];
      document.getElementById('hud-map-title').textContent = map ? `${map.chapter} ｜ ${map.name}` : '';
      document.getElementById('hud-quest-text').textContent = PalX.getQuestObjective(st.flags);
      document.getElementById('hud-gold').textContent = `${st.gold} 文`;

      const partyWrap = document.getElementById('hud-party-mini');
      partyWrap.innerHTML = st.activeParty.map((hid) => {
        const h = st.heroes[hid];
        const eff = PalX.computeHeroStats(h);
        const hpPct = Math.max(0, Math.min(100, Math.round((h.hp / eff.maxHp) * 100)));
        const mpPct = Math.max(0, Math.min(100, Math.round((h.mp / eff.maxMp) * 100)));
        const pBadge = h.poison ? `<span class="poison-pill">毒</span>` : '';
        return `
          <div class="hud-hero-pill">
            <div class="hh-top"><span>${h.name}</span><small>Lv.${h.level}</small>${pBadge}</div>
            <div class="hh-bar"><i class="hp-fill" style="width:${hpPct}%"></i></div>
            <div class="hh-bar"><i class="mp-fill" style="width:${mpPct}%"></i></div>
          </div>
        `;
      }).join('');
    }

    // =========================================================================
    // 詩詞捲軸 (定場詩) 與仙劍1深藍描金對話框
    // =========================================================================
    playPoetryScroll(title, poem, onDone) {
      this.game.dialogueActive = true;
      const el = document.getElementById('poetry-overlay');
      document.getElementById('poetry-title').textContent = title;
      document.getElementById('poetry-body').innerHTML = poem.split('\n').map((l) => `<p>${l}</p>`).join('');
      el.classList.remove('hidden');

      const finish = () => {
        el.removeEventListener('click', finish);
        el.classList.add('hidden');
        this.game.dialogueActive = false;
        this.game.interactCooldown = 0.42;
        if (onDone) onDone();
      };
      el.addEventListener('click', finish);
    }

    startDialogue(lines, onDone) {
      if (!lines || !lines.length) {
        if (onDone) onDone();
        return;
      }
      this.game.dialogueActive = true;
      this.game.pointerSteerVec = { x: 0, y: 0 };
      this.dialogueQueue = lines.slice();
      this.dialogueCallback = onDone || null;
      document.getElementById('virtual-controls').classList.add('hidden');
      document.getElementById('dialogue-overlay').classList.remove('hidden');
      this.renderNextDialogueLine();
    }

    renderNextDialogueLine() {
      if (this.dialogueQueue.length === 0) {
        document.getElementById('dialogue-overlay').classList.add('hidden');
        if (!this.game.battle.active) {
          document.getElementById('virtual-controls').classList.remove('hidden');
        }
        this.game.dialogueActive = false;
        this.game.interactCooldown = 0.42;
        const cb = this.dialogueCallback;
        this.dialogueCallback = null;
        if (cb) cb();
        return;
      }

      const line = this.dialogueQueue.shift();
      this.currentLineObj = line;
      const sp = PalX.SPEAKERS[line.speaker] || PalX.SPEAKERS.narrator;
      document.getElementById('dlg-speaker').textContent = sp.title ? `${sp.name}（${sp.title}）` : sp.name;
      PalX.graphics.drawPortrait(document.getElementById('dlg-portrait'), sp.portrait);

      const choicesEl = document.getElementById('dlg-choices');
      choicesEl.innerHTML = '';

      this.currentFullText = line.text;
      const textEl = document.getElementById('dlg-text');
      textEl.textContent = '';
      this.isTyping = true;
      let idx = 0;
      if (this.typingTimer) clearInterval(this.typingTimer);

      const showChoicesIfNeeded = () => {
        if (line.choices && line.choices.length) {
          choicesEl.innerHTML = line.choices.map((c, ci) =>
            `<button class="choice-btn" data-cidx="${ci}">${c.label}</button>`
          ).join('');
          choicesEl.querySelectorAll('.choice-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
              const chosen = line.choices[Number(btn.getAttribute('data-cidx'))];
              PalX.audio.sfx('confirm');
              document.getElementById('dialogue-overlay').classList.add('hidden');
              if (!this.game.battle.active) {
                document.getElementById('virtual-controls').classList.remove('hidden');
              }
              this.game.dialogueActive = false;
              const cb = this.dialogueCallback;
              this.dialogueCallback = null;
              if (cb) cb(chosen.value);
            });
          });
        }
      };

      this.typingTimer = setInterval(() => {
        idx += 2;
        if (idx >= this.currentFullText.length) {
          textEl.textContent = this.currentFullText;
          clearInterval(this.typingTimer);
          this.typingTimer = null;
          this.isTyping = false;
          showChoicesIfNeeded();
        } else {
          textEl.textContent = this.currentFullText.slice(0, idx);
        }
      }, 18);
    }

    advanceDialogue() {
      if (!this.game.dialogueActive) return;
      if (this.isTyping) {
        if (this.typingTimer) clearInterval(this.typingTimer);
        this.typingTimer = null;
        this.isTyping = false;
        document.getElementById('dlg-text').textContent = this.currentFullText;
        if (this.currentLineObj && this.currentLineObj.choices) {
          const line = this.currentLineObj;
          const choicesEl = document.getElementById('dlg-choices');
          choicesEl.innerHTML = line.choices.map((c, ci) =>
            `<button class="choice-btn" data-cidx="${ci}">${c.label}</button>`
          ).join('');
          choicesEl.querySelectorAll('.choice-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
              const chosen = line.choices[Number(btn.getAttribute('data-cidx'))];
              PalX.audio.sfx('confirm');
              document.getElementById('dialogue-overlay').classList.add('hidden');
              if (!this.game.battle.active) {
                document.getElementById('virtual-controls').classList.remove('hidden');
              }
              this.game.dialogueActive = false;
              const cb = this.dialogueCallback;
              this.dialogueCallback = null;
              if (cb) cb(chosen.value);
            });
          });
        }
        return;
      }
      if (this.currentLineObj && this.currentLineObj.choices && this.currentLineObj.choices.length) {
        return; // 等待玩家點選選項
      }
      PalX.audio.sfx('cursor');
      this.renderNextDialogueLine();
    }

    // =========================================================================
    // 仙劍1經典45度戰鬥十字菱形指令盤與狀態列
    // =========================================================================
    bindBattleEvents() {
      document.getElementById('cmd-attack').addEventListener('click', () => {
        this.closeBattleDrawer();
        this.game.battle.submitPlayerAction({ type: 'attack', targetIdx: this.game.battle.selectedEnemyIdx });
      });

      document.getElementById('cmd-magic').addEventListener('click', () => {
        PalX.audio.sfx('cursor');
        this.openBattleDrawer('skill');
      });

      document.getElementById('cmd-coop').addEventListener('click', () => {
        this.closeBattleDrawer();
        this.game.battle.submitPlayerAction({ type: 'coop' });
      });

      document.getElementById('cmd-item').addEventListener('click', () => {
        PalX.audio.sfx('cursor');
        this.openBattleDrawer('item');
      });

      document.querySelectorAll('[data-bquick]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const act = btn.getAttribute('data-bquick');
          this.closeBattleDrawer();
          if (act === 'throw') {
            this.openBattleDrawer('throw');
          } else {
            this.game.battle.submitPlayerAction({ type: act });
          }
        });
      });

      document.getElementById('btn-bdrawer-close').addEventListener('click', () => {
        this.closeBattleDrawer();
      });

      document.getElementById('btn-victory-ok').addEventListener('click', () => {
        document.getElementById('victory-modal').classList.add('hidden');
        const cb = this.victoryCallback;
        this.victoryCallback = null;
        if (cb) cb();
      });
    }

    showBattleOverlay() {
      this.closeBattleDrawer();
      const tw = document.getElementById('toast-container');
      if (tw) tw.innerHTML = '';
      document.getElementById('virtual-controls').classList.add('hidden');
      document.getElementById('battle-overlay').classList.remove('hidden');
      this.updateBattleHud();
    }

    hideBattleOverlay() {
      this.closeBattleDrawer();
      document.getElementById('battle-overlay').classList.add('hidden');
      if (!this.game.dialogueActive) {
        document.getElementById('virtual-controls').classList.remove('hidden');
      }
    }

    updateBattleHud() {
      const b = this.game.battle;
      if (!b || !b.active) return;

      const latestLog = b.logs.length ? b.logs[b.logs.length - 1] : '拔劍迎敵！';
      document.getElementById('battle-log-bar').textContent = latestLog;

      // 敵方鎖定目標切換列
      const targetWrap = document.getElementById('battle-enemy-targets');
      targetWrap.innerHTML = b.enemies.map((en, idx) => {
        if (en.dead) return '';
        const elem = PalX.ELEMENTS[en.elem] || PalX.ELEMENTS.none;
        const active = b.selectedEnemyIdx === idx ? 'active' : '';
        return `<button class="enemy-target-pill ${active}" data-eidx="${idx}">[${elem.name}] ${en.name} (${en.hp}/${en.maxHp})</button>`;
      }).join('');
      targetWrap.querySelectorAll('[data-eidx]').forEach((btn) => {
        btn.addEventListener('click', () => {
          b.selectedEnemyIdx = Number(btn.getAttribute('data-eidx'));
          PalX.audio.sfx('cursor');
          this.updateBattleHud();
        });
      });

      // 動態顯示當前可發動之【合擊】名稱 (含靈珠神召提示!)
      const living = b.party.filter((h) => h.hp > 0 && h.stun <= 0);
      const coop = PalX.resolveCoopSkill(living);
      const coopBtn = document.getElementById('cmd-coop');
      coopBtn.title = coop ? `合擊：${coop.name}（${coop.desc}）` : '需2人以上存活方可合擊';
      const coopSub = coopBtn.querySelector('small');
      if (coopSub) coopSub.textContent = coop ? coop.name.slice(0, 4) : '合擊';

      // 當前行動角色提示
      const actor = b.party.find((h) => h.id === b.activeActorId);
      const turnEl = document.getElementById('battle-turn-actor');
      turnEl.textContent = (b.phase === 'input' && actor) ? `▶ ${actor.name} 出招` : '【交鋒中…】';

      // 右下角仙劍1經典人物頭像狀態牌
      const cardsWrap = document.getElementById('battle-hero-cards');
      cardsWrap.innerHTML = b.party.map((h) => {
        const isTurn = b.phase === 'input' && b.activeActorId === h.id ? 'turn-active' : '';
        const hpClass = h.hp <= 0 ? 'dead' : h.hp < h.maxHp * 0.28 ? 'low' : '';
        const tags = [];
        if (h.poison === 'chidu') tags.push('<i class="btag poison">赤毒</i>');
        if (h.poison === 'zhangdu') tags.push('<i class="btag poison">瘴毒</i>');
        if (h.stun > 0) tags.push('<i class="btag stun">定身</i>');
        if (h.buffs && h.buffs.tiangang > 0) tags.push('<i class="btag buff">天罡</i>');
        if (h.buffs && h.buffs.zuixian > 0) tags.push('<i class="btag buff">醉仙</i>');
        if (h.buffs && h.buffs.zhenyuan > 0) tags.push('<i class="btag buff">真元</i>');
        if (h.buffs && h.buffs.stealth > 0) tags.push('<i class="btag stealth">隱身</i>');
        return `
          <div class="bhero-card ${isTurn} ${hpClass}">
            <canvas class="bhero-portrait" data-pid="${h.id}" width="54" height="54"></canvas>
            <div class="bhero-info">
              <div class="bhero-name">${h.name} <span class="btags">${tags.join('')}</span></div>
              <div class="bhero-stat hp-row"><span>體力</span><b>${h.hp}/${h.maxHp}</b></div>
              <div class="bhero-stat mp-row"><span>真氣</span><b>${h.mp}/${h.maxMp}</b></div>
            </div>
          </div>
        `;
      }).join('');
      cardsWrap.querySelectorAll('.bhero-portrait').forEach((cv) => {
        PalX.graphics.drawPortrait(cv, cv.getAttribute('data-pid'));
      });
    }

    openBattleDrawer(mode) {
      const b = this.game.battle;
      if (!b.active || b.phase !== 'input') return;
      const hero = b.party.find((h) => h.id === b.activeActorId);
      if (!hero) return;

      this.battleSubMode = mode;
      const drawer = document.getElementById('battle-drawer');
      const titleEl = document.getElementById('bdrawer-title');
      const listEl = document.getElementById('bdrawer-list');
      drawer.classList.remove('hidden');

      if (mode === 'skill') {
        titleEl.textContent = `${hero.name} · 仙術武學（當前真氣 ${hero.mp}）`;
        listEl.innerHTML = hero.skills.map((sid) => {
          const sk = PalX.SKILLS[sid];
          if (!sk) return '';
          const elem = PalX.ELEMENTS[sk.elem] || PalX.ELEMENTS.none;
          const disabled = hero.mp < sk.mp ? 'disabled' : '';
          const extraCost = sk.coinCost ? ` / ${sk.coinCost}文` : sk.requireWine ? ` / 耗酒(剩${9 - this.game.state.wineGodUses}次)` : '';
          return `
            <button class="bdrawer-item" data-skid="${sk.id}" ${disabled}>
              <div class="bdi-top">
                <span class="elem-badge" style="color:${elem.color}">[${elem.name}]</span>
                <b>${sk.name}</b>
                <small>${sk.mp} 真氣${extraCost}</small>
              </div>
              <div class="bdi-desc">${sk.desc}</div>
            </button>
          `;
        }).join('');

        listEl.querySelectorAll('[data-skid]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const skid = btn.getAttribute('data-skid');
            const sk = PalX.SKILLS[skid];
            if (sk.target === 'ally' || sk.target === 'deadAlly') {
              this.promptBattleAllyTarget(sk.name, (allyIdx) => {
                this.closeBattleDrawer();
                b.submitPlayerAction({ type: 'skill', skillId: skid, allyIdx });
              });
            } else {
              this.closeBattleDrawer();
              b.submitPlayerAction({ type: 'skill', skillId: skid, targetIdx: b.selectedEnemyIdx });
            }
          });
        });
      } else if (mode === 'item') {
        titleEl.innerHTML = `行囊道具 · <button class="tab-mini active">使用仙藥</button> <button class="tab-mini" id="switch-to-throw">切換投擲 [W]</button>`;
        const entries = Object.keys(this.game.state.inventory)
          .map((id) => ({ item: PalX.ITEMS[id], count: this.game.state.inventory[id] }))
          .filter((x) => x.item && (x.item.category === 'medicine' || x.item.category === 'elixir') && !x.item.escapeMaze);

        listEl.innerHTML = entries.length ? entries.map(({ item, count }) => `
          <button class="bdrawer-item" data-itid="${item.id}">
            <div class="bdi-top"><b>${item.name}</b> <small>×${count}</small></div>
            <div class="bdi-desc">${item.desc}</div>
          </button>
        `).join('') : '<p class="empty-tip">行囊中暫無可用丹藥。</p>';

        const sw = document.getElementById('switch-to-throw');
        if (sw) sw.addEventListener('click', () => this.openBattleDrawer('throw'));

        listEl.querySelectorAll('[data-itid]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const itid = btn.getAttribute('data-itid');
            const item = PalX.ITEMS[itid];
            if (item.target === 'ally' || item.target === 'deadAlly' || item.target === 'anyAlly') {
              this.promptBattleAllyTarget(item.name, (allyIdx) => {
                this.closeBattleDrawer();
                b.submitPlayerAction({ type: 'item', itemId: itid, allyIdx });
              });
            } else {
              this.closeBattleDrawer();
              b.submitPlayerAction({ type: 'item', itemId: itid });
            }
          });
        });
      } else if (mode === 'throw') {
        titleEl.innerHTML = `暗器與武器投擲 · <button class="tab-mini" id="switch-to-use">切換吃藥 [E]</button> <button class="tab-mini active">投擲破防</button>`;
        // 仙劍1經典：可投擲暗器，也可投擲背包中閒置的武器(家傳木劍除外以免誤扔十年前信物)!
        const entries = Object.keys(this.game.state.inventory)
          .map((id) => ({ item: PalX.ITEMS[id], count: this.game.state.inventory[id] }))
          .filter((x) => x.item && x.item.throwDmg && x.item.id !== 'mujian');

        listEl.innerHTML = entries.length ? entries.map(({ item, count }) => `
          <button class="bdrawer-item" data-thid="${item.id}">
            <div class="bdi-top">
              <b>${item.name}</b>
              <small>威力 ${item.throwDmg} (${item.target === 'allEnemies' ? '全體' : '單體'}) ×${count}</small>
            </div>
            <div class="bdi-desc">${item.desc}</div>
          </button>
        `).join('') : '<p class="empty-tip">行囊中無可投擲之暗器或備用刀劍。</p>';

        const sw = document.getElementById('switch-to-use');
        if (sw) sw.addEventListener('click', () => this.openBattleDrawer('item'));

        listEl.querySelectorAll('[data-thid]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const thid = btn.getAttribute('data-thid');
            this.closeBattleDrawer();
            b.submitPlayerAction({ type: 'throw', itemId: thid, targetIdx: b.selectedEnemyIdx });
          });
        });
      }
    }

    promptBattleAllyTarget(actionName, onPick) {
      const b = this.game.battle;
      const listEl = document.getElementById('bdrawer-list');
      document.getElementById('bdrawer-title').textContent = `選擇【${actionName}】施放對象：`;
      listEl.innerHTML = b.party.map((h, idx) => `
        <button class="bdrawer-item" data-allyidx="${idx}">
          <div class="bdi-top"><b>${h.name}</b> <small>體力 ${h.hp}/${h.maxHp} ｜ 真氣 ${h.mp}/${h.maxMp}</small></div>
        </button>
      `).join('');
      listEl.querySelectorAll('[data-allyidx]').forEach((btn) => {
        btn.addEventListener('click', () => onPick(Number(btn.getAttribute('data-allyidx'))));
      });
    }

    closeBattleDrawer() {
      document.getElementById('battle-drawer').classList.add('hidden');
      this.battleSubMode = null;
    }

    showVictoryBanner(summary, onDone) {
      this.victoryCallback = onDone || null;
      const el = document.getElementById('victory-modal');
      const body = document.getElementById('victory-body');
      let html = `<p>獲得修為經驗：<b>+${summary.exp}</b></p><p>拾獲文錢：<b>+${summary.gold} 文</b></p>`;
      if (summary.drops && summary.drops.length) {
        html += `<p class="vic-highlight">戰利寶物：【${summary.drops.join('】、【')}】</p>`;
      }
      if (summary.lvLogs && summary.lvLogs.length) {
        html += summary.lvLogs.map((l) => `<p class="vic-lvup">【修為突破】${l}</p>`).join('');
      }
      body.innerHTML = html;
      el.classList.remove('hidden');
    }

    // =========================================================================
    // 仙劍1經典系統大選單 (狀態 / 仙術 / 物品 / 煉蠱 / 裝備 / 九州錄 / 系統)
    // =========================================================================
    bindMenuEvents() {
      document.getElementById('btn-menu-close').addEventListener('click', () => this.closeModal());
      document.getElementById('btn-shop-close').addEventListener('click', () => this.closeModal());

      document.querySelectorAll('[data-menutab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          PalX.audio.sfx('cursor');
          this.selectedMenuTab = btn.getAttribute('data-menutab');
          this.renderMenuModal();
        });
      });
    }

    openMenuModal(tab, fromTitle) {
      this.fromTitleModal = !!fromTitle;
      this.game.modalActive = true;
      const vc = document.getElementById('virtual-controls');
      if (vc) vc.classList.add('hidden');
      this.selectedMenuTab = tab || 'status';
      if (this.game.state && !this.game.state.unlockedHeroes.includes(this.selectedHeroId)) {
        this.selectedHeroId = this.game.state.activeParty[0] || 'luxiao';
      }
      document.getElementById('menu-modal').classList.remove('hidden');
      this.renderMenuModal();
    }

    closeModal() {
      this.game.modalActive = false;
      this.game.interactCooldown = 0.35;
      document.getElementById('menu-modal').classList.add('hidden');
      document.getElementById('shop-modal').classList.add('hidden');
      if (!this.game.battle.active && !this.game.dialogueActive) {
        const vc = document.getElementById('virtual-controls');
        if (vc) vc.classList.remove('hidden');
      }
      if (this.game.state) this.updateTopHud();
    }

    renderHeroSelectorBar() {
      const st = this.game.state;
      if (!st) return '';
      return `<div class="hero-tabs">` + st.unlockedHeroes.map((hid) => {
        const h = st.heroes[hid];
        const act = this.selectedHeroId === hid ? 'active' : '';
        const inParty = st.activeParty.includes(hid) ? '（出戰）' : '（休養）';
        return `<button class="hero-tab-btn ${act}" data-pickhero="${hid}">${h.name} <small>Lv.${h.level}${inParty}</small></button>`;
      }).join('') + `</div>`;
    }

    bindHeroSelectorEvents(container) {
      container.querySelectorAll('[data-pickhero]').forEach((btn) => {
        btn.addEventListener('click', () => {
          PalX.audio.sfx('cursor');
          this.selectedHeroId = btn.getAttribute('data-pickhero');
          this.renderMenuModal();
        });
      });
    }

    renderMenuModal() {
      const hasGame = !!this.game.state;
      document.querySelectorAll('[data-menutab]').forEach((btn) => {
        const t = btn.getAttribute('data-menutab');
        btn.classList.toggle('active', t === this.selectedMenuTab);
        if (this.fromTitleModal && t !== 'lore' && t !== 'system') {
          btn.classList.add('hidden');
        } else {
          btn.classList.remove('hidden');
        }
      });

      const body = document.getElementById('menu-body');

      // 任務卷軸 (主線使命與 12 樁支線任務即時追蹤)
      if (this.selectedMenuTab === 'quests') {
        const f = (this.game.state && this.game.state.flags) || {};
        const mainObjective = PalX.getQuestObjective ? PalX.getQuestObjective(f) : '尋訪江湖大道';
        body.innerHTML = `
          <div class="quests-container">
            <div class="quest-main-box">
              <h4><img src="assets/ui_icons/scroll.svg" class="hud-inline-icon" alt=""> 當前主線使命</h4>
              <p>${mainObjective}</p>
            </div>
            <h4 style="color: var(--pal-gold); margin-top: 4px;"><img src="assets/ui_icons/compass.svg" class="hud-inline-icon" alt=""> 九州奇遇錄（十二樁俠義支線）</h4>
            <div class="quest-grid">
              ${(PalX.SIDE_QUESTS || []).map((q) => {
                const isDone = !!f[q.doneFlag];
                const isProg = !!f[q.startFlag] && !isDone;
                const canTurnIn = isProg && ((q.readyItem && this.game.getItemCount(q.readyItem) > 0) || (q.readyFlag && !!f[q.readyFlag]));
                const statusBadge = isDone
                  ? `<span class="quest-badge done">已結義</span>`
                  : canTurnIn
                  ? `<span class="quest-badge ready">可交付</span>`
                  : isProg
                  ? `<span class="quest-badge prog">進行中</span>`
                  : `<span class="quest-badge unseen">未觸發</span>`;
                const cardClass = isDone ? 'done' : canTurnIn ? 'ready' : '';
                return `
                  <div class="quest-card ${cardClass}">
                    <div class="quest-card-head">
                      <b>${q.title}</b>
                      ${statusBadge}
                    </div>
                    <div style="font-size: 0.76rem; color: #80deea; margin-bottom: 3px;">【界域】${q.region} ｜ 【委託】${q.giver}</div>
                    <div class="quest-desc">${q.desc}</div>
                    <div class="quest-reward">【厚禮】${q.rewardText}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
        return;
      }

      // 仙樂鑑賞 (16 首原創古風樂章試聽)
      if (this.selectedMenuTab === 'music') {
        const curTrack = PalX.audio && PalX.audio.currentTrack;
        body.innerHTML = `
          <div class="music-container">
            <div class="quest-main-box">
              <h4><img src="assets/ui_icons/music.svg" class="hud-inline-icon" alt=""> 仙樂鑑賞 · 九州古韻</h4>
              <p>本作品採用 WebAudio 7 聲部民族樂器物理建模合成（竹笛、洞簫、二胡、古箏、琵琶、編鐘玉磬、堂鼓木魚），收錄 16 首原創長篇仙俠樂章。</p>
            </div>
            <div class="music-grid">
              ${(PalX.TRACK_LIST || []).map((t) => {
                const isPlaying = curTrack === t.id;
                return `
                  <div class="music-card ${isPlaying ? 'playing' : ''}">
                    <div class="music-card-info">
                      <b>${t.title || t.name || t.id}</b>
                      <span>${t.subtitle ? (t.subtitle + (t.mood ? " · " + t.mood : "")) : (t.desc || t.id)}</span>
                    </div>
                    <button class="pal-btn-sm" data-playtrack="${t.id}">${isPlaying ? '【奏響中】' : '【試聽】'}</button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
        body.querySelectorAll('[data-playtrack]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const tid = btn.getAttribute('data-playtrack');
            PalX.audio.playMusic(tid);
            this.renderMenuModal();
          });
        });
        return;
      }

      // 1. 九州錄 (隨時可從標題或遊戲內閱覽!)
      if (this.selectedMenuTab === 'lore') {
        body.innerHTML = `<div class="lore-container">` + PalX.LORE_CODEX.categories.map((cat) => `
          <div class="lore-section">
            <h3>${cat.title} <small>— ${cat.subtitle}</small></h3>
            ${cat.entries.map((e) => `
              <div class="lore-card">
                <div class="lore-card-head"><b>${e.title}</b><span>${e.era}</span></div>
                <blockquote class="lore-poem">${e.poem}</blockquote>
                ${e.body.map((p) => `<p>${p}</p>`).join('')}
              </div>
            `).join('')}
          </div>
        `).join('') + `</div>`;
        return;
      }

      // 2. 系統存讀檔
      if (this.selectedMenuTab === 'system') {
        const slots = ['auto', '1', '2', '3'];
        body.innerHTML = `
          <div class="sys-panel">
            <h3>宿命卷軸 · 存檔與讀取</h3>
            <div class="save-slots">
              ${slots.map((sid) => {
                const meta = this.game.getSlotMeta(sid);
                const label = sid === 'auto' ? '【自動存檔】' : `【卷軸 ${sid}】`;
                return `
                  <div class="save-slot-card">
                    <div>
                      <b>${label}</b>
                      ${meta ? `<p>${meta.chapter} ｜ ${meta.mapName}（修行 Lv.${meta.leaderLv}）</p><small>${new Date(meta.savedAt).toLocaleString()}</small>` : '<p class="muted">尚無紀錄</p>'}
                    </div>
                    <div class="slot-btns">
                      ${hasGame && !this.fromTitleModal && sid !== 'auto' ? `<button class="pal-btn-sm" data-save="${sid}">寫入存檔</button>` : ''}
                      ${meta ? `<button class="pal-btn-sm" data-load="${sid}">讀取進度</button>` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
            <div class="sys-export-bar">
              ${hasGame && !this.fromTitleModal ? `<button class="pal-btn-sm" id="btn-export-json">匯出存檔 JSON</button>` : ''}
              <button class="pal-btn-sm" id="btn-import-json">匯入存檔 JSON</button>
              ${hasGame && !this.fromTitleModal ? `<button class="pal-btn-sm danger" id="btn-back-title">返回標題畫面</button>` : ''}
            </div>
          </div>
        `;
        body.querySelectorAll('[data-save]').forEach((b) => {
          b.addEventListener('click', () => {
            const sid = b.getAttribute('data-save');
            this.game.saveToSlot(sid);
            PalX.audio.sfx('confirm');
            this.toast(`已寫入卷軸 ${sid}！`);
            this.renderMenuModal();
          });
        });
        body.querySelectorAll('[data-load]').forEach((b) => {
          b.addEventListener('click', () => {
            const sid = b.getAttribute('data-load');
            this.fromTitleModal = false;
            this.game.loadFromSlot(sid);
          });
        });
        const btnExp = document.getElementById('btn-export-json');
        if (btnExp) {
          btnExp.addEventListener('click', () => {
            const blob = new Blob([this.game.serializeSave()], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `pal-x-save-lv${this.game.state.heroes.luxiao.level}.json`;
            a.click();
          });
        }
        document.getElementById('btn-import-json').addEventListener('click', () => {
          const inp = document.createElement('input');
          inp.type = 'file';
          inp.accept = '.json,application/json';
          inp.onchange = () => {
            const file = inp.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              this.fromTitleModal = false;
              if (!this.game.importSaveJson(reader.result)) {
                this.toast('存檔格式無效！');
              }
            };
            reader.readAsText(file);
          };
          inp.click();
        });
        const btnTitle = document.getElementById('btn-back-title');
        if (btnTitle) {
          btnTitle.addEventListener('click', () => {
            this.closeModal();
            this.showTitleScreen();
          });
        }
        return;
      }

      if (!hasGame) return;
      const st = this.game.state;
      const hero = st.heroes[this.selectedHeroId] || st.heroes.luxiao;
      const eff = PalX.computeHeroStats(hero);

      // 3. 人物狀態
      if (this.selectedMenuTab === 'status') {
        const nextExp = PalX.expForNextLevel(hero.level);
        const traits = [];
        if (eff.doubleHit) traits.push('普通攻擊【二連擊】');
        if (eff.splashAll) traits.push('普通攻擊【橫掃敵全體】');
        if (eff.poisonHit) traits.push('普攻淬毒');
        if (hero.id === 'luxiao') traits.push(`酒神剩餘次數：${9 - st.wineGodUses}/9`);

        body.innerHTML = `
          ${this.renderHeroSelectorBar()}
          <div class="status-grid">
            <div class="status-left">
              <canvas id="status-portrait" width="120" height="120"></canvas>
              <h4>${hero.name} <small>（${hero.courtesy} · ${hero.title}）</small></h4>
              <blockquote class="hero-poem">${hero.poem.replace(/\n/g, '<br>')}</blockquote>
              <p class="hero-bio">${hero.bio}</p>
            </div>
            <div class="status-right">
              <div class="stat-box"><span>修行等級</span><b>第 ${hero.level} 重</b></div>
              <div class="stat-box"><span>歷練經驗</span><b>${hero.exp} / ${nextExp}</b></div>
              <div class="stat-box hp"><span>體力上限</span><b>${hero.hp} / ${eff.maxHp}</b></div>
              <div class="stat-box mp"><span>真氣上限</span><b>${hero.mp} / ${eff.maxMp}</b></div>
              <div class="stat-box"><span>武術 (物攻)</span><b>${eff.atk}</b></div>
              <div class="stat-box"><span>靈力 (仙術)</span><b>${eff.mag}</b></div>
              <div class="stat-box"><span>防禦 (護體)</span><b>${eff.def}</b></div>
              <div class="stat-box"><span>身法 (速度)</span><b>${eff.spd}</b></div>
              <div class="stat-box"><span>吉運 (暴擊/格擋/偷竊)</span><b>${eff.lck}</b></div>
              <div class="stat-box"><span>異常狀態</span><b>${hero.poison ? '中毒（請儘速解毒）' : '氣血清朗'}</b></div>
              <div class="trait-list">${traits.map((t) => `<span class="trait-chip">${t}</span>`).join('')}</div>
            </div>
          </div>
        `;
        this.bindHeroSelectorEvents(body);
        PalX.graphics.drawPortrait(document.getElementById('status-portrait'), hero.id);
        return;
      }

      // 4. 仙術列表與非戰鬥療傷施法
      if (this.selectedMenuTab === 'magic') {
        body.innerHTML = `
          ${this.renderHeroSelectorBar()}
          <p class="sub-hint">${hero.name} 當前真氣：<b>${hero.mp} / ${eff.maxMp}</b>（療傷與解毒仙術可於地圖直接施展）</p>
          <div class="card-list">
            ${hero.skills.map((sid) => {
              const sk = PalX.SKILLS[sid];
              const elem = PalX.ELEMENTS[sk.elem] || PalX.ELEMENTS.none;
              return `
                <div class="item-row">
                  <div>
                    <span class="elem-badge" style="color:${elem.color}">[${elem.name}]</span>
                    <b>${sk.name}</b> <small>（耗真氣 ${sk.mp}）</small>
                    <p>${sk.desc}</p>
                  </div>
                  ${sk.usableInField ? `<button class="pal-btn-sm" data-castfield="${sk.id}">施展</button>` : '<span class="muted-tag">戰鬥專用</span>'}
                </div>
              `;
            }).join('')}
          </div>
        `;
        this.bindHeroSelectorEvents(body);
        body.querySelectorAll('[data-castfield]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const skid = btn.getAttribute('data-castfield');
            const res = this.game.castFieldSkill(hero.id, skid, hero.id);
            this.toast(res.msg);
            this.renderMenuModal();
            this.updateTopHud();
          });
        });
        return;
      }

      // 5. 行囊物品
      if (this.selectedMenuTab === 'items') {
        const invKeys = Object.keys(st.inventory).filter((k) => st.inventory[k] > 0 && PalX.ITEMS[k]);
        body.innerHTML = `
          ${this.renderHeroSelectorBar()}
          <p class="sub-hint">選擇上方角色作為單體仙藥／靈果的服用對象（目前對象：<b>${hero.name}</b>）</p>
          <div class="card-list">
            ${invKeys.length ? invKeys.map((id) => {
              const it = PalX.ITEMS[id];
              const cnt = st.inventory[id];
              return `
                <div class="item-row">
                  <div>
                    <b>${it.name}</b> <small>×${cnt}</small>
                    <p>${it.desc}</p>
                  </div>
                  ${it.usableInField ? `<button class="pal-btn-sm" data-useitem="${it.id}">使用</button>` : ''}
                </div>
              `;
            }).join('') : '<p class="empty-tip">行囊空空如也。</p>'}
          </div>
        `;
        this.bindHeroSelectorEvents(body);
        body.querySelectorAll('[data-useitem]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const itid = btn.getAttribute('data-useitem');
            const res = this.game.useFieldItem(itid, hero.id);
            this.toast(res.msg);
            if (res.closeMenu) this.closeModal();
            else {
              this.renderMenuModal();
              this.updateTopHud();
            }
          });
        });
        return;
      }

      // 6. 六部位裝備欄
      if (this.selectedMenuTab === 'equip') {
        const livingParty = st.activeParty.map((id) => st.heroes[id]);
        const coop = PalX.resolveCoopSkill(livingParty);
        const bagEquips = Object.keys(st.inventory)
          .filter((id) => st.inventory[id] > 0 && PalX.ITEMS[id] && PalX.ITEMS[id].category === 'equip')
          .map((id) => PalX.ITEMS[id])
          .filter((it) => !it.who || it.who.includes(hero.id));

        body.innerHTML = `
          ${this.renderHeroSelectorBar()}
          <div class="equip-layout">
            <div class="equip-slots-panel">
              <h4>${hero.name} · 六部位披掛</h4>
              ${PalX.EQUIP_SLOTS.map((s) => {
                const eqId = hero.equip[s.id];
                const eqItem = eqId ? PalX.ITEMS[eqId] : null;
                return `
                  <div class="equip-slot-row">
                    <span class="slot-label">${s.name}</span>
                    <b>${eqItem ? eqItem.name : '— 未裝備 —'}</b>
                    ${eqItem ? `<button class="pal-btn-xs" data-unequip="${s.id}">卸下</button>` : ''}
                  </div>
                `;
              }).join('')}
              <div class="coop-preview-box">
                當前隊伍【合擊】招式：<b>${coop ? coop.name : '（需至少2人出戰）'}</b>
                ${coop ? `<p>${coop.desc}</p>` : ''}
              </div>
            </div>
            <div class="equip-bag-panel">
              <h4>可穿戴裝備與靈珠</h4>
              <div class="card-list">
                ${bagEquips.length ? bagEquips.map((it) => `
                  <div class="item-row">
                    <div>
                      <b>${it.name}</b> <small>[${PalX.EQUIP_SLOTS.find((x) => x.id === it.slot).name}] ×${st.inventory[it.id]}</small>
                      <p>${it.desc}</p>
                    </div>
                    <button class="pal-btn-sm" data-doequip="${it.id}">裝備</button>
                  </div>
                `).join('') : '<p class="empty-tip">行囊中無其他適用裝備。</p>'}
              </div>
            </div>
          </div>
        `;
        this.bindHeroSelectorEvents(body);
        body.querySelectorAll('[data-unequip]').forEach((btn) => {
          btn.addEventListener('click', () => {
            this.game.unequipSlot(hero.id, btn.getAttribute('data-unequip'));
            this.renderMenuModal();
          });
        });
        body.querySelectorAll('[data-doequip]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const res = this.game.equipItem(hero.id, btn.getAttribute('data-doequip'));
            this.toast(res.msg);
            this.renderMenuModal();
          });
        });
        return;
      }

      // 7. 百草丹鼎合煉系統
      if (this.selectedMenuTab === 'gu') {
        const unlocked = this.game.hasItemOrEquipped('liangumin') || st.flags.aman_joined;
        if (!unlocked) {
          body.innerHTML = `<div class="empty-tip">尚未獲得苗疆秘寶【煉蠱皿】。<br>推進劇情至第四章【南詔白苗聖姑谷】，白苗少主雲珞入隊時即會贈予！</div>`;
          return;
        }
        const materials = Object.keys(st.inventory)
          .filter((id) => st.inventory[id] > 0 && PalX.ITEMS[id] && ['medicine', 'elixir', 'throw'].includes(PalX.ITEMS[id].category))
          .map((id) => ({ item: PalX.ITEMS[id], count: st.inventory[id] }));

        if (this.guSlotA && this.game.getItemCount(this.guSlotA) <= 0) this.guSlotA = null;
        if (this.guSlotB && this.game.getItemCount(this.guSlotB) <= 0) this.guSlotB = null;

        const nameA = this.guSlotA ? PalX.ITEMS[this.guSlotA].name : '點擊下方選擇藥引甲';
        const nameB = this.guSlotB ? PalX.ITEMS[this.guSlotB].name : '點擊下方選擇藥引乙';

        body.innerHTML = `
          <div class="gu-panel">
            <div class="gu-cauldron">
              <div class="gu-slot ${this.guSlotA ? 'filled' : ''}" id="gu-clear-a"><span>藥引甲</span><b>${nameA}</b></div>
              <div class="gu-plus">＋</div>
              <div class="gu-slot ${this.guSlotB ? 'filled' : ''}" id="gu-clear-b"><span>藥引乙</span><b>${nameB}</b></div>
              <button class="pal-btn" id="btn-gu-craft" ${(!this.guSlotA || !this.guSlotB) ? 'disabled' : ''}>開皿合煉</button>
            </div>
            <p class="sub-hint">秘方提示：【赤蠍毒砂/無影毒/五毒蠱卵 ＋ 化屍水 → 隱蠱】、【雪蛤蟆 ＋ 試煉果 → 金蠶王】、【止血草 ＋ 鼠兒果 → 行軍丹】</p>
            <div class="gu-cols">
              <div class="card-list">
                ${materials.map(({ item, count }) => `
                  <div class="item-row">
                    <div><b>${item.name}</b> <small>×${count}</small><p>${item.desc}</p></div>
                    <button class="pal-btn-sm" data-pickgu="${item.id}">投入</button>
                  </div>
                `).join('')}
              </div>
              <div class="gu-recipes-log">
                <h4>已領悟丹方紀錄</h4>
                ${st.discoveredRecipes.length ? st.discoveredRecipes.map((r) => `<p>【玄方】${r}</p>`).join('') : '<p class="muted">尚無煉化紀錄，快投入兩種藥材試試！</p>'}
              </div>
            </div>
          </div>
        `;
        document.getElementById('gu-clear-a').addEventListener('click', () => { this.guSlotA = null; this.renderMenuModal(); });
        document.getElementById('gu-clear-b').addEventListener('click', () => { this.guSlotB = null; this.renderMenuModal(); });
        body.querySelectorAll('[data-pickgu]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-pickgu');
            if (!this.guSlotA) this.guSlotA = id;
            else this.guSlotB = id;
            PalX.audio.sfx('cursor');
            this.renderMenuModal();
          });
        });
        document.getElementById('btn-gu-craft').addEventListener('click', () => {
          const res = this.game.performGuAlchemy(this.guSlotA, this.guSlotB);
          this.toast(res.msg);
          this.renderMenuModal();
        });
      }
    }

    // =========================================================================
    // 藥鋪 / 鐵匠鋪 / 當鋪買賣介面
    // =========================================================================
    openShop(shopData, mode) {
      this.currentShop = shopData;
      this.shopMode = mode || 'buy';
      this.game.modalActive = true;
      document.getElementById('shop-modal').classList.remove('hidden');
      this.renderShop();
    }

    renderShop() {
      const shop = this.currentShop;
      const st = this.game.state;
      document.getElementById('shop-title').textContent = `${shop.name}（持有：${st.gold} 文錢）`;
      const body = document.getElementById('shop-body');

      const tabHtml = `
        <div class="hero-tabs">
          <button class="hero-tab-btn ${this.shopMode === 'buy' ? 'active' : ''}" id="shop-tab-buy">購買商品</button>
          <button class="hero-tab-btn ${this.shopMode === 'sell' ? 'active' : ''}" id="shop-tab-sell">典當出售（六折）</button>
        </div>
      `;

      if (this.shopMode === 'buy') {
        body.innerHTML = tabHtml + `<div class="card-list">` + shop.items.map((id) => {
          const it = PalX.ITEMS[id];
          const owned = this.game.getItemCount(id);
          return `
            <div class="item-row">
              <div>
                <b>${it.name}</b> <small>單價 ${it.price} 文 ｜ 已持有 ${owned}</small>
                <p>${it.desc}</p>
              </div>
              <button class="pal-btn-sm" data-buy="${it.id}" ${st.gold < it.price ? 'disabled' : ''}>購買</button>
            </div>
          `;
        }).join('') + `</div>`;
      } else {
        const sellables = Object.keys(st.inventory)
          .filter((id) => st.inventory[id] > 0 && PalX.ITEMS[id] && PalX.ITEMS[id].price > 0 && PalX.ITEMS[id].category !== 'key' && id !== 'mujian')
          .map((id) => ({ item: PalX.ITEMS[id], count: st.inventory[id] }));
        body.innerHTML = tabHtml + `<div class="card-list">` + (sellables.length ? sellables.map(({ item, count }) => {
          const sellPrice = Math.max(5, Math.floor(item.price * 0.6));
          return `
            <div class="item-row">
              <div>
                <b>${item.name}</b> <small>典當價 ${sellPrice} 文 ｜ 持有 ×${count}</small>
                <p>${item.desc}</p>
              </div>
              <button class="pal-btn-sm" data-sell="${item.id}">出售</button>
            </div>
          `;
        }).join('') : '<p class="empty-tip">行囊中無可典當之閒置物品（劇情信物與家傳木劍不可典當）。</p>') + `</div>`;
      }

      document.getElementById('shop-tab-buy').addEventListener('click', () => { this.shopMode = 'buy'; this.renderShop(); });
      document.getElementById('shop-tab-sell').addEventListener('click', () => { this.shopMode = 'sell'; this.renderShop(); });

      body.querySelectorAll('[data-buy]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const it = PalX.ITEMS[btn.getAttribute('data-buy')];
          if (st.gold >= it.price) {
            st.gold -= it.price;
            this.game.addItem(it.id, 1);
            PalX.audio.sfx('item');
            this.toast(`購得【${it.name}】！`);
            this.renderShop();
            this.updateTopHud();
          }
        });
      });

      body.querySelectorAll('[data-sell]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const it = PalX.ITEMS[btn.getAttribute('data-sell')];
          const sellPrice = Math.max(5, Math.floor(it.price * 0.6));
          this.game.addItem(it.id, -1);
          st.gold += sellPrice;
          PalX.audio.sfx('confirm');
          this.toast(`典當【${it.name}】獲得 ${sellPrice} 文錢。`);
          this.renderShop();
          this.updateTopHud();
        });
      });
    }

    // =========================================================================
    // 終局通關畫面與輕量提示 Toast
    // =========================================================================
    showEndingScreen(ending) {
      const st = this.game.state;
      const el = document.getElementById('ending-overlay');
      const mins = Math.max(1, Math.round((st.playTimeSec || 60) / 60));
      document.getElementById('ending-badge').textContent = ending.badge;
      document.getElementById('ending-title').textContent = ending.title;
      document.getElementById('ending-poem').innerHTML = ending.poem.split('\n').map((l) => `<p>${l}</p>`).join('');
      document.getElementById('ending-stats').innerHTML = `
        <span>陸逍修行：第 ${st.heroes.luxiao.level} 重</span>
        <span>宿命記憶碎片：${this.game.getItemCount('memory_shard')} 枚</span>
        <span>領悟丹方：${st.discoveredRecipes.length} 種</span>
        <span>歷練時光：約 ${mins} 分鐘</span>
      `;
      el.classList.remove('hidden');

      document.getElementById('btn-ending-roam').onclick = () => {
        el.classList.add('hidden');
        this.game.fullRestoreParty();
        this.updateTopHud();
        this.toast('可自由探索各章節地圖或嘗試不同結局條件！');
      };
      document.getElementById('btn-ending-title').onclick = () => {
        el.classList.add('hidden');
        this.showTitleScreen();
      };
    }

    toast(msg) {
      const wrap = document.getElementById('toast-container');
      if (!wrap) return;
      wrap.innerHTML = '';
      const div = document.createElement('div');
      div.className = 'pal-toast';
      div.textContent = msg;
      wrap.appendChild(div);
      setTimeout(() => {
        div.classList.add('fade-out');
        setTimeout(() => div.remove(), 260);
      }, 2100);
    }
  }

  PalX.UIController = UIController;
})(typeof window !== 'undefined' ? window : globalThis);
