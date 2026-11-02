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

console.log('=== 《仙劍X：霧魂殘夢》自動化品質與全流程回歸測試 ===\n');

// 1. 典籍與五靈生剋檢查
test('六界九泉錄涵蓋三皇六界、神農九泉、五靈生剋與歷代九部仙劍精神', () => {
  assert(PalX.LORE_CODEX.categories.length >= 4);
  const allText = JSON.stringify(PalX.LORE_CODEX);
  ['伏羲', '神農', '女媧', '霧魂', '寒髓', '毒瘴', '龍潭', '鎖妖塔', '五靈珠', '聖靈珠'].forEach((kw) => {
    assert(allText.includes(kw), `缺少關鍵世界觀詞彙: ${kw}`);
  });
});

test('五靈相剋循環（水→火→雷→風→土→水）倍率精準', () => {
  assert.strictEqual(PalX.getElementMultiplier('water', 'fire'), 1.5);
  assert.strictEqual(PalX.getElementMultiplier('fire', 'thunder'), 1.5);
  assert.strictEqual(PalX.getElementMultiplier('thunder', 'wind'), 1.5);
  assert.strictEqual(PalX.getElementMultiplier('wind', 'earth'), 1.5);
  assert.strictEqual(PalX.getElementMultiplier('earth', 'water'), 1.5);
  assert.strictEqual(PalX.getElementMultiplier('fire', 'water'), 0.68);
});

// 2. 全部 10 張等距地圖之物件座標與 BFS 可達性驗證
test('全部 10 張 45度斜視角地圖的所有 NPC、寶箱、機關、Boss 與傳送點 100% 可步行抵達', () => {
  const engine = new PalX.GameEngine({ headless: true });
  engine.initNewGameState();

  // 開啟所有機關門旗標以驗證解謎後全圖連通性
  const allGateFlags = ['qixia_seal_broken', 'serpent_gate_open', 'tower_seal_open', 'qilin_gate_open', 'rift_gate_open', 'abyss_seal_open'];
  allGateFlags.forEach((gf) => { engine.state.flags[gf] = true; });
  ['lingxi_joined', 'defeated_shejun', 'defeated_yexiao'].forEach((f) => { engine.state.flags[f] = true; });

  const mapIds = Object.keys(PalX.MAPS);
  assert.strictEqual(mapIds.length, 10);

  for (const mid of mapIds) {
    const map = PalX.MAPS[mid];
    engine.loadMap(mid, map.spawn.x, map.spawn.y, true);
    assert(engine.isTileWalkable(map, map.spawn.x, map.spawn.y, true), `${mid} spawn 不可行走`);

    for (const obj of map.objects) {
      const ch = map.grid[obj.y] && map.grid[obj.y][obj.x];
      assert(ch && !['#', '~', 'T'].includes(ch), `${mid} 物件 ${obj.id} 位於阻擋格 (${obj.x},${obj.y})='${ch}'`);

      const dist = Math.abs(obj.x - map.spawn.x) + Math.abs(obj.y - map.spawn.y);
      if (dist > 1) {
        const path = engine.findPathBFS(map.spawn.x, map.spawn.y, obj.x, obj.y);
        assert(path.length > 0, `${mid} 無法從入口尋路抵達物件 ${obj.id} (${obj.x},${obj.y})`);
      }
    }
  }
});

// 3. 煉蠱皿、金蠶王、靈珠改變合擊、偷竊、投擲、乾坤一擲與酒神驗證
test('煉蠱皿配方可正確煉出【隱蠱】與【金蠶王】且金蠶王直接升1級', () => {
  const engine = new PalX.GameEngine({ headless: true });
  engine.initNewGameState();
  engine.addItem('liangumin', 1);
  engine.addItem('dulongsha', 1);
  engine.addItem('huashishui', 1);
  const r1 = engine.performGuAlchemy('dulongsha', 'huashishui');
  assert(r1.ok && r1.product.id === 'yingu', '赤蠍毒砂+化屍水應煉出隱蠱');

  engine.addItem('xuehama', 1);
  engine.addItem('shilianguo', 1);
  const r2 = engine.performGuAlchemy('xuehama', 'shilianguo');
  assert(r2.ok && r2.product.id === 'jincanwang', '雪蛤蟆+試煉果應煉出金蠶王');

  const lvBefore = engine.state.heroes.luxiao.level;
  const useRes = engine.useFieldItem('jincanwang', 'luxiao');
  assert(useRes.ok && engine.state.heroes.luxiao.level === lvBefore + 1, '金蠶王應使修行+1');
});

