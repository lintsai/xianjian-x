const assert = require('assert');

// 載入所有核心模組至全域
require('../js/data/lore_codex.js');
require('../js/data/items_skills.js');
require('../js/data/characters_enemies.js');
require('../js/data/maps_chapters.js');
require('../js/data/story_events.js');
require('../js/audio.js');
require('../js/graphics.js');
require('../js/combat.js');
require('../js/engine.js');

const PalX = globalThis.PalX;

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    process.exit(1);
  }
}

console.log('=== 《仙劍X：燼月長歌》全十六境長篇巨製與系統品質測試 ===\n');

// 1. 典籍與五靈生剋檢查
test('九州錄涵蓋太初墜星、神農歸墟、五曜鎮淵、十八年前壬戌燼夜與原創仙俠世界觀', () => {
  assert(PalX.LORE_CODEX.categories.length >= 4);
  const allText = JSON.stringify(PalX.LORE_CODEX);
  ['太初', '歸墟', '五曜', '燼毒', '玄霄', '鎮遠', '聽雪', '望舒', '聖魄'].forEach((kw) => {
    assert(allText.includes(kw), `缺少關鍵世界觀詞彙: ${kw}`);
  });
});

test('五曜生剋循環（水→火→雷→風→土→水）倍率精準', () => {
  assert.strictEqual(PalX.getElementMultiplier('water', 'fire'), 1.5);
  assert.strictEqual(PalX.getElementMultiplier('fire', 'thunder'), 1.5);
  assert.strictEqual(PalX.getElementMultiplier('thunder', 'wind'), 1.5);
  assert.strictEqual(PalX.getElementMultiplier('wind', 'earth'), 1.5);
  assert.strictEqual(PalX.getElementMultiplier('earth', 'water'), 1.5);
  assert.strictEqual(PalX.getElementMultiplier('fire', 'water'), 0.68);
});

// 2. 全部 16 張等距大地圖 (13,072 瓦片) 之物件座標與 BFS 可達性驗證
test('全部 16 張 45度斜視角地圖的所有 NPC、寶箱、機關、Boss、造景與傳送點 100% 可步行抵達', () => {
  const engine = new PalX.GameEngine({ headless: true });
  engine.initNewGameState();

  // 開啟所有機關門旗標以驗證解謎後全圖連通性
  const allGateFlags = [
    'reed_sluice_open', 'qixia_seal_broken', 'snake_gate_open', 'mine_inner_open',
    'tower_seal_open', 'miasma_cleared', 'fire_bridge_open', 'trial_gate_open',
    'causeway_seal_open', 'abyss_seal_open'
  ];
  allGateFlags.forEach((gf) => { engine.state.flags[gf] = true; });
  ['lingxi_joined', 'defeated_shejun', 'saved_yueling', 'defeated_yexiao', 'unlocked_trial_grotto'].forEach((f) => { engine.state.flags[f] = true; });

  const mapIds = Object.keys(PalX.MAPS);
  assert.strictEqual(mapIds.length, 16, '大地圖總數應為 16 張');

  for (const mid of mapIds) {
    const map = PalX.MAPS[mid];
    engine.loadMap(mid, map.spawn.x, map.spawn.y, true);
    assert(engine.isTileWalkable(map, map.spawn.x, map.spawn.y, true), `${mid} spawn 不可行走`);

    for (const obj of map.objects) {
      const ch = map.grid[obj.y] && map.grid[obj.y][obj.x];
      assert(ch && !['#', '~', 'T', 'W', 'B', 'w'].includes(ch), `${mid} 物件 ${obj.id} 位於阻擋格 (${obj.x},${obj.y})='${ch}'`);

      const dist = Math.abs(obj.x - map.spawn.x) + Math.abs(obj.y - map.spawn.y);
      if (dist > 1) {
        const path = engine.findPathBFS(map.spawn.x, map.spawn.y, obj.x, obj.y);
        assert(path.length > 0, `${mid} 無法從入口尋路抵達物件 ${obj.id} (${obj.x},${obj.y})`);
      }
    }
  }
});

