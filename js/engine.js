(function (root) {
  'use strict';

  const PalX = (root.PalX = root.PalX || {});

  const SAVE_KEY_PREFIX = 'palx_mist_save_v1_';

  function evalCondition(expr, flags) {
    if (!expr) return true;
    const parts = expr.split('&&').map((p) => p.trim());
    for (const part of parts) {
      if (part.startsWith('!')) {
        const k = part.slice(1).trim();
        if (flags[k]) return false;
      } else {
        if (!flags[part]) return false;
      }
    }
    return true;
  }

  function isMainQuestTarget(interactionId, flags) {
    if (!flags.gave_wine_to_zuijian && interactionId === 'linan_zuijian') return true;
    if (flags.gave_wine_to_zuijian && !flags.liushen_sick && interactionId === 'linan_liushen') return true;
    if (flags.liushen_sick && !flags.lingxi_joined && interactionId === 'qixia_meet_lingxi') return true;
    if (flags.lingxi_joined && !flags.defeated_chigui && interactionId === 'qixia_boss_chigui') return true;
    if (flags.defeated_chigui && !flags.cured_liushen && interactionId === 'linan_liushen') return true;
    if (flags.cured_liushen && !flags.yueling_joined && interactionId === 'suzhou_arena_yueling') return true;
    if (flags.yueling_joined && !flags.defeated_shejun && interactionId === 'snake_boss_fight') return true;
    if (flags.defeated_shejun && !flags.defeated_jiannu && interactionId === 'luoxia_boss_jiannu') return true;
    if (flags.defeated_jiannu && !flags.entered_demon_tower && interactionId === 'shushan_main_event') return true;
    if (flags.entered_demon_tower && !flags.defeated_mingwang && interactionId === 'tower_boss_mingwang') return true;
    if (flags.defeated_mingwang && !flags.aman_joined && interactionId === 'miao_aman_join') return true;
    if (flags.aman_joined && !flags.defeated_fumuzun && interactionId === 'miasma_boss_fight') return true;
    if (flags.defeated_fumuzun && !flags.defeated_qilin && interactionId === 'qilin_boss_fight') return true;
    if (flags.defeated_qilin && !flags.saved_yueling && interactionId === 'miao_shenggu') return true;
    if (flags.saved_yueling && !flags.defeated_yexiao && interactionId === 'rift_boss_yexiao') return true;
    if (flags.defeated_yexiao && !flags.abyss_seal_open && interactionId === 'abyss_wuling_altar') return true;
    if (flags.abyss_seal_open && interactionId === 'abyss_final_boss') return true;
    return false;
  }

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
      this.showMiniMap = true;
      this.miniMapRect = null;
      this.playerPos = { x: 5, y: 5 };
      this.renderPlayer = { x: 5, y: 5 };
      this.stepAnim = { active: false, fromX: 5, fromY: 5, toX: 5, toY: 5, elapsed: 0, duration: 0.13 };
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
      this.activeMapNpcs = [];
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

      const startMapId = 'yanbo_town';
      const spawnX = 5;
      const spawnY = 5;

      this.state = {
        version: 2,
        playTimeSec: 0,
        mapId: startMapId,
        x: spawnX,
        y: spawnY,
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

      this.loadMap(startMapId, spawnX, spawnY, true);
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
        return { ok: true, msg: `${h.name}服下【${item.name}】，修行升至第 ${h.level} 重！${learned.length ? '領悟：' + learned.join('、') : ''}` };
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
        return { ok: true, msg: `${h.name}服下【${item.name}】，根骨永久提升！` };
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
      if (!caster || !sk || !sk.usableInField) return { ok: false, msg: '此武學僅限戰鬥中施展。' };
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
      return { ok: true, msg: `${caster.name}施展【${sk.name}】，同伴煥然一新。` };
    }

    performGuAlchemy(itemA, itemB) {
      if (!this.hasItemOrEquipped('liangumin') && !this.state.flags.aman_joined) {
        return { ok: false, msg: '尚未取得雲夢澤奇寶【百草丹鼎】（第四章雲珞入隊解鎖）！' };
      }
      if (itemA === itemB && this.getItemCount(itemA) < 2) {
        return { ok: false, msg: '同種藥材合煉至少需要 2 份！' };
      }
      if (this.getItemCount(itemA) < 1 || this.getItemCount(itemB) < 1) {
        return { ok: false, msg: '投入材料數量不足！' };
      }
      const product = PalX.craftGu(itemA, itemB);
      if (!product) {
        return { ok: false, msg: '武器裝備與劇情信物不可投入百草丹鼎。' };
      }
      this.addItem(itemA, -1);
      this.addItem(itemB, -1);
      this.addItem(product.id, 1);
      const recStr = `${PalX.ITEMS[itemA].name} + ${PalX.ITEMS[itemB].name} → ${product.name}`;
      if (!this.state.discoveredRecipes.includes(recStr)) {
        this.state.discoveredRecipes.unshift(recStr);
      }
      PalX.audio.sfx('item');
      return { ok: true, product, msg: `紫氣升騰！百草丹鼎成功煉出【${product.name}】！` };
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
      if (!PalX.MAPS[mapId]) mapId = 'yanbo_town';
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

      // 初始化當前地圖巡邏野怪
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

      // 初始化當前地圖生動 NPC 狀態機
      this.activeMapNpcs = (map.objects || [])
        .filter((o) => o.type === 'npc' || o.type === 'boss')
        .map((o) => ({
          id: o.id,
          def: o,
          type: o.type,
          sprite: o.sprite,
          name: o.name,
          interaction: o.interaction,
          questId: o.questId,
          serviceBadge: o.serviceBadge,
          baseX: o.x,
          baseY: o.y,
          x: o.x,
          y: o.y,
          rx: o.x,
          ry: o.y,
          fromX: o.x,
          fromY: o.y,
          toX: o.x,
          toY: o.y,
          stepElapsed: 0.44,
          stepDur: 0.44,
          runtimeMoving: false,
          runtimeWalkPhase: Math.random() * 8,
          runtimeFacingLeft: false,
          runtimePose: o.pose || 'stand',
          patrol: o.patrol ? o.patrol.slice() : null,
          patrolIdx: 0,
          pauseTimer: 1.2 + Math.random() * 1.5,
          states: o.states ? o.states.slice() : null,
          barks: o.barks ? o.barks.slice() : null,
          barkTimer: 2.0 + Math.random() * 4.0,
          activeBark: null,
          barkDisplayTimer: 0,
          barkAlpha: 0,
          questMarker: null,
          hidden: false
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
      if (!PalX.MAPS[mapId]) mapId = 'yanbo_town';
      const map = PalX.MAPS[mapId];
      if (!map) return;
      this.loadMap(mapId, x, y, true);
      this.interactCooldown = 0.32;
      if (this.ui) {
        this.ui.toast(`抵達【${map.name}】`);
      }
    }

    getVisibleMapObjects(map) {
      if (!map) return [];
      const staticObjs = (map.objects || []).filter((o) => {
        if (o.type === 'npc' || o.type === 'boss') return false;
        if (o.requireFlag && !this.state.flags[o.requireFlag]) return false;
        if (o.hideFlag && this.state.flags[o.hideFlag]) return false;
        return true;
      });
      const liveNpcs = (this.activeMapNpcs || []).filter((n) => !n.hidden);
      return staticObjs.concat(liveNpcs);
    }

    isTileWalkable(map, gx, gy, ignoreObjects) {
      if (!map) return false;
      if (gy < 0 || gy >= map.grid.length || gx < 0 || gx >= map.grid[0].length) return false;
      const ch = map.grid[gy][gx];
      if (['#', 'w', '~', 'T', 'W', 'B'].includes(ch)) return false;
      if (ch === 'G') {
        const open = map.gateFlag ? !!this.state.flags[map.gateFlag] : true;
        if (!open) return false;
      }
      if (ch === 'H') {
        const open2 = map.gate2Flag ? !!this.state.flags[map.gate2Flag] : true;
        if (!open2) return false;
      }
      if (!ignoreObjects) {
        // 檢查活體 NPC
        for (const n of this.activeMapNpcs || []) {
          if (!n.hidden && n.x === gx && n.y === gy) return false;
        }
        // 檢查靜態物件
        for (const obj of map.objects) {
          if (obj.type === 'npc' || obj.type === 'boss') continue;
          if (obj.requireFlag && !this.state.flags[obj.requireFlag]) continue;
          if (obj.hideFlag && this.state.flags[obj.hideFlag]) continue;
          if (obj.type === 'portal') continue;
          if (obj.type === 'decor') {
            if (obj.blocking === false) continue; // 牌坊、花叢等可行走
            if (obj.x === gx && obj.y === gy) return false;
          } else if (obj.x === gx && obj.y === gy) {
            return false;
          }
        }
      }
      return true;
    }

    findObjectAt(map, gx, gy) {
      if (!map) return null;
      // 優先檢查活體 NPC
      for (const n of this.activeMapNpcs || []) {
        if (!n.hidden && n.x === gx && n.y === gy) return n;
      }
      // 其次檢查靜態物件
      for (const obj of map.objects) {
        if (obj.type === 'npc' || obj.type === 'boss') continue;
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
      if (!obj || obj.type === 'portal' || obj.type === 'decor') return false;
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
          (obj.interaction === 'reed_switch' && obj.flag && f[obj.flag]) ||
          (obj.interaction === 'snake_switch' && f.snake_gate_open) ||
          (obj.interaction === 'zhurong_switch' && obj.flag && f[obj.flag]) ||
          (obj.interaction === 'causeway_switch' && obj.flag && f[obj.flag]) ||
          (obj.interaction === 'trial_switch' && obj.flag && f[obj.flag]) ||
          (obj.interaction === 'abyss_wuling_altar' && f.abyss_seal_open);
        if (alreadyOn) return false;
      }
      return true;
    }

    getStepDuration(dx, dy) {
      const sprint = !!(this.sprintToggle || this.keysDown.ShiftLeft || this.keysDown.ShiftRight);
      const base = sprint ? 0.135 : 0.20;
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

      // 2. 優先選擇最貼合螢幕方向且可行走之方向；若正前方受斜牆/河岸阻擋則自動滑牆
      for (const c of candidates) {
        if (this.canStepDelta(map, fx, fy, c.dx, c.dy)) {
          const dur = this.getStepDuration(c.dx, c.dy);
          const ok = this.tryStep(c.dx, c.dy, { duration: dur, overshoot: overshootDt || 0, fromSteer: true });
          if (ok) return { moved: true, dur };
        }
      }

      // 3. 若前方與兩側滑牆皆受阻，檢查是否有可互動物件
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

      this.totalSteps = (this.totalSteps || 0) + 1;
      this.footsteps.push({ x: oldX, y: oldY, life: 0.42, maxLife: 0.42 });
      if (this.footsteps.length > 10) this.footsteps.shift();

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

      let poisonedTick = false;
      for (const hid of this.state.activeParty) {
        const h = this.state.heroes[hid];
        if (h.poison && h.hp > 1) {
          h.hp = Math.max(1, h.hp - 3);
          poisonedTick = true;
        }
      }
      if (poisonedTick && this.ui && Math.random() < 0.35) {
        this.ui.toast('同伴身中燼毒未解，行走間氣血受損！（請用青露草或觀音清心咒調理）');
      }
      if (this.ui) this.ui.updateTopHud();

      if (obj && obj.type === 'portal') {
        this.interactWithObject(obj);
        return true;
      }

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
    // 物件搜刮、機關解謎與全十六境長篇主支線劇情互動處理器
    // =========================================================================
    interactWithObject(obj) {
      this.movePath = [];
      this.moveTarget = null;
      this.pendingInteractObj = null;

      // 1. 寶箱、木桶、水缸翻箱倒櫃
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
        // ==================== 第一章：煙波古鎮、蘆花古渡與棲雲竹海 ====================
        case 'yanbo_stele': {
          this.showLines([
            { speaker: 'narrator', text: '【煙波鎮古道斷碣】：「江流石不轉，客散月明初。昔太初墜星落歸墟，素娥鑄天鎖狂瀾。願後世執劍者，莫失初心，勿忘人間。」' }
          ]);
          break;
        }

        case 'yanbo_storyteller': {
          this.showLines([
            { speaker: 'narrator', text: '說書人拍撫醒木：「話說十八年前『壬戌燼夜』，煙波渡江水暴漲，銀灰妖霧瀰漫！正是聽遠老鏢頭燕鐵衣、謝滄海大俠與一眾高人浴血奮戰，方保下這方水土！如今無生邪教死灰復燃，少俠不可不察呀！」' }
          ]);
          break;
        }

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
                { speaker: 'zuijian', text: '「嗅嗅……好清冽的桂花香！小子，算你懂得孝敬前輩！咕嚕咕嚕——痛快！」' },
                { speaker: 'luxiao', text: '「前輩慢些飲！這可是裴爺爺窖藏二十年的煙波桂花釀，被他知道少了一罈，我少不了要挨船槳呢！」' },
                { speaker: 'zuijian', text: '「哈哈哈！酒逢知己，劍隨心動！看你筋骨奇清，腰間這柄舊鐵劍竟有我玄霄劍宗祖師太阿之意……老夫便傳你一套【御劍術·聽潮碎浪】！」' },
                { speaker: 'narrator', text: '瞎眼琴客併指成劍，一道破空劍氣將數丈外落葉一分為二！裴少游心神大悟，習得劍訣【御劍術】！' },
                { speaker: 'zuijian', text: '「快回聽雨草堂看看你家裴爺爺吧，他印堂隱有寒霜聚結，只怕是舊年燼毒復發了！」' }
              ], () => { if (this.ui) this.ui.updateTopHud(); });
            } else {
              this.showLines([
                { speaker: 'zuijian', text: '「無酒不撫琴！小子，聽雨草堂西北角的大酒罈裡正飄著陳年【煙波桂花釀】的香氣，快去取來！」' }
              ]);
            }
          } else {
            this.showLines([
              { speaker: 'zuijian', text: '「一棹煙波聽雨落，十年孤劍倚長風。少游，快回草堂照料裴老艄公吧！」' }
            ]);
          }
          break;
        }

        case 'linan_liushen': {
          if (!f.gave_wine_to_zuijian) {
            this.showLines([
              { speaker: 'liushen', text: '「鶴汀，快去屋角酒罈摸一壺【煙波桂花釀】送往聽雨茶肆給謝先生，別怠慢了貴客！」' }
            ]);
          } else if (!f.liushen_sick) {
            f.liushen_sick = true;
            this.showLines([
              { speaker: 'luxiao', text: '「裴爺爺，謝前輩喝了桂花釀，傳了我一手出神入化的御劍術呢！……咦？裴爺爺，您臉色怎地結了一層寒霜？！」' },
              { speaker: 'liushen', text: '「咳咳……心脈好凍……十八年前壬戌燼夜留下的燼毒，終究還是壓不住了……」' },
              { speaker: 'narrator', text: '裴老艄公昏厥倒榻！許杏林大夫急急趕來施針：「唯有江心【棲雲竹海·聽雪藥廬】白芷微姑娘的『聽雪清心露』方能拔除寒毒！快由南渡口乘船渡江！」' },
              { speaker: 'luxiao', text: '「裴爺爺養育我長大，縱是刀山火海我也要求來靈露！（前往西南渡口搭乘烏篷船）」' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          } else if (!f.defeated_chigui) {
            this.showLines([
              { speaker: 'narrator', text: '裴老艄公臥榻昏迷，寒霜封脈。必須前往【棲雲竹海】向白芷微姑娘求取聽雪清心露！' }
            ]);
          } else if (!f.cured_liushen) {
            f.cured_liushen = true;
            this.addItem('zijinyulu', -1);
            this.fullRestoreParty();
            this.showLines([
              { speaker: 'narrator', text: '少游將【聽雪清心露】餵入老艄公口中，溫潤清露化作青霞驅散寒霜，裴老艄公悠悠轉醒！' },
              { speaker: 'liushen', text: '「鶴汀……這位白衣勝雪的姑娘……莫非是素娥天闕聽雪神醫白芷微姑娘？！」' },
              { speaker: 'lingxi', text: '「裴老伯安心休養，燼毒已解。只是無生邪教爪牙四出，十八年前歸墟異動似有重演之兆，我須前往巴蜀【錦官城】查探。」' },
              { speaker: 'liushen', text: '「少游！你身世與十八年前燼夜密切相連，既得白姑娘相救，便隨她同往錦官城，定要護她周全！西南驛道哨衛老陳已放行！」' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          } else {
            this.fullRestoreParty();
            this.showLines([
              { speaker: 'liushen', text: '「累了就回草堂歇息（全隊體力真氣已完全恢復）！江湖風雨險惡，少游要好好照顧白姑娘與同伴！」' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          }
          break;
        }

        case 'sq_umbrella_npc': {
          if (!f.sq_umbrella_started) {
            f.sq_umbrella_started = true;
            this.showLines([
              { speaker: 'lubo', text: '「唉，老拙亡妻臨終留下的這柄十二骨油紙傘，傘骨斷了一截……聽聞蘆花沉船灘散落著堅韌的【湘妃老竹骨】，少俠若能幫我尋來一根，老拙願以家傳傘墜相贈！」' }
            ]);
          } else if (!f.sq_umbrella_done) {
            if (this.getItemCount('umbrella_bamboo') > 0) {
              this.addItem('umbrella_bamboo', -1);
              f.sq_umbrella_done = true;
              this.state.gold += 200;
              this.addItem('tingyusan', 1);
              PalX.audio.sfx('item');
              this.showLines([
                { speaker: 'lubo', text: '「太好啦！這正是湘妃沉水老竹骨！多謝少俠！這只【聽雨油紙傘墜】（提升身法與防禦）與 200 文錢請務必收下！」' }
              ], () => { if (this.ui) this.ui.updateTopHud(); });
            } else {
              this.showLines([
                { speaker: 'lubo', text: '「沉船灘蘆花深處多有水怪出沒，尋找【湘妃老竹骨】切記注意安全啊！」' }
              ]);
            }
          } else {
            this.showLines([
              { speaker: 'lubo', text: '「油紙傘修好啦，看著它，就像老伴還在身邊一樣……少俠一路平安！」' }
            ]);
          }
          break;
        }

        case 'sq_letter_npc': {
          if (!f.sq_letter_started) {
            f.sq_letter_started = true;
            this.showLines([
              { speaker: 'ayun', text: '「少游哥，家父隨貨船前往蘆花古渡已有半月，昨夜聽聞沉船灘起了大霧……若你在沉船邊見到家父的【江心平安信】，請一定幫阿芸帶回來！」' }
            ]);
          } else if (!f.sq_letter_done) {
            if (this.getItemCount('sunken_letter') > 0) {
              this.addItem('sunken_letter', -1);
              f.sq_letter_done = true;
              this.addItem('guihuajiu', 2);
              PalX.audio.sfx('item');
              this.showLines([
                { speaker: 'ayun', text: '「（拆信落淚）爹爹在信裡說貨船已避入安全港灣，一切安好！少游哥，太謝謝你了！這兩壺【煙波桂花釀】送給你路上暢飲！」' }
              ], () => { if (this.ui) this.ui.updateTopHud(); });
            } else {
              this.showLines([
                { speaker: 'ayun', text: '「不知爹爹在蘆花古渡是否安好……」' }
              ]);
            }
          } else {
            this.showLines([
              { speaker: 'ayun', text: '「阿芸泡好熱茶等你們凱旋歸來！」' }
            ]);
          }
          break;
        }

        case 'linan_hong': {
          if (!f.sq_orchid_started) {
            f.sq_orchid_started = true;
            this.showLines([
              { speaker: 'xudoc', text: '「少游，老夫欲研製預防燼毒的解厄湯，急需一株生長於棲雲竹海幽谷深處的【幽谷寒蘭】。若採得此蘭，老夫以靈果相贈！」' }
            ], () => {
              if (this.ui) this.ui.openShop(PalX.MAPS.yanbo_town.shops.yanbo_med);
            });
          } else if (!f.sq_orchid_done && this.getItemCount('frost_orchid') > 0) {
            this.addItem('frost_orchid', -1);
            f.sq_orchid_done = true;
            this.addItem('qiannianyurou', 1);
            this.state.gold += 260;
            PalX.audio.sfx('item');
            this.showLines([
              { speaker: 'xudoc', text: '「好品相的幽谷寒蘭！這枚可培元固本的靈果【千年玉肉】與 260 文錢便贈予你了！」' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          } else {
            if (this.ui) this.ui.openShop(PalX.MAPS.yanbo_town.shops.yanbo_med);
          }
          break;
        }

        case 'linan_smith': {
          if (this.ui) this.ui.openShop(PalX.MAPS.yanbo_town.shops.yanbo_wpn);
          break;
        }

        case 'yanbo_inn_rest': {
          const cost = 30;
          if (this.state.gold < cost) {
            this.showLines([{ speaker: 'narrator', text: `投宿需 ${cost} 文錢，盤纏不足。` }]);
          } else {
            this.state.gold -= cost;
            this.fullRestoreParty();
            PalX.audio.sfx('inn');
            if (this.ui) this.ui.updateTopHud();
            this.showLines([{ speaker: 'narrator', text: `花費 ${cost} 文錢安睡一宿，全隊體力與真氣完全恢復！` }]);
          }
          break;
        }

        case 'yanbo_post_guard': {
          if (!f.cured_liushen) {
            this.showLines([{ speaker: 'narrator', text: '哨衛老陳：「少游，裴老艄公危在旦夕，你可不能丟下他擅自離鎮啊！」' }]);
          } else {
            this.showLines([{ speaker: 'narrator', text: '哨衛老陳：「裴老艄公安好，少游放手去闖天下吧！西南驛道一路直通巴蜀錦官城！」' }]);
          }
          break;
        }

        case 'linan_boat': {
          if (!f.liushen_sick) {
            this.showLines([{ speaker: 'luxiao', text: '「江上起霧了，先回聽雨草堂看看裴爺爺吧。」' }]);
          } else {
            this.teleport('sunken_reed', 3, 23);
          }
          break;
        }

        case 'linan_to_suzhou': {
          if (!f.cured_liushen) {
            this.showLines([{ speaker: 'luxiao', text: '「裴爺爺病勢沈重，豈能在此時離鎮！」' }]);
          } else {
            this.teleport('jinguan_city', 3, 14);
          }
          break;
        }

        // 蘆花古渡沉船水閘與玄蛟首領
        case 'reed_switch': {
          if (f[obj.flag]) {
            if (this.ui) this.ui.toast(`${obj.name}已拉下，沉船水閘隆隆作響。`);
            return;
          }
          f[obj.flag] = true;
          PalX.audio.sfx('confirm');
          if (f.reed_sw_1 && f.reed_sw_2) {
            f.reed_sluice_open = true;
            this.showLines([
              { speaker: 'narrator', text: '轟隆巨響！東西雙向沉船水閘盡數落下，蘆花古渡阻水枯骨消退，北側航道正式貫通！' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          } else {
            if (this.ui) this.ui.toast(`扳動了【${obj.name}】！還需開啟另一側沉船水閘。`);
          }
          break;
        }

        case 'reed_boss_fuzhou': {
          this.showLines([
            { speaker: 'narrator', text: '狂濤分卷，被無生邪法污染的【覆舟玄蛟】掀起滔天濁浪攔住去路！' },
            { speaker: 'luxiao', text: '「孽畜休要作祟！接我一招御劍術！」' }
          ], () => {
            this.startStoryBoss(['boss_fuzhou'], {}, () => {
              f.defeated_fuzhou = true;
              this.showLines([
                { speaker: 'narrator', text: '玄蛟哀鳴遁入江底，通往【棲雲竹海】之青石古階豁然開朗！' }
              ], () => { if (this.ui) this.ui.updateTopHud(); });
            });
          });
          break;
        }

        case 'reed_to_qiyun': {
          if (!f.defeated_fuzhou) {
            this.showLines([{ speaker: 'luxiao', text: '「覆舟玄蛟盤踞江口，需先擊退妖龍！」' }]);
          } else {
            this.teleport('qiyun_bamboo', 15, 23);
          }
          break;
        }

        // 棲雲竹海四音石像、遇白芷微與血刃屠千刃
        case 'qixia_statue': {
          if (f[obj.flag]) {
            if (this.ui) this.ui.toast(`${obj.name}琴音悠揚，禁制已解。`);
            return;
          }
          f[obj.flag] = true;
          PalX.audio.sfx('magic');
          const count = ['statue_1', 'statue_2', 'statue_3', 'statue_4'].filter((k) => f[k]).length;
          if (count >= 4) {
            f.qixia_seal_broken = true;
            this.showLines([
              { speaker: 'narrator', text: '宮、商、角、羽四象琴韻和鳴！聽雪藥廬外五行竹障結界消散無形！' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          } else {
            if (this.ui) this.ui.toast(`叩響【${obj.name}】！（已協調 ${count}/4 座音律石像）`);
          }
          break;
        }

        case 'qiyun_clinic_boy': {
          this.showLines([
            { speaker: 'narrator', text: '採藥童子：「白姑娘正在藥廬配製解毒仙露，四象石像若鳴，便可步入內院。」' }
          ]);
          break;
        }

        case 'qixia_meet_lingxi': {
          if (!f.lingxi_joined) {
            f.lingxi_joined = true;
            this.unlockHero('lingxi');
            this.state.activeParty = ['luxiao', 'lingxi'];
            this.addItem('zijinyulu', 1);
            const runJoin = () => {
              this.showLines([
                { speaker: 'lingxi', text: '「來者何人，竟能以劍氣扣開我布下的四象音陣？」' },
                { speaker: 'luxiao', text: '「姑娘莫誤會！在下煙波鎮裴少游，因裴爺爺突發十八年前殘餘燼毒命在旦夕，特來叩求仙露救命！」' },
                { speaker: 'lingxi', text: '「聽雨渡的裴老伯？！十八年前家母隨素娥一脈鎮守歸墟，多蒙裴老伯相護……這瓶【聽雪清心露】你快拿去救人！」' },
                { speaker: 'narrator', text: '芷微將清露交予少游。就在此時，竹海外煞氣大盛——無生邪教血刃堂主竟循蹤殺至！' },
                { speaker: 'lingxi', text: '「無生教是衝著素娥清氣而來！少游，芷微助你一同殺出竹海！」' },
                { speaker: 'narrator', text: '【白芷微】加入隊伍！（白芷微身懷雙劍普通攻擊可【二連擊】，並精通素娥水月仙術與回生靈咒！）' }
              ], () => { if (this.ui) this.ui.updateTopHud(); });
            };
            if (this.ui) {
              this.ui.playPoetryScroll('【白芷微 · 定場詩】', PalX.HERO_TEMPLATES.lingxi.poem, runJoin);
            } else {
              runJoin();
            }
          } else {
            this.showLines([{ speaker: 'lingxi', text: '「少游，快由南面石階返回煙波鎮救治裴老伯！」' }]);
          }
          break;
        }

        case 'qixia_boss_chigui': {
          this.showLines([
            { speaker: 'chigui', text: '「桀桀桀！踏破鐵鞋無覓處，素娥聖女，隨本堂主回無生壇祭旗吧！」' },
            { speaker: 'luxiao', text: '「狂徒休得猖狂！白姑娘退後，且看我的聽潮碎浪劍！（提示：白芷微施展【冰咒】剋制火系，效果拔群！）」' }
          ], () => {
            this.startStoryBoss(['boss_chigui'], {}, () => {
              f.defeated_chigui = true;
              this.showLines([
                { speaker: 'chigui', text: '「呃啊……好凌厲的劍意……教主大計已成，你們救不了這人間……」' },
                { speaker: 'lingxi', text: '「血刃堂主伏誅！少游，我們快乘烏篷船回聽雨草堂！」' }
              ], () => { if (this.ui) this.ui.updateTopHud(); });
            });
          });
          break;
        }

        // ==================== 第二章：錦官城與鬼哭礦脈 ====================
        case 'suzhou_arena_yueling': {
          const runArena = () => {
            this.showLines([
              { speaker: 'yueling', text: '「堂堂鎮遠鏢局豈容鼠輩撒野！台下那腰懸舊鐵劍的少俠，看你步履沉穩，可敢上台接我三鞭？」' },
              { speaker: 'luxiao', text: '「在下煙波裴少游，為查十八年前歸墟押鏢真相而來，請燕姑娘指教！」' }
            ], () => {
              this.startStoryBoss(['boss_yueling'], { overrideParty: ['luxiao'] }, () => {
                this.showLines([
                  { speaker: 'narrator', text: '二人點到為止！忽見數名黑衣死士擲出暗器：「截殺鎮遠叛逆，奪取歸墟殘圖！」' },
                  { speaker: 'yueling', text: '「無生教妖徒竟敢在錦官城撒野！少游，聯手除賊！」' }
                ], () => {
                  this.startStoryBoss(['heifenghan', 'heifenghan'], { overrideParty: ['luxiao', 'yueling'] }, () => {
                    f.yueling_joined = true;
                    this.unlockHero('yueling');
                    this.state.activeParty = ['luxiao', 'yueling'];
                    this.fullRestoreParty();
                    this.showLines([
                      { speaker: 'yueling', text: '「多謝少游援手！家父十八年前押送五曜風魄入鬼哭礦脈後下落不明，世人皆污我鎮遠鏢局通邪叛道！我沈驚鴻縱粉身碎骨，亦要洗雪沈門冤屈！」' },
                      { speaker: 'narrator', text: '就在此時，留守客棧的白芷微感應到礦脈暗河妖氣激盪，已先一步趕往城東南【鬼哭礦脈】尋找地脈陣眼！' },
                      { speaker: 'luxiao', text: '「不好，芷微一人孤身犯險！燕姑娘，我們立刻同往鬼哭礦脈接應！」' },
                      { speaker: 'yueling', text: '「正合我意！持我這柄紅綾烈焰鞭，隨我闖入鬼哭溶洞！」' },
                      { speaker: 'narrator', text: '【燕驚鴻】加入隊伍！（燕驚鴻手持長鞭，普通攻擊具備【橫掃敵方全體】特效！由城東南道可進入鬼哭礦脈。）' }
                    ], () => { if (this.ui) this.ui.updateTopHud(); });
                  });
                });
              });
            });
          };
          if (this.ui) {
            this.ui.playPoetryScroll('【燕驚鴻 · 定場詩】', PalX.HERO_TEMPLATES.yueling.poem, runArena);
          } else {
            runArena();
          }
          break;
        }

        case 'sq_escort_npc': {
          if (!f.sq_escort_started) {
            f.sq_escort_started = true;
            this.showLines([
              { speaker: 'qinshu', text: '「老夫隨老總鏢頭走鏢三十年，總鏢頭深明大義，絕不可能投靠無生邪教！少俠若在鬼哭礦脈尋得老總鏢頭的蛛絲馬跡，萬望告知老夫！」' }
            ]);
          } else if (f.defeated_shejun && !f.sq_escort_done) {
            f.sq_escort_done = true;
            this.state.gold += 450;
            this.addItem('qiannianyurou', 1);
            PalX.audio.sfx('item');
            this.showLines([
              { speaker: 'qinshu', text: '「（見殘旗痛哭失聲）老總鏢頭果然戰至最後一刻，與風魄同存……鎮遠忠烈天地可鑑！這枚【赤麟鍛骨丹】與 450 文錢請少俠務必收下！」' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          } else {
            this.showLines([
              { speaker: 'qinshu', text: '「老夫在此靜候少俠與驚鴻少主的消息！」' }
            ]);
          }
          break;
        }

        case 'jinguan_inn': {
          const cost = 50;
          if (this.state.gold < cost) {
            this.showLines([{ speaker: 'narrator', text: `客棧投宿需 ${cost} 文錢。` }]);
          } else {
            this.state.gold -= cost;
            this.fullRestoreParty();
            PalX.audio.sfx('inn');
            if (this.ui) this.ui.updateTopHud();
            this.showLines([{ speaker: 'narrator', text: `在錦官客棧安然歇息，全員體力真氣完全恢復！` }]);
          }
          break;
        }

        case 'suzhou_med_shop': {
          if (this.ui) this.ui.openShop(PalX.MAPS.jinguan_city.shops.suzhou_med);
          break;
        }

        case 'sq_star_iron_npc': {
          if (!f.sq_star_iron_started) {
            f.sq_star_iron_started = true;
            this.showLines([
              { speaker: 'handajiang', text: '「老夫平生只鍛神兵！聽聞鬼哭暗河深潭有一枚太古【沉淵寒鐵礦】，少俠若能帶回，老夫免費為你錘煉一套上古【玄鐵鎖子甲】！」' }
            ], () => {
              if (this.ui) this.ui.openShop(PalX.MAPS.jinguan_city.shops.suzhou_wpn);
            });
          } else if (!f.sq_star_iron_done && this.getItemCount('star_iron') > 0) {
            this.addItem('star_iron', -1);
            f.sq_star_iron_done = true;
            this.addItem('xuantiejia', 1);
            this.addItem('leihuodan', 3);
            PalX.audio.sfx('levelup');
            this.showLines([
              { speaker: 'handajiang', text: '「叮噹！淬火功成！此【玄鐵鎖子甲】刀槍不入，另贈三顆【驚雷烈火彈】，少俠好生收好！」' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          } else {
            if (this.ui) this.ui.openShop(PalX.MAPS.jinguan_city.shops.suzhou_wpn);
          }
          break;
        }

        case 'sq_poem_npc': {
          if (f.sq_poem_done) {
            this.showLines([{ speaker: 'luzijin', text: '「高山流水遇知音，少俠詩劍雙絕，在下佩服！」' }]);
            return;
          }
          if (this.ui) {
            this.ui.startDialogue([
              {
                speaker: 'luzijin',
                text: '「在下以詩會友。第一題：『萬里雲山齊入劍，』請對下聯：」',
                choices: [
                  { label: '「一江煙雨總關情」', value: 'c1' },
                  { label: '「滿城風絮不知愁」', value: 'w1' },
                  { label: '「千秋霸業化為灰」', value: 'w2' }
                ]
              }
            ], (val1) => {
              if (val1 !== 'c1') {
                this.showLines([{ speaker: 'luzijin', text: '「對仗欠工整，少俠不妨再來試過！」' }]);
                return;
              }
              this.ui.startDialogue([
                {
                  speaker: 'luzijin',
                  text: '「妙極！第二題：『浮生若夢何須嘆，』請對下聯：」',
                  choices: [
                    { label: '「願借清波照素心」', value: 'c2' },
                    { label: '「獨飲濁酒待天明」', value: 'w3' },
                    { label: '「拔劍斬破九重天」', value: 'w4' }
                  ]
                }
              ], (val2) => {
                if (val2 !== 'c2') {
                  this.showLines([{ speaker: 'luzijin', text: '「意境略偏，少俠請多思索。」' }]);
                  return;
                }
                this.ui.startDialogue([
                  {
                    speaker: 'luzijin',
                    text: '「風雅卓絕！第三題：『待到春風催綠柳，』請對下聯：」',
                    choices: [
                      { label: '「相逢攜手醉紅塵」', value: 'c3' },
                      { label: '「孤影獨行向天涯」', value: 'w5' },
                      { label: '「白骨如山覆舊城」', value: 'w6' }
                    ]
                  }
                ], (val3) => {
                  if (val3 !== 'c3') {
                    this.showLines([{ speaker: 'luzijin', text: '「末聯稍欠圓滿，還望少俠斟酌。」' }]);
                    return;
                  }
                  f.sq_poem_done = true;
                  this.addItem('yufozhu', 1);
                  PalX.audio.sfx('item');
                  this.showLines([
                    { speaker: 'luzijin', text: '「胸藏錦繡，劍氣書香！此枚古剎神僧所遺法寶【菩提清音珠】（配戴可解鎖梵音鎮魔印）便贈予少俠！」' }
                  ], () => { if (this.ui) this.ui.updateTopHud(); });
                });
              });
            });
          } else {
            f.sq_poem_done = true;
            this.addItem('yufozhu', 1);
          }
          break;
        }

        case 'sq_miner_wife_npc': {
          if (!f.sq_miners_started) {
            f.sq_miners_started = true;
            this.showLines([
              { speaker: 'narrator', text: '林嫂哭泣：「我家當家的趙大被無生教強抓去鬼哭暗河開採血晶，至今杳無音信……求少俠搭救！」' }
            ]);
          } else if (f.saved_miners && !f.sq_miners_done) {
            f.sq_miners_done = true;
            this.state.gold += 350;
            this.addItem('qiannianyurou', 1);
            PalX.audio.sfx('item');
            this.showLines([
              { speaker: 'narrator', text: '林嫂連連叩謝：「趙大平安回來了！這包祖傳【凌波星辰砂】與 350 文錢請少俠收下！」' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          } else {
            this.showLines([{ speaker: 'narrator', text: '林嫂一家團聚，喜笑顏開。' }]);
          }
          break;
        }

        case 'jinguan_rescued_miner': {
          this.showLines([{ speaker: 'narrator', text: '礦工趙大：「多虧少俠在暗河斬殺妖蟒，救出我們兄弟！」' }]);
          break;
        }

        case 'jinguan_diviner': {
          const shards = this.getItemCount('memory_shard');
          this.showLines([
            { speaker: 'narrator', text: `袁天罡卜卦長嘆：「望舒月輪，墜入溟淵。若欲求取圓滿宿命，需尋回五枚【宿命殘簡】（目前已得 ${shards}/5 枚，散落於竹海、暗河、劍獄、熔窟與舊夢夜色之中）。」` }
          ]);
          break;
        }

        case 'suzhou_to_snake': {
          if (!f.yueling_joined) {
            this.showLines([{ speaker: 'luxiao', text: '「城北擂台喧騰，先去鎮遠鏢局擂台瞧瞧。」' }]);
          } else {
            this.teleport('ghost_mine', 3, 24);
          }
          break;
        }

        case 'jinguan_to_luoxia': {
          if (!f.defeated_shejun) {
            this.showLines([{ speaker: 'yueling', text: '「鬼哭礦脈凶險未除，白芷微姑娘亦在其中，我們先入暗河！」' }]);
          } else {
            this.teleport('luoxia_trail', 4, 23);
          }
          break;
        }

        // 鬼哭礦脈機關、救礦工、內殿鑰匙與雙妖尊
        case 'snake_switch': {
          if (f.snake_gate_open) {
            if (this.ui) this.ui.toast('暗河引水水閥已開啟。');
            return;
          }
          f.snake_gate_open = true;
          PalX.audio.sfx('confirm');
          this.showLines([
            { speaker: 'yueling', text: '「合力扳動這座青銅蟒首！看，暗河對岸的玄鐵鐵閘升起來了！」' }
          ], () => { if (this.ui) this.ui.updateTopHud(); });
          break;
        }

        case 'mine_rescue_miners': {
          if (f.saved_miners) {
            this.showLines([{ speaker: 'narrator', text: '礦牢空無一人，被解救的礦工們已順利逃回錦官城。' }]);
            return;
          }
          f.saved_miners = true;
          this.addItem('sheyao_key', 1);
          PalX.audio.sfx('item');
          this.showLines([
            { speaker: 'narrator', text: '少游揮劍斬開鐵鎖，解救被困礦工！礦工趙大感激涕零：「少俠恩公！這把從守衛妖頭身上掉下的【暗河玄鐵鑰】請拿去開啟深處妖尊內殿！」' }
          ], () => { if (this.ui) this.ui.updateTopHud(); });
          break;
        }

        case 'mine_unlock_inner': {
          if (f.mine_inner_open) {
            if (this.ui) this.ui.toast('妖尊內殿大門已完全洞開。');
            return;
          }
          if (this.getItemCount('sheyao_key') > 0) {
            f.mine_inner_open = true;
            this.addItem('sheyao_key', -1);
            PalX.audio.sfx('confirm');
            this.showLines([
              { speaker: 'narrator', text: '插入【暗河玄鐵鑰】，深處血池石門轟然敞開！' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          } else {
            this.showLines([
              { speaker: 'luxiao', text: '「大門緊鎖，需先在西側礦牢尋得【暗河玄鐵鑰】！」' }
            ]);
          }
          break;
        }

        case 'snake_boss_fight': {
          this.showLines([
            { speaker: 'shejun', text: '「嘶嘶……無生邪鼎即將煉化風魄，你們兩個凡骨竟敢闖入送死！」' },
            { speaker: 'yinhu', text: '「好俊俏的少俠，不如把心肝留給本宮做補品吧！」' },
            { speaker: 'yueling', text: '「呸！妖孽納命來！（提示：二人同場可點擊【合擊】發動驚鴻弦月斬！）」' }
          ], () => {
            this.startStoryBoss(['boss_shejun', 'boss_yinhu'], {}, () => {
              f.defeated_shejun = true;
              this.addItem('fenglingzhu', 1);
              this.addItem('zhenyuan_flag', 1);
              this.state.activeParty = ['luxiao', 'lingxi', 'yueling'];
              this.fullRestoreParty();
              this.showLines([
                { speaker: 'narrator', text: '雙妖尊伏誅！妖鼎碎裂處飛出五曜之一【扶搖風魄】與染血的【鎮遠舊鏢旗】！' },
                { speaker: 'lingxi', text: '「少游、驚鴻姐姐！我在暗河另一端布下了清心法陣，正好及時會合！」' },
                { speaker: 'yueling', text: '「芷微妹妹無恙便好！風魄已現，北方【玄霄劍宗】乃執牛耳者，我們即刻由錦官城北門攀登【落霞山道】上玄霄！」' },
                { speaker: 'narrator', text: '三人小隊正式合壁！由錦官城北可登落霞山道。' }
              ], () => { if (this.ui) this.ui.updateTopHud(); });
            });
          });
          break;
        }

        // ==================== 第三章：落霞山道、玄霄劍宗與鎮魔劍獄 ====================
        case 'luoxia_tea_rest': {
          this.fullRestoreParty();
          PalX.audio.sfx('inn');
          this.showLines([{ speaker: 'narrator', text: '在落霞茶亭烹泉品茗，全員氣血充盈！' }]);
          break;
        }

        case 'luoxia_oath_stele': {
          if (!f.got_sword_token) {
            f.got_sword_token = true;
            this.addItem('broken_sword_token', 1);
            PalX.audio.sfx('item');
            this.showLines([
              { speaker: 'narrator', text: '古碑石縫中插著半枚斷劍劍穗：「兩百年誓守，不負太阿。」獲得【守約舊劍穗】（可用於支線解除守劍癡魂執念）。' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          } else {
            this.showLines([{ speaker: 'narrator', text: '古碑劍意凜然，殘字隱入雲煙。' }]);
          }
          break;
        }

        case 'luoxia_boss_jiannu': {
          this.showLines([
            { speaker: 'hanxiao', text: '「厲首座法旨：凡攜邪異五魄窺探玄霄者，格殺勿論！」' },
            { speaker: 'luxiao', text: '「同為劍修，豈能助紂為虐！拔劍吧！」' }
          ], () => {
            this.startStoryBoss(['boss_jiannu'], {}, () => {
              f.defeated_jiannu = true;
              this.showLines([
                { speaker: 'narrator', text: '棄徒韓梟敗退，玄霄劍宗山門大開！' }
              ], () => { if (this.ui) this.ui.updateTopHud(); });
            });
          });
          break;
        }

        case 'luoxia_to_sect': {
          if (!f.defeated_jiannu) {
            this.showLines([{ speaker: 'luxiao', text: '「劍奴韓梟阻道，需先勝過此人。」' }]);
          } else {
            this.teleport('xuanxiao_sect', 16, 24);
          }
          break;
        }

        case 'shushan_main_event': {
          if (!f.entered_demon_tower) {
            f.entered_demon_tower = true;
            this.state.activeParty = ['luxiao', 'yueling'];
            this.showLines([
              { speaker: 'cangming', text: '「大膽妖女！攜素娥殘脈與歸墟濁氣踏我太微殿！來人，打入【鎮魔劍獄】永世鎮壓！」' },
              { speaker: 'lingxi', text: '「厲首座！素娥一脈本為封淵而生，非是邪佞——啊！」' },
              { speaker: 'luxiao', text: '「住手！芷微一路救死扶傷，爾等道貌岸然，竟不辨善惡！」' },
              { speaker: 'cangming', text: '「哼！頑冥不靈，待本座淨化此女，再治爾等擅闖宗門之罪！」' },
              { speaker: 'yueling', text: '「少游，不必多費唇舌！劍獄在東峰後山，我們持劍殺進去劫獄救人！」' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          } else {
            this.showLines([{ speaker: 'narrator', text: '厲無咎長老閉目入定，冷眼睥睨。' }]);
          }
          break;
        }

        case 'shushan_zuijian_jiushen': {
          if (!f.learned_jiushen) {
            f.learned_jiushen = true;
            this.addItem('shaodaozi', 2);
            if (!this.state.heroes.luxiao.skills.includes('jiushen')) {
              this.state.heroes.luxiao.skills.push('jiushen');
            }
            PalX.audio.sfx('levelup');
            this.showLines([
              { speaker: 'zuijian', text: '「臭小子，老夫緊趕慢趕還是慢了一步！厲無咎早已入魔，竟欲以素娥靈脈填平歸墟成就己身仙道！」' },
              { speaker: 'luxiao', text: '「謝前輩，請指點少游破獄救人之法！」' },
              { speaker: 'zuijian', text: '「這招乃老夫畢生至高劍意【醉月狂歌】（一生限用九次，需行囊有酒方可發動），今日盡數傳你！喝了這壺燒刀子，去斬碎劍獄枷鎖！」' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          } else {
            this.showLines([{ speaker: 'zuijian', text: '「持劍問心，莫失其真。去吧，少游！」' }]);
          }
          break;
        }

        case 'shushan_med_shop': {
          if (this.ui) this.ui.openShop(PalX.MAPS.xuanxiao_sect.shops.shushan_med);
          break;
        }

        case 'shushan_wpn_shop': {
          if (this.ui) this.ui.openShop(PalX.MAPS.xuanxiao_sect.shops.shushan_wpn);
          break;
        }

        case 'xuanxiao_rest': {
          this.fullRestoreParty();
          PalX.audio.sfx('inn');
          this.showLines([{ speaker: 'narrator', text: '在客寮調息凝神，狀態完全恢復。' }]);
          break;
        }

        case 'sq_duel_disciple': {
          if (f.sq_sword_duel_done) {
            this.showLines([{ speaker: 'lingfeng', text: '「少游師弟劍術超群，凌風佩服！」' }]);
            return;
          }
          this.showLines([
            { speaker: 'lingfeng', text: '「在下太微試劍首徒凌風，欲領教謝前輩一脈聽潮劍法！」' }
          ], () => {
            this.startStoryBoss(['shijiankui'], {}, () => {
              f.sq_sword_duel_done = true;
              this.state.gold += 400;
              this.addItem('qiannianyurou', 1);
              PalX.audio.sfx('item');
              this.showLines([
                { speaker: 'lingfeng', text: '「果然精妙！此枚【望舒凝華果】與 400 文錢贈與師弟，願少俠劍道大成！」' }
              ], () => { if (this.ui) this.ui.updateTopHud(); });
            });
          });
          break;
        }

        case 'shushan_to_tower': {
          if (!f.entered_demon_tower) {
            this.showLines([{ speaker: 'luxiao', text: '「需先去北殿面見宗門執劍首座。」' }]);
          } else {
            this.teleport('sword_prison', 16, 25);
          }
          break;
        }

        case 'tower_switch_yin': {
          if (f.tower_yin) {
            if (this.ui) this.ui.toast('太陰陣樞已點亮。');
            return;
          }
          f.tower_yin = true;
          PalX.audio.sfx('confirm');
          if (f.tower_yin && f.tower_yang) {
            f.tower_seal_open = true;
            this.showLines([{ speaker: 'narrator', text: '太陰、太陽兩儀合璧！鎮魔古獄深處雷獄禁門轟然開解！' }], () => { if (this.ui) this.ui.updateTopHud(); });
          } else {
            if (this.ui) this.ui.toast('點亮了【太陰陣樞】！還需開啟太陽陣樞。');
          }
          break;
        }

        case 'tower_switch_yang': {
          if (f.tower_yang) {
            if (this.ui) this.ui.toast('太陽陣樞已點亮。');
            return;
          }
          f.tower_yang = true;
          PalX.audio.sfx('confirm');
          if (f.tower_yin && f.tower_yang) {
            f.tower_seal_open = true;
            this.showLines([{ speaker: 'narrator', text: '太陰、太陽兩儀合璧！鎮魔古獄深處雷獄禁門轟然開解！' }], () => { if (this.ui) this.ui.updateTopHud(); });
          } else {
            if (this.ui) this.ui.toast('點亮了【太陽陣樞】！還需開啟太陰陣樞。');
          }
          break;
        }

        case 'sq_sword_ghost_npc': {
          if (!f.sq_sword_oath_started && this.getItemCount('broken_sword_token') === 0) {
            f.sq_sword_oath_started = true;
            this.showLines([
              { speaker: 'peixuan', text: '「兩百年了……師兄，你當年赴落霞山抵擋魔潮，究竟可曾平安？我答應過要替你守著這柄太阿殘佩……」' }
            ]);
          } else if (!f.sq_sword_oath_done) {
            f.sq_sword_oath_started = true;
            if (this.getItemCount('broken_sword_token') > 0) {
              this.addItem('broken_sword_token', -1);
              f.sq_sword_oath_done = true;
              this.addItem('taia_jade', 1);
              PalX.audio.sfx('levelup');
              this.showLines([
                { speaker: 'peixuan', text: '「（摩挲斷劍穗淚落如雨）這是師兄的劍穗……他至死都不曾負約！心願已了，此枚【太阿古劍佩】（可開啟古墟問心劍塚）便交予少俠了！」' }
              ], () => { if (this.ui) this.ui.updateTopHud(); });
            } else {
              this.showLines([{ speaker: 'peixuan', text: '「落霞山古道處，可曾有師兄的消息……」' }]);
            }
          } else {
            this.showLines([{ speaker: 'peixuan', text: '「執念已散，多謝少俠。」' }]);
          }
          break;
        }

        case 'sq_paint_spirit_npc': {
          if (f.sq_painting_done) {
            this.showLines([{ speaker: 'narrator', text: '畫卷靈光溫潤，素心含笑欠身。' }]);
            return;
          }
          if (this.ui) {
            this.ui.startDialogue([
              {
                speaker: 'narrator',
                text: '【畫靈素心】自殘卷浮現：「妾身被困古獄百年。敢問少俠：若逢雷霆暴烈之魔，當以五行何系破之？」',
                choices: [
                  { label: '「以火克雷，熾烈焚天！」', value: 'fire' },
                  { label: '「以土克水，厚德載物。」', value: 'earth' },
                  { label: '「以風引雷，同氣連枝。」', value: 'wind' }
                ]
              }
            ], (ans) => {
              if (ans === 'fire') {
                f.sq_painting_done = true;
                this.addItem('memory_shard', 1);
                this.addItem('yuputi', 1);
                PalX.audio.sfx('item');
                this.showLines([
                  { speaker: 'narrator', text: '素心展顏微笑：「少俠深諳生剋至理！贈予【宿命殘簡】與【玉菩提】一枚！」' }
                ], () => { if (this.ui) this.ui.updateTopHud(); });
              } else {
                this.showLines([{ speaker: 'narrator', text: '素心搖頭輕嘆：「此法恐難化解雷煞，少俠請再思量。」' }]);
              }
            });
          } else {
            f.sq_painting_done = true;
            this.addItem('memory_shard', 1);
            this.addItem('yuputi', 1);
          }
          break;
        }

        case 'tower_boss_mingwang': {
          this.showLines([
            { speaker: 'mingwang', text: '「凡擅闖鎮魔劍獄者，受九天雷極神殛！」' },
            { speaker: 'luxiao', text: '「斬開鎖鏈，救出芷微！（提示：可用【醉月狂歌】或火系仙術轟破雷甲！）」' }
          ], () => {
            this.startStoryBoss(['boss_mingwang'], {}, () => {
              f.defeated_mingwang = true;
              this.addItem('leilingzhu', 1);
              this.state.activeParty = ['luxiao'];
              PalX.audio.playMusic('sad');
              this.showLines([
                { speaker: 'narrator', text: '雷獄鎖鏈崩斷，五曜之二【驚蟄雷魄】入手！然而古獄地脈劇烈崩塌，萬斤巨石砸落之際，燕驚鴻猛揮長鞭將少游與芷微推向石階，自己卻被玄鐵柱砸中心脈！' },
                { speaker: 'yueling', text: '「少游……別哭……說好一起去江南喝桂花釀的……本姑娘才不會輕易認輸……」' },
                { speaker: 'zuijian', text: '「劍氣凌虛，瞬息千里！臭小子休慌，老夫御劍帶你們速奔苗疆【雲夢澤·百草懸空寨】求辛夷藥婆續命！」' }
              ], () => {
                this.teleport('yunmeng_village', 16, 15);
              });
            });
          });
          break;
        }

        // ==================== 第四章：雲夢澤、迷霧瘴林與祝融赤炎熔窟 ====================
        case 'miao_shenggu': {
          if (!f.saved_yueling) {
            if (this.getItemCount('fenghuangyu') > 0 && this.getItemCount('huoqilinjiao') > 0) {
              this.addItem('fenghuangyu', -1);
              this.addItem('huoqilinjiao', -1);
              f.saved_yueling = true;
              this.state.activeParty = ['luxiao', 'lingxi', 'yueling', 'aman'];
              this.fullRestoreParty();
              this.addItem('memory_shard', 1);
              PalX.audio.sfx('levelup');
              this.showLines([
                { speaker: 'shenggu', text: '「好！梧桐鳳血髓重塑筋脈，祝融赤炎丹回陽通絡！老身這便施展【百草續命蠱法】！」' },
                { speaker: 'narrator', text: '霞光籠罩竹榻，燕驚鴻與白芷微雙雙甦醒！藥婆亦將自古寨拾獲的【宿命殘簡】交予少游。' },
                { speaker: 'shenggu', text: '「兩位姑娘性命已無礙！深淵大戰在即，由寨西北可通往【望舒古墟】尋回最後水魄！」' }
              ], () => { if (this.ui) this.ui.updateTopHud(); });
            } else {
              this.showLines([
                { speaker: 'shenggu', text: '「燕姑娘心脈受創，白姑娘靈氣枯竭！若欲救命，需速往東林【迷霧瘴林】取【梧桐鳳血髓】，再入南窟【祝融赤炎熔窟】求【祝融赤炎丹】！快隨我徒兒【雲珞】同行！」' }
              ]);
            }
          } else {
            this.fullRestoreParty();
            this.showLines([{ speaker: 'shenggu', text: '「同伴均已調息完畢，深淵浩劫將至，少俠萬事小心！」' }]);
          }
          break;
        }

        case 'yunmeng_check_yueling': {
          if (f.saved_yueling) {
            this.showLines([{ speaker: 'yueling', text: '「少游！我的傷全好啦，長鞭已擦亮，隨時可以出發！」' }]);
          } else {
            this.showLines([{ speaker: 'narrator', text: '燕驚鴻靜臥竹榻，氣息微弱，需儘快取得鳳血髓與赤炎丹！' }]);
          }
          break;
        }

        case 'yunmeng_check_lingxi': {
          if (f.saved_yueling) {
            this.showLines([{ speaker: 'lingxi', text: '「少游，不必為我擔憂，有大家在身邊，芷微無所畏懼。」' }]);
          } else {
            this.showLines([{ speaker: 'narrator', text: '白芷微閉目調息，等待藥引以解枯竭之體。' }]);
          }
          break;
        }

        case 'miao_aman_join': {
          if (!f.aman_joined) {
            f.aman_joined = true;
            this.unlockHero('aman');
            this.state.activeParty = ['luxiao', 'aman'];
            this.addItem('liangumin', 1);
            const runAman = () => {
              this.showLines([
                { speaker: 'aman', text: '「嘻嘻！你就是那個大鬧玄霄劍宗的裴少游哥哥？我是百草懸空寨雲珞，大家都叫我阿螢！」' },
                { speaker: 'luxiao', text: '「阿螢姑娘有禮！為救驚鴻與芷微，還請姑娘為我引路！」' },
                { speaker: 'aman', text: '「包在我身上！這只苗疆至寶【百草丹鼎】送給你——打開選單【百草鼎】，投入兩種靈草毒物，就能煉出靈丹妙藥喔！」' },
                { speaker: 'narrator', text: '【雲珞】加入隊伍，並解鎖【百草丹鼎】煉藥系統！' }
              ], () => { if (this.ui) this.ui.updateTopHud(); });
            };
            if (this.ui) {
              this.ui.playPoetryScroll('【雲珞 · 定場詩】', PalX.HERO_TEMPLATES.aman.poem, runAman);
            } else {
              runAman();
            }
          } else {
            this.showLines([{ speaker: 'aman', text: '「少游哥哥，我們先往東橋進迷霧瘴林吧！」' }]);
          }
          break;
        }

        case 'miao_med_shop': {
          if (this.ui) this.ui.openShop(PalX.MAPS.yunmeng_village.shops.miao_med);
          break;
        }

        case 'miao_wpn_shop': {
          if (this.ui) this.ui.openShop(PalX.MAPS.yunmeng_village.shops.miao_wpn);
          break;
        }

        case 'yunmeng_rest': {
          this.fullRestoreParty();
          PalX.audio.sfx('inn');
          this.showLines([{ speaker: 'narrator', text: '在吊腳竹樓小憩，全員精力倍增！' }]);
          break;
        }

        case 'sq_alchemy_ge_npc': {
          if (!f.sq_alchemy_started && this.getItemCount('yingu') === 0) {
            f.sq_alchemy_started = true;
            this.showLines([
              { speaker: 'narrator', text: '葛伯：「老拙醉心丹道，若能以【百草丹鼎】（如靈草＋寒露）合成一顆【幻霧隱靈丹】，老拙願以至寶金蠶相贈！」' }
            ]);
          } else if (!f.sq_alchemy_done) {
            f.sq_alchemy_started = true;
            if (this.getItemCount('yingu') > 0) {
              f.sq_alchemy_done = true;
              this.addItem('jincanwang', 1);
              PalX.audio.sfx('levelup');
              this.showLines([
                { speaker: 'narrator', text: '葛伯雙手顫抖鑑賞：「妙！靈氣渾然天成！丹藥少俠留著自用，這隻可直接突破一重境界的【金蠶靈王】便贈予你了！」' }
              ], () => { if (this.ui) this.ui.updateTopHud(); });
            } else {
              this.showLines([{ speaker: 'narrator', text: '葛伯：「少俠快試試百草丹鼎的各種藥材組合吧。」' }]);
            }
          } else {
            this.showLines([{ speaker: 'narrator', text: '葛伯：「少俠丹術精湛，老拙心服口服！」' }]);
          }
          break;
        }

        case 'sq_fawn_boy_npc': {
          if (!f.sq_fawn_started) {
            f.sq_fawn_started = true;
            this.showLines([
              { speaker: 'narrator', text: '阿木：「嗚嗚……我的小白鹿在迷霧瘴林深處走失了，裡面毒瘴那麼重，求大哥哥幫忙尋回！」' }
            ]);
          } else if (f.fawn_rescued && !f.sq_fawn_done) {
            f.sq_fawn_done = true;
            this.addItem('zhutian_xuanwu', 1);
            this.addItem('jiuzhuanxuming', 1);
            PalX.audio.sfx('item');
            this.showLines([
              { speaker: 'narrator', text: '阿木抱著小白鹿歡呼：「小白鹿平安回來啦！這顆亮晶晶的【鑄天玄武石】與【九轉續命露】送給恩公！」' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          } else {
            this.showLines([{ speaker: 'narrator', text: '阿木正開心地餵小白鹿吃嫩草。' }]);
          }
          break;
        }

        case 'miao_to_qilin': {
          if (!f.aman_joined) {
            this.showLines([{ speaker: 'luxiao', text: '「大澤路徑迷離，先與白草司雲珞姑娘會合。」' }]);
          } else {
            this.teleport('miasma_forest', 3, 14);
          }
          break;
        }

        case 'miao_to_rift': {
          if (!f.saved_yueling) {
            this.showLines([{ speaker: 'luxiao', text: '「驚鴻與芷微重傷在身，需先集齊兩味靈藥回寨救治！」' }]);
          } else {
            this.teleport('wangshu_ruins', 15, 23);
          }
          break;
        }

        // 迷霧瘴林風圖騰、救靈鹿與千年腐木毒尊
        case 'miasma_totem': {
          if (f[obj.flag]) {
            if (this.ui) this.ui.toast(`${obj.name}罡風呼嘯，瘴氣散退。`);
            return;
          }
          f[obj.flag] = true;
          PalX.audio.sfx('magic');
          const count = ['wtotem_1', 'wtotem_2', 'wtotem_3'].filter((k) => f[k]).length;
          if (count >= 3) {
            f.miasma_cleared = true;
            this.showLines([
              { speaker: 'narrator', text: '三座驅瘴風圖騰齊鳴！大澤百里毒霧退散，神木王座之門開啟！' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          } else {
            if (this.ui) this.ui.toast(`引動【${obj.name}】！（已點亮 ${count}/3 座風圖騰）`);
          }
          break;
        }

        case 'sq_rescue_fawn': {
          if (f.fawn_rescued) {
            this.showLines([{ speaker: 'narrator', text: '小白鹿已安然返回寨中。' }]);
            return;
          }
          f.fawn_rescued = true;
          PalX.audio.sfx('heal');
          this.showLines([
            { speaker: 'narrator', text: '少游以靈氣化解小鹿身上微毒，小白鹿歡躍啼鳴，奔回懸空寨找阿木去了！' }
          ], () => { if (this.ui) this.ui.updateTopHud(); });
          break;
        }

        case 'miasma_boss_fight': {
          this.showLines([
            { speaker: 'narrator', text: '萬年腐朽樹根拔地而起，【千年腐木毒尊】裹挾地脈黑瘴狂嘯襲來！' },
            { speaker: 'aman', text: '「少游哥哥，這老樹妖怕火！用祝融焚天之術破它盤根！」' }
          ], () => {
            this.startStoryBoss(['boss_fumuzun'], {}, () => {
              f.defeated_fumuzun = true;
              this.addItem('tulingzhu', 1);
              this.showLines([
                { speaker: 'narrator', text: '腐木化為飛灰，五曜之三【坤輿土魄】落入掌中！前方鳳棲古木的靈髓樹洞已可採掘！' }
              ], () => { if (this.ui) this.ui.updateTopHud(); });
            });
          });
          break;
        }

        case 'qilin_phoenix_chest': {
          if (f.got_fenghuangyu) {
            this.showLines([{ speaker: 'narrator', text: '梧桐古樹已收穫靈髓。' }]);
            return;
          }
          if (!f.defeated_fumuzun) {
            this.showLines([{ speaker: 'luxiao', text: '「腐木毒尊妖氣籠罩，需先破除妖尊！」' }]);
            return;
          }
          f.got_fenghuangyu = true;
          this.addItem('fenghuangyu', 1);
          PalX.audio.sfx('item');
          this.showLines([
            { speaker: 'narrator', text: '自神木樹洞採得續命至寶【梧桐鳳血髓】！速往南面【祝融赤炎熔窟】尋求火麟丹！' }
          ], () => { if (this.ui) this.ui.updateTopHud(); });
          break;
        }

        case 'miasma_to_zhurong': {
          if (!f.defeated_fumuzun) {
            this.showLines([{ speaker: 'luxiao', text: '「毒尊未平，去路受阻。」' }]);
          } else {
            this.teleport('zhurong_cavern', 16, 25);
          }
          break;
        }

        // 祝融赤炎熔窟火樞與祝融炎麟獸
        case 'zhurong_switch': {
          if (f[obj.flag]) {
            if (this.ui) this.ui.toast(`${obj.name}赤焰高騰。`);
            return;
          }
          f[obj.flag] = true;
          PalX.audio.sfx('confirm');
          if (f.fsw_1 && f.fsw_2) {
            f.fire_bridge_open = true;
            this.showLines([
              { speaker: 'narrator', text: '地底熔岩兩極火樞共鳴，橫跨火海的熔岩玄橋升起！' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          } else {
            if (this.ui) this.ui.toast(`引動了【${obj.name}】！需再點亮另一側火樞。`);
          }
          break;
        }

        case 'qilin_boss_fight': {
          this.showLines([
            { speaker: 'qilin', text: '「吼——！吾乃祝融守道炎麟！欲取靈丹與火魄，先以劍意過吾這關！」' },
            { speaker: 'luxiao', text: '「得罪了，炎麟尊者！（提示：水系仙術剋制赤炎！）」' }
          ], () => {
            this.startStoryBoss(['boss_huoqilin'], {}, () => {
              f.defeated_qilin = true;
              this.addItem('huoqilinjiao', 1);
              this.addItem('huolingzhu', 1);
              PalX.audio.sfx('item');
              this.showLines([
                { speaker: 'qilin', text: '「好一個赤子劍心！此枚【祝融赤炎丹】與五曜之四【焚天火魄】贈予汝等！」' },
                { speaker: 'luxiao', text: '「兩味神藥盡皆入手！快回百草懸空寨請辛夷藥婆救醒驚鴻與芷微！」' }
              ], () => { if (this.ui) this.ui.updateTopHud(); });
            });
          });
          break;
        }

        // ==================== 第五章：望舒古墟、問心劍塚與十八年前舊夢 ====================
        case 'rift_longtan_mirror': {
          if (f.forged_longtan_pact) {
            this.showLines([{ speaker: 'narrator', text: '【同心守歲契】清輝熠熠，足以為芷微抵禦歸墟死劫！' }]);
            return;
          }
          const shardCount = this.getItemCount('memory_shard');
          if (shardCount >= 4) {
            f.forged_longtan_pact = true;
            this.addItem('longtan_pact', 1);
            PalX.audio.sfx('levelup');
            this.showLines([
              { speaker: 'narrator', text: '太古照影古鏡映照四人羈絆，太音神響：「記憶為誓，守歲同心；執迷不屈者，得破天命！」' },
              { speaker: 'luxiao', text: '「若天命注定素娥後人必須以身殉海，我裴少游願承萬重風雪，換四人同歸江南！」' },
              { speaker: 'narrator', text: '靈光鑄就至寶【同心守歲契】！（已達成隱藏真結局核心條件！）' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          } else {
            this.showLines([
              { speaker: 'narrator', text: `照影古鏡沉寂：「需集齊至少 4 枚【宿命殘簡】方能締結守歲逆命契（目前擁有 ${shardCount} 枚，線索遍布竹海蘭幽、暗河玄鐵、劍獄畫卷、炎窟深處與舊夢故人）。」` }
            ]);
          }
          break;
        }

        case 'ruins_to_secret_grotto': {
          if (this.getItemCount('taia_jade') > 0 || f.unlocked_trial_grotto) {
            f.unlocked_trial_grotto = true;
            this.teleport('sword_trial_grotto', 14, 23);
          } else {
            this.showLines([{ speaker: 'luxiao', text: '「劍塚古門刻有太阿銘紋，需得【太阿古劍佩】方可開啟。」' }]);
          }
          break;
        }

        // 隱藏試煉：問心劍塚與太阿劍靈
        case 'trial_switch': {
          if (f[obj.flag]) {
            if (this.ui) this.ui.toast(`${obj.name}劍陣已啟動。`);
            return;
          }
          f[obj.flag] = true;
          PalX.audio.sfx('confirm');
          if (f.tsw_1 && f.tsw_2) {
            f.trial_gate_open = true;
            this.showLines([{ speaker: 'narrator', text: '問心劍陣兩翼開解，太阿試煉台降臨！' }], () => { if (this.ui) this.ui.updateTopHud(); });
          } else {
            if (this.ui) this.ui.toast(`引動了【${obj.name}】！需開啟兩側劍陣。`);
          }
          break;
        }

        case 'trial_superboss_fight': {
          this.showLines([
            { speaker: 'swordspirit', text: '「吾乃上古太阿劍靈！持劍問心，汝之劍，因何而鳴？」' },
            { speaker: 'luxiao', text: '「不為長生，不為稱尊，只為守護眼前所愛與人間燈火！」' }
          ], () => {
            this.startStoryBoss(['boss_swordspirit'], { music: 'final_boss' }, () => {
              f.defeated_swordspirit = true;
              this.showLines([
                { speaker: 'swordspirit', text: '「善！有情之劍，方通天地造化！」' }
              ], () => { if (this.ui) this.ui.updateTopHud(); });
            });
          });
          break;
        }

        case 'trial_taia_chest': {
          if (f.got_taia_sword) {
            this.showLines([{ speaker: 'narrator', text: '太阿劍台光華內斂。' }]);
            return;
          }
          if (!f.defeated_swordspirit) {
            this.showLines([{ speaker: 'luxiao', text: '「需先通過太阿劍靈之試煉。」' }]);
            return;
          }
          f.got_taia_sword = true;
          this.addItem('taia_sword', 1);
          this.addItem('jincanwang', 2);
          PalX.audio.sfx('levelup');
          this.showLines([
            { speaker: 'narrator', text: '拔出曠世神兵【太阿古劍】！並獲得【金蠶靈王×2】！' }
          ], () => { if (this.ui) this.ui.updateTopHud(); });
          break;
        }

        // 十八年前舊夢：燕鐵衣、謝滄海、童年少游與夜梟
        case 'past_yantiyi_talk': {
          this.showLines([
            { speaker: 'yantiyi', text: '「驚鴻這丫頭……將來若繼承鏢局，定比老夫更有擔當。少俠，無論你是何人，謝你護佑我兒！」' }
          ]);
          break;
        }

        case 'past_xie_talk': {
          this.showLines([
            { speaker: 'young_xie', text: '「歸墟暴動，厲師兄竟欲封閉山門見死不救……今日我謝滄海哪怕破門出宗，也定要隨燕總鏢頭擋下魔潮！」' }
          ]);
          break;
        }

        case 'rift_young_luxiao': {
          if (!f.met_young_self) {
            f.met_young_self = true;
            this.addItem('memory_shard', 1);
            PalX.audio.sfx('item');
            this.showLines([
              { speaker: 'young_luxiao', text: '「嗚……江水好冷，裴爺爺去划船了……大哥哥，你身上的鐵劍跟我懷裡的木劍好像呀！這枚發光的青石片送給你！」' },
              { speaker: 'luxiao', text: '「（心頭震撼）十八年前在江畔鼓勵我活下來的青衫劍客……竟是今日的我！」' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          } else if (f.defeated_yexiao && !f.got_shuilingzhu) {
            f.got_shuilingzhu = true;
            this.addItem('shuilingzhu', 1);
            PalX.audio.sfx('levelup');
            this.showLines([
              { speaker: 'young_luxiao', text: '「大哥哥打跑大怪鳥啦！這顆藍色的大水珠是在江心浮木上撿到的，交給大哥哥！」' },
              { speaker: 'narrator', text: '最後一顆至寶——五曜之五【滄瀾水魄】入手！五曜盡齊！' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          } else {
            this.showLines([{ speaker: 'young_luxiao', text: '「阿鶴長大以後，也要像大哥哥一樣勇敢！」' }]);
          }
          break;
        }

        case 'rift_boss_yexiao': {
          this.showLines([
            { speaker: 'yexiao', text: '「桀桀！歸墟裂隙大開，水靈珠乃我魔界囊中之物！」' },
            { speaker: 'luxiao', text: '「十八年前的悲劇，絕不容你在今日重演！」' }
          ], () => {
            this.startStoryBoss(['boss_yexiao'], {}, () => {
              f.defeated_yexiao = true;
              this.showLines([
                { speaker: 'narrator', text: '夜梟潰滅，時空平定！快去找小阿鶴取得水靈珠！' }
              ], () => { if (this.ui) this.ui.updateTopHud(); });
            });
          });
          break;
        }

        case 'rift_to_abyss': {
          if (!f.got_shuilingzhu) {
            this.showLines([{ speaker: 'luxiao', text: '「水曜靈魄尚未尋回，無法封閉時空裂口。」' }]);
          } else {
            this.teleport('guixu_causeway', 15, 23);
          }
          break;
        }

        // ==================== 終章：歸墟溟海古道與望舒天闕 ====================
        case 'guixu_supply_shop': {
          if (this.ui) this.ui.openShop(PalX.MAPS.guixu_causeway.shops.guixu_supply);
          break;
        }

        case 'guixu_camp_rest': {
          this.fullRestoreParty();
          PalX.audio.sfx('inn');
          this.showLines([{ speaker: 'zuijian', text: '「在深淵營地痛飲一番，真氣精氣完全充盈！前方即是望舒天闕！」' }]);
          break;
        }

        case 'causeway_switch': {
          if (f[obj.flag]) {
            if (this.ui) this.ui.toast(`${obj.name}血祭陣眼已破除。`);
            return;
          }
          f[obj.flag] = true;
          PalX.audio.sfx('confirm');
          if (f.csw_1 && f.csw_2) {
            f.causeway_seal_open = true;
            this.showLines([
              { speaker: 'narrator', text: '沉淵雙陣俱破，通往望舒天闕之天梯長橋降臨！' }
            ], () => { if (this.ui) this.ui.updateTopHud(); });
          } else {
            if (this.ui) this.ui.toast(`破除了【${obj.name}】！需破除兩側血陣。`);
          }
          break;
        }

        case 'citadel_heal_spring': {
          this.fullRestoreParty();
          PalX.audio.sfx('heal');
          if (this.ui) {
            this.ui.updateTopHud();
            this.ui.toast('沐浴望舒天闕月華靈泉，全員體力真氣完全充盈，百毒盡消！');
          }
          break;
        }

        case 'abyss_party_selector': {
          if (this.ui) {
            this.ui.startDialogue([
              {
                speaker: 'narrator',
                text: '終局死戰在即，請挑選三人決戰陣容：',
                choices: [
                  { label: '【聽雪鎮遠陣】裴少游 ＋ 白芷微 ＋ 燕驚鴻', value: 'luxiao,lingxi,yueling' },
                  { label: '【聽雪百草陣】裴少游 ＋ 白芷微 ＋ 雲珞', value: 'luxiao,lingxi,aman' },
                  { label: '【雙姝疾攻陣】裴少游 ＋ 燕驚鴻 ＋ 雲珞', value: 'luxiao,yueling,aman' }
                ]
              }
            ], (val) => {
              if (val) {
                this.state.activeParty = val.split(',');
                this.fullRestoreParty();
                if (this.ui) {
                  this.ui.updateTopHud();
                  this.ui.toast(`出戰陣容已確認：${this.state.activeParty.map((id) => this.state.heroes[id].name).join('、')}！`);
                }
              }
            });
          }
          break;
        }

        case 'abyss_wuling_altar': {
          if (f.abyss_seal_open) {
            if (this.ui) this.ui.toast('五曜大陣已成，終焉結界已開！');
            return;
          }
          f.abyss_seal_open = true;
          this.addItem('shenglingzhu', 1);
          const leader = this.state.heroes[this.state.activeParty[0]];
          if (leader && !leader.equip.relic) {
            this.equipItem(leader.id, 'shenglingzhu');
          }
          PalX.audio.sfx('levelup');
          this.showLines([
            { speaker: 'narrator', text: '風、雷、火、土、水五曜靈魄融入總樞，天地五色神光沖霄！化合為無上神器——【望舒五曜聖魄】！' },
            { speaker: 'lingxi', text: '「只要同伴配戴【望舒五曜聖魄】發動【合擊】，便能召喚開天闢地之【鑄天劍神】！少游，迎戰厲無咎！」' }
          ], () => { if (this.ui) this.ui.updateTopHud(); });
          break;
        }

        case 'abyss_final_boss': {
          this.showLines([
            { speaker: 'youming', text: '「哈哈哈！何為正？何為邪？唯有借歸墟太古巨獸吞沒六界，洗去情苦執念，方得永恆超脫！」' },
            { speaker: 'luxiao', text: '「若無情愛牽絆，長生亦如頑石！今日便斬你執迷，還世間晴空！」' }
          ], () => {
            // 一階段：厲無咎
            this.startStoryBoss(['boss_youming'], { music: 'duel_boss' }, () => {
              this.fullRestoreParty();
              this.showLines([
                { speaker: 'youming', text: '「咳……以吾神魂血祭，破封吧——【太古蝕月巨獸】！！」' },
                { speaker: 'narrator', text: '厲無咎縱身躍入溟海，黑潮滔天，太古蝕月巨獸破封而出！（全員狀態回滿，進入終焉決死戰！提示：善用【五曜聖魄合擊】與【醉月狂歌】！）' }
              ], () => {
                // 二階段：太古蝕月巨獸
                this.startStoryBoss(['boss_shuimoshou'], { music: 'final_boss' }, () => {
                  this.triggerEndingSequence();
                });
              });
            });
          });
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
    // 主迴圈更新 (60 FPS 絲滑插值移動、生動NPC模擬與8向操控)
    // =========================================================================
    update(dt) {
      this.time += dt;
      if (!this.state) return;
      this.state.playTimeSec = (this.state.playTimeSec || 0) + dt;
      this.interactCooldown = Math.max(0, (this.interactCooldown || 0) - dt);

      for (let i = this.footsteps.length - 1; i >= 0; i--) {
        this.footsteps[i].life -= dt;
        if (this.footsteps[i].life <= 0) this.footsteps.splice(i, 1);
      }

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

      // 推進當前步伐之 60FPS 子格插值動畫
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

      // 生動 NPC 模擬：巡邏、面向玩家、工作火花、頭頂驚嘆號與氣泡短語
      const map = PalX.MAPS[this.state.mapId];
      for (const npc of this.activeMapNpcs) {
        if (npc.def.hideFlag && this.state.flags[npc.def.hideFlag]) {
          npc.hidden = true;
          continue;
        }
        if (npc.def.requireFlag && !this.state.flags[npc.def.requireFlag]) {
          npc.hidden = true;
          continue;
        }
        npc.hidden = false;

        let curPose = npc.def.pose || 'stand';
        let curBarks = npc.def.barks || null;
        let targetX = npc.baseX;
        let targetY = npc.baseY;
        let stFacingExplicit = false;

        if (npc.states && npc.states.length > 0) {
          for (const st of npc.states) {
            if (evalCondition(st.when, this.state.flags)) {
              if (st.x != null) targetX = st.x;
              if (st.y != null) targetY = st.y;
              if (st.pose != null) curPose = st.pose;
              if (st.barks != null) curBarks = st.barks;
              if (st.facing === 'left') { npc.runtimeFacingLeft = true; stFacingExplicit = true; }
              else if (st.facing === 'right') { npc.runtimeFacingLeft = false; stFacingExplicit = true; }
              break;
            }
          }
        }
        npc.runtimePose = curPose;

        // 若因劇情狀態需變更常駐座標（如病倒移至竹榻、大夫移至榻邊）
        if (!npc.patrol && (npc.x !== targetX || npc.y !== targetY)) {
          npc.x = targetX;
          npc.y = targetY;
          npc.rx = targetX;
          npc.ry = targetY;
          npc.runtimeMoving = false;
        }

        // 巡邏 NPC 移動與遇玩家禮貌駐足
        const distToPlayer = Math.hypot(this.renderPlayer.x - (npc.rx != null ? npc.rx : npc.x), this.renderPlayer.y - (npc.ry != null ? npc.ry : npc.y));
        if (distToPlayer <= 1.6) {
          npc.runtimeMoving = false;
          if (curPose === 'stand' && !stFacingExplicit) {
            const fdx = this.renderPlayer.x - (npc.rx != null ? npc.rx : npc.x);
            if (fdx !== 0) npc.runtimeFacingLeft = fdx < 0;
          }
        } else if (npc.patrol && npc.patrol.length > 1 && curPose === 'stand') {
          if (npc.stepElapsed < npc.stepDur) {
            npc.stepElapsed = Math.min(npc.stepDur, npc.stepElapsed + dt);
            const ep = npc.stepElapsed / Math.max(0.01, npc.stepDur);
            npc.rx = npc.fromX + (npc.toX - npc.fromX) * ep;
            npc.ry = npc.fromY + (npc.toY - npc.fromY) * ep;
            npc.runtimeWalkPhase = (npc.totalSteps || 0) * Math.PI + ep * Math.PI * 2;
            npc.runtimeMoving = true;
            if (ep >= 1) {
              npc.totalSteps = (npc.totalSteps || 0) + 2;
              npc.x = npc.toX;
              npc.y = npc.toY;
              npc.rx = npc.x;
              npc.ry = npc.y;
              npc.runtimeMoving = false;
              npc.pauseTimer = 1.4 + Math.random() * 1.6;
            }
          } else {
            npc.rx = npc.x;
            npc.ry = npc.y;
            npc.runtimeMoving = false;
            npc.pauseTimer -= dt;
            if (npc.pauseTimer <= 0) {
              npc.patrolIdx = (npc.patrolIdx + 1) % npc.patrol.length;
              const nextNode = npc.patrol[npc.patrolIdx];
              if (this.isTileWalkable(map, nextNode.x, nextNode.y, true)) {
                npc.fromX = npc.x;
                npc.fromY = npc.y;
                npc.toX = nextNode.x;
                npc.toY = nextNode.y;
                npc.stepElapsed = 0;
                npc.stepDur = 0.44;
                npc.runtimeFacingLeft = (nextNode.x - npc.x) < 0;
              }
            }
          }
        }

        // 頭頂任務標記計算 (!, ?, ✓)
        npc.questMarker = null;
        if (npc.questId) {
          const sq = PalX.SIDE_QUESTS.find((q) => q.id === npc.questId);
          if (sq) {
            if (this.state.flags[sq.doneFlag]) {
              npc.questMarker = null;
            } else if (this.state.flags[sq.startFlag]) {
              const canDone = (sq.readyItem && this.getItemCount(sq.readyItem) > 0) || (sq.readyFlag && this.state.flags[sq.readyFlag]);
              npc.questMarker = canDone ? '✓' : '?';
            } else {
              npc.questMarker = '!';
            }
          }
        }
        if (!npc.questMarker && isMainQuestTarget(npc.interaction, this.state.flags)) {
          npc.questMarker = '!';
        }

        // 氣泡短語淡入淡出計時
        if (distToPlayer <= 3.8 && curBarks && curBarks.length > 0) {
          npc.barkTimer -= dt;
          if (npc.barkTimer <= 0) {
            npc.activeBark = curBarks[Math.floor(Math.random() * curBarks.length)];
            npc.barkDisplayTimer = 3.2;
            npc.barkTimer = 7.0 + Math.random() * 6.0;
          }
        }
        if (npc.barkDisplayTimer > 0) {
          npc.barkDisplayTimer -= dt;
          if (npc.barkDisplayTimer > 2.7) npc.barkAlpha = (3.2 - npc.barkDisplayTimer) / 0.5;
          else if (npc.barkDisplayTimer < 0.5) npc.barkAlpha = npc.barkDisplayTimer / 0.5;
          else npc.barkAlpha = 1;
          if (npc.barkDisplayTimer <= 0) {
            npc.activeBark = null;
            npc.barkAlpha = 0;
          }
        }
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

      // 整合鍵盤8向 (WASD / 方向鍵)、虛擬搖桿與觸控長按向量
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
        if (this.stepAnim && this.stepAnim.active) {
          const p = Math.min(1, this.stepAnim.elapsed / Math.max(0.01, this.stepAnim.duration));
          this.walkPhase = (this.totalSteps || 0) * Math.PI + p * Math.PI;
        } else {
          const sprintMul = (this.sprintToggle || this.keysDown.ShiftLeft || this.keysDown.ShiftRight) ? 1.32 : 1;
          this.walkPhase += dt * 10 * sprintMul;
        }
      }

      // 明雷怪物巡邏與子格平滑插值
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

      // 鏡頭 60FPS 緊密絲滑跟隨插值主角座標
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
        PalX.graphics.renderBattleScene(this.ctx, this.canvas, this.battle, map ? map.theme : 'reed_marsh', this.time);
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