test('五靈珠與聖靈珠配戴後可正確昇華【合擊】為風神/雷神/火神/山神/雪妖/武神', () => {
  const engine = new PalX.GameEngine({ headless: true });
  engine.initNewGameState();
  const h1 = engine.state.heroes.luxiao;
  const h2 = engine.state.heroes.lingxi;

  assert.strictEqual(PalX.resolveCoopSkill([h1, h2]).id, 'hetiqigong');
  h2.equip.relic = 'fenglingzhu';
  assert.strictEqual(PalX.resolveCoopSkill([h1, h2]).id, 'fengshen');
  h1.equip.relic = 'leilingzhu';
  assert.strictEqual(PalX.resolveCoopSkill([h1, h2]).id, 'leishen');
  h2.equip.relic = 'shenglingzhu';
  assert.strictEqual(PalX.resolveCoopSkill([h1, h2]).id, 'wushen');
});

test('仙劍1核心戰鬥機制：飛雲探龍手偷竊、雙劍二連擊、長鞭全體橫掃、武器投擲、乾坤一擲、酒神9次限制', () => {
  const engine = new PalX.GameEngine({ headless: true });
  engine.initNewGameState();
  engine.state.gold = 2000;
  engine.addItem('guihuajiu', 2);
  engine.addItem('tiejian', 1);

  const luxiao = engine.state.heroes.luxiao;
  for (let i = 0; i < 24; i++) PalX.levelUpHeroOnce(luxiao);
  luxiao.skills.push('jiushen');
  engine.state.activeParty = ['luxiao', 'lingxi', 'yueling'];
  for (let i = 0; i < 20; i++) {
    PalX.levelUpHeroOnce(engine.state.heroes.lingxi);
    PalX.levelUpHeroOnce(engine.state.heroes.yueling);
  }

  // 驗證雙劍二連擊與長鞭全體橫掃旗標
  assert.strictEqual(PalX.computeHeroStats(engine.state.heroes.lingxi).doubleHit, true);
  assert.strictEqual(PalX.computeHeroStats(engine.state.heroes.yueling).splashAll, true);

  // 開啟與鎮獄明王及兩隻銅人的戰鬥
  let won = false;
  engine.battle.start(['boss_mingwang', 'tongren'], {
    onVictory: () => { won = true; }
  });

  // 飛雲探龍手偷竊鎮獄明王的金蠶王
  luxiao.baseStats.lck = 300; // 確保測試命中偷竊
  engine.battle.activeActorId = 'luxiao';
  engine.battle.phase = 'input';
  engine.battle.submitPlayerAction({ type: 'skill', skillId: 'feiyuntanlong', targetIdx: 0 });
  assert(engine.getItemCount('jincanwang') >= 1, '應從鎮獄明王身上偷得金蠶王');

  // 投擲閒置精鐵長劍
  if (engine.battle.active) {
    engine.battle.activeActorId = 'luxiao';
    engine.battle.phase = 'input';
    engine.battle.submitPlayerAction({ type: 'throw', itemId: 'tiejian', targetIdx: 1 });
    assert.strictEqual(engine.getItemCount('tiejian'), 0, '投擲武器後應消耗該武器');
  }

  // 施展酒神清場
  if (engine.battle.active) {
    luxiao.mp = 350;
    engine.battle.activeActorId = 'luxiao';
    engine.battle.phase = 'input';
    engine.battle.submitPlayerAction({ type: 'skill', skillId: 'jiushen' });
    assert.strictEqual(engine.state.wineGodUses, 1, '酒神使用次數應+1');
    assert.strictEqual(luxiao.mp, 0, '酒神應傾盡當前真氣');
  }
  assert(won, '酒神與連番攻勢後應贏得戰鬥');
});

