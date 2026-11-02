(function (root) {
  'use strict';

  const PalX = (root.PalX = root.PalX || {});

  function createHeroInstance(heroId) {
    const tpl = PalX.HERO_TEMPLATES[heroId];
    const hero = {
      id: tpl.id,
      name: tpl.name,
      courtesy: tpl.courtesy,
      title: tpl.title,
      poem: tpl.poem,
      bio: tpl.bio,
      level: tpl.initLevel,
      exp: 0,
      baseStats: Object.assign({}, tpl.baseStats),
      permBonus: { maxHp: 0, maxMp: 0, atk: 0, mag: 0, def: 0, spd: 0, lck: 0 },
      equip: Object.assign({}, tpl.initEquip),
      skills: tpl.initSkills.slice(),
      hp: tpl.baseStats.maxHp,
      mp: tpl.baseStats.maxMp,
      poison: null,
      stun: 0,
      buffs: {},
      lastAction: null
    };
    // 補足初始等級高於1級時的成長計算
    const eff = computeHeroStats(hero);
    hero.hp = eff.maxHp;
    hero.mp = eff.maxMp;
    return hero;
  }

  function computeHeroStats(hero) {
    const out = {
      maxHp: hero.baseStats.maxHp + (hero.permBonus.maxHp || 0),
      maxMp: hero.baseStats.maxMp + (hero.permBonus.maxMp || 0),
      atk: hero.baseStats.atk + (hero.permBonus.atk || 0),
      mag: hero.baseStats.mag + (hero.permBonus.mag || 0),
      def: hero.baseStats.def + (hero.permBonus.def || 0),
      spd: hero.baseStats.spd + (hero.permBonus.spd || 0),
      lck: hero.baseStats.lck + (hero.permBonus.lck || 0),
      doubleHit: false,
      splashAll: false,
      poisonHit: null,
      critBonus: 0,
      hpRegen: 0,
      mpRegen: 0,
      resistElem: null
    };

    if (hero.equip) {
      for (const slot of Object.keys(hero.equip)) {
        const itemId = hero.equip[slot];
        if (!itemId) continue;
        const item = PalX.ITEMS[itemId];
        if (!item) continue;
        if (item.stats) {
          for (const k of Object.keys(item.stats)) {
            if (typeof out[k] === 'number') out[k] += item.stats[k];
          }
        }
        if (item.doubleHit) out.doubleHit = true;
        if (item.splashAll) out.splashAll = true;
        if (item.poisonHit) out.poisonHit = item.poisonHit;
        if (item.critBonus) out.critBonus += item.critBonus;
        if (item.hpRegen) out.hpRegen += item.hpRegen;
        if (item.mpRegen) out.mpRegen += item.mpRegen;
        if (item.resistElem) out.resistElem = item.resistElem;
      }
    }

    if (hero.buffs) {
      if (hero.buffs.tiangang > 0) out.atk = Math.floor(out.atk * 1.9);
      if (hero.buffs.zhenyuan > 0) out.def = Math.floor(out.def * 1.75);
      if (hero.buffs.yunti > 0) out.spd = Math.floor(out.spd * 1.6);
      if (hero.buffs.zuixian > 0) out.doubleHit = true;
    }
    return out;
  }

  function levelUpHeroOnce(hero) {
    const tpl = PalX.HERO_TEMPLATES[hero.id];
    hero.level += 1;
    for (const k of Object.keys(tpl.growth)) {
      hero.baseStats[k] += tpl.growth[k];
    }
    const learned = [];
    for (const entry of tpl.levelSkills) {
      if (entry.lv <= hero.level && !hero.skills.includes(entry.skill)) {
        hero.skills.push(entry.skill);
        learned.push(PalX.SKILLS[entry.skill].name);
      }
    }
    const eff = computeHeroStats(hero);
    hero.hp = eff.maxHp;
    hero.mp = eff.maxMp;
    return learned;
  }

  function gainHeroExp(hero, amount) {
    hero.exp += amount;
    const logs = [];
    while (hero.level < 60 && hero.exp >= PalX.expForNextLevel(hero.level)) {
      hero.exp -= PalX.expForNextLevel(hero.level);
      const learned = levelUpHeroOnce(hero);
      let msg = `${hero.name}修行提升至第 ${hero.level} 重！`;
      if (learned.length) msg += ` 領悟【${learned.join('、')}】！`;
      logs.push(msg);
    }
    return logs;
  }

  class BattleManager {
    constructor(game) {
      this.game = game;
      this.active = false;
      this.party = [];
      this.enemies = [];
      this.isBoss = false;
      this.onVictory = null;
      this.onDefeat = null;
      this.turnQueue = [];
      this.activeActorId = null;
      this.selectedEnemyIdx = 0;
      this.phase = 'idle'; // 'input' | 'anim' | 'end'
      this.logs = [];
      this.vfxList = [];
      this.popups = [];
      this.shakeTimer = 0;
      this.autoSiege = false;
    }

    start(enemyIds, opts) {
      opts = opts || {};
      this.active = true;
      this.autoSiege = false;
      this.logs = [];
      this.vfxList = [];
      this.popups = [];
      this.shakeTimer = 0;
      this.onVictory = opts.onVictory || null;
      this.onDefeat = opts.onDefeat || null;

      const partyIds = opts.overrideParty || this.game.state.activeParty;
      this.party = partyIds.map((id) => {
        const h = this.game.state.heroes[id];
        const eff = computeHeroStats(h);
        h.maxHp = eff.maxHp;
        h.maxMp = eff.maxMp;
        h.hp = Math.min(h.maxHp, Math.max(1, h.hp));
        h.mp = Math.min(h.maxMp, h.mp);
        h.buffs = {};
        h.stun = 0;
        h.defending = false;
        h.animLunge = 0;
        return h;
      });

      this.enemies = enemyIds.map((eid, i) => {
        const tpl = PalX.ENEMIES[eid];
        return {
          uid: `${eid}_${i}`,
          id: tpl.id,
          name: tpl.name,
          sprite: tpl.sprite,
          elem: tpl.elem || 'none',
          isBoss: !!tpl.isBoss,
          hp: tpl.hp,
          maxHp: tpl.hp,
          mp: tpl.mp,
          atk: tpl.atk,
          mag: tpl.mag,
          def: tpl.def,
          spd: tpl.spd,
          exp: tpl.exp,
          gold: tpl.gold,
          regenPerTurn: tpl.regenPerTurn || 0,
          stealItem: tpl.stealItem,
          stealGold: tpl.stealGold || 0,
          stolen: false,
          dropItem: tpl.dropItem,
          dropRate: tpl.dropRate || 0,
          skills: tpl.skills || [],
          poison: null,
          stun: 0,
          dead: false,
          fadeAlpha: 1,
          hitFlash: 0,
          animLunge: 0
        };
      });

      this.isBoss = this.enemies.some((e) => e.isBoss);
      this.selectedEnemyIdx = 0;
      PalX.audio.playMusic(this.isBoss ? 'boss' : 'battle');

      this.pushLog(this.isBoss ? `強敵【${this.enemies.map((e) => e.name).join('、')}】現身！` : '妖魔攔路，拔劍迎敵！');
      this.buildNextRoundQueue();
      this.advanceTurn();
    }

    pushLog(msg) {
      this.logs.push(msg);
      if (this.logs.length > 30) this.logs.shift();
      if (this.game && this.game.ui) {
        this.game.ui.updateBattleHud();
      }
    }

    addPopup(targetIsEnemy, idx, text, color, big) {
      const canvasW = 960;
      const canvasH = 580;
      const pos = targetIsEnemy
        ? PalX.graphics.getEnemyBattlePos(idx, this.enemies.length, canvasW, canvasH)
        : PalX.graphics.getHeroBattlePos(idx, this.party.length, canvasW, canvasH);
      const jitter = (Math.random() - 0.5) * 24;
      this.popups.push({
        x: pos.x + jitter,
        y: pos.y - 38,
        vy: -28,
        text,
        color: color || '#ffffff',
        big: !!big,
        timer: 1.05
      });
    }

    addVfx(kind, targetIsEnemy, idx, title) {
      const canvasW = 960;
      const canvasH = 580;
      let pos = { x: canvasW * 0.65, y: canvasH * 0.35 };
      if (idx >= 0) {
        pos = targetIsEnemy
          ? PalX.graphics.getEnemyBattlePos(idx, this.enemies.length, canvasW, canvasH)
          : PalX.graphics.getHeroBattlePos(idx, this.party.length, canvasW, canvasH);
      }
      this.vfxList.push({
        kind,
        x: pos.x,
        y: pos.y,
        title: title || '',
        timer: 0.65,
        maxTimer: 0.65
      });
    }

    firstLivingEnemyIdx() {
      const i = this.enemies.findIndex((e) => !e.dead);
      return i >= 0 ? i : 0;
    }

    ensureValidEnemyTarget() {
      if (!this.enemies[this.selectedEnemyIdx] || this.enemies[this.selectedEnemyIdx].dead) {
        this.selectedEnemyIdx = this.firstLivingEnemyIdx();
      }
    }

    buildNextRoundQueue() {
      const actors = [];
      for (const h of this.party) {
        if (h.hp > 0) {
          const eff = computeHeroStats(h);
          h.maxHp = eff.maxHp;
          h.maxMp = eff.maxMp;
          // 裝備每回合回血回魔 (如水靈珠/聖靈珠/天蛇靈杖)
          if (eff.hpRegen > 0) h.hp = Math.min(h.maxHp, h.hp + eff.hpRegen);
          if (eff.mpRegen > 0) h.mp = Math.min(h.maxMp, h.mp + eff.mpRegen);
          actors.push({ side: 'hero', id: h.id, spd: eff.spd + Math.random() * 8 });
        }
      }
      for (const e of this.enemies) {
        if (!e.dead) {
          if (e.regenPerTurn > 0 && e.hp < e.maxHp) {
            const reg = Math.min(e.maxHp - e.hp, e.regenPerTurn);
            e.hp += reg;
            const eIdx = this.enemies.indexOf(e);
            this.addPopup(true, eIdx, `+${reg} 濁浪再生`, '#4fc3f7');
          }
          actors.push({ side: 'enemy', uid: e.uid, spd: e.spd + Math.random() * 8 });
        }
      }
      actors.sort((a, b) => b.spd - a.spd);
      this.turnQueue = actors;
    }

    tickActorStartOfTurn(actor, isEnemy, idx) {
      // 毒傷結算
      if (actor.poison) {
        const pct = actor.poison === 'zhangdu' ? 0.1 : 0.06;
        const dmg = Math.max(8, Math.floor(actor.maxHp * pct));
        actor.hp = Math.max(isEnemy ? 1 : 1, actor.hp - dmg);
        this.addPopup(isEnemy, idx, `-${dmg} 毒發`, '#9ccc65');
      }
      // 增益回合遞減
      if (actor.buffs) {
        for (const k of Object.keys(actor.buffs)) {
          if (actor.buffs[k] > 0) actor.buffs[k] -= 1;
        }
      }
      if (actor.stun > 0) {
        actor.stun -= 1;
        this.pushLog(`${actor.name}身中定身咒，無法動彈！`);
        this.addPopup(isEnemy, idx, '定身!', '#ce93d8');
        return false;
      }
      return true;
    }

    checkBattleEnd() {
      const allEnemiesDead = this.enemies.every((e) => e.dead);
      if (allEnemiesDead) {
        this.finishVictory();
        return true;
      }
      const allHeroesDead = this.party.every((h) => h.hp <= 0);
      if (allHeroesDead) {
        this.finishDefeat();
        return true;
      }
      return false;
    }

    advanceTurn() {
      if (!this.active) return;
      if (this.checkBattleEnd()) return;
      this.ensureValidEnemyTarget();

      if (this.turnQueue.length === 0) {
        this.buildNextRoundQueue();
      }

      const next = this.turnQueue.shift();
      if (!next) return;

      if (next.side === 'hero') {
        const hIdx = this.party.findIndex((h) => h.id === next.id);
        const hero = this.party[hIdx];
        if (!hero || hero.hp <= 0) {
          this.advanceTurn();
          return;
        }
        hero.defending = false;
        if (!this.tickActorStartOfTurn(hero, false, hIdx)) {
          this.scheduleNext(320);
          return;
        }
        this.activeActorId = hero.id;
        if (this.autoSiege) {
          this.executeHeroCommand(hero, { type: 'attack', targetIdx: this.firstLivingEnemyIdx() });
        } else {
          this.phase = 'input';
          if (this.game && this.game.ui) this.game.ui.updateBattleHud();
        }
      } else {
        const eIdx = this.enemies.findIndex((e) => e.uid === next.uid);
        const enemy = this.enemies[eIdx];
        if (!enemy || enemy.dead) {
          this.advanceTurn();
          return;
        }
        if (!this.tickActorStartOfTurn(enemy, true, eIdx)) {
          this.scheduleNext(320);
          return;
        }
        this.phase = 'anim';
        this.executeEnemyTurn(enemy, eIdx);
      }
    }

    scheduleNext(delayMs) {
      if (this.game && this.game.headless) {
        this.advanceTurn();
      } else {
        setTimeout(() => this.advanceTurn(), delayMs);
      }
    }

    // =========================================================================
    // 我方指令執行
    // =========================================================================
    submitPlayerAction(cmd) {
      if (!this.active || this.phase !== 'input') return;
      const hero = this.party.find((h) => h.id === this.activeActorId);
      if (!hero) return;
      this.executeHeroCommand(hero, cmd);
    }

    executeHeroCommand(hero, cmd) {
      this.phase = 'anim';
      const hIdx = this.party.indexOf(hero);
      const eff = computeHeroStats(hero);
      this.ensureValidEnemyTarget();

      if (cmd.type === 'siege') {
        this.autoSiege = true;
        this.pushLog('全員發動【圍攻】！');
        this.executeHeroCommand(hero, { type: 'attack', targetIdx: this.selectedEnemyIdx });
        return;
      }

      if (cmd.type === 'repeat') {
        const prev = hero.lastAction || { type: 'attack', targetIdx: this.selectedEnemyIdx };
        this.executeHeroCommand(hero, prev);
        return;
      }

      if (cmd.type === 'strongest') {
        // 仙劍1快捷鍵 F：自動挑最強且不耗酒/不耗錢的攻擊仙術
        let bestSkill = null;
        for (const sid of hero.skills) {
          const sk = PalX.SKILLS[sid];
          if (sk && sk.type === 'attack' && hero.mp >= sk.mp) {
            if (!bestSkill || sk.power > bestSkill.power) bestSkill = sk;
          }
        }
        if (bestSkill) {
          this.executeHeroCommand(hero, { type: 'skill', skillId: bestSkill.id, targetIdx: this.selectedEnemyIdx });
        } else {
          this.executeHeroCommand(hero, { type: 'attack', targetIdx: this.selectedEnemyIdx });
        }
        return;
      }

      if (cmd.type === 'defend') {
        hero.defending = true;
        hero.lastAction = cmd;
        this.pushLog(`${hero.name}凝神守禦，受到的傷害減半。`);
        this.addPopup(false, hIdx, '防禦', '#90caf9');
        this.scheduleNext(300);
        return;
      }

      if (cmd.type === 'flee') {
        if (this.isBoss) {
          this.pushLog('強敵環伺，無法逃脫！');
          this.phase = 'input';
          if (this.game && this.game.ui) this.game.ui.updateBattleHud();
          return;
        }
        const chance = 0.58 + eff.lck * 0.004 + eff.spd * 0.003;
        if (Math.random() < chance) {
          this.pushLog('施展輕功順利脫離戰場！');
          this.endBattleCleanly();
          return;
        } else {
          this.pushLog(`${hero.name}試圖突圍，卻被妖魔攔住去路！`);
          this.scheduleNext(380);
          return;
        }
      }

      if (cmd.type === 'attack') {
        hero.lastAction = cmd;
        hero.animLunge = 1;
        setTimeout(() => { hero.animLunge = 0; }, 220);

        const targets = eff.splashAll
          ? this.enemies.map((e, i) => ({ e, i })).filter((x) => !x.e.dead)
          : [{ e: this.enemies[cmd.targetIdx != null ? cmd.targetIdx : this.selectedEnemyIdx] || this.enemies[this.firstLivingEnemyIdx()], i: cmd.targetIdx != null ? cmd.targetIdx : this.selectedEnemyIdx }];

        const hits = eff.doubleHit ? 2 : 1;
        PalX.audio.sfx(eff.splashAll ? 'whip' : 'slash');

        for (let hit = 0; hit < hits; hit++) {
          for (const t of targets) {
            if (!t.e || t.e.dead) continue;
            let raw = eff.atk * 1.45 - t.e.def * 0.65;
            if (eff.splashAll) raw *= 0.85;
            raw = Math.max(12, raw * (0.94 + Math.random() * 0.12));
            const isCrit = Math.random() < (0.08 + eff.lck * 0.002 + eff.critBonus);
            if (isCrit) raw *= 1.65;
            const dmg = Math.floor(raw);
            this.applyDamageToEnemy(t.e, t.i, dmg, isCrit ? '暴擊!' : '');
            if (eff.poisonHit && !t.e.dead && Math.random() < 0.45) {
              t.e.poison = eff.poisonHit;
              this.addPopup(true, t.i, '中毒!', '#9ccc65');
            }
          }
        }
        const tag = hits === 2 ? '施展【二連擊】' : eff.splashAll ? '揮鞭【橫掃全場】' : '揮劍斬擊';
        this.pushLog(`${hero.name}${tag}！`);
        this.scheduleNext(460);
        return;
      }

      if (cmd.type === 'coop') {
        const living = this.party.filter((h) => h.hp > 0 && h.stun <= 0);
        const coop = PalX.resolveCoopSkill(living);
        if (!coop || living.length < 2) {
          this.pushLog('需至少兩名清醒同伴方可發動【合擊】！');
          this.phase = 'input';
          if (this.game && this.game.ui) this.game.ui.updateBattleHud();
          return;
        }
        // 消耗參與者少量體力 (保留至少1點)
        let sumPower = 0;
        for (const m of living) {
          const meff = computeHeroStats(m);
          sumPower += meff.atk + meff.mag;
          const cost = Math.floor(meff.maxHp * coop.hpCostPct);
          m.hp = Math.max(1, m.hp - cost);
          m.animLunge = 1;
          setTimeout(() => { m.animLunge = 0; }, 280);
        }
        PalX.audio.sfx('magic');
        this.shakeTimer = 0.45;
        const vfxMap = {
          wind: 'wind_vortex', thunder: 'thunder_strike', fire: 'fire_pillar',
          water: 'ice_storm', earth: 'earth_rock', holy: 'wine_god', sword: 'sword_rain'
        };
        this.addVfx(vfxMap[coop.elem] || 'wine_god', true, this.firstLivingEnemyIdx(), coop.name);
        this.pushLog(`眾人同心施展合擊絕技【${coop.name}】——「${coop.poem}」`);

        this.enemies.forEach((en, idx) => {
          if (en.dead) return;
          const mult = PalX.getElementMultiplier(coop.elem, en.elem);
          const raw = (coop.power * 1.35 + sumPower * 0.72 - en.def * 0.4) * mult;
          const dmg = Math.max(45, Math.floor(raw));
          this.applyDamageToEnemy(en, idx, dmg, mult > 1.2 ? '五靈剋制!' : '', true);
          if (coop.inflict && !en.dead) en.poison = coop.inflict;
        });

        if (coop.healPct) {
          this.party.forEach((m, idx) => {
            if (m.hp > 0) {
              const heal = Math.floor(m.maxHp * coop.healPct);
              m.hp = Math.min(m.maxHp, m.hp + heal);
              this.addPopup(false, idx, `+${heal}`, '#69f0ae');
            }
          });
        }

        this.scheduleNext(650);
        return;
      }

      if (cmd.type === 'skill') {
        const sk = PalX.SKILLS[cmd.skillId];
        if (!sk || hero.mp < sk.mp) {
          this.pushLog('真氣不足，無法施展此仙術！');
          this.phase = 'input';
          if (this.game && this.game.ui) this.game.ui.updateBattleHud();
          return;
        }

        // 乾坤一擲檢查文錢
        if (sk.type === 'coinAttack') {
          if (this.game.state.gold < sk.coinCost) {
            this.pushLog(`文錢不足 ${sk.coinCost} 文，無法施展【乾坤一擲】！`);
            this.phase = 'input';
            if (this.game && this.game.ui) this.game.ui.updateBattleHud();
            return;
          }
          this.game.state.gold -= sk.coinCost;
          hero.mp -= sk.mp;
          hero.lastAction = cmd;
          PalX.audio.sfx('magic');
          this.shakeTimer = 0.35;
          this.addVfx('coin_shower', true, this.firstLivingEnemyIdx());
          this.pushLog(`${hero.name}豪擲 ${sk.coinCost} 文錢施展【乾坤一擲】！漫天金錢破空貫敵！`);
          this.enemies.forEach((en, idx) => {
            if (en.dead) return;
            const dmg = Math.floor(sk.power + eff.mag * 1.8 + eff.lck * 1.5);
            this.applyDamageToEnemy(en, idx, dmg, '無視防禦!', true);
          });
          this.scheduleNext(580);
          return;
        }

        // 酒神絕技檢查 (一生限用9次 + 背包有酒)
        if (sk.type === 'wineGod') {
          if (this.game.state.wineGodUses >= 9) {
            this.pushLog('【酒神】一生僅能召喚九次，已達天道極限！');
            this.phase = 'input';
            return;
          }
          const wineId = ['guihuajiu', 'shaodaozi'].find((id) => (this.game.state.inventory[id] || 0) > 0);
          if (!wineId) {
            this.pushLog('行囊中沒有美酒（桂花酒或燒刀子），無法召喚【酒神】！');
            this.phase = 'input';
            return;
          }
          this.game.addItem(wineId, -1);
          this.game.state.wineGodUses += 1;
          const usedMp = Math.max(40, hero.mp);
          hero.mp = 0;
          PalX.audio.sfx('magic');
          this.shakeTimer = 0.7;
          this.addVfx('wine_god', true, this.firstLivingEnemyIdx(), '醉劍喚酒神');
          const dmg = Math.floor(usedMp * 8 + eff.atk * 2);
          this.pushLog(`${hero.name}仰天痛飲【${PalX.ITEMS[wineId].name}】，傾盡真氣第 ${this.game.state.wineGodUses}/9 次召喚【酒神】！`);
          this.enemies.forEach((en, idx) => {
            if (!en.dead) this.applyDamageToEnemy(en, idx, dmg, '酒神天威!', true);
          });
          this.scheduleNext(750);
          return;
        }

        hero.mp -= sk.mp;
        if (sk.type !== 'wineGod' && sk.type !== 'coinAttack') hero.lastAction = cmd;

        // 飛雲探龍手 (偷竊!)
        if (sk.type === 'steal') {
          const tIdx = cmd.targetIdx != null ? cmd.targetIdx : this.selectedEnemyIdx;
          const target = this.enemies[tIdx] || this.enemies[this.firstLivingEnemyIdx()];
          hero.animLunge = 1;
          setTimeout(() => { hero.animLunge = 0; }, 220);
          PalX.audio.sfx('confirm');
          if (target.stolen) {
            this.pushLog(`${target.name}身上已經被摸得乾乾淨淨啦！`);
            this.addPopup(true, tIdx, '空空如也', '#cfd8dc');
          } else {
            const rate = 0.72 + eff.lck * 0.004;
            if (Math.random() < rate) {
              target.stolen = true;
              const gotParts = [];
              if (target.stealItem && PalX.ITEMS[target.stealItem]) {
                this.game.addItem(target.stealItem, 1);
                gotParts.push(`【${PalX.ITEMS[target.stealItem].name}】`);
              }
              if (target.stealGold > 0) {
                this.game.state.gold += target.stealGold;
                gotParts.push(`${target.stealGold} 文錢`);
              }
              PalX.audio.sfx('item');
              const txt = gotParts.join('、') || '50 文錢';
              this.pushLog(`${hero.name}施展【飛雲探龍手】，妙手探得 ${txt}！`);
              this.addPopup(true, tIdx, `偷得 ${txt}`, '#ffd54f', true);
            } else {
              this.pushLog(`${hero.name}探手失誤，差點被${target.name}咬了一口！`);
              this.addPopup(true, tIdx, '失手!', '#cfd8dc');
            }
          }
          this.scheduleNext(460);
          return;
        }

        // 治療 / 淨化 / 復活 / 增益
        if (sk.type === 'heal' || sk.type === 'cleanse') {
          PalX.audio.sfx('heal');
          const list = sk.target === 'allAllies'
            ? this.party.map((m, i) => ({ m, i })).filter((x) => x.m.hp > 0)
            : [{ m: this.party[cmd.allyIdx != null ? cmd.allyIdx : hIdx] || hero, i: cmd.allyIdx != null ? cmd.allyIdx : hIdx }];
          for (const { m, i } of list) {
            if (m.hp <= 0) continue;
            const amount = Math.floor(sk.power + eff.mag * 1.45);
            m.hp = Math.min(m.maxHp, m.hp + amount);
            if (sk.type === 'cleanse') {
              m.poison = null;
              m.stun = 0;
            }
            this.addVfx('heal_lotus', false, i);
            this.addPopup(false, i, `+${amount}`, '#69f0ae');
          }
          this.pushLog(`${hero.name}施展【${sk.name}】，甘霖護體！`);
          this.scheduleNext(450);
          return;
        }

        if (sk.type === 'revive') {
          PalX.audio.sfx('heal');
          let targetIdx = cmd.allyIdx != null ? cmd.allyIdx : this.party.findIndex((m) => m.hp <= 0);
          if (targetIdx < 0) targetIdx = hIdx;
          const m = this.party[targetIdx];
          m.hp = Math.max(1, Math.floor(m.maxHp * (sk.hpPct || 0.5)));
          m.poison = null;
          m.stun = 0;
          this.addVfx('heal_lotus', false, targetIdx);
          this.addPopup(false, targetIdx, `復活 +${m.hp}`, '#ffe082', true);
          this.pushLog(`${hero.name}吟誦【${sk.name}】，喚醒了${m.name}！`);
          this.scheduleNext(480);
          return;
        }

        if (sk.type === 'buff') {
          PalX.audio.sfx('magic');
          const list = sk.target === 'allAllies' ? this.party : [hero];
          list.forEach((m) => {
            if (m.hp > 0) {
              m.buffs[sk.buff.id] = sk.buff.turns;
              const idx = this.party.indexOf(m);
              this.addVfx('heal_lotus', false, idx);
              this.addPopup(false, idx, sk.name, '#ffd54f');
            }
          });
          this.pushLog(`${hero.name}施展【${sk.name}】！`);
          this.scheduleNext(420);
          return;
        }

        // 夢蛇·女媧聖靈 / 攻擊類五靈劍蠱仙術
        PalX.audio.sfx('magic');
        const vfxByElem = {
          sword: 'sword_rain', fire: 'fire_pillar', water: 'ice_storm',
          thunder: 'thunder_strike', wind: 'wind_vortex', earth: 'earth_rock',
          holy: 'wine_god', poison: 'wind_vortex'
        };
        const targets = sk.target === 'allEnemies'
          ? this.enemies.map((e, i) => ({ e, i })).filter((x) => !x.e.dead)
          : [{ e: this.enemies[cmd.targetIdx != null ? cmd.targetIdx : this.selectedEnemyIdx] || this.enemies[this.firstLivingEnemyIdx()], i: cmd.targetIdx != null ? cmd.targetIdx : this.selectedEnemyIdx }];

        if (sk.power >= 220) this.shakeTimer = 0.3;

        for (const t of targets) {
          if (!t.e || t.e.dead) continue;
          this.addVfx(vfxByElem[sk.elem] || 'sword_rain', true, t.i, sk.type === 'mengshe' ? '女媧聖靈' : '');
          const statBase = sk.scale === 'atk' ? eff.atk * 1.55 : sk.scale === 'both' ? (eff.atk + eff.mag) * 0.92 : eff.mag * 1.65;
          const mult = PalX.getElementMultiplier(sk.elem, t.e.elem);
          const defMit = t.e.def * (sk.ignoreDef ? (1 - sk.ignoreDef) : 1) * 0.45;
          const dmg = Math.max(20, Math.floor((sk.power + statBase - defMit) * mult * (0.95 + Math.random() * 0.1)));
          this.applyDamageToEnemy(t.e, t.i, dmg, mult >= 1.4 ? '剋制!' : mult <= 0.7 ? '抵抗' : '');
          if (sk.inflict && !t.e.dead && Math.random() < 0.6) {
            if (sk.inflict === 'stun') {
              t.e.stun = 1;
              this.addPopup(true, t.i, '定身!', '#ce93d8');
            } else {
              t.e.poison = sk.inflict;
              this.addPopup(true, t.i, '中毒!', '#9ccc65');
            }
          }
        }

        if (sk.type === 'mengshe') {
          this.party.forEach((m, idx) => {
            if (m.hp > 0) {
              m.buffs.zhenyuan = 4;
              const heal = Math.floor(m.maxHp * 0.25);
              m.hp = Math.min(m.maxHp, m.hp + heal);
              this.addPopup(false, idx, `+${heal} 聖護`, '#ffe082');
            }
          });
        }

        this.pushLog(`${hero.name}施展仙術【${sk.name}】！`);
        this.scheduleNext(520);
        return;
      }

      // 使用物品
      if (cmd.type === 'item') {
        const item = PalX.ITEMS[cmd.itemId];
        if (!item || (this.game.state.inventory[item.id] || 0) <= 0) {
          this.phase = 'input';
          return;
        }
        this.game.addItem(item.id, -1);
        PalX.audio.sfx('heal');

        if (item.buff) {
          const list = item.target === 'allAllies' ? this.party : [this.party[cmd.allyIdx != null ? cmd.allyIdx : hIdx] || hero];
          list.forEach((m) => {
            if (m.hp > 0) {
              m.buffs[item.buff.id] = item.buff.turns;
              if (item.hp) m.hp = Math.min(m.maxHp, m.hp + item.hp);
              this.addPopup(false, this.party.indexOf(m), item.buff.id === 'stealth' ? '隱蠱無敵!' : '酒力加身!', '#ffe082', true);
            }
          });
          this.pushLog(`${hero.name}使用了【${item.name}】！`);
          this.scheduleNext(440);
          return;
        }

        if (item.levelUp) {
          const target = this.party[cmd.allyIdx != null ? cmd.allyIdx : hIdx] || hero;
          const learned = levelUpHeroOnce(target);
          PalX.audio.sfx('levelup');
          this.addPopup(false, this.party.indexOf(target), `修行+1 (Lv.${target.level})`, '#ffd54f', true);
          this.pushLog(`${target.name}服下【金蠶王】，修行突破至第 ${target.level} 重！${learned.length ? '領悟 ' + learned.join('、') : ''}`);
          this.scheduleNext(500);
          return;
        }

        if (item.permStat) {
          const target = this.party[cmd.allyIdx != null ? cmd.allyIdx : hIdx] || hero;
          for (const k of Object.keys(item.permStat)) {
            target.permBonus[k] = (target.permBonus[k] || 0) + item.permStat[k];
          }
          const neff = computeHeroStats(target);
          target.maxHp = neff.maxHp;
          target.maxMp = neff.maxMp;
          this.addPopup(false, this.party.indexOf(target), `${item.name}靈效!`, '#ffd54f');
          this.pushLog(`${target.name}服下【${item.name}】，根骨永久提升！`);
          this.scheduleNext(420);
          return;
        }

        const list = item.target === 'allAllies'
          ? this.party
          : [this.party[cmd.allyIdx != null ? cmd.allyIdx : (item.revive ? Math.max(0, this.party.findIndex((m) => m.hp <= 0)) : hIdx)] || hero];

        for (const m of list) {
          const idx = this.party.indexOf(m);
          if (m.hp <= 0 && !item.revive) continue;
          if (m.hp <= 0 && item.revive) {
            m.hp = Math.max(1, Math.floor(m.maxHp * (item.hpPct || 0.5)));
            if (item.mpPct) m.mp = Math.min(m.maxMp, m.mp + Math.floor(m.maxMp * item.mpPct));
            this.addPopup(false, idx, `甦醒 +${m.hp}`, '#ffe082', true);
          } else {
            if (item.hpPct) m.hp = Math.floor(m.maxHp * item.hpPct);
            if (item.hp) m.hp = Math.min(m.maxHp, m.hp + item.hp);
            if (item.mpPct) m.mp = Math.min(m.maxMp, m.mp + Math.floor(m.maxMp * item.mpPct));
            if (item.mp) m.mp = Math.min(m.maxMp, m.mp + item.mp);
            this.addPopup(false, idx, item.hp ? `+${item.hp} HP` : `+${item.mp || ''} MP`, '#69f0ae');
          }
          if (item.curePoison) m.poison = null;
          if (item.cureStatus) m.stun = 0;
        }
        this.pushLog(`${hero.name}使用了【${item.name}】。`);
        this.scheduleNext(440);
        return;
      }

      // 投擲暗器或閒置武器 (仙劍1精髓!)
      if (cmd.type === 'throw') {
        const item = PalX.ITEMS[cmd.itemId];
        if (!item || !item.throwDmg || (this.game.state.inventory[item.id] || 0) <= 0) {
          this.phase = 'input';
          return;
        }
        this.game.addItem(item.id, -1);
        hero.animLunge = 1;
        setTimeout(() => { hero.animLunge = 0; }, 220);
        PalX.audio.sfx('slash');

        const targets = item.target === 'allEnemies'
          ? this.enemies.map((e, i) => ({ e, i })).filter((x) => !x.e.dead)
          : [{ e: this.enemies[cmd.targetIdx != null ? cmd.targetIdx : this.selectedEnemyIdx] || this.enemies[this.firstLivingEnemyIdx()], i: cmd.targetIdx != null ? cmd.targetIdx : this.selectedEnemyIdx }];

        for (const t of targets) {
          if (!t.e || t.e.dead) continue;
          const mult = PalX.getElementMultiplier(item.elem || 'none', t.e.elem);
          const dmg = Math.floor((item.throwDmg + eff.atk * 0.55) * mult);
          this.addVfx(item.elem === 'fire' ? 'fire_pillar' : 'sword_rain', true, t.i);
          this.applyDamageToEnemy(t.e, t.i, dmg, '投擲破防!', item.throwDmg >= 500);
          if (item.inflict && !t.e.dead) {
            t.e.poison = item.inflict;
            this.addPopup(true, t.i, '中毒!', '#9ccc65');
          }
        }
        this.pushLog(`${hero.name}奮力擲出【${item.name}】！`);
        this.scheduleNext(480);
      }
    }

    applyDamageToEnemy(enemy, eIdx, dmg, tag, big) {
      enemy.hp = Math.max(0, enemy.hp - dmg);
      enemy.hitFlash = 0.22;
      PalX.audio.sfx('hit');
      this.addPopup(true, eIdx, `${tag ? tag + ' ' : ''}-${dmg}`, tag ? '#ffd54f' : '#ff8a80', big || !!tag);
      if (enemy.hp <= 0 && !enemy.dead) {
        enemy.dead = true;
        enemy.fadeAlpha = 1;
        this.pushLog(`${enemy.name}被擊敗了！`);
      }
    }

    // =========================================================================
    // 敵方 AI 回合
    // =========================================================================
    executeEnemyTurn(enemy, eIdx) {
      enemy.animLunge = 1;
      setTimeout(() => { enemy.animLunge = 0; }, 240);

      const livingHeroes = this.party.map((h, i) => ({ h, i })).filter((x) => x.h.hp > 0);
      if (!livingHeroes.length) {
        this.advanceTurn();
        return;
      }

      // 技能判定
      let chosenSkill = null;
      for (const sk of enemy.skills) {
        if (Math.random() < (sk.rate || 0.35)) {
          chosenSkill = sk;
          break;
        }
      }

      const targets = (chosenSkill && chosenSkill.all)
        ? livingHeroes
        : [livingHeroes[Math.floor(Math.random() * livingHeroes.length)]];

      if (chosenSkill) {
        this.pushLog(`${enemy.name}施展【${chosenSkill.name}】！`);
        PalX.audio.sfx('magic');
      } else {
        this.pushLog(`${enemy.name}發起猛撲攻擊！`);
        PalX.audio.sfx('hit');
      }

      for (const { h, i } of targets) {
        // 隱蠱無敵判定
        if (h.buffs && h.buffs.stealth > 0) {
          this.addPopup(false, i, '隱身免疫!', '#80deea');
          continue;
        }
        const heff = computeHeroStats(h);
        // 醉仙望月步 / 仙風雲體術 閃避判定
        const dodgeRate = 0.05 + (h.buffs.zuixian > 0 ? 0.32 : 0) + (h.buffs.yunti > 0 ? 0.14 : 0) + heff.spd * 0.0008;
        if (Math.random() < dodgeRate) {
          this.addPopup(false, i, '閃避!', '#80cbc4');
          continue;
        }

        const atkPower = chosenSkill ? (chosenSkill.power + enemy.mag * 0.75) : (enemy.atk * 1.25);
        let raw = Math.max(8, atkPower - heff.def * 0.58);
        if (chosenSkill && chosenSkill.elem && heff.resistElem === chosenSkill.elem) {
          raw *= 0.5;
        }
        // 吉運格擋減半 (仙劍1經典格擋!)
        let blocked = false;
        if (!chosenSkill && Math.random() < (0.08 + heff.lck * 0.0022)) {
          raw *= 0.5;
          blocked = true;
        }
        if (h.defending) raw *= 0.5;

        const dmg = Math.max(1, Math.floor(raw * (0.93 + Math.random() * 0.14)));
        h.hp = Math.max(0, h.hp - dmg);
        this.addPopup(false, i, `${blocked ? '格擋! ' : ''}-${dmg}`, blocked ? '#90caf9' : '#ff5252');

        if (chosenSkill && chosenSkill.inflict && h.hp > 0 && Math.random() < 0.45) {
          if (chosenSkill.inflict === 'stun') {
            h.stun = 1;
            this.addPopup(false, i, '定身!', '#ce93d8');
          } else {
            h.poison = chosenSkill.inflict;
            this.addPopup(false, i, '中毒!', '#9ccc65');
          }
        }
      }

      this.scheduleNext(480);
    }

    // =========================================================================
    // 勝負結算與每幀動畫更新
    // =========================================================================
    finishVictory() {
      this.phase = 'end';
      let totalExp = 0;
      let totalGold = 0;
      const drops = [];
      for (const e of this.enemies) {
        totalExp += e.exp;
        totalGold += e.gold;
        if (e.dropItem && Math.random() <= e.dropRate) {
          this.game.addItem(e.dropItem, 1);
          drops.push(PalX.ITEMS[e.dropItem].name);
        }
      }
      this.game.state.gold += totalGold;
      const lvLogs = [];
      for (const h of this.party) {
        if (h.hp <= 0) h.hp = 1; // 仙劍1戰後昏厥角色以1點體力甦醒
        h.buffs = {};
        h.stun = 0;
        const msgs = gainHeroExp(h, totalExp);
        lvLogs.push(...msgs);
      }

      PalX.audio.sfx(lvLogs.length ? 'levelup' : 'item');
      const cb = this.onVictory;
      const summary = {
        exp: totalExp,
        gold: totalGold,
        drops,
        lvLogs
      };

      const finalize = () => {
        this.endBattleCleanly();
        if (this.game && this.game.ui) {
          this.game.ui.showVictoryBanner(summary, () => {
            if (cb) cb(summary);
          });
        } else if (cb) {
          cb(summary);
        }
      };

      if (this.game && this.game.headless) finalize();
      else setTimeout(finalize, 420);
    }

    finishDefeat() {
      this.phase = 'end';
      const cb = this.onDefeat;
      const finalize = () => {
        this.active = false;
        // 戰敗不卡死：於當前城鎮/迷宮入口復活並回半血，方便玩家重整裝備再戰！
        for (const id of Object.keys(this.game.state.heroes)) {
          const h = this.game.state.heroes[id];
          const eff = computeHeroStats(h);
          h.hp = Math.floor(eff.maxHp * 0.6);
          h.mp = Math.floor(eff.maxMp * 0.6);
          h.poison = null;
          h.stun = 0;
        }
        const map = PalX.MAPS[this.game.state.mapId];
        if (map) this.game.teleport(map.id, map.spawn.x, map.spawn.y);
        if (this.game && this.game.ui) {
          this.game.ui.hideBattleOverlay();
          this.game.ui.toast('勝敗乃兵家常事，大俠已退回入口調息重整！');
        }
        if (cb) cb();
      };
      if (this.game && this.game.headless) finalize();
      else setTimeout(finalize, 550);
    }

    endBattleCleanly() {
      this.active = false;
      this.autoSiege = false;
      const map = PalX.MAPS[this.game.state.mapId];
      if (map) PalX.audio.playMusic(map.music);
      if (this.game && this.game.ui) {
        this.game.ui.hideBattleOverlay();
        this.game.ui.updateTopHud();
      }
    }

    update(dt) {
      if (!this.active) return;
      if (this.shakeTimer > 0) this.shakeTimer = Math.max(0, this.shakeTimer - dt);
      for (const e of this.enemies) {
        if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - dt);
        if (e.dead && e.fadeAlpha > 0) e.fadeAlpha = Math.max(0, e.fadeAlpha - dt * 2.2);
      }
      for (let i = this.vfxList.length - 1; i >= 0; i--) {
        this.vfxList[i].timer -= dt;
        if (this.vfxList[i].timer <= 0) this.vfxList.splice(i, 1);
      }
      for (let i = this.popups.length - 1; i >= 0; i--) {
        const p = this.popups[i];
        p.y += p.vy * dt;
        p.timer -= dt;
        if (p.timer <= 0) this.popups.splice(i, 1);
      }
    }
  }

  PalX.createHeroInstance = createHeroInstance;
  PalX.computeHeroStats = computeHeroStats;
  PalX.levelUpHeroOnce = levelUpHeroOnce;
  PalX.gainHeroExp = gainHeroExp;
  PalX.BattleManager = BattleManager;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      createHeroInstance,
      computeHeroStats,
      levelUpHeroOnce,
      gainHeroExp,
      BattleManager
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