// 3. 生動 NPC 狀態機模擬測試 (病榻躺臥、大夫移步、巡邏遇玩家駐足面向、礦工團聚)
test('生動 NPC 狀態機：巡邏路徑、遇玩家禮貌駐足面向、病榻動態臥倒、大夫移步守護與礦工夫妻團聚', () => {
  const engine = new PalX.GameEngine({ headless: true });
  engine.initNewGameState();

  // 1. 煙波古鎮初始狀態
  engine.loadMap('yanbo_town', 5, 5, true);
  const peiNpc = engine.activeMapNpcs.find((n) => n.id === 'npc_peiye');
  const xuNpc = engine.activeMapNpcs.find((n) => n.id === 'npc_xu_doc');
  let sailorNpc = engine.activeMapNpcs.find((n) => n.id === 'npc_patrol_sailor');

  assert(peiNpc && peiNpc.x === 6 && peiNpc.y === 4 && peiNpc.runtimePose === 'stand', '裴老艄公初始應立於草堂門前');
  assert(xuNpc && xuNpc.x === 25 && xuNpc.y === 4 && xuNpc.serviceBadge === '藥', '許大夫初始應在杏林藥堂坐堂');
  assert(sailorNpc && sailorNpc.patrol && sailorNpc.patrol.length >= 2, '鎮民應有巡邏路徑');

  // 2. 觸發裴老艄公病倒狀態
  engine.state.flags.liushen_sick = true;
  engine.update(0.1);
  assert.strictEqual(peiNpc.x, 4, '老艄公病倒後應移至竹榻 (4,4)');
  assert.strictEqual(peiNpc.runtimePose, 'kneel', '老艄公病倒後應呈現臥榻姿勢 (kneel)');
  assert.strictEqual(xuNpc.x, 5, '許大夫聞訊應迅速移步至草堂病榻旁 (5,4)');
  assert.strictEqual(xuNpc.runtimeFacingLeft, true, '許大夫應轉向面對老艄公施針診治');

  // 3. 巡邏 NPC 在玩家靠近時禮貌駐足並面向玩家
  engine.teleport('yanbo_town', sailorNpc.x + 1, sailorNpc.y);
  sailorNpc = engine.activeMapNpcs.find((n) => n.id === 'npc_patrol_sailor');
  engine.update(0.05);
  const dist = Math.hypot(engine.renderPlayer.x - sailorNpc.rx, engine.renderPlayer.y - sailorNpc.ry);
  assert(dist <= 1.6, '玩家應處於巡邏者鄰近範圍');
  assert.strictEqual(sailorNpc.runtimeMoving, false, '巡邏者遇玩家靠近應停步');

  // 4. 錦官城解救礦工後，礦工趙大應出現在林嫂身邊團聚
  engine.teleport('jinguan_city', 20, 20);
  engine.state.flags.saved_miners = true;
  engine.update(0.1);
  const rescuedMiner = engine.activeMapNpcs.find((n) => n.id === 'npc_rescued_miner');
  const minerWife = engine.activeMapNpcs.find((n) => n.id === 'npc_miner_wife');
  assert(rescuedMiner && !rescuedMiner.hidden, '解救後礦工趙大應在城中現身');
  assert(minerWife && !minerWife.hidden, '林嫂應在旁');
  assert(Math.abs(rescuedMiner.x - minerWife.x) <= 1 && Math.abs(rescuedMiner.y - minerWife.y) <= 1, '夫妻二人應相聚身畔');
});