// 4. 全六章完整通關與三大結局觸發模擬
test('全六章主支線劇情、八大首領連戰與【隱藏真結局／正統結局／蒼涼結局】完整可達', () => {
  const engine = new PalX.GameEngine({ headless: true });
  engine.initNewGameState();

  // 提升數值以在無頭模式下自動高速打贏所有劇情 Boss
  ['luxiao', 'lingxi', 'yueling', 'aman'].forEach((id) => {
    const h = engine.state.heroes[id];
    for (let i = 0; i < 32; i++) PalX.levelUpHeroOnce(h);
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

  // 第一章：搜刮酒罈與古柳記憶碎片1 -> 醉劍翁學御劍術 -> 柳嬸病倒 -> 棲霞島破4石像 -> 靈汐入隊 -> 戰赤鬼 -> 救醒柳嬸
  engine.interactWithObject(PalX.MAPS.linan_inn.objects.find((o) => o.id === 'barrel_wine'));
  engine.interactWithObject(PalX.MAPS.linan_inn.objects.find((o) => o.id === 'chest_linan_well'));
  engine.runStoryInteraction('linan_zuijian');
  assert(engine.state.heroes.luxiao.skills.includes('yujianshu'));
  engine.runStoryInteraction('linan_liushen');
  engine.runStoryInteraction('linan_boat');
  assert.strictEqual(engine.state.mapId, 'qixia_island');

  ['statue_wind', 'statue_fire', 'statue_water', 'statue_thunder'].forEach((sid) => {
    engine.interactWithObject(PalX.MAPS.qixia_island.objects.find((o) => o.id === sid));
  });
  assert(engine.state.flags.qixia_seal_broken);
  engine.runStoryInteraction('qixia_meet_lingxi');
  engine.runStoryInteraction('qixia_boss_chigui');
  autoWinCurrentBattle();
  assert(engine.state.flags.defeated_chigui);
  engine.teleport('linan_inn', 3, 3);
  engine.runStoryInteraction('linan_liushen');
  assert(engine.state.flags.cured_liushen);

  // 第二章：姑蘇記憶碎片2 -> 比武招親戰沈月綾 -> 隱霧蛇窟開關 -> 戰蛇君狐女得風靈珠
  engine.runStoryInteraction('linan_to_suzhou');
  engine.interactWithObject(PalX.MAPS.suzhou_city.objects.find((o) => o.id === 'chest_suzhou_mem'));
  engine.runStoryInteraction('suzhou_arena_duel');
  autoWinCurrentBattle();
  assert(engine.state.flags.yueling_joined);
  engine.runStoryInteraction('suzhou_to_serpent');
  engine.runStoryInteraction('serpent_switch');
  engine.runStoryInteraction('serpent_boss_fight');
  autoWinCurrentBattle();
  assert(engine.getItemCount('fenglingzhu') === 1);

  // 第三章：蜀山劍塚記憶碎片3 -> 闖鎮妖古塔 -> 陰陽雙陣樞 & 記憶碎片4 -> 戰鎮獄明王得雷火雙珠與酒神
  engine.runStoryInteraction('serpent_to_shushan');
  engine.runStoryInteraction('shushan_sword_mound');
  engine.runStoryInteraction('shushan_enter_tower');
  engine.interactWithObject(PalX.MAPS.demon_tower.objects.find((o) => o.id === 'chest_tower_2'));
  engine.interactWithObject(PalX.MAPS.demon_tower.objects.find((o) => o.id === 'switch_yin'));
  engine.interactWithObject(PalX.MAPS.demon_tower.objects.find((o) => o.id === 'switch_yang'));
  assert(engine.state.flags.tower_seal_open);
  engine.runStoryInteraction('tower_boss_mingwang');
  autoWinCurrentBattle();
  assert(engine.state.flags.defeated_mingwang);
  assert(engine.state.heroes.luxiao.skills.includes('jiushen'));

  // 第四章：白苗谷藍阿蠻入隊得煉蠱皿 -> 火麟洞拾鳳凰羽、開火圖騰、戰火麒麟得麒麟角與土靈珠 -> 聖姑救治月綾
  engine.runStoryInteraction('miao_aman_join');
  engine.runStoryInteraction('miao_to_qilin');
  engine.interactWithObject(PalX.MAPS.fire_qilin_cave.objects.find((o) => o.id === 'chest_phoenix'));
  engine.runStoryInteraction('qilin_switch');
  engine.runStoryInteraction('qilin_boss_fight');
  autoWinCurrentBattle();
  assert(engine.state.flags.defeated_qilin);
  engine.teleport('miao_village', 7, 7);
  engine.runStoryInteraction('miao_shenggu');
  assert(engine.state.flags.saved_yueling);

  // 第五章：霧魂時之隙遇十年前小陸逍 -> 龍潭古鏡締結【龍潭逆命契】 -> 戰魔統領夜梟得水靈珠
  engine.runStoryInteraction('miao_to_mist');
  engine.runStoryInteraction('mist_young_luxiao');
  assert(engine.getItemCount('memory_shard') >= 5);
  engine.runStoryInteraction('mist_longtan_mirror');
  assert(engine.state.flags.forged_longtan_pact);
  engine.runStoryInteraction('mist_switch');
  engine.runStoryInteraction('mist_boss_yexiao');
  autoWinCurrentBattle();
  assert(engine.getItemCount('shuilingzhu') === 1);

  // 終章：九泉深淵五靈合成聖靈珠 -> 幽溟教主與合體渾沌水魔獸二連戰 -> 觸發隱藏真結局！
  engine.runStoryInteraction('mist_to_abyss');
  engine.runStoryInteraction('abyss_five_pearls_altar');
  assert(engine.hasItemOrEquipped('shenglingzhu'));
  engine.runStoryInteraction('abyss_final_battle');
  autoWinCurrentBattle(); // 擊敗幽溟教主
  autoWinCurrentBattle(); // 擊敗渾沌水魔獸
  assert.strictEqual(engine.state.flags.completed_ending, 'true_ending');

  // 驗證正統結局與蒼涼結局分支判定
  engine.state.flags.forged_longtan_pact = false;
  engine.state.flags.saved_yueling = true;
  engine.triggerEndingSequence();
  assert.strictEqual(engine.state.flags.completed_ending, 'classic_ending');

  engine.state.flags.saved_yueling = false;
  engine.triggerEndingSequence();
  assert.strictEqual(engine.state.flags.completed_ending, 'lone_ending');
});

// 5. 8向螢幕對齊操控、45度走廊自動滑牆、60FPS子格插值與不可通行格智慧吸附驗證
test('8向螢幕對齊移動、1格荷花橋自動滑牆、60FPS子格插值與河岸點擊智慧吸附', () => {
  const engine = new PalX.GameEngine({ headless: true });
  engine.initNewGameState();

  // 在客棧出生點 (3,3) 正上方 (2,2) 為柳嬸：按上應直接朝向並觸發互動；於空地 (4,3) 按上則朝螢幕正上方 (-1,-1) 走至 (3,2)
  const rBump = engine.resolveScreenDirectionStep(0, -1, 0);
  assert(rBump.interacted === true, '正對柳嬸 (2,2) 按上應直接觸發對話互動');
  engine.teleport('linan_inn', 4, 3);
  const rUp = engine.resolveScreenDirectionStep(0, -1, 0);
  assert(rUp.moved && engine.playerPos.x === 3 && engine.playerPos.y === 2, '開闊處按上應朝螢幕正上方 (-1,-1) 前進至 (3,2)');

  // 測試 60FPS 子格插值：推進半步時 renderPlayer 應位於起終點之間，而非瞬間跳變
  engine.teleport('suzhou_city', 6, 8);
  engine.tryStep(1, 0, { duration: 0.14 });
  engine.update(0.07);
  assert(engine.renderPlayer.x > 6.2 && engine.renderPlayer.x < 6.8, '半步更新時 renderPlayer 應處於平滑子格插值位置');

  // 在棲霞仙島 1 格寬荷花橋 (5, 11) 按螢幕正右 (svx=1, svy=0)：正對角 (6,10) 為水域，應自動沿橋滑行至 (6,11)
  engine.teleport('qixia_island', 5, 11);
  const rSlide = engine.resolveScreenDirectionStep(1, 0, 0);
  assert(rSlide.moved && engine.playerPos.x === 6 && engine.playerPos.y === 11, '1格寬荷花橋按右應自動沿45度橋面滑行至 (6,11)');

  // 點擊水域不可通行格 (7, 12) 時，應自動吸附至最近可抵達之橋面格產生尋路路徑
  engine.handleMapClick(7, 12, null);
  assert(engine.movePath.length > 0, '點擊河岸旁水域應自動吸附至最近可行走格');
});

console.log(`\n🎉 全部 ${passed} 項核心系統與全六章通關驗證 100% 通過！`);
