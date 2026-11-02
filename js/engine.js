(function (root) {
  'use strict';

  const PalX = (root.PalX = root.PalX || {});

  const SAVE_KEY_PREFIX = 'palx_mist_save_v1_';

  class GameEngine {
    constructor(opts) {
      opts = opts || {};
      this.headless = !!opts.headless;
      this.canvas = opts.canvas || null;
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.ui = null;
      this.time = 0;
      this.camX = 0;
      this.camY = 0;
      this.playerPos = { x: 3, y: 3 };
      this.renderPlayer = { x: 3, y: 3 };
      this.stepAnim = { active: false, fromX: 3, fromY: 3, toX: 3, toY: 3, elapsed: 0, duration: 0.13 };
      this.walkPhase = 0;
      this.footsteps = [];
      this.facingLeft = false;
      this.trail = [];
      this.movePath = [];
      this.moveTarget = null;
      this.pendingInteractObj = null;
      this.stepCooldown = 0;
      this.interactCooldown = 0;
      this.isMoving = false;
      this.sprintToggle = false;
      this.virtualSteerVec = { x: 0, y: 0 };
      this.pointerSteerVec = { x: 0, y: 0 };
      this.hoverTile = null;
      this.hoverObj = null;
      this.activeMapEnemies = [];
      this.keysDown = {};
      this.state = null;
      this.battle = new PalX.BattleManager(this);
      this.dialogueActive = false;
      this.modalActive = false;
      this.autoSaveTimer = 0;
    }

    initNewGameState() {
      const heroes = {
        luxiao: PalX.createHeroInstance('luxiao'),
        lingxi: PalX.createHeroInstance('lingxi'),
        yueling: PalX.createHeroInstance('yueling'),
        aman: PalX.createHeroInstance('aman')
      };

      this.state = {
        version: 1,
        playTimeSec: 0,
        mapId: 'linan_inn',
        x: 3,
        y: 3,
        gold: 260,
        wineGodUses: 0,
        unlockedHeroes: ['luxiao'],
        activeParty: ['luxiao'],
        heroes,
        inventory: {
          zhixuecao: 4,
          shuerguo: 2,
          chixuecan: 1,
          meihuabiao: 2
        },
        flags: {},
        searched: {},
        clickCounts: {},
        discoveredRecipes: []
      };

      this.loadMap('linan_inn', 3, 3, true);
    }

    startNewGame() {
      this.initNewGameState();
      if (this.ui) {
        this.ui.hideTitleScreen();
        this.ui.updateTopHud();
        this.ui.playPoetryScroll(PalX.OPENING_SCENE.poemTitle, PalX.OPENING_SCENE.poem, () => {
          this.ui.startDialogue(PalX.OPENING_SCENE.lines);
        });
      }
    }

    // =========================================================================
    // 物品與裝備管理
    // =========================================================================
    addItem(itemId, delta) {
      if (!PalX.ITEMS[itemId]) return;
      const cur = this.state.inventory[itemId] || 0;
      const next = Math.max(0, cur + delta);
      if (next === 0) delete this.state.inventory[itemId];
      else this.state.inventory[itemId] = next;
    }

    getItemCount(itemId) {
      return this.state.inventory[itemId] || 0;
    }

    hasItemOrEquipped(itemId) {
      if (this.getItemCount(itemId) > 0) return true;
      for (const hid of Object.keys(this.state.heroes)) {
        const eq = this.state.heroes[hid].equip || {};
        for (const s of Object.keys(eq)) {
          if (eq[s] === itemId) return true;
        }
      }
      return false;
    }

    equipItem(heroId, itemId) {
      const hero = this.state.heroes[heroId];
      const item = PalX.ITEMS[itemId];
      if (!hero || !item || item.category !== 'equip') return { ok: false, msg: '無法裝備此物品。' };
      if (item.who && !item.who.includes(heroId)) return { ok: false, msg: `${hero.name}無法使用【${item.name}】。` };
      if (this.getItemCount(itemId) <= 0) return { ok: false, msg: '行囊中無此裝備。' };

      const oldId = hero.equip[item.slot];
      this.addItem(itemId, -1);
      if (oldId) this.addItem(oldId, 1);
      hero.equip[item.slot] = itemId;

      const eff = PalX.computeHeroStats(hero);
      hero.hp = Math.min(hero.hp, eff.maxHp);
      hero.mp = Math.min(hero.mp, eff.maxMp);
      PalX.audio.sfx('confirm');
      return { ok: true, msg: `${hero.name}已裝備【${item.name}】！` };
    }

    unequipSlot(heroId, slot) {
      const hero = this.state.heroes[heroId];
      if (!hero || !hero.equip[slot]) return;
      const oldId = hero.equip[slot];
      hero.equip[slot] = null;
      this.addItem(oldId, 1);
      const eff = PalX.computeHeroStats(hero);
      hero.hp = Math.min(hero.hp, eff.maxHp);
      hero.mp = Math.min(hero.mp, eff.maxMp);
      PalX.audio.sfx('cursor');
    }

    useFieldItem(itemId, targetHeroId) {
      const item = PalX.ITEMS[itemId];
      if (!item || !item.usableInField) return { ok: false, msg: '此物品需在戰鬥或特定場合使用。' };

      // 土靈珠可裝備或背包直接使用脫出迷宮
      const isEquippedRelic = item.id === 'tulingzhu' && this.hasItemOrEquipped('tulingzhu');
      if (!isEquippedRelic && this.getItemCount(itemId) <= 0) {
        return { ok: false, msg: '數量不足。' };
      }

      if (item.escapeMaze) {
        const map = PalX.MAPS[this.state.mapId];
        if (!map || !map.enemies || map.enemies.length === 0) {
          return { ok: false, msg: '目前身處安全城鎮，無需脫出迷宮。' };
        }
        if (!isEquippedRelic) this.addItem(itemId, -1);
        this.teleport(map.id, map.spawn.x, map.spawn.y);
        PalX.audio.sfx('magic');
        return { ok: true, closeMenu: true, msg: `施展【${item.name}】，瞬間返回迷宮入口！` };
      }

      this.addItem(itemId, -1);
      const targets = item.target === 'allAllies'
        ? this.state.activeParty.map((id) => this.state.heroes[id])
        : [this.state.heroes[targetHeroId || this.state.activeParty[0]]];

      if (item.levelUp) {
        const h = targets[0];
        const learned = PalX.levelUpHeroOnce(h);
        PalX.audio.sfx('levelup');
        return { ok: true, msg: `${h.name}服下【金蠶王】，修行升至第 ${h.level} 重！${learned.length ? '領悟：' + learned.join('、') : ''}` };
      }

      if (item.permStat) {
        const h = targets[0];
        for (const k of Object.keys(item.permStat)) {
          h.permBonus[k] = (h.permBonus[k] || 0) + item.permStat[k];
          const eff = PalX.computeHeroStats(h);
          if (k === 'maxHp') h.hp = Math.min(eff.maxHp, h.hp + item.permStat[k]);
          if (k === 'maxMp') h.mp = Math.min(eff.maxMp, h.mp + item.permStat[k]);
        }
        PalX.audio.sfx('item');
        return { ok: true, msg: `${h.name}服下【${item.name}】，屬性永久提升！` };
      }

      for (const h of targets) {
        const eff = PalX.computeHeroStats(h);
        if (item.hpPct) h.hp = Math.floor(eff.maxHp * item.hpPct);
        if (item.hp) h.hp = Math.min(eff.maxHp, h.hp + item.hp);
        if (item.mpPct) h.mp = Math.min(eff.maxMp, h.mp + Math.floor(eff.maxMp * item.mpPct));
        if (item.mp) h.mp = Math.min(eff.maxMp, h.mp + item.mp);
        if (item.curePoison) h.poison = null;
        if (item.cureStatus) h.stun = 0;
      }
      PalX.audio.sfx('heal');
      return { ok: true, msg: `使用了【${item.name}】。` };
    }

    castFieldSkill(casterId, skillId, targetHeroId) {
      const caster = this.state.heroes[casterId];
      const sk = PalX.SKILLS[skillId];
      if (!caster || !sk || !sk.usableInField) return { ok: false, msg: '此仙術僅限戰鬥中施展。' };
      if (caster.mp < sk.mp) return { ok: false, msg: '真氣不足！' };

      caster.mp -= sk.mp;
      const ceff = PalX.computeHeroStats(caster);
      const targets = sk.target === 'allAllies'
        ? this.state.activeParty.map((id) => this.state.heroes[id])
        : [this.state.heroes[targetHeroId || casterId]];

      for (const h of targets) {
        const heff = PalX.computeHeroStats(h);
        if (sk.type === 'revive') {
          h.hp = Math.max(h.hp, Math.floor(heff.maxHp * (sk.hpPct || 0.5)));
        } else {
          const heal = Math.floor((sk.power || 80) + ceff.mag * 1.4);
          h.hp = Math.min(heff.maxHp, h.hp + heal);
        }
        if (sk.type === 'cleanse') {
          h.poison = null;
          h.stun = 0;
        }
      }
      PalX.audio.sfx('heal');
      return { ok: true, msg: `${caster.name}施展【${sk.name}】，隊伍煥然一新。` };
    }

    performGuAlchemy(itemA, itemB) {
      if (!this.hasItemOrEquipped('liangumin') && !this.state.flags.aman_joined) {
        return { ok: false, msg: '尚未取得苗疆奇寶【煉蠱皿】（第四章白苗少主藍阿蠻入隊解鎖）！' };
      }
      if (itemA === itemB && this.getItemCount(itemA) < 2) {
        return { ok: false, msg: '同種藥材合煉至少需要 2 份！' };
      }
      if (this.getItemCount(itemA) < 1 || this.getItemCount(itemB) < 1) {
        return { ok: false, msg: '投入材料數量不足！' };
      }
      const product = PalX.craftGu(itemA, itemB);
      if (!product) {
        return { ok: false, msg: '武器裝備與劇情信物不可投入煉蠱皿。' };
      }
      this.addItem(itemA, -1);
      this.addItem(itemB, -1);
      this.addItem(product.id, 1);
      const recStr = `${PalX.ITEMS[itemA].name} + ${PalX.ITEMS[itemB].name} ➔ ${product.name}`;
      if (!this.state.discoveredRecipes.includes(recStr)) {
        this.state.discoveredRecipes.unshift(recStr);
      }
      PalX.audio.sfx('item');
      return { ok: true, product, msg: `紫氣升騰！煉蠱皿成功煉出【${product.name}】！` };
    }

    fullRestoreParty() {
      for (const hid of Object.keys(this.state.heroes)) {
        const h = this.state.heroes[hid];
        const eff = PalX.computeHeroStats(h);
        h.hp = eff.maxHp;
        h.mp = eff.maxMp;
        h.poison = null;
        h.stun = 0;
      }
    }

    // =========================================================================
    // 地圖載入、8向平滑碰撞滑牆、A*尋路與毛毛蟲跟隨隊列
    // =========================================================================
    loadMap(mapId, x, y, snapCam) {
      const map = PalX.MAPS[mapId];
      if (!map) return;
      this.state.mapId = mapId;
      const sx = x != null ? x : map.spawn.x;
      const sy = y != null ? y : map.spawn.y;
      this.state.x = sx;
      this.state.y = sy;
      this.playerPos = { x: sx, y: sy };
      this.renderPlayer = { x: sx, y: sy };
      this.stepAnim = { active: false, fromX: sx, fromY: sy, toX: sx, toY: sy, elapsed: 0, duration: 0.13 };
      this.stepCooldown = 0;
      this.footsteps = [];
      this.trail = [
        { x: sx, y: sy, rx: sx, ry: sy, fromX: sx, fromY: sy, facingLeft: this.facingLeft },
        { x: sx, y: sy, rx: sx, ry: sy, fromX: sx, fromY: sy, facingLeft: this.facingLeft },
        { x: sx, y: sy, rx: sx, ry: sy, fromX: sx, fromY: sy, facingLeft: this.facingLeft },
        { x: sx, y: sy, rx: sx, ry: sy, fromX: sx, fromY: sy, facingLeft: this.facingLeft }
      ];
      this.movePath = [];
      this.moveTarget = null;
      this.pendingInteractObj = null;
      this.pointerSteerVec = { x: 0, y: 0 };

      this.activeMapEnemies = (map.enemies || []).map((e) => ({
        id: e.id,
        enemyGroup: e.enemyGroup.slice(),
        x: e.x,
        y: e.y,
        rx: e.x,
        ry: e.y,
        fromX: e.x,
        fromY: e.y,
        stepElapsed: 0,
        stepDur: 0.34,
        patrol: e.patrol || [],
        patrolIdx: 0,
        moveTimer: 1.1 + Math.random() * 0.7,
        defeated: false
      }));

      if (snapCam) {
        const isoX = (sx - sy) * (PalX.graphics.TILE_W / 2);
        const isoY = (sx + sy) * (PalX.graphics.TILE_H / 2);
        this.camX = isoX;
        this.camY = isoY;
      }

      PalX.audio.playMusic(map.music);
      if (this.ui) this.ui.updateTopHud();
    }

    teleport(mapId, x, y) {
      const map = PalX.MAPS[mapId];
      if (!map) return;
      this.loadMap(mapId, x, y, true);
      this.interactCooldown = 0.32;
      if (this.ui) {
        this.ui.toast(`抵達【${map.name}】`);
      }
    }

    isTileWalkable(map, gx, gy, ignoreObjects) {
      if (!map) return false;
      if (gy < 0 || gy >= map.grid.length || gx < 0 || gx >= map.grid[0].length) return false;
      const ch = map.grid[gy][gx];
      if (ch === '#' || ch === '~' || ch === 'T') return false;
      if (ch === 'G') {
        const open = map.gateFlag ? !!this.state.flags[map.gateFlag] : true;
        if (!open) return false;
      }
      if (!ignoreObjects) {
        for (const obj of map.objects) {
          if (obj.requireFlag && !this.state.flags[obj.requireFlag]) continue;
          if (obj.hideFlag && this.state.flags[obj.hideFlag]) continue;
          if (obj.x === gx && obj.y === gy && obj.type !== 'portal') return false;
        }
      }
      return true;
    }

    findObjectAt(map, gx, gy) {
      if (!map) return null;
      for (const obj of map.objects) {
        if (obj.requireFlag && !this.state.flags[obj.requireFlag]) continue;
        if (obj.hideFlag && this.state.flags[obj.hideFlag]) continue;
        if (obj.x === gx && obj.y === gy) return obj;
      }
      return null;
    }

    canStepDelta(map, fx, fy, dx, dy) {
      if (!map) return false;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1 || (dx === 0 && dy === 0)) return false;
      const nx = fx + dx;
      const ny = fy + dy;
      if (!this.isTileWalkable(map, nx, ny, false)) return false;

      // 斜向對角步進時，兩側正交鄰格亦須可通行且非傳送點，防止斜切穿牆、越水或擦邊誤觸傳送門
      if (dx !== 0 && dy !== 0) {
        if (!this.isTileWalkable(map, fx + dx, fy, false)) return false;
        if (!this.isTileWalkable(map, fx, fy + dy, false)) return false;
        const o1 = this.findObjectAt(map, fx + dx, fy);
        const o2 = this.findObjectAt(map, fx, fy + dy);
        if ((o1 && o1.type === 'portal') || (o2 && o2.type === 'portal')) return false;
      }
      return true;
    }

    isBumpInteractable(obj) {
      if (!obj || obj.type === 'portal') return false;
      if ((obj.type === 'chest' || obj.type === 'barrel' || obj.type === 'jar') && this.state.searched[obj.id]) {
        return false;
      }
      if (obj.type === 'statue' && obj.flag && this.state.flags[obj.flag]) {
        return false;
      }
      if (obj.type === 'switch') {
        const f = this.state.flags;
        const alreadyOn =
          (obj.flag && f[obj.flag]) ||
          (obj.interaction === 'serpent_switch' && f.serpent_gate_open) ||
          (obj.interaction === 'qilin_switch' && f.qilin_gate_open) ||
          (obj.interaction === 'mist_switch' && f.rift_gate_open) ||
          (obj.interaction === 'abyss_five_pearls_altar' && f.abyss_seal_open);
        if (alreadyOn) return false;
      }
      return true;
    }

    getStepDuration(dx, dy) {
      const sprint = !!(this.sprintToggle || this.keysDown.ShiftLeft || this.keysDown.ShiftRight);
      const base = sprint ? 0.094 : 0.132;
      // 螢幕純橫向對角步 ((-1,1) 或 (1,-1)) 在 2:1 等距投影下螢幕跨距較長，微調時間使視覺移速恆定
      const isWideHoriz = (dx !== 0 && dy !== 0 && dx !== dy);
      return isWideHoriz ? base * 1.35 : base;
    }

    resolveScreenDirectionStep(svx, svy, overshootDt) {
      const len = Math.hypot(svx, svy);
      if (len < 0.14) return { moved: false, dur: 0 };
      const map = PalX.MAPS[this.state.mapId];
      if (!map) return { moved: false, dur: 0 };

      const nsx = svx / len;
      const nsy = svy / len;
      const halfW = (PalX.graphics && PalX.graphics.TILE_W ? PalX.graphics.TILE_W : 68) / 2;
      const halfH = (PalX.graphics && PalX.graphics.TILE_H ? PalX.graphics.TILE_H : 34) / 2;

      const rawDirs = [
        { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 }, { dx: 1, dy: 0 },
        { dx: 1, dy: 1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 1 }, { dx: -1, dy: 0 }
      ];

      const candidates = rawDirs.map((d) => {
        const ix = (d.dx - d.dy) * halfW;
        const iy = (d.dx + d.dy) * halfH;
        const ilen = Math.hypot(ix, iy) || 1;
        const dot = (ix / ilen) * nsx + (iy / ilen) * nsy;
        const sameFacing = ((d.dx - d.dy) < 0) === this.facingLeft ? 0.002 : 0;
        return { dx: d.dx, dy: d.dy, dot, score: dot + sameFacing };
      }).filter((c) => c.dot >= 0.36).sort((a, b) => b.score - a.score);

      if (!candidates.length) return { moved: false, dur: 0 };

      const fx = this.playerPos.x;
      const fy = this.playerPos.y;

      // 1. 若玩家正對著未搜刮寶箱 / NPC / 首領直推，直接面向並互動
      const primary = candidates[0];
      if (primary.dot >= 0.86 && this.interactCooldown <= 0) {
        const pObj = this.findObjectAt(map, fx + primary.dx, fy + primary.dy);
        if (this.isBumpInteractable(pObj)) {
          if (primary.dx - primary.dy !== 0) this.facingLeft = (primary.dx - primary.dy) < 0;
          this.interactCooldown = 0.42;
          this.interactWithObject(pObj);
          return { moved: false, interacted: true, dur: 0.16 };
        }
      }

      // 2. 優先選擇最貼合螢幕方向且可行走之方向；若正前方受45度斜牆/河岸阻擋則自動沿走廊順暢滑行
      for (const c of candidates) {
        if (this.canStepDelta(map, fx, fy, c.dx, c.dy)) {
          const dur = this.getStepDuration(c.dx, c.dy);
          const ok = this.tryStep(c.dx, c.dy, { duration: dur, overshoot: overshootDt || 0, fromSteer: true });
          if (ok) return { moved: true, dur };
        }
      }

      // 3. 若前方與兩側滑牆皆受阻（如角落酒罈、橋頭石像），檢查是否有可互動物件
      if (this.interactCooldown <= 0) {
        for (const c of candidates) {
          if (c.dot < 0.42) continue;
          const bObj = this.findObjectAt(map, fx + c.dx, fy + c.dy);
          if (this.isBumpInteractable(bObj)) {
            if (c.dx - c.dy !== 0) this.facingLeft = (c.dx - c.dy) < 0;
            this.interactCooldown = 0.42;
            this.interactWithObject(bObj);
            return { moved: false, interacted: true, dur: 0.16 };
          }
        }
      }

      return { moved: false, dur: 0 };
    }

    findPathBFS(startX, startY, goalX, goalY) {
      const map = PalX.MAPS[this.state.mapId];
      if (!map) return [];
      if (startX === goalX && startY === goalY) return [];

      const targetObj = this.findObjectAt(map, goalX, goalY);
      const allowGoalAdjacent = targetObj && targetObj.type !== 'portal';

      if (!allowGoalAdjacent && !this.isTileWalkable(map, goalX, goalY, false)) {
        return [];
      }

      const dirs = [
        { dx: 0, dy: -1, cost: 1.0 },
        { dx: 0, dy: 1, cost: 1.0 },
        { dx: -1, dy: 0, cost: 1.0 },
        { dx: 1, dy: 0, cost: 1.0 },
        { dx: -1, dy: -1, cost: 1.36 },
        { dx: 1, dy: 1, cost: 1.36 },
        { dx: -1, dy: 1, cost: 1.36 },
        { dx: 1, dy: -1, cost: 1.36 }
      ];

      const startKey = `${startX},${startY}`;
      const bestCost = new Map([[startKey, 0]]);
      const open = [{ x: startX, y: startY, g: 0, f: 0, path: [] }];

      while (open.length > 0) {
        // 取最小 f 值節點 (16x16 地圖極小，輕量陣列佇列即可於 <0.1ms 完成 8 向最短路徑)
        let bestIdx = 0;
        for (let i = 1; i < open.length; i++) {
          if (open[i].f < open[bestIdx].f) bestIdx = i;
        }
        const cur = open.splice(bestIdx, 1)[0];
        const curKey = `${cur.x},${cur.y}`;
        if (cur.g > (bestCost.get(curKey) ?? Infinity)) continue;

        if (cur.x === goalX && cur.y === goalY) return cur.path;
        if (allowGoalAdjacent && Math.abs(cur.x - goalX) + Math.abs(cur.y - goalY) === 1) {
          return cur.path;
        }

        for (const d of dirs) {
          const nx = cur.x + d.dx;
          const ny = cur.y + d.dy;
          if (!this.canStepDelta(map, cur.x, cur.y, d.dx, d.dy)) continue;

          // 中途路徑避免誤踩非目標傳送點
          if (!(nx === goalX && ny === goalY)) {
            const midObj = this.findObjectAt(map, nx, ny);
            if (midObj && midObj.type === 'portal') continue;
          }

          const ng = cur.g + d.cost;
          const nKey = `${nx},${ny}`;
          if (ng + 1e-6 < (bestCost.get(nKey) ?? Infinity)) {
            bestCost.set(nKey, ng);
            const h = Math.hypot(goalX - nx, goalY - ny) * 0.95;
            open.push({
              x: nx,
              y: ny,
              g: ng,
              f: ng + h,
              path: cur.path.concat([{ x: nx, y: ny }])
            });
          }
        }
      }
      return [];
    }

    findNearestWalkableGoal(map, gx, gy) {
      let best = null;
      let bestScore = Infinity;
      for (let r = 1; r <= 4; r++) {
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
            const cx = gx + dx;
            const cy = gy + dy;
            if (!this.isTileWalkable(map, cx, cy, false)) continue;
            const midObj = this.findObjectAt(map, cx, cy);
            if (midObj && midObj.type === 'portal') continue;
            const score = Math.hypot(dx, dy) + Math.hypot(cx - this.playerPos.x, cy - this.playerPos.y) * 0.08;
            if (score < bestScore) {
              const p = this.findPathBFS(this.playerPos.x, this.playerPos.y, cx, cy);
              if (p.length > 0) {
                bestScore = score;
                best = { x: cx, y: cy, path: p };
              }
            }
          }
        }
        if (best) return best;
      }
      return null;
    }

    handleMapClick(gx, gy, explicitObj) {
      if (this.battle.active || this.dialogueActive || this.modalActive) return;
      const map = PalX.MAPS[this.state.mapId];
      if (!map) return;

      const obj = explicitObj || this.findObjectAt(map, gx, gy);
      const tx = obj ? obj.x : gx;
      const ty = obj ? obj.y : gy;

      const chebDist = Math.max(Math.abs(this.playerPos.x - tx), Math.abs(this.playerPos.y - ty));
      if (obj && obj.type !== 'portal' && chebDist <= 1) {
        const dx = tx - this.playerPos.x;
        const dy = ty - this.playerPos.y;
        if (dx - dy !== 0) this.facingLeft = (dx - dy) < 0;
        this.interactWithObject(obj);
        return;
      }
      if (obj && obj.type === 'portal' && chebDist === 0) {
        this.interactWithObject(obj);
        return;
      }

      const path = this.findPathBFS(this.playerPos.x, this.playerPos.y, tx, ty);
      if (path.length > 0) {
        this.movePath = path;
        this.moveTarget = { x: tx, y: ty };
        this.pendingInteractObj = obj || null;
        return;
      }

      // 若玩家點到河岸邊緣、牆角或樹冠等不可通行格，自動吸附至最近可抵達格順暢走過去
      if (!obj) {
        const fallback = this.findNearestWalkableGoal(map, tx, ty);
        if (fallback) {
          this.movePath = fallback.path;
          this.moveTarget = { x: fallback.x, y: fallback.y };
          this.pendingInteractObj = null;
        }
      }
    }

    tryStep(dx, dy, opts) {
      if (this.battle.active || this.dialogueActive || this.modalActive) return false;
      const map = PalX.MAPS[this.state.mapId];
      if (!map) return false;
      opts = opts || {};

      const oldX = this.playerPos.x;
      const oldY = this.playerPos.y;
      const nx = oldX + dx;
      const ny = oldY + dy;

      const obj = this.findObjectAt(map, nx, ny);
      if (obj && obj.type !== 'portal') {
        if (!opts.fromSteer || this.isBumpInteractable(obj)) {
          if (dx - dy !== 0) this.facingLeft = (dx - dy) < 0;
          this.interactWithObject(obj);
        }
        return false;
      }

      if (!this.canStepDelta(map, oldX, oldY, dx, dy)) return false;

      if (dx - dy !== 0) {
        this.facingLeft = (dx - dy) < 0;
      }

      const dur = opts.duration || this.getStepDuration(dx, dy);
      const startRx = this.stepAnim && this.stepAnim.active ? this.renderPlayer.x : oldX;
      const startRy = this.stepAnim && this.stepAnim.active ? this.renderPlayer.y : oldY;

      // 留下輕盈步履漣漪（水面/棧橋/草地微塵）
      this.footsteps.push({ x: oldX, y: oldY, life: 0.42, maxLife: 0.42 });
      if (this.footsteps.length > 10) this.footsteps.shift();

      // 更新毛毛蟲跟隨歷史位置（帶連續插值起終點，讓靈汐/月綾/阿蠻 60FPS 絲滑跟隨）
      const prevNodes = [{ x: oldX, y: oldY, facingLeft: this.facingLeft }].concat(this.trail);
      const nextTrail = [];
      for (let i = 0; i < 4; i++) {
        const curSlot = this.trail[i] || { x: oldX, y: oldY, rx: oldX, ry: oldY };
        const targetNode = prevNodes[i] || { x: oldX, y: oldY, facingLeft: this.facingLeft };
        const fx = curSlot.rx != null ? curSlot.rx : curSlot.x;
        const fy = curSlot.ry != null ? curSlot.ry : curSlot.y;
        nextTrail.push({
          fromX: fx,
          fromY: fy,
          x: targetNode.x,
          y: targetNode.y,
          rx: fx,
          ry: fy,
          facingLeft: targetNode.facingLeft != null ? targetNode.facingLeft : this.facingLeft
        });
      }
      this.trail = nextTrail;

      this.playerPos = { x: nx, y: ny };
      this.state.x = nx;
      this.state.y = ny;

      const initElapsed = Math.min(dur * 0.45, Math.max(0, opts.overshoot || 0));
      this.stepAnim = {
        active: true,
        fromX: startRx,
        fromY: startRy,
        toX: nx,
        toY: ny,
        elapsed: initElapsed,
        duration: dur
      };
      const p0 = dur > 0 ? initElapsed / dur : 1;
      this.renderPlayer = {
        x: startRx + (nx - startRx) * p0,
        y: startRy + (ny - startRy) * p0
      };

      // 仙劍1經典機制：若隊伍有人中毒未解，每行走一步扣微幅體力(最低留1滴血)並提醒
      let poisonedTick = false;
      for (const hid of this.state.activeParty) {
        const h = this.state.heroes[hid];
        if (h.poison && h.hp > 1) {
          h.hp = Math.max(1, h.hp - 3);
          poisonedTick = true;
        }
      }
      if (poisonedTick && this.ui && Math.random() < 0.35) {
        this.ui.toast('同伴身中奇毒未解，行走間氣血受損！（請用赤血蠶或冰心訣/淨衣咒）');
      }
      if (this.ui) this.ui.updateTopHud();

      // 檢查是否踏上傳送點
      if (obj && obj.type === 'portal') {
        this.interactWithObject(obj);
        return true;
      }

      // 檢查是否碰撞明雷怪物
      this.checkEnemyCollision();
      return true;
    }

    interactNearby() {
      if (this.battle.active || this.dialogueActive || this.modalActive) return;
      const map = PalX.MAPS[this.state.mapId];
      if (!map) return;

      const px = this.playerPos.x;
      const py = this.playerPos.y;
      const offsets = this.facingLeft
        ? [
            { dx: 0, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 },
            { dx: -1, dy: 1 }, { dx: -1, dy: -1 }, { dx: 1, dy: 1 }, { dx: 1, dy: -1 }
          ]
        : [
            { dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 },
            { dx: 1, dy: -1 }, { dx: 1, dy: 1 }, { dx: -1, dy: -1 }, { dx: -1, dy: 1 }
          ];

      // 優先調查尚未開啟的寶箱/NPC/首領，其次再調查已開啟過的空箱或傳送點
      let fallbackObj = null;
      for (const o of offsets) {
        const obj = this.findObjectAt(map, px + o.dx, py + o.dy);
        if (!obj) continue;
        if (this.isBumpInteractable(obj)) {
          if (o.dx - o.dy !== 0) this.facingLeft = (o.dx - o.dy) < 0;
          this.interactWithObject(obj);
          return;
        }
        if (!fallbackObj) fallbackObj = obj;
      }
      if (fallbackObj) {
        this.interactWithObject(fallbackObj);
        return;
      }
      if (this.ui) this.ui.toast('四周並無可調查之物。');
    }

    checkEnemyCollision() {
      for (const en of this.activeMapEnemies) {
        if (en.defeated) continue;
        const dist = Math.abs(en.x - this.playerPos.x) + Math.abs(en.y - this.playerPos.y);
        if (dist <= 0) {
          this.triggerMapEnemyBattle(en);
          return;
        }
      }
    }

    triggerMapEnemyBattle(mapEnemy) {
      this.movePath = [];
      this.moveTarget = null;
      this.pointerSteerVec = { x: 0, y: 0 };
      if (this.ui) this.ui.showBattleOverlay();
      this.battle.start(mapEnemy.enemyGroup, {
        onVictory: () => {
          mapEnemy.defeated = true;
        }
      });
    }

    // =========================================================================
    // 物件搜刮、機關解謎與全六章主支線劇情互動處理器
    // =========================================================================
    interactWithObject(obj) {
      this.movePath = [];
      this.moveTarget = null;
      this.pendingInteractObj = null;

      // 1. 寶箱、木桶、水缸翻箱倒櫃 (仙劍1靈魂!)
      if (obj.type === 'chest' || obj.type === 'barrel' || obj.type === 'jar') {
        if (this.state.searched[obj.id]) {
          if (this.ui) this.ui.toast(`${obj.name}裡面已經空空如也。`);
          return;
        }
        if (obj.multiClick) {
          const cur = (this.state.clickCounts[obj.id] || 0) + 1;
          this.state.clickCounts[obj.id] = cur;
          if (cur < obj.multiClick) {
            PalX.audio.sfx('cursor');
            if (this.ui) this.ui.toast(`敲了敲${obj.name}，底下似乎有空心的回音？（再調查 ${obj.multiClick - cur} 次試試）`);
            return;
          }
        }
        this.state.searched[obj.id] = true;
        const loot = obj.loot || {};
        if (loot.gold) this.state.gold += loot.gold;
        if (loot.item) this.addItem(loot.item, loot.count || 1);
        if (loot.extraItem) this.addItem(loot.extraItem, loot.extraCount || 1);
        PalX.audio.sfx('item');
        if (this.ui) {
          this.ui.updateTopHud();
          this.ui.startDialogue([{ speaker: 'narrator', text: obj.msg || `獲得寶物！` }]);
        }
        return;
      }

      // 2. 直接傳送門
      if (obj.type === 'portal' && obj.targetMap) {
        this.teleport(obj.targetMap, obj.targetX, obj.targetY);
        return;
      }

      // 3. 劇情與NPC/機關/Boss分派
      this.runStoryInteraction(obj.interaction, obj);
    }

    showLines(lines, onDone) {
      if (this.ui) {
        this.ui.startDialogue(lines, onDone);
      } else if (onDone) {
        onDone();
      }
    }

    startStoryBoss(enemyIds, opts, onWin) {
      if (this.ui) this.ui.showBattleOverlay();
      this.battle.start(enemyIds, Object.assign({}, opts, {
        onVictory: (summary) => {
          if (onWin) onWin(summary);
        }
      }));
    }

    unlockHero(heroId) {
      if (!this.state.unlockedHeroes.includes(heroId)) {
        this.state.unlockedHeroes.push(heroId);
      }
    }

    runStoryInteraction(id, obj) {
      const f = this.state.flags;

      switch (id) {
        // ==================== 第一章：臨安渡 & 棲霞仙島 ====================
        case 'linan_zuijian': {
          if (!f.gave_wine_to_zuijian) {
            if (this.getItemCount('guihuajiu') > 0) {
              this.addItem('guihuajiu', -1);
              f.gave_wine_to_zuijian = true;
              if (!this.state.heroes.luxiao.skills.includes('yujianshu')) {
                this.state.heroes.luxiao.skills.push('yujianshu');
              }
              PalX.audio.sfx('levelup');
              this.showLines([
                { speaker: 'zuijian', text: '「嗅嗅……好香的桂花釀！小子，算你懂老夫的心思！咕嚕咕嚕——痛快！」' },
                { speaker: 'luxiao', text: '「前輩慢點喝，這可是柳嬸藏在酒罈夾層裡的陳年佳釀，被她發現我又要挨鍋鏟啦。」' },
                { speaker: 'zuijian', text: '「哈哈哈，酒逢知己千杯少！看你小子骨骼清奇，腰間這柄舊木劍竟還沾著十年前南詔霧魂之氣……老夫便傳你一招蜀山入門劍訣！」' },
                { speaker: 'narrator', text: '醉劍翁併指如劍，一道清冽劍氣破窗斬落柳枝！陸逍心神大震，領悟蜀山仙術【御劍術】！' },
                { speaker: 'zuijian', text: '「好自為之，將來有緣，蜀山或苗疆自會再見！快去看看你家掌櫃嬸嬸吧，她印堂似有寒髓陰氣纏繞！」' }
              ], () => { if (this.ui) this.ui.updateTopHud(); });
            } else {
              this.showLines([
                { speaker: 'zuijian', text: '「沒酒！沒酒老夫一步也不走！小子，客棧左上角那口大酒罈裡明明飄著【桂花酒】香，快去取來！」' }
              ]);
            }
          } else {
            this.showLines([
              { speaker: 'zuijian', text: '「御劍乘風來，除魔天地間！小子，快去後堂看看你柳嬸吧！」' }
            ]);
          }
          break;
        }

        case 'linan_liushen': {
          if (!f.gave_wine_to_zuijian) {
            this.showLines([
              { speaker: 'liushen', text: '「快去左上角酒罈找壺【桂花酒】打發那位醉道士，別讓他耽誤了客棧生意。」' }
            ]);
          } else if (!f.liushen_sick) {
            f.liushen_sick = true;
            this.showLines([
              { speaker: 'luxiao', text: '「柳嬸，那位老前輩喝完酒大笑三聲，還教了我一招御劍術呢！……咦？柳嬸，妳臉色怎地這般慘白？！」' },
              { speaker: 'liushen', text: '「咳咳……心口好冷……十年前受的寒髓舊傷竟在此時發作……」' },
              { speaker: 'narrator', text: '柳嬸話音未落便昏厥倒地！洪大夫聞聲趕來把脈，面色凝重：唯有江心【棲霞仙島】水月宮的「紫金九泉露」方能救命！' },
              { speaker: 'luxiao', text: '「無論仙島有什麼奇門陣法，柳嬸撫養我長大，我陸逍拼了命也要把仙露求回來！（前往東南渡口搭乘蘆葦扁舟）」' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          } else if (!f.defeated_chigui) {
            this.showLines([
              { speaker: 'narrator', text: '柳嬸氣息微弱、眉結寒霜，必須儘快搭渡口蘆葦舟前往【棲霞仙島】求取紫金九泉露！' }
            ]);
          } else if (!f.cured_liushen) {
            f.cured_liushen = true;
            this.addItem('zijinyulu', -1);
            this.fullRestoreParty();
            this.showLines([
              { speaker: 'narrator', text: '陸逍將【紫金九泉露】餵入柳嬸口中，一縷溫潤清氣化開寒霜，柳嬸終於悠悠轉醒！' },
              { speaker: 'liushen', text: '「逍兒……？這位清麗如仙的姑娘……莫非是當年青嵐聖女的女兒、靈汐姑娘？！」' },
              { speaker: 'luxiao', text: '「咦……頭好痛！我只記得去仙島求藥，怎麼半路上竟忘了在島上發生過什麼事……（赤鬼統領臨死施放的『忘塵蠱』竟封住了陸逍在仙島結緣的記憶！）」' },
              { speaker: 'lingxi', text: '「（低頭輕撫腕間紅線，忍住淚意）……無妨，只要柳婆婆平安便好。如今幽溟教爪牙已現蹤江南，我須前往【姑蘇城】與【蜀山】查明九泉霧魂異動。」' },
              { speaker: 'liushen', text: '「逍兒！你父母十年前便與南詔九泉之事有關，如今既與靈汐姑娘同行，你定要寸步不離護她周全！由客棧西南驛道便可直達【姑蘇城】！」' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          } else {
            this.fullRestoreParty();
            this.showLines([
              { speaker: 'liushen', text: '「累了就回忘憂客棧歇歇腳（全隊體力真氣已回滿）！江湖險惡，定要好好照顧靈汐與同伴！」' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          }
          break;
        }

        case 'linan_hong': {
          if (this.ui) this.ui.openShop(PalX.MAPS.linan_inn.shops.linan_med);
          break;
        }
        case 'linan_smith': {
          if (this.ui) this.ui.openShop(PalX.MAPS.linan_inn.shops.linan_wpn);
          break;
        }
        case 'linan_diviner': {
          const shards = this.getItemCount('memory_shard');
          this.showLines([
            { speaker: 'narrator', text: `算命瞎仙掐指長嘆：「霧魂凝時回舊夢，龍潭映影換餘生。少俠若想逆轉女媧宿命，切記留心散落各地的【宿命記憶碎片】（目前已尋獲 ${shards}/5 枚），並保存好手中的【家傳木劍】！」` }
          ]);
          break;
        }
        case 'linan_boat': {
          if (!f.liushen_sick) {
            this.showLines([{ speaker: 'luxiao', text: '「江上濃霧瀰漫，眼下還是先回客棧招呼醉道士與柳嬸吧。」' }]);
          } else {
            this.teleport('qixia_island', 2, 13);
          }
          break;
        }
        case 'linan_to_suzhou': {
          if (!f.cured_liushen) {
            this.showLines([{ speaker: 'luxiao', text: '「柳嬸性命垂危，豈能此時遠行！」' }]);
          } else {
            this.teleport('suzhou_city', 2, 11);
          }
          break;
        }

        // 棲霞仙島奇門四石像解謎
        case 'qixia_statue': {
          if (f[obj.flag]) {
            if (this.ui) this.ui.toast(`${obj.name}已經碎裂失效。`);
            return;
          }
          f[obj.flag] = true;
          PalX.audio.sfx('magic');
          const count = ['statue_1', 'statue_2', 'statue_3', 'statue_4'].filter((k) => f[k]).length;
          if (count >= 4) {
            f.qixia_seal_broken = true;
            this.showLines([
              { speaker: 'narrator', text: '轟隆巨響！四座奇門石像盡數碎裂，北方水月宮前的五靈幻陣結界隨之消散！' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          } else {
            if (this.ui) this.ui.toast(`以劍氣擊碎【${obj.name}】！（已破除 ${count}/4 座奇門石像）`);
          }
          break;
        }

        case 'qixia_meet_lingxi': {
          if (!f.lingxi_joined) {
            f.lingxi_joined = true;
            this.unlockHero('lingxi');
            this.state.activeParty = ['luxiao', 'lingxi'];
            this.addItem('zijinyulu', 1);
            const runDialogue = () => {
              this.showLines([
                { speaker: 'lingxi', text: '「何人擅闖棲霞水月宮，破我奇門荷花陣？！」' },
                { speaker: 'luxiao', text: '「仙女姐姐莫動劍！在下臨安渡陸逍，只因家中柳嬸突發寒髓陰毒命在旦夕，特來跪求紫金九泉露救命！」' },
                { speaker: 'lingxi', text: '「忘憂客棧的柳婆婆？！十年前母親封鎖霧魂裂隙殉難時，正是柳婆婆護送年幼的我渡江避難……這瓶【紫金九泉露】請快收下！」' },
                { speaker: 'narrator', text: '靈汐將九泉仙露與一縷女媧宿命紅線繫於陸逍腕間。就在此時，島外殺氣沖天——幽溟教先鋒【赤鬼統領】竟趁荷花陣破除之際率眾殺入仙島！' },
                { speaker: 'lingxi', text: '「不好，他們是衝著我體內的霧魂清氣來的！陸公子，靈汐助你一同突圍離島！」' },
                { speaker: 'narrator', text: '【蘇靈汐】加入隊伍！（蘇靈汐手持雙劍普通攻擊可【二連擊】，且精通五靈仙術與觀音咒！）' }
              ], () => { if (this.ui) this.ui.updateTopHud(); });
            };
            if (this.ui) {
              this.ui.playPoetryScroll('【蘇靈汐 · 定場詩】', PalX.HERO_TEMPLATES.lingxi.poem, runDialogue);
            } else {
              runDialogue();
            }
          } else {
            this.showLines([{ speaker: 'lingxi', text: '「陸公子，我們快由南面荷花橋突圍回臨安渡救柳婆婆！」' }]);
          }
          break;
        }

        case 'qixia_boss_chigui': {
          this.showLines([
            { speaker: 'chigui', text: '「桀桀桀！多謝你這毛頭小子破開水月宮奇門陣！乖乖交出女媧聖女，本統領饒你不死！」' },
            { speaker: 'luxiao', text: '「醜八怪少作夢！靈汐妹妹別怕，看小爺用剛學的御劍術會會他！（提示：陸逍可用【飛雲探龍手】偷取赤鬼身上的秘寶血玲瓏，蘇靈汐用【冰咒】水剋火特效拔群！）」' }
          ], () => {
            this.startStoryBoss(['boss_chigui'], {}, () => {
              f.defeated_chigui = true;
              this.showLines([
                { speaker: 'chigui', text: '「可惡……女媧遺脈、還有忘塵暗蠱……幽溟教主絕不會放過你們……」' },
                { speaker: 'lingxi', text: '「赤鬼退走了！陸公子，我們快乘扁舟回臨安渡救治柳婆婆！」' }
              ], () => { if (this.ui) this.ui.updateTopHud(); });
            });
          });
          break;
        }

        // ==================== 第二章：姑蘇城 & 隱霧蛇窟 ====================
        case 'suzhou_master_shen': {
          if (!f.yueling_joined) {
            this.showLines([
              { speaker: 'shentiannan', text: '「老夫驚鴻山莊沈天南！小女月綾性子剛烈，今日設下比武招親擂台，哪位少年英雄能在小女手下走過十招，便是我沈家乘龍快婿！」' }
            ]);
          } else {
            this.showLines([
              { speaker: 'shentiannan', text: '「陸賢婿！月綾這丫頭外冷內熱，城東【隱霧蛇窟】凶險萬分，你們務必小心！」' }
            ]);
          }
          break;
        }

        case 'suzhou_arena_duel': {
          const startArena = () => {
            this.showLines([
              { speaker: 'yueling', text: '「哼！台下那些紈絝子弟本姑娘連看都懶得看一眼！喂，台下那個腰掛木劍的呆子，你在那兒偷笑什麼？有膽上台接我三鞭！」' },
              { speaker: 'luxiao', text: '「這位大小姐，比武招親講究以武會友，妳一上來就拿鞭子抽人，誰敢娶妳呀？來來來，在下陸逍陪妳過兩招！」' }
            ], () => {
              this.startStoryBoss(['boss_yueling'], { overrideParty: ['luxiao'] }, () => {
                f.yueling_joined = true;
                this.unlockHero('yueling');
                this.state.activeParty = ['luxiao', 'yueling'];
                this.fullRestoreParty();
                this.showLines([
                  { speaker: 'yueling', text: '「你……你使詐！哪有人用蜀山御劍術欺負人的……（臉頰微紅）不過既輸給了你，本姑娘願賭服輸！」' },
                  { speaker: 'narrator', text: '正當擂台喧騰之際，城郊忽然妖霧翻湧！留守橋畔客舍的蘇靈汐為護住百姓，竟被隱霧蛇窟群妖趁亂擄往城東深山，地上只餘一枚染塵的翠玉髮飾！' },
                  { speaker: 'luxiao', text: '「不好！靈汐有危險！沈姑娘，招親之事容後再議，我要立刻去城東蛇窟救人！」' },
                  { speaker: 'yueling', text: '「站住！我沈月綾看上的人，豈能讓你獨自去闖蛇妖老巢？拿好我的紅綾長鞭——本姑娘陪你去把那位妹妹救回來！」' },
                  { speaker: 'narrator', text: '【沈月綾】加入隊伍！（沈月綾手持長鞭時，普通攻擊可直接【橫掃敵方全體】，清怪威力無匹！由城東山道可進入隱霧蛇窟。）' }
                ], () => { if (this.ui) this.ui.updateTopHud(); });
              });
            });
          };
          if (this.ui) {
            this.ui.playPoetryScroll('【沈月綾 · 定場詩】', PalX.HERO_TEMPLATES.yueling.poem, startArena);
          } else {
            startArena();
          }
          break;
        }

        case 'suzhou_to_serpent': {
          if (!f.yueling_joined) {
            this.showLines([{ speaker: 'luxiao', text: '「城中心比武擂台熱鬧非凡，先去擂台瞧瞧吧！」' }]);
          } else {
            this.teleport('serpent_cave', 2, 13);
          }
          break;
        }

        case 'serpent_switch': {
          if (f.serpent_gate_open) {
            if (this.ui) this.ui.toast('青銅蛇首機關已開啟。');
            return;
          }
          f.serpent_gate_open = true;
          PalX.audio.sfx('confirm');
          this.showLines([
            { speaker: 'yueling', text: '「看我的！用力扭轉這座青銅蛇首——聽，北面妖殿的玄鐵閘門打開了！」' }
          ], () => { if (this.ui) this.ui.updateTopHud(); });
          break;
        }

        case 'serpent_boss_fight': {
          this.showLines([
            { speaker: 'shejun', text: '「嘶嘶……兩個不知死活的凡人竟敢闖入本君洞府！那位身懷女媧靈氣的小美人早已自行震斷妖索往蜀山方向去了，你們就留下來當血食吧！」' },
            { speaker: 'yueling', text: '「一隻長蟲配一隻騷狐狸也敢大言不慚！陸呆子，今日便讓你瞧瞧本姑娘的厲害！（提示：二人同場可發動右側指令【合擊】弦月斬！）」' }
          ], () => {
            this.startStoryBoss(['boss_shejun', 'boss_yinhu'], {}, () => {
              f.defeated_shejun = true;
              this.addItem('fenglingzhu', 1);
              this.state.activeParty = ['luxiao', 'lingxi', 'yueling'];
              this.fullRestoreParty();
              PalX.audio.sfx('item');
              this.showLines([
                { speaker: 'narrator', text: '蛇君與狐妖雙雙伏誅，妖丹碎裂處竟浮現五靈奇珍之一——【風靈珠】！（可在選單「裝備 → 配戴」裝上風靈珠，合擊將昇華為【風神】！）' },
                { speaker: 'lingxi', text: '「陸公子、沈姐姐！我在暗道出口聽見打鬥聲趕回來，幸好你們平安無事！」' },
                { speaker: 'yueling', text: '「哇，原來妳就是陸呆子心心念念的靈汐妹妹，果真像畫裡的仙女一樣！以後誰敢欺負妳，包在我沈月綾身上！」' },
                { speaker: 'lingxi', text: '「謝謝月綾姐姐。方才我感應到北方【蜀山】五靈地脈劇烈震盪，霧魂濁氣正在衝擊鎮妖古塔，我們快由北面暗道上蜀山求見凌虛掌門！」' },
                { speaker: 'narrator', text: '三人鐵三角隊伍正式集結！北側通往【蜀山丹霞仙境】的雲梯暗道已開啟！' }
              ], () => { if (this.ui) this.ui.updateTopHud(); });
            });
          });
          break;
        }

        case 'serpent_to_shushan': {
          this.teleport('shushan_sect', 7, 12);
          break;
        }

        // ==================== 第三章：蜀山雲海 & 鎮妖古塔 ====================
        case 'shushan_lingxu': {
          if (!f.defeated_mingwang) {
            this.showLines([
              { speaker: 'lingxu', text: '「無量天尊……神農九泉之『霧魂』與蜀山地脈相連，近來濁氣翻湧，連我派執劍長老【蒼溟】亦受心魔所惑，執意主張寧可錯殺不可縱妖。三位若去北殿見他，切莫硬起衝突啊……」' }
            ]);
          } else {
            this.showLines([
              { speaker: 'lingxu', text: '「老道慚愧，未能及時阻攔蒼溟師弟，致令沈女俠重傷。苗疆聖姑醫術通神，願天佑有情人！」' }
            ]);
          }
          break;
        }

        case 'shushan_sword_mound': {
          if (f.sword_mound_done) {
            if (this.ui) this.ui.toast('古劍塚劍氣清朗，七星磐龍劍已擇主而隨。');
            return;
          }
          if (this.ui) {
            this.ui.startDialogue([
              {
                speaker: 'narrator',
                text: '蜀山古劍塚石碑浮現歷代劍仙叩問（致敬仙劍四尋仙問道）：「後世持劍者，汝拔劍修仙，所求為何？」',
                choices: [
                  { label: '「為護眼前摯愛與天下蒼生，縱不成仙亦無悔！」', value: 'heart' },
                  { label: '「斬斷七情六慾，求太上忘情之萬載長生。」', value: 'cold' },
                  { label: '「求天下第一劍名，令六界俯首稱臣。」', value: 'fame' }
                ]
              }
            ], (choice) => {
              f.sword_mound_done = true;
              this.addItem('qixingjian', 1);
              this.addItem('memory_shard', 1);
              PalX.audio.sfx('item');
              const praise = choice === 'heart'
                ? '劍塚萬劍齊鳴！石碑浮現青光：「道不遠人，有情方為真劍仙！」'
                : '劍塚古劍微顫：「太上豈能真忘情？執此劍於紅塵歷練，自見本心！」';
              this.showLines([
                { speaker: 'narrator', text: `${praise} 獲得蜀山名劍【七星磐龍劍】與【宿命記憶碎片】！` }
              ]);
            });
          } else {
            f.sword_mound_done = true;
            this.addItem('qixingjian', 1);
            this.addItem('memory_shard', 1);
          }
          break;
        }

        case 'shushan_cangming':
        case 'shushan_enter_tower': {
          if (!f.entered_demon_tower) {
            f.entered_demon_tower = true;
            this.state.activeParty = ['luxiao', 'yueling'];
            this.showLines([
              { speaker: 'cangming', text: '「大膽妖女！身懷南詔女媧蛇紋與霧魂濁氣，竟敢踏上蜀山丹霞殿！來人，開啟天罡劍陣，將她打入【鎮妖古塔】永世鎮壓！」' },
              { speaker: 'lingxi', text: '「蒼溟長老明鑑！靈汐從未害過一人，此番上山正是為了修補九泉裂隙——啊！」' },
              { speaker: 'luxiao', text: '「住手！！靈汐一路救死扶傷，比你們這些不分青紅皂白的名門正派仁義百倍！若修仙便是絕情棄義，這仙不修也罷！」' },
              { speaker: 'yueling', text: '「陸呆子，別跟這老頑固廢話！他把靈汐妹妹關進鎮妖塔底，我們這就持劍殺進去劫塔救人！」' }
            ], () => {
              this.teleport('demon_tower', 7, 13);
            });
          } else {
            this.teleport('demon_tower', 7, 13);
          }
          break;
        }

        case 'tower_thinking_ghost': {
          if (f.ghost_riddle_done) {
            this.showLines([{ speaker: 'narrator', text: '沉思鬼正開心地蹦蹦跳跳練習殭屍跳步。' }]);
            return;
          }
          if (this.ui) {
            this.ui.startDialogue([
              {
                speaker: 'narrator',
                text: '鎖妖塔經典彩蛋【沉思鬼】抱頭苦思了五百年：「唉……人走路的時候，究竟應該先邁左腳，還是先邁右腳呢？」',
                choices: [
                  { label: '「你已經是鬼啦，雙腳併攏跳著走不就成了！」', value: 'jump' },
                  { label: '「男左女右，當然先邁左腳。」', value: 'left' }
                ]
              }
            ], () => {
              f.ghost_riddle_done = true;
              this.addItem('yuputi', 1);
              this.addItem('huashishui', 1);
              PalX.audio.sfx('item');
              this.showLines([
                { speaker: 'narrator', text: '沉思鬼恍然大悟：「妙哉！五百年心結一朝解開！」臨去前贈予【玉菩提×1】與【化屍水×1】！' }
              ]);
            });
          } else {
            f.ghost_riddle_done = true;
            this.addItem('yuputi', 1);
            this.addItem('huashishui', 1);
          }
          break;
        }

        case 'tower_book_fairy': {
          if (!f.met_book_fairy) {
            f.met_book_fairy = true;
            this.addItem('shilianguo', 1);
            PalX.audio.sfx('item');
            this.showLines([
              { speaker: 'narrator', text: '冰晶古卷中飄出【書中仙】：「小夥子重情重義闖鎖妖塔，頗有昔年李少俠之風！切記：塔底鎮獄明王屬雷，以【火系】剋之；日後若遇水魔濁獸，則以【土系】與五靈合一之【聖靈珠】破之！」（獲贈【試煉果×1】）' }
            ]);
          } else {
            this.showLines([{ speaker: 'narrator', text: '書中仙捻鬚微笑：「開啟左右兩側【太陰】【太陽】雙陣樞，便可破開塔底雷火障！」' }]);
          }
          break;
        }

        case 'tower_switch': {
          if (f[obj.flag]) {
            if (this.ui) this.ui.toast(`${obj.name}已點亮。`);
            return;
          }
          f[obj.flag] = true;
          PalX.audio.sfx('confirm');
          if (f.tower_yin && f.tower_yang) {
            f.tower_seal_open = true;
            this.showLines([
              { speaker: 'narrator', text: '太陰、太陽雙儀共鳴！鎮妖古塔深處的雷火封印閘門轟然洞開！' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          } else {
            if (this.ui) this.ui.toast(`點亮了【${obj.name}】！還需開啟另一側陣樞。`);
          }
          break;
        }

        case 'tower_boss_mingwang': {
          this.showLines([
            { speaker: 'mingwang', text: '「凡擅闖鎮妖塔救妖者，皆受九幽雷獄天刑！受死吧！」' },
            { speaker: 'luxiao', text: '「放開靈汐！月綾，我們並肩斬開這座破鎖鏈！（提示：可偷取鎮獄明王身上的【金蠶王】！）」' }
          ], () => {
            this.startStoryBoss(['boss_mingwang'], {}, () => {
              f.defeated_mingwang = true;
              this.addItem('leilingzhu', 1);
              this.addItem('huolingzhu', 1);
              if (!this.state.heroes.luxiao.skills.includes('jiushen')) {
                this.state.heroes.luxiao.skills.push('jiushen');
              }
              this.state.activeParty = ['luxiao', 'lingxi'];
              this.fullRestoreParty();
              PalX.audio.playMusic('sad');
              this.showLines([
                { speaker: 'narrator', text: '鎖妖鐵鏈應聲寸斷，塔底鎮壓地脈的【雷靈珠】與【火靈珠】飛入囊中！劍氣激盪間，陸逍腦海中的「忘塵蠱」徹底碎裂——棲霞仙島水月宮的紅線誓言盡數湧上心頭！' },
                { speaker: 'luxiao', text: '「靈汐……我都想起來了！那日在水月宮，我答應過要護妳一生一世……」' },
                { speaker: 'yueling', text: '「（強顏歡笑，眼角閃過淚光）原來……你們早就許下婚約啦。哼，現在不是說這個的時候——小心頭頂！！」' },
                { speaker: 'narrator', text: '古塔七星磐龍柱轟然崩塌！千鈞巨石砸落之際，沈月綾猛然揮鞭將陸逍與蘇靈汐推向出口，自己卻被崩落的玄鐵巨柱重重擊中心脈，鮮血染紅了白玉石階……' },
                { speaker: 'yueling', text: '「呆子……別哭……說好了一起吃到老、玩到老……我才沒那麼容易認輸呢……」' },
                { speaker: 'zuijian', text: '「無量劍氣，破空開道！臭小子別慌，老夫帶你們御劍直奔南詔【白苗聖姑谷】！另外這招老夫壓箱底的至高劍意【酒神】（一生限用九次），今日一併傳你！」' }
              ], () => {
                this.teleport('miao_village', 7, 7);
              });
            });
          });
          break;
        }

        // ==================== 第四章：南詔白苗谷 & 神木火麟洞 ====================
        case 'miao_shenggu': {
          if (!f.saved_yueling) {
            if (this.getItemCount('fenghuangyu') > 0 && this.getItemCount('huoqilinjiao') > 0) {
              this.addItem('fenghuangyu', -1);
              this.addItem('huoqilinjiao', -1);
              f.saved_yueling = true;
              this.addItem('memory_shard', 1);
              PalX.audio.sfx('levelup');
              this.showLines([
                { speaker: 'shenggu', text: '「好！神木鳳凰羽與赤炎麒麟角皆已齊備！老身這便以九泉寒髓靈藥配合苗疆【傀儡續命仙術】，為沈姑娘重塑心脈！」' },
                { speaker: 'narrator', text: '七彩霞光籠罩竹榻，沈月綾蒼白的臉龐終於恢復紅潤呼吸！聖姑欣慰點頭，並將一枚從月綾衣襟拾獲的【宿命記憶碎片】交予陸逍。' },
                { speaker: 'shenggu', text: '「沈姑娘性命已保！待終章決戰之時，她亦可再執紅綾鞭與你們並肩作戰！眼下九泉『霧魂』裂隙就在村北女媧神殿，快隨靈汐與阿蠻前去尋回十年前遺落的【水靈珠】吧！」' }
              ], () => { if (this.ui) this.ui.updateTopHud(); });
            } else {
              this.showLines([
                { speaker: 'shenggu', text: '「沈姑娘天靈與心脈受創極重，老身已用冰蠶護住她一線生機。若要救她性命，必須前往村東【神木火麟洞】尋來【神木鳳凰羽】與【赤炎麒麟角】！快去找我徒兒【藍阿蠻】帶路吧。」' }
              ]);
            }
          } else {
            this.fullRestoreParty();
            this.showLines([
              { speaker: 'shenggu', text: '「沈姑娘心脈已穩，正在竹榻靜養（全隊體力真氣已恢復）。村北通往十年前【霧魂時之隙】的神殿結界已開！」' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          }
          break;
        }

        case 'miao_aman_join': {
          const joinAman = () => {
            f.aman_joined = true;
            this.unlockHero('aman');
            this.state.activeParty = ['luxiao', 'lingxi', 'aman'];
            this.addItem('liangumin', 1);
            PalX.audio.sfx('item');
            this.showLines([
              { speaker: 'aman', text: '「嘻嘻，你就是師父說的那個大鬧蜀山鎖妖塔的陸逍哥哥？靈汐姐姐好！我是白苗少主藍阿蠻！」' },
              { speaker: 'luxiao', text: '「阿蠻姑娘有禮！為救月綾性命並平息九泉毒瘴，還請姑娘引路前往神木火麟洞！」' },
              { speaker: 'aman', text: '「包在本少主身上！對啦，這只苗疆至寶【煉蠱皿】送給你們——打開選單【煉蠱】，把兩種草藥、毒砂或化屍水放進去，就能煉出全體隱身無敵的【隱蠱】和直接升級的【金蠶王】喔！」' },
              { speaker: 'narrator', text: '【藍阿蠻】加入隊伍，並解鎖【煉蠱皿】合成系統！由村東可前往【神木火麟洞】。' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          };
          if (this.ui) {
            this.ui.playPoetryScroll('【藍阿蠻 · 定場詩】', PalX.HERO_TEMPLATES.aman.poem, joinAman);
          } else {
            joinAman();
          }
          break;
        }

        case 'miao_to_qilin': {
          if (!f.aman_joined) {
            this.showLines([{ speaker: 'luxiao', text: '「神木林路徑複雜，先在村中與白苗少主【藍阿蠻】會合吧！」' }]);
          } else {
            this.teleport('fire_qilin_cave', 2, 13);
          }
          break;
        }

        case 'miao_to_mist': {
          if (!f.defeated_qilin) {
            this.showLines([{ speaker: 'lingxi', text: '「月綾姐姐危在旦夕，我們先去村東【神木火麟洞】取回續命雙珍吧！」' }]);
          } else {
            this.teleport('mist_dream_past', 7, 13);
          }
          break;
        }

        case 'qilin_switch': {
          if (f.qilin_gate_open) {
            if (this.ui) this.ui.toast('祝融火圖騰已開啟。');
            return;
          }
          f.qilin_gate_open = true;
          PalX.audio.sfx('confirm');
          this.showLines([
            { speaker: 'aman', text: '「以巫月銀鈴引動祝融圖騰——看，火麒麟聖殿的火焰障壁散開啦！」' }
          ], () => { if (this.ui) this.ui.updateTopHud(); });
          break;
        }

        case 'qilin_boss_fight': {
          this.showLines([
            { speaker: 'qilin', text: '「吼——！吾乃神農九泉守護瑞獸！凡人欲求麒麟靈角與土靈珠，先以實力證明汝等守護蒼生之決心！」' },
            { speaker: 'lingxi', text: '「得罪了，火麒麟前輩！（提示：火麒麟屬火，蘇靈汐施展【冰咒／風雪冰天】或配戴水系仙術可打出 1.5 倍剋制重創！）」' }
          ], () => {
            this.startStoryBoss(['boss_huoqilin'], {}, () => {
              f.defeated_qilin = true;
              this.addItem('huoqilinjiao', 1);
              this.addItem('tulingzhu', 1);
              PalX.audio.sfx('item');
              this.showLines([
                { speaker: 'qilin', text: '「好精純的女媧清氣與赤子劍心！這截【赤炎麒麟角】與五靈至寶【土靈珠】，便託付予汝等！」' },
                { speaker: 'luxiao', text: '「太好了！別忘了拿西側梧桐巢上的【神木鳳凰羽】，集齊兩樣奇珍快回白苗谷找【聖姑】救月綾！（提示：土靈珠在迷宮選單中使用可隨時瞬間返回入口！）」' }
              ], () => { if (this.ui) this.ui.updateTopHud(); });
            });
          });
          break;
        }

        // ==================== 第五章：霧魂時之隙（十年前南詔 & 龍潭古鏡） ====================
        case 'mist_young_luxiao': {
          if (f.met_young_self) {
            this.showLines([{ speaker: 'young_luxiao', text: '「大哥哥，我一定會好好練劍，長大以後像你一樣當大俠！」' }]);
            return;
          }
          f.met_young_self = true;
          this.addItem('memory_shard', 1);
          PalX.audio.sfx('item');
          this.showLines([
            { speaker: 'young_luxiao', text: '「嗚嗚……爹娘去幫青嵐聖女封印大水怪了，把小逍一個人留在神殿外……大哥哥，你腰間或包裡那把刻著『逍』字的桃木劍，怎麼跟我的一模一樣呀？」' },
            { speaker: 'luxiao', text: '「（心頭巨震）原來十年前在霧魂裂隙外鼓勵我活下去、替我繫緊劍穗的青衫劍客……竟是十年後的我自己！」' },
            { speaker: 'young_luxiao', text: '「大哥哥別難過！這顆發亮的小晶石是我方才在泉邊撿到的，送給你換一塊桂花糕好不好？」' },
            { speaker: 'narrator', text: '跨越十載光陰的宿命閉環達成（致敬仙劍一十年前木劍之約）！獲得最後一枚【宿命記憶碎片】！' }
          ], () => { if (this.ui) this.ui.updateTopHud(); });
          break;
        }

        case 'mist_longtan_mirror': {
          if (f.forged_longtan_pact) {
            this.showLines([{ speaker: 'narrator', text: '【龍潭逆命契】已在懷中熠熠生輝，足以在終局替蘇靈汐抵擋宿命死劫！' }]);
            return;
          }
          const shardCount = this.getItemCount('memory_shard');
          if (shardCount >= 4) {
            f.forged_longtan_pact = true;
            this.addItem('longtan_pact', 1);
            PalX.audio.sfx('levelup');
            this.showLines([
              { speaker: 'narrator', text: '神農九泉之【龍潭古鏡】（致敬仙劍六龍潭法則）感應到你集齊的宿命記憶碎片，鏡面浮現太古神音：「記憶為憑，羈絆為契；不懼天命者，可換一線生機！」' },
              { speaker: 'luxiao', text: '「若天命注定女媧後人必須以死殉道，我陸逍願以十年孤苦記憶為祭，換大家一個活著相守的明天！」' },
              { speaker: 'narrator', text: '古鏡清輝凝成至寶【龍潭逆命契】！（已滿足隱藏真結局關鍵條件！）' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          } else {
            this.showLines([
              { speaker: 'narrator', text: `九泉【龍潭古鏡】幽光流轉：「集齊至少 4 枚【宿命記憶碎片】方可締結逆命之契（目前擁有 ${shardCount} 枚——提示：臨安古柳、姑蘇畫舫、蜀山劍塚、鎮妖塔寶箱、聖姑救治月綾、十年前小陸逍皆有線索）。」` }
            ]);
          }
          break;
        }

        case 'mist_switch': {
          if (f.rift_gate_open) {
            if (this.ui) this.ui.toast('霧魂凝時碑已共鳴。');
            return;
          }
          f.rift_gate_open = true;
          PalX.audio.sfx('confirm');
          this.showLines([
            { speaker: 'lingxi', text: '「母親當年留下的霧魂封印正在共鳴……北面十年前的裂隙戰場已經開啟了！」' }
          ], () => { if (this.ui) this.ui.updateTopHud(); });
          break;
        }

        case 'mist_boss_yexiao': {
          this.showLines([
            { speaker: 'narrator', text: '時空迷霧散開，眾人目睹十年前青嵐聖女與陸逍父母浴血封印水魔獸的壯烈一幕！魔界裂隙統領【夜梟】正企圖奪走鎮泉之寶水靈珠！' },
            { speaker: 'luxiao', text: '「爹、娘、青嵐前輩——這一戰，十年後的我們陪你們一起打！」' }
          ], () => {
            this.startStoryBoss(['boss_yexiao'], {}, () => {
              f.defeated_yexiao = true;
              this.addItem('shuilingzhu', 1);
              PalX.audio.sfx('item');
              this.showLines([
                { speaker: 'narrator', text: '魔統領夜梟灰飛煙滅，十年前的歷史得以保全，五靈最後一顆至寶【水靈珠】緩緩落入蘇靈汐掌心！' },
                { speaker: 'lingxi', text: '「風、雷、火、土、水五靈珠終於齊聚！現世的幽溟教主正在【九泉深淵】喚醒合體水魔獸，我們由北側時空裂口直入深淵決一死戰！」' }
              ], () => { if (this.ui) this.ui.updateTopHud(); });
            });
          });
          break;
        }

        case 'mist_to_abyss': {
          this.teleport('abyss_altar', 7, 13);
          break;
        }

        // ==================== 終章：九泉深淵·拜月水魔祭壇 ====================
        case 'abyss_free_heal': {
          this.fullRestoreParty();
          PalX.audio.sfx('heal');
          if (this.ui) {
            this.ui.updateTopHud();
            this.ui.toast('沐浴九泉春滋清輝，全體同伴體力與真氣完全恢復，百毒盡消！');
          }
          break;
        }

        case 'abyss_party_select': {
          if (!f.saved_yueling) {
            this.showLines([
              { speaker: 'narrator', text: '沈月綾仍在白苗谷昏迷未醒（若已集齊鳳凰羽與麒麟角，可隨時返回白苗谷請聖姑救治後在此編入決戰陣容！）。目前出戰陣容：陸逍、蘇靈汐、藍阿蠻。' }
            ]);
            return;
          }
          if (this.ui) {
            this.ui.startDialogue([
              {
                speaker: 'narrator',
                text: '沈月綾已由聖姑續命甦醒趕至深淵會合！請選擇終極決戰的三人出戰陣容：',
                choices: [
                  { label: '【經典仙一鐵三角】陸逍 ＋ 蘇靈汐 ＋ 沈月綾', value: 'luxiao,lingxi,yueling' },
                  { label: '【南詔破魔陣】陸逍 ＋ 蘇靈汐 ＋ 藍阿蠻', value: 'luxiao,lingxi,aman' },
                  { label: '【雙姝快攻陣】陸逍 ＋ 沈月綾 ＋ 藍阿蠻', value: 'luxiao,yueling,aman' }
                ]
              }
            ], (val) => {
              if (val) {
                this.state.activeParty = val.split(',');
                this.fullRestoreParty();
                if (this.ui) {
                  this.ui.updateTopHud();
                  this.ui.toast(`決戰陣容已編組：${this.state.activeParty.map((id) => this.state.heroes[id].name).join('、')}！`);
                }
              }
            });
          }
          break;
        }

        case 'abyss_five_pearls_altar': {
          if (f.abyss_seal_open) {
            if (this.ui) this.ui.toast('五靈已融合為【聖靈珠】，深淵結界已破除！');
            return;
          }
          f.abyss_seal_open = true;
          this.addItem('shenglingzhu', 1);
          // 若領隊配戴欄為空，貼心自動配戴聖靈珠以解鎖【武神】合擊
          const leader = this.state.heroes[this.state.activeParty[0]];
          if (leader && !leader.equip.relic) {
            this.equipItem(leader.id, 'shenglingzhu');
          }
          PalX.audio.sfx('levelup');
          this.showLines([
            { speaker: 'narrator', text: '風、雷、水、火、土五顆靈珠騰空飛起，於總樞祭壇化作五色神虹，擊碎了深淵魔障，更融合昇華為曠古神器——【聖靈珠】！' },
            { speaker: 'lingxi', text: '「只要出戰同伴配戴【聖靈珠】發動【合擊】，便能召喚開天闢地的終極神威【武神·斬破宿命】！雲舟哥哥，準備迎戰幽溟教主！」' }
          ], () => { if (this.ui) this.ui.updateTopHud(); });
          break;
        }

        case 'abyss_final_battle': {
          this.showLines([
            { speaker: 'youming', text: '「哈哈哈！愚蠢的世人總以為情愛與羈絆能戰勝私慾！唯有引九泉『毒瘴』吞沒『霧魂』，喚醒上古【渾沌水魔獸】洗淨人間，方能締造永恆無垢的新世界！」' },
            { speaker: 'luxiao', text: '「閉嘴！人間縱有悲歡離合，也輪不到你這瘋子來替蒼生做主！拔劍吧，幽溟老賊！」' }
          ], () => {
            // 第一階段決戰：幽溟教主
            this.startStoryBoss(['boss_youming'], {}, () => {
              this.fullRestoreParty();
              this.showLines([
                { speaker: 'youming', text: '「咳啊……你們以為贏了嗎？！以吾殘軀血肉，獻祭九泉深淵——甦醒吧，不死不滅的【渾沌水魔獸】！！」' },
                { speaker: 'narrator', text: '幽溟教主縱身躍入黑淵，萬丈狂濤沖天而起，幽溟與上古水魔獸徹底融為一體！（春滋清氣庇護，我方全體狀態已回滿，進入最終死戰！提示：善用【聖靈珠合擊·武神】、【土系仙術】、【隱蠱】與【酒神】！）' }
              ], () => {
                // 第二階段終極戰：合體·渾沌水魔獸
                this.startStoryBoss(['boss_shuimoshou'], {}, () => {
                  this.triggerEndingSequence();
                });
              });
            });
          });
          break;
        }

        // ==================== 商店與客棧通用處理 ====================
        case 'shop_suzhou_wpn':
          if (this.ui) this.ui.openShop(PalX.MAPS.suzhou_city.shops.suzhou_wpn);
          break;
        case 'shop_suzhou_med':
          if (this.ui) this.ui.openShop(PalX.MAPS.suzhou_city.shops.suzhou_med);
          break;
        case 'shop_shushan':
          if (this.ui) this.ui.openShop(PalX.MAPS.shushan_sect.shops.shushan_shop);
          break;
        case 'shop_miao_med':
          if (this.ui) this.ui.openShop(PalX.MAPS.miao_village.shops.miao_med);
          break;
        case 'shop_miao_wpn':
          if (this.ui) this.ui.openShop(PalX.MAPS.miao_village.shops.miao_wpn);
          break;
        case 'shop_abyss_final':
          if (this.ui) this.ui.openShop(PalX.MAPS.abyss_altar.shops.abyss_final);
          break;
        case 'inn_rest': {
          const cost = obj.cost || 60;
          if (this.state.gold < cost) {
            this.showLines([{ speaker: 'narrator', text: `投宿需 ${cost} 文錢，囊中羞澀，快去打幾隻小妖賺些盤纏吧！` }]);
          } else {
            this.state.gold -= cost;
            this.fullRestoreParty();
            PalX.audio.sfx('heal');
            if (this.ui) this.ui.updateTopHud();
            this.showLines([{ speaker: 'narrator', text: `花費 ${cost} 文錢在客舍美美睡了一覺，全員體力、真氣完全恢復，異常狀態盡除！` }]);
          }
          break;
        }
      }
    }

    triggerEndingSequence() {
      const f = this.state.flags;
      let endingKey = 'lone_ending';
      if (f.forged_longtan_pact && f.saved_yueling) {
        endingKey = 'true_ending';
      } else if (f.saved_yueling) {
        endingKey = 'classic_ending';
      }
      f.completed_ending = endingKey;
      const ending = PalX.ENDINGS[endingKey];
      PalX.audio.playMusic(endingKey === 'true_ending' ? 'title' : 'sad');

      if (this.ui) {
        this.ui.startDialogue(ending.scenes, () => {
          this.ui.showEndingScreen(ending);
        });
      }
    }

    // =========================================================================
    // 存檔 / 讀檔 / 匯出 / 匯入
    // =========================================================================
    serializeSave() {
      return JSON.stringify({
        savedAt: new Date().toISOString(),
        mapName: (PalX.MAPS[this.state.mapId] && PalX.MAPS[this.state.mapId].name) || '',
        chapter: (PalX.MAPS[this.state.mapId] && PalX.MAPS[this.state.mapId].chapter) || '',
        leaderLv: this.state.heroes.luxiao.level,
        state: this.state
      });
    }

    saveToSlot(slotId) {
      if (typeof localStorage === 'undefined' || !this.state) return false;
      localStorage.setItem(SAVE_KEY_PREFIX + slotId, this.serializeSave());
      return true;
    }

    getSlotMeta(slotId) {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(SAVE_KEY_PREFIX + slotId);
      if (!raw) return null;
      try {
        const data = JSON.parse(raw);
        return {
          slotId,
          savedAt: data.savedAt,
          mapName: data.mapName,
          chapter: data.chapter,
          leaderLv: data.leaderLv
        };
      } catch (e) {
        return null;
      }
    }

    loadFromSlot(slotId) {
      if (typeof localStorage === 'undefined') return false;
      const raw = localStorage.getItem(SAVE_KEY_PREFIX + slotId);
      if (!raw) return false;
      return this.importSaveJson(raw);
    }

    importSaveJson(rawJson) {
      try {
        const parsed = JSON.parse(rawJson);
        const st = parsed.state || parsed;
        if (!st || !st.heroes || !st.mapId || !PalX.MAPS[st.mapId]) return false;
        this.state = st;
        this.battle.active = false;
        this.loadMap(st.mapId, st.x, st.y, true);
        if (this.ui) {
          this.ui.hideTitleScreen();
          this.ui.hideBattleOverlay();
          this.ui.closeModal();
          this.ui.updateTopHud();
          this.ui.toast('舊夢重續，存檔讀取成功！');
        }
        return true;
      } catch (e) {
        return false;
      }
    }

    // =========================================================================
    // 主迴圈更新 (60 FPS 絲滑插值移動與8向操控)
    // =========================================================================
    update(dt) {
      this.time += dt;
      if (!this.state) return;
      this.state.playTimeSec = (this.state.playTimeSec || 0) + dt;
      this.interactCooldown = Math.max(0, (this.interactCooldown || 0) - dt);

      // 步履漣漪淡出
      for (let i = this.footsteps.length - 1; i >= 0; i--) {
        this.footsteps[i].life -= dt;
        if (this.footsteps[i].life <= 0) this.footsteps.splice(i, 1);
      }

      // 每 90 秒自動保存於 auto 槽位
      this.autoSaveTimer += dt;
      if (this.autoSaveTimer >= 90 && !this.battle.active) {
        this.autoSaveTimer = 0;
        this.saveToSlot('auto');
      }

      if (this.battle.active) {
        this.isMoving = false;
        this.battle.update(dt);
        return;
      }

      // 推進當前步伐之 60FPS 子格插值動畫（即使剛開啟對話亦優雅收步落地）
      if (this.stepAnim && this.stepAnim.active) {
        this.stepAnim.elapsed += dt;
        const p = Math.min(1, this.stepAnim.elapsed / Math.max(0.01, this.stepAnim.duration));
        this.renderPlayer.x = this.stepAnim.fromX + (this.stepAnim.toX - this.stepAnim.fromX) * p;
        this.renderPlayer.y = this.stepAnim.fromY + (this.stepAnim.toY - this.stepAnim.fromY) * p;
        for (const tn of this.trail) {
          if (tn.fromX != null) {
            tn.rx = tn.fromX + (tn.x - tn.fromX) * p;
            tn.ry = tn.fromY + (tn.y - tn.fromY) * p;
          }
        }
        if (p >= 1) {
          this.stepAnim.active = false;
          this.renderPlayer.x = this.playerPos.x;
          this.renderPlayer.y = this.playerPos.y;
          for (const tn of this.trail) {
            tn.rx = tn.x;
            tn.ry = tn.y;
          }
        }
      } else {
        this.renderPlayer.x = this.playerPos.x;
        this.renderPlayer.y = this.playerPos.y;
      }

      if (this.dialogueActive || this.modalActive) {
        this.isMoving = !!(this.stepAnim && this.stepAnim.active);
        this.pointerSteerVec = { x: 0, y: 0 };
        const targetIsoX = (this.renderPlayer.x - this.renderPlayer.y) * (PalX.graphics.TILE_W / 2);
        const targetIsoY = (this.renderPlayer.x + this.renderPlayer.y) * (PalX.graphics.TILE_H / 2);
        this.camX += (targetIsoX - this.camX) * Math.min(1, dt * 12);
        this.camY += (targetIsoY - this.camY) * Math.min(1, dt * 12);
        return;
      }

      // 整合鍵盤8向 (WASD / 方向鍵支援雙鍵斜走)、虛擬搖桿與滑鼠/觸控長按拖曳向量
      let kbX = 0;
      let kbY = 0;
      if (this.keysDown.ArrowUp || this.keysDown.KeyW) kbY -= 1;
      if (this.keysDown.ArrowDown || this.keysDown.KeyS) kbY += 1;
      if (this.keysDown.ArrowLeft || this.keysDown.KeyA) kbX -= 1;
      if (this.keysDown.ArrowRight || this.keysDown.KeyD) kbX += 1;

      let svx = kbX;
      let svy = kbY;
      if (svx === 0 && svy === 0) {
        if (Math.hypot(this.virtualSteerVec.x, this.virtualSteerVec.y) > 0.14) {
          svx = this.virtualSteerVec.x;
          svy = this.virtualSteerVec.y;
        } else if (Math.hypot(this.pointerSteerVec.x, this.pointerSteerVec.y) > 0.14) {
          svx = this.pointerSteerVec.x;
          svy = this.pointerSteerVec.y;
        }
      }

      const prevCooldown = this.stepCooldown;
      this.stepCooldown = Math.max(0, this.stepCooldown - dt);
      const overshoot = Math.max(0, dt - prevCooldown);
      let moved = false;

      if (this.stepCooldown <= 0) {
        const prevMapId = this.state.mapId;
        if (svx !== 0 || svy !== 0) {
          this.movePath = [];
          this.moveTarget = null;
          this.pendingInteractObj = null;
          const res = this.resolveScreenDirectionStep(svx, svy, overshoot);
          moved = !!res.moved;
          if (this.state.mapId !== prevMapId) {
            this.stepCooldown = 0.12;
          } else if (res.moved) {
            this.stepCooldown = Math.max(0.02, res.dur - (this.stepAnim.elapsed || 0));
          } else if (res.interacted) {
            this.stepCooldown = 0.18;
          } else {
            this.stepCooldown = 0.045;
          }
        } else if (this.movePath.length > 0) {
          const nextStep = this.movePath.shift();
          const sdx = nextStep.x - this.playerPos.x;
          const sdy = nextStep.y - this.playerPos.y;
          const dur = this.getStepDuration(sdx, sdy);
          moved = this.tryStep(sdx, sdy, { duration: dur, overshoot });
          if (this.state.mapId !== prevMapId) {
            this.stepCooldown = 0.12;
          } else if (moved) {
            this.stepCooldown = Math.max(0.02, dur - (this.stepAnim.elapsed || 0));
          } else {
            // 若中途被巡邏怪或障礙擋住則清空殘餘路徑
            this.movePath = [];
            this.moveTarget = null;
          }

          if (this.movePath.length === 0 && this.state.mapId === prevMapId) {
            this.moveTarget = null;
            if (this.pendingInteractObj) {
              const obj = this.pendingInteractObj;
              this.pendingInteractObj = null;
              const cheb = Math.max(Math.abs(obj.x - this.playerPos.x), Math.abs(obj.y - this.playerPos.y));
              if (cheb <= 1) {
                const odx = obj.x - this.playerPos.x;
                const ody = obj.y - this.playerPos.y;
                if (odx - ody !== 0) this.facingLeft = (odx - ody) < 0;
                this.interactWithObject(obj);
              }
            }
          }
        }
      }

      this.isMoving = moved || (this.stepAnim && this.stepAnim.active) || this.movePath.length > 0;
      if (this.isMoving) {
        const sprintMul = (this.sprintToggle || this.keysDown.ShiftLeft || this.keysDown.ShiftRight) ? 1.32 : 1;
        this.walkPhase += dt * 14 * sprintMul;
      }

      // 明雷怪物巡邏與子格平滑插值
      const map = PalX.MAPS[this.state.mapId];
      for (const en of this.activeMapEnemies) {
        if (en.defeated) continue;
        if (en.stepElapsed < en.stepDur) {
          en.stepElapsed = Math.min(en.stepDur, en.stepElapsed + dt);
          const ep = en.stepElapsed / Math.max(0.01, en.stepDur);
          en.rx = en.fromX + (en.x - en.fromX) * ep;
          en.ry = en.fromY + (en.y - en.fromY) * ep;
        } else {
          en.rx = en.x;
          en.ry = en.y;
        }
        if (!en.patrol || en.patrol.length < 2) continue;
        en.moveTimer -= dt;
        if (en.moveTimer <= 0) {
          en.moveTimer = 1.0 + Math.random() * 0.6;
          const goal = en.patrol[en.patrolIdx];
          const edx = Math.sign(goal.x - en.x);
          const edy = edx === 0 ? Math.sign(goal.y - en.y) : 0;
          if (edx === 0 && edy === 0) {
            en.patrolIdx = (en.patrolIdx + 1) % en.patrol.length;
          } else if (this.isTileWalkable(map, en.x + edx, en.y + edy, true)) {
            en.fromX = en.rx != null ? en.rx : en.x;
            en.fromY = en.ry != null ? en.ry : en.y;
            en.x += edx;
            en.y += edy;
            en.stepElapsed = 0;
            en.stepDur = 0.34;
            if (en.x === this.playerPos.x && en.y === this.playerPos.y) {
              this.triggerMapEnemyBattle(en);
              return;
            }
          } else {
            en.patrolIdx = (en.patrolIdx + 1) % en.patrol.length;
          }
        }
      }

      // 鏡頭 60FPS 緊密絲滑跟隨插值主角座標（消除離散跳格拉扯感）
      const targetIsoX = (this.renderPlayer.x - this.renderPlayer.y) * (PalX.graphics.TILE_W / 2);
      const targetIsoY = (this.renderPlayer.x + this.renderPlayer.y) * (PalX.graphics.TILE_H / 2);
      this.camX += (targetIsoX - this.camX) * Math.min(1, dt * 12.5);
      this.camY += (targetIsoY - this.camY) * Math.min(1, dt * 12.5);
    }

    render() {
      if (!this.ctx || !this.canvas) return;
      if (!this.state) return;
      if (this.battle.active) {
        const map = PalX.MAPS[this.state.mapId];
        PalX.graphics.renderBattleScene(this.ctx, this.canvas, this.battle, map ? map.theme : 'lotus_island', this.time);
      } else {
        PalX.graphics.renderMapScene(this.ctx, this.canvas, this);
      }
    }
  }

  PalX.GameEngine = GameEngine;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameEngine };
  }
})(typeof window !== 'undefined' ? window : globalThis);