// 4. 百草丹鼎合煉、金蠶靈王、靈珠昇華合擊、偷竊、投擲、金錢鏢與醉月狂歌九次限制
test('百草丹鼎合煉【幻霧隱靈丹】與【金蠶靈王】，聖靈珠昇華【鑄天劍神】，探雲摘星手、投擲與醉月狂歌', () => {
  const engine = new PalX.GameEngine({ headless: true });
  engine.initNewGameState();
  engine.addItem('liangumin', 1);
  engine.addItem('dulongsha', 1);
  engine.addItem('huashishui', 1);
  const r1 = engine.performGuAlchemy('dulongsha', 'huashishui');
  assert(r1.ok && r1.product.id === 'yingu', '赤蠍毒砂+化屍水應煉出幻霧隱靈丹');

  engine.addItem('xuehama', 1);
  engine.addItem('shilianguo', 1);
  const r2 = engine.performGuAlchemy('xuehama', 'shilianguo');
  assert(r2.ok && r2.product.id === 'jincanwang', '雪蛤蟆+試煉果應煉出金蠶靈王');

  const lvBefore = engine.state.heroes.luxiao.level;
  const useRes = engine.useFieldItem('jincanwang', 'luxiao');
  assert(useRes.ok && engine.state.heroes.luxiao.level === lvBefore + 1, '金蠶靈王應使修行+1');

  // 五靈合擊昇華驗證
  const h1 = engine.state.heroes.luxiao;
  const h2 = engine.state.heroes.lingxi;
  assert.strictEqual(PalX.resolveCoopSkill([h1, h2]).id, 'hetiqigong');
  h2.equip.relic = 'fenglingzhu';
  assert.strictEqual(PalX.resolveCoopSkill([h1, h2]).id, 'fengshen');
  h1.equip.relic = 'leilingzhu';
  assert.strictEqual(PalX.resolveCoopSkill([h1, h2]).id, 'leishen');
  h2.equip.relic = 'shenglingzhu';
  assert.strictEqual(PalX.resolveCoopSkill([h1, h2]).id, 'wushen');

  // 戰鬥實裝驗證
  engine.state.gold = 2000;
  engine.addItem('guihuajiu', 2);
  engine.addItem('tiejian', 1);
  for (let i = 0; i < 24; i++) PalX.levelUpHeroOnce(h1);
  h1.skills.push('jiushen');
  engine.state.activeParty = ['luxiao', 'lingxi', 'yueling'];
  for (let i = 0; i < 20; i++) {
    PalX.levelUpHeroOnce(engine.state.heroes.lingxi);
    PalX.levelUpHeroOnce(engine.state.heroes.yueling);
  }

  assert.strictEqual(PalX.computeHeroStats(engine.state.heroes.lingxi).doubleHit, true, '白芷微雙劍普通攻擊具備二連擊');
  assert.strictEqual(PalX.computeHeroStats(engine.state.heroes.yueling).splashAll, true, '燕驚鴻長鞭普通攻擊具備全體橫掃');

  let won = false;
  engine.battle.start(['boss_mingwang', 'tongren'], {
    onVictory: () => { won = true; }
  });

  // 偷竊測試
  h1.baseStats.lck = 300;
  engine.battle.activeActorId = 'luxiao';
  engine.battle.phase = 'input';
  engine.battle.submitPlayerAction({ type: 'skill', skillId: 'feiyuntanlong', targetIdx: 0 });
  assert(engine.getItemCount('jincanwang') >= 1, '應從鎮獄神傀身上探得金蠶靈王');

  // 投擲測試
  if (engine.battle.active) {
    engine.battle.activeActorId = 'luxiao';
    engine.battle.phase = 'input';
    engine.battle.submitPlayerAction({ type: 'throw', itemId: 'tiejian', targetIdx: 1 });
    assert.strictEqual(engine.getItemCount('tiejian'), 0, '投擲武器後應消耗該武器');
  }

  // 醉月狂歌九次限制測試
  if (engine.battle.active) {
    h1.mp = 350;
    engine.battle.activeActorId = 'luxiao';
    engine.battle.phase = 'input';
    engine.battle.submitPlayerAction({ type: 'skill', skillId: 'jiushen' });
    assert.strictEqual(engine.state.wineGodUses, 1, '醉月狂歌使用次數應+1');
    assert.strictEqual(h1.mp, 0, '醉月狂歌應傾盡當前真氣');
  }
  assert(won, '戰鬥應獲勝');
});

// 5. 十二樁完整支線任務推進與酬謝驗證
test('十二樁俠義支線（修傘、信物、尋蘭、對詩、寒鐵、撫恤、救礦、試劍、守劍、畫靈、丹術、靈鹿）完整可解', () => {
  const engine = new PalX.GameEngine({ headless: true });
  engine.initNewGameState();

  // SQ1: 修傘
  engine.runStoryInteraction('sq_umbrella_npc');
  assert(engine.state.flags.sq_umbrella_started);
  engine.addItem('umbrella_bamboo', 1);
  engine.runStoryInteraction('sq_umbrella_npc');
  assert(engine.state.flags.sq_umbrella_done);

  // SQ2: 家書
  engine.runStoryInteraction('sq_letter_npc');
  assert(engine.state.flags.sq_letter_started);
  engine.addItem('sunken_letter', 1);
  engine.runStoryInteraction('sq_letter_npc');
  assert(engine.state.flags.sq_letter_done);

  // SQ3: 幽蘭
  engine.runStoryInteraction('linan_hong');
  assert(engine.state.flags.sq_orchid_started);
  engine.addItem('frost_orchid', 1);
  engine.runStoryInteraction('linan_hong');
  assert(engine.state.flags.sq_orchid_done);

  // SQ4: 對詩
  engine.runStoryInteraction('sq_poem_npc');
  assert(engine.state.flags.sq_poem_done);
  assert(engine.getItemCount('yufozhu') >= 1);

  // SQ5: 寒鐵
  engine.runStoryInteraction('sq_star_iron_npc');
  assert(engine.state.flags.sq_star_iron_started);
  engine.addItem('star_iron', 1);
  engine.runStoryInteraction('sq_star_iron_npc');
  assert(engine.state.flags.sq_star_iron_done);

  // SQ6: 鏢局
  engine.runStoryInteraction('sq_escort_npc');
  assert(engine.state.flags.sq_escort_started);
  engine.state.flags.defeated_shejun = true;
  engine.runStoryInteraction('sq_escort_npc');
  assert(engine.state.flags.sq_escort_done);

  // SQ7: 礦工
  engine.runStoryInteraction('sq_miner_wife_npc');
  assert(engine.state.flags.sq_miners_started);
  engine.state.flags.saved_miners = true;
  engine.runStoryInteraction('sq_miner_wife_npc');
  assert(engine.state.flags.sq_miners_done);

  // SQ8: 試劍
  for (let i = 0; i < 15; i++) PalX.levelUpHeroOnce(engine.state.heroes.luxiao);
  engine.runStoryInteraction('sq_duel_disciple');
  while (engine.battle.active) {
    if (engine.battle.phase === 'input') engine.battle.submitPlayerAction({ type: 'strongest' });
    else engine.battle.advanceTurn();
  }
  assert(engine.state.flags.sq_sword_duel_done);

  // SQ9: 守劍
  engine.runStoryInteraction('sq_sword_ghost_npc');
  assert(engine.state.flags.sq_sword_oath_started);
  engine.addItem('broken_sword_token', 1);
  engine.runStoryInteraction('sq_sword_ghost_npc');
  assert(engine.state.flags.sq_sword_oath_done);
  assert(engine.getItemCount('taia_jade') >= 1);

  // SQ10: 畫靈
  engine.runStoryInteraction('sq_paint_spirit_npc');
  assert(engine.state.flags.sq_painting_done);

  // SQ11: 丹術
  engine.addItem('yingu', 1);
  engine.runStoryInteraction('sq_alchemy_ge_npc');
  assert(engine.state.flags.sq_alchemy_done);

  // SQ12: 靈鹿
  engine.runStoryInteraction('sq_fawn_boy_npc');
  assert(engine.state.flags.sq_fawn_started);
  engine.runStoryInteraction('sq_rescue_fawn');
  engine.runStoryInteraction('sq_fawn_boy_npc');
  assert(engine.state.flags.sq_fawn_done);
});

// 6. 全六章長篇主線、秘境問心劍塚神獸與三大結局完整通關模擬
test('全六章十六境長篇主線、問心劍塚太阿殘魂 Superboss 與三大結局完整可通', () => {
  const engine = new PalX.GameEngine({ headless: true });
  engine.initNewGameState();

  ['luxiao', 'lingxi', 'yueling', 'aman'].forEach((id) => {
    const h = engine.state.heroes[id];
    for (let i = 0; i < 35; i++) PalX.levelUpHeroOnce(h);
  });

  function autoWinCurrentBattle() {
    let guard = 0;
    while (engine.battle.active && guard < 200) {
      guard++;
      if (engine.battle.phase === 'input') {
        engine.battle.submitPlayerAction({ type: 'strongest' });
      } else {
        engine.battle.advanceTurn();
      }
    }
    assert(!engine.battle.active, '戰鬥應順利結束');
  }

  // 第一章
  engine.addItem('guihuajiu', 1);
  engine.runStoryInteraction('linan_zuijian');
  assert(engine.state.heroes.luxiao.skills.includes('yujianshu'));
  engine.runStoryInteraction('linan_liushen');
  assert(engine.state.flags.liushen_sick);
  engine.runStoryInteraction('linan_boat');
  assert.strictEqual(engine.state.mapId, 'sunken_reed');

  engine.runStoryInteraction('reed_switch', { flag: 'reed_sw_1' });
  engine.runStoryInteraction('reed_switch', { flag: 'reed_sw_2' });
  assert(engine.state.flags.reed_sluice_open);
  engine.runStoryInteraction('reed_boss_fuzhou');
  autoWinCurrentBattle();
  assert(engine.state.flags.defeated_fuzhou);
  engine.runStoryInteraction('reed_to_qiyun');
  assert.strictEqual(engine.state.mapId, 'qiyun_bamboo');

  ['statue_1', 'statue_2', 'statue_3', 'statue_4'].forEach((sid) => {
    engine.runStoryInteraction('qixia_statue', { flag: sid });
  });
  assert(engine.state.flags.qixia_seal_broken);
  engine.runStoryInteraction('qixia_meet_lingxi');
  assert(engine.state.flags.lingxi_joined);
  engine.runStoryInteraction('qixia_boss_chigui');
  autoWinCurrentBattle();
  assert(engine.state.flags.defeated_chigui);
  engine.teleport('yanbo_town', 5, 5);
  engine.runStoryInteraction('linan_liushen');
  assert(engine.state.flags.cured_liushen);

  // 第二章
  engine.runStoryInteraction('linan_to_suzhou');
  assert.strictEqual(engine.state.mapId, 'jinguan_city');
  engine.runStoryInteraction('suzhou_arena_yueling');
  autoWinCurrentBattle();
  autoWinCurrentBattle();
  assert(engine.state.flags.yueling_joined);
  engine.runStoryInteraction('suzhou_to_snake');
  assert.strictEqual(engine.state.mapId, 'ghost_mine');
  engine.runStoryInteraction('snake_switch');
  assert(engine.state.flags.snake_gate_open);
  engine.runStoryInteraction('mine_rescue_miners');
  assert(engine.state.flags.saved_miners);
  engine.runStoryInteraction('mine_unlock_inner');
  assert(engine.state.flags.mine_inner_open);
  engine.runStoryInteraction('snake_boss_fight');
  autoWinCurrentBattle();
  assert(engine.state.flags.defeated_shejun);
  assert(engine.getItemCount('fenglingzhu') >= 1);

  // 第三章
  engine.teleport('jinguan_city', 15, 3);
  engine.runStoryInteraction('jinguan_to_luoxia');
  assert.strictEqual(engine.state.mapId, 'luoxia_trail');
  engine.runStoryInteraction('luoxia_oath_stele');
  assert(engine.getItemCount('broken_sword_token') >= 1);
  engine.runStoryInteraction('luoxia_boss_jiannu');
  autoWinCurrentBattle();
  assert(engine.state.flags.defeated_jiannu);
  engine.runStoryInteraction('luoxia_to_sect');
  assert.strictEqual(engine.state.mapId, 'xuanxiao_sect');
  engine.runStoryInteraction('shushan_main_event');
  assert(engine.state.flags.entered_demon_tower);
  engine.runStoryInteraction('shushan_zuijian_jiushen');
  assert(engine.state.heroes.luxiao.skills.includes('jiushen'));
  engine.runStoryInteraction('shushan_to_tower');
  assert.strictEqual(engine.state.mapId, 'sword_prison');
  engine.runStoryInteraction('tower_switch_yin');
  engine.runStoryInteraction('tower_switch_yang');
  assert(engine.state.flags.tower_seal_open);
  engine.runStoryInteraction('sq_sword_ghost_npc');
  assert(engine.getItemCount('taia_jade') >= 1);
  engine.runStoryInteraction('tower_boss_mingwang');
  autoWinCurrentBattle();
  assert(engine.state.flags.defeated_mingwang);
  assert.strictEqual(engine.state.mapId, 'yunmeng_village');

  // 第四章
  engine.runStoryInteraction('miao_aman_join');
  assert(engine.state.flags.aman_joined);
  engine.runStoryInteraction('miao_to_qilin');
  assert.strictEqual(engine.state.mapId, 'miasma_forest');
  ['wtotem_1', 'wtotem_2', 'wtotem_3'].forEach((sid) => {
    engine.runStoryInteraction('miasma_totem', { flag: sid });
  });
  assert(engine.state.flags.miasma_cleared);
  engine.runStoryInteraction('miasma_boss_fight');
  autoWinCurrentBattle();
  assert(engine.state.flags.defeated_fumuzun);
  assert(engine.getItemCount('tulingzhu') >= 1);
  engine.runStoryInteraction('qilin_phoenix_chest');
  assert(engine.state.flags.got_fenghuangyu);
  engine.runStoryInteraction('miasma_to_zhurong');
  assert.strictEqual(engine.state.mapId, 'zhurong_cavern');
  engine.runStoryInteraction('zhurong_switch', { flag: 'fsw_1' });
  engine.runStoryInteraction('zhurong_switch', { flag: 'fsw_2' });
  assert(engine.state.flags.fire_bridge_open);
  engine.runStoryInteraction('qilin_boss_fight');
  autoWinCurrentBattle();
  assert(engine.state.flags.defeated_qilin);
  assert(engine.getItemCount('huolingzhu') >= 1);
  engine.teleport('yunmeng_village', 16, 4);
  engine.runStoryInteraction('miao_shenggu');
  assert(engine.state.flags.saved_yueling);

  // 第五章 & 隱藏秘境問心劍塚
  engine.runStoryInteraction('miao_to_rift');
  assert.strictEqual(engine.state.mapId, 'wangshu_ruins');
  engine.runStoryInteraction('ruins_to_secret_grotto');
  assert.strictEqual(engine.state.mapId, 'sword_trial_grotto');
  engine.runStoryInteraction('trial_switch', { flag: 'tsw_1' });
  engine.runStoryInteraction('trial_switch', { flag: 'tsw_2' });
  assert(engine.state.flags.trial_gate_open);
  engine.runStoryInteraction('trial_superboss_fight');
  autoWinCurrentBattle();
  assert(engine.state.flags.defeated_swordspirit);
  engine.runStoryInteraction('trial_taia_chest');
  assert(engine.getItemCount('taia_sword') >= 1);

  // 十八年前舊夢
  engine.teleport('past_yanbo_night', 14, 22);
  engine.runStoryInteraction('rift_young_luxiao');
  engine.runStoryInteraction('rift_boss_yexiao');
  autoWinCurrentBattle();
  assert(engine.state.flags.defeated_yexiao);
  engine.runStoryInteraction('rift_young_luxiao');
  assert(engine.getItemCount('shuilingzhu') >= 1);

  // 龍潭逆命契
  engine.teleport('wangshu_ruins', 15, 12);
  engine.addItem('memory_shard', 4);
  engine.runStoryInteraction('rift_longtan_mirror');
  assert(engine.state.flags.forged_longtan_pact);

  // 終章
  engine.teleport('guixu_causeway', 15, 23);
  engine.runStoryInteraction('causeway_switch', { flag: 'csw_1' });
  engine.runStoryInteraction('causeway_switch', { flag: 'csw_2' });
  assert(engine.state.flags.causeway_seal_open);
  engine.teleport('lunar_citadel', 16, 25);
  engine.runStoryInteraction('abyss_wuling_altar');
  assert(engine.hasItemOrEquipped('shenglingzhu'));
  engine.runStoryInteraction('abyss_final_boss');
  autoWinCurrentBattle();
  autoWinCurrentBattle();
  assert.strictEqual(engine.state.flags.completed_ending, 'true_ending');

  // 驗證三結局分支
  engine.state.flags.forged_longtan_pact = false;
  engine.state.flags.saved_yueling = true;
  engine.triggerEndingSequence();
  assert.strictEqual(engine.state.flags.completed_ending, 'classic_ending');

  engine.state.flags.saved_yueling = false;
  engine.triggerEndingSequence();
  assert.strictEqual(engine.state.flags.completed_ending, 'lone_ending');
});

console.log(`\n🎉 全部 ${passed} 項長篇系統、十六境地圖與三大結局驗證 100% 通過！`);

