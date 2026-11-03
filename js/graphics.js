(function (root) {
  'use strict';

  const PalX = (root.PalX = root.PalX || {});

  const TILE_W = 68;
  const TILE_H = 34;

  // =========================================================================
  // 全套角色、NPC、首領、建築圖塊與精緻場景道具預載清單
  // =========================================================================
  const ASSET_MANIFEST = [
    // 人物與首領對話半身彩繪像
    'portraits/luxiao.png', 'portraits/lingxi.png', 'portraits/yueling.png', 'portraits/aman.png',
    'portraits/drunk_master.png', 'portraits/elder_woman.png', 'portraits/elder_man.png',
    'portraits/taoist_elder.png', 'portraits/taoist_stern.png', 'portraits/merchant_med.png',
    'portraits/blacksmith.png', 'portraits/child_boy.png', 'portraits/ghost_npc.png',
    'portraits/blind_lute.png', 'portraits/tea_girl.png', 'portraits/ferryman.png',
    'portraits/sect_disciple.png', 'portraits/scholar.png', 'portraits/escort_captain.png',
    'portraits/matriarch.png', 'portraits/boss_liwujiu.png', 'portraits/boss_swordspirit.png',
    'portraits/boss_chigui.png', 'portraits/boss_shejun.png', 'portraits/boss_yinhu.png',
    'portraits/boss_mingwang.png', 'portraits/boss_qilin.png', 'portraits/boss_yexiao.png',
    'portraits/boss_youming.png', 'portraits/boss_shuimoshou.png',
    // 四大主角地圖與對角戰鬥立繪
    'heroes/luxiao.png', 'heroes/lingxi.png', 'heroes/yueling.png', 'heroes/aman.png',
    'heroes_battle/luxiao.png', 'heroes_battle/lingxi.png', 'heroes_battle/yueling.png', 'heroes_battle/aman.png',
    // 多元城鎮與門派 NPC 立繪
    'npcs/drunk_master.png', 'npcs/elder_woman.png', 'npcs/elder_man.png',
    'npcs/taoist_elder.png', 'npcs/taoist_stern.png', 'npcs/merchant_med.png',
    'npcs/blacksmith.png', 'npcs/child_boy.png', 'npcs/ghost_npc.png',
    'npcs/blind_lute.png', 'npcs/tea_girl.png', 'npcs/ferryman.png',
    'npcs/sect_disciple.png', 'npcs/scholar.png', 'npcs/escort_captain.png', 'npcs/matriarch.png',
    // 鎮關首領與超首領
    'bosses/boss_chigui.png', 'bosses/boss_yueling.png', 'bosses/boss_shejun.png',
    'bosses/boss_yinhu.png', 'bosses/boss_mingwang.png', 'bosses/boss_qilin.png',
    'bosses/boss_yexiao.png', 'bosses/boss_youming.png', 'bosses/boss_shuimoshou.png',
    'bosses/boss_liwujiu.png', 'bosses/boss_swordspirit.png',
    // 迷宮妖魔精怪
    'monsters/plant.png', 'monsters/toad.png', 'monsters/bee.png', 'monsters/snake.png',
    'monsters/fox.png', 'monsters/golem.png', 'monsters/ghost.png', 'monsters/firebeast.png',
    'monsters/marsh_beast.png', 'monsters/ash_serpent.png',
    // 場景可互動道具與精緻裝飾物件
    'props/chest_closed.png', 'props/chest_open.png', 'props/jar.png', 'props/barrel.png',
    'props/statue.png', 'props/statue_broken.png', 'props/switch.png', 'props/switch_active.png',
    'props/boat.png', 'props/portal.png',
    'props/tree_peach.png', 'props/tree_miao.png', 'props/tree_pine.png',
    'props/tree_willow.png', 'props/bamboo_grove.png',
    'props/lantern_post.png', 'props/paifang.png', 'props/pavilion.png',
    'props/market_stall.png', 'props/incense_burner.png', 'props/well_stone.png',
    'props/inn_table.png', 'props/rock_garden.png', 'props/flower_bush.png',
    'props/stone_stele.png', 'props/alch_cauldron.png', 'props/weapon_rack.png', 'props/crystal_pillar.png',
    // 2.5D 等距地磚與粉牆黛瓦建築方塊
    'tiles/road.png', 'tiles/grass.png', 'tiles/wood.png', 'tiles/jade.png',
    'tiles/carpet.png', 'tiles/plaza.png',
    'tiles/cave_floor.png', 'tiles/tower_floor.png', 'tiles/fire_floor.png', 'tiles/mist_floor.png',
    'tiles/water.png', 'tiles/lava.png', 'tiles/abyss_water.png',
    'tiles/wall_town.png', 'tiles/wall_courtyard.png', 'tiles/wall_bamboo.png',
    'tiles/wall_rock.png', 'tiles/wall_tower.png',
    'tiles/wall_shushan.png', 'tiles/wall_fire.png', 'tiles/wall_abyss.png', 'tiles/bridge.png',
    // 全景標題與區域天幕戰場背景
    'backdrops/bg_title.jpg', 'backdrops/bg_bamboo.jpg', 'backdrops/bg_sunset.jpg', 'backdrops/bg_lunar.jpg',
    'backdrops/bg_demon_tower.jpg', 'backdrops/bg_fire_cavern.jpg', 'backdrops/bg_abyss.jpg', 'backdrops/bg_cave.jpg'
  ];

  const IMAGE_CACHE = {};

  function preloadAssets() {
    if (typeof Image === 'undefined') return;
    for (const rel of ASSET_MANIFEST) {
      const img = new Image();
      img.src = 'assets/' + rel;
      IMAGE_CACHE[rel] = img;
    }
  }

  function getImageRecord(rel) {
    if (typeof Image === 'undefined') return null;
    if (!IMAGE_CACHE[rel]) {
      const img = new Image();
      img.src = 'assets/' + rel;
      IMAGE_CACHE[rel] = img;
    }
    return IMAGE_CACHE[rel];
  }

  function getAsset(rel) {
    if (!rel) return null;
    const img = getImageRecord(rel);
    if (img && img.complete && img.naturalWidth > 0) {
      return img;
    }
    return null;
  }

  preloadAssets();

  // 11 大區域主題材質與氛圍光影表
  const THEME_PALETTES = {
    jiangnan_town: {
      bgTop: '#162944', bgBot: '#274564',
      ground: '#4d7c52', floor: '#8b6340', road: '#8e939c', plaza: '#a4a298',
      bridge: '#a47148', water: '#1d547a', waterHi: '#74c0fc',
      wallTop: '#d8d2c5', wallLeft: '#b5afa2', wallRight: '#8e887c',
      cliffLeft: '#465461', cliffRight: '#2c3742',
      lightColor: 'rgba(255, 208, 132, 0.17)', blossom: '#f48fb1',
      mapBackdrop: 'backdrops/bg_title.jpg', waterTile: 'tiles/water.png',
      tiles: {
        '.': 'tiles/grass.png', f: 'tiles/wood.png', r: 'tiles/road.png', p: 'tiles/plaza.png',
        c: 'tiles/carpet.png', b: 'tiles/bridge.png', '#': 'tiles/wall_town.png',
        w: 'tiles/wall_courtyard.png', T: 'props/tree_peach.png', W: 'props/tree_willow.png', B: 'props/bamboo_grove.png'
      },
      battleTile: 'tiles/plaza.png', battleBackdrop: null
    },
    lotus_island: {
      bgTop: '#0d2b3e', bgBot: '#1c5161',
      ground: '#3f7d63', floor: '#8b6340', road: '#7ea898', plaza: '#9cb5ad',
      bridge: '#689f78', water: '#134c66', waterHi: '#4dd0e1',
      wallTop: '#7fa1b8', wallLeft: '#5c7d94', wallRight: '#425d70',
      cliffLeft: '#2d5768', cliffRight: '#1b3a47',
      lightColor: 'rgba(128, 222, 234, 0.16)', blossom: '#b2dfdb',
      mapBackdrop: 'backdrops/bg_bamboo.jpg', waterTile: 'tiles/water.png',
      tiles: {
        '.': 'tiles/grass.png', f: 'tiles/wood.png', r: 'tiles/road.png', p: 'tiles/plaza.png',
        c: 'tiles/carpet.png', b: 'tiles/bridge.png', '#': 'tiles/wall_rock.png',
        w: 'tiles/wall_bamboo.png', T: 'props/tree_miao.png', W: 'props/tree_willow.png', B: 'props/bamboo_grove.png'
      },
      battleTile: 'tiles/grass.png', battleBackdrop: null
    },
    bamboo_sea: {
      bgTop: '#0b2926', bgBot: '#1a4a3f',
      ground: '#3d7a5a', floor: '#8d6846', road: '#859c90', plaza: '#b8ccc2',
      bridge: '#739e72', water: '#15525c', waterHi: '#80cbc4',
      wallTop: '#d2ded8', wallLeft: '#a6bab0', wallRight: '#7d9187',
      cliffLeft: '#2b4d44', cliffRight: '#183029',
      lightColor: 'rgba(167, 255, 235, 0.17)', blossom: '#a5d6a7',
      mapBackdrop: 'backdrops/bg_bamboo.jpg', waterTile: 'tiles/water.png',
      tiles: {
        '.': 'tiles/grass.png', f: 'tiles/wood.png', r: 'tiles/road.png', p: 'tiles/jade.png',
        c: 'tiles/carpet.png', b: 'tiles/bridge.png', '#': 'tiles/wall_rock.png',
        w: 'tiles/wall_courtyard.png', T: 'props/tree_pine.png', W: 'props/tree_willow.png', B: 'props/bamboo_grove.png'
      },
      battleTile: 'tiles/grass.png', battleBackdrop: null
    },
    lantern_city: {
      bgTop: '#1d142c', bgBot: '#3b233a',
      ground: '#4a704e', floor: '#946642', road: '#918a86', plaza: '#b0a396',
      bridge: '#ab7448', water: '#1d3d5e', waterHi: '#ffb74d',
      wallTop: '#ded5c8', wallLeft: '#baa996', wallRight: '#8f7f6d',
      cliffLeft: '#4a3942', cliffRight: '#2b2027',
      lightColor: 'rgba(255, 183, 77, 0.22)', blossom: '#ffcc80',
      mapBackdrop: 'backdrops/bg_sunset.jpg', waterTile: 'tiles/water.png',
      tiles: {
        '.': 'tiles/grass.png', f: 'tiles/wood.png', r: 'tiles/road.png', p: 'tiles/plaza.png',
        c: 'tiles/carpet.png', b: 'tiles/bridge.png', '#': 'tiles/wall_town.png',
        w: 'tiles/wall_courtyard.png', T: 'props/tree_peach.png', W: 'props/tree_willow.png', B: 'props/bamboo_grove.png'
      },
      battleTile: 'tiles/plaza.png', battleBackdrop: null
    },
    snake_cave: {
      bgTop: '#100e1c', bgBot: '#1e1930',
      ground: '#4a4458', floor: '#5d536b', road: '#585266', plaza: '#69627a',
      bridge: '#785a46', water: '#163147', waterHi: '#4fc3f7',
      wallTop: '#363042', wallLeft: '#292433', wallRight: '#1c1824',
      cliffLeft: '#2e273d', cliffRight: '#1a1524',
      lightColor: 'rgba(128, 222, 234, 0.16)', blossom: '#9575cd',
      mapBackdrop: 'backdrops/bg_cave.jpg', waterTile: 'tiles/water.png',
      tiles: {
        '.': 'tiles/cave_floor.png', f: 'tiles/tower_floor.png', r: 'tiles/cave_floor.png', p: 'tiles/tower_floor.png',
        c: 'tiles/carpet.png', b: 'tiles/bridge.png', '#': 'tiles/wall_rock.png',
        w: 'tiles/wall_tower.png', T: 'props/statue.png', W: 'props/tree_willow.png', B: 'props/bamboo_grove.png'
      },
      battleTile: 'tiles/cave_floor.png', battleBackdrop: 'backdrops/bg_cave.jpg'
    },
    shushan: {
      bgTop: '#152a4a', bgBot: '#465c82',
      ground: '#648572', floor: '#dce7f0', road: '#b8c8d8', plaza: '#d8e6f2',
      bridge: '#e6c88a', water: '#254366', waterHi: '#90caf9',
      wallTop: '#e8eef5', wallLeft: '#c5d3e0', wallRight: '#9fb1c2',
      cliffLeft: '#6d879e', cliffRight: '#496075',
      lightColor: 'rgba(179, 229, 252, 0.18)', blossom: '#fff59d',
      mapBackdrop: 'backdrops/bg_sunset.jpg', waterTile: 'tiles/water.png',
      tiles: {
        '.': 'tiles/grass.png', f: 'tiles/jade.png', r: 'tiles/road.png', p: 'tiles/jade.png',
        c: 'tiles/carpet.png', b: 'tiles/bridge.png', '#': 'tiles/wall_shushan.png',
        w: 'tiles/wall_courtyard.png', T: 'props/tree_pine.png', W: 'props/tree_willow.png', B: 'props/bamboo_grove.png'
      },
      battleTile: 'tiles/jade.png', battleBackdrop: null
    },
    demon_tower: {
      bgTop: '#140b22', bgBot: '#29153b',
      ground: '#3c314f', floor: '#4c3d63', road: '#574670', plaza: '#63517d',
      bridge: '#8c6b3f', water: '#1a0f28', waterHi: '#9575cd',
      wallTop: '#54433a', wallLeft: '#3d3029', wallRight: '#29201b',
      cliffLeft: '#342447', cliffRight: '#1f152e',
      lightColor: 'rgba(206, 147, 216, 0.17)', blossom: '#ce93d8',
      mapBackdrop: 'backdrops/bg_demon_tower.jpg', waterTile: 'tiles/abyss_water.png',
      tiles: {
        '.': 'tiles/tower_floor.png', f: 'tiles/tower_floor.png', r: 'tiles/cave_floor.png', p: 'tiles/jade.png',
        c: 'tiles/carpet.png', b: 'tiles/wood.png', '#': 'tiles/wall_tower.png',
        w: 'tiles/wall_tower.png', T: 'props/statue.png', W: 'props/tree_willow.png', B: 'props/bamboo_grove.png'
      },
      battleTile: 'tiles/tower_floor.png', battleBackdrop: 'backdrops/bg_demon_tower.jpg'
    },
    miao_valley: {
      bgTop: '#132c24', bgBot: '#2a5240',
      ground: '#528048', floor: '#946846', road: '#94866b', plaza: '#a89a7d',
      bridge: '#ad7a4c', water: '#1b5952', waterHi: '#64ffda',
      wallTop: '#8f6b4a', wallLeft: '#705339', wallRight: '#543e2a',
      cliffLeft: '#44523a', cliffRight: '#293322',
      lightColor: 'rgba(167, 255, 235, 0.18)', blossom: '#ffd54f',
      mapBackdrop: 'backdrops/bg_bamboo.jpg', waterTile: 'tiles/water.png',
      tiles: {
        '.': 'tiles/grass.png', f: 'tiles/wood.png', r: 'tiles/road.png', p: 'tiles/plaza.png',
        c: 'tiles/carpet.png', b: 'tiles/bridge.png', '#': 'tiles/wall_rock.png',
        w: 'tiles/wall_bamboo.png', T: 'props/tree_miao.png', W: 'props/tree_willow.png', B: 'props/bamboo_grove.png'
      },
      battleTile: 'tiles/grass.png', battleBackdrop: null
    },
    fire_cavern: {
      bgTop: '#290c0c', bgBot: '#4f1913',
      ground: '#54322e', floor: '#6b3e38', road: '#633b34', plaza: '#7a4940',
      bridge: '#8a5236', water: '#b83714', waterHi: '#ffb74d',
      wallTop: '#45221e', wallLeft: '#331815', wallRight: '#210f0d',
      cliffLeft: '#4a1d17', cliffRight: '#2b0f0c',
      lightColor: 'rgba(255, 112, 67, 0.22)', blossom: '#ffab40',
      mapBackdrop: 'backdrops/bg_fire_cavern.jpg', waterTile: 'tiles/lava.png',
      tiles: {
        '.': 'tiles/fire_floor.png', f: 'tiles/fire_floor.png', r: 'tiles/fire_floor.png', p: 'tiles/fire_floor.png',
        c: 'tiles/carpet.png', b: 'tiles/wood.png', '#': 'tiles/wall_fire.png',
        w: 'tiles/wall_fire.png', T: 'tiles/wall_fire.png', W: 'props/tree_willow.png', B: 'props/bamboo_grove.png'
      },
      battleTile: 'tiles/fire_floor.png', battleBackdrop: 'backdrops/bg_fire_cavern.jpg'
    },
    time_rift: {
      bgTop: '#0b152e', bgBot: '#1d2d50',
      ground: '#3a506b', floor: '#4c698a', road: '#5c7da3', plaza: '#7898bd',
      bridge: '#6fffe9', water: '#0f1b38', waterHi: '#84ffff',
      wallTop: '#495f7a', wallLeft: '#344559', wallRight: '#222e3d',
      cliffLeft: '#2d4159', cliffRight: '#1c293a',
      lightColor: 'rgba(132, 255, 255, 0.17)', blossom: '#e0fbfc',
      mapBackdrop: 'backdrops/bg_lunar.jpg', waterTile: 'tiles/abyss_water.png',
      tiles: {
        '.': 'tiles/mist_floor.png', f: 'tiles/wood.png', r: 'tiles/mist_floor.png', p: 'tiles/jade.png',
        c: 'tiles/carpet.png', b: 'tiles/bridge.png', '#': 'tiles/wall_shushan.png',
        w: 'tiles/wall_courtyard.png', T: 'props/tree_pine.png', W: 'props/tree_willow.png', B: 'props/bamboo_grove.png'
      },
      battleTile: 'tiles/mist_floor.png', battleBackdrop: 'backdrops/bg_lunar.jpg'
    },
    abyss: {
      bgTop: '#070b19', bgBot: '#191436',
      ground: '#2d2a4a', floor: '#3b3761', road: '#464173', plaza: '#58528a',
      bridge: '#9c7a44', water: '#112240', waterHi: '#b388ff',
      wallTop: '#332e54', wallLeft: '#24203d', wallRight: '#171429',
      cliffLeft: '#241e42', cliffRight: '#141029',
      lightColor: 'rgba(138, 108, 255, 0.19)', blossom: '#80d8ff',
      mapBackdrop: 'backdrops/bg_abyss.jpg', waterTile: 'tiles/abyss_water.png',
      tiles: {
        '.': 'tiles/tower_floor.png', f: 'tiles/tower_floor.png', r: 'tiles/cave_floor.png', p: 'tiles/jade.png',
        c: 'tiles/carpet.png', b: 'tiles/bridge.png', '#': 'tiles/wall_abyss.png',
        w: 'tiles/wall_tower.png', T: 'props/statue.png', W: 'props/tree_willow.png', B: 'props/bamboo_grove.png'
      },
      battleTile: 'tiles/tower_floor.png', battleBackdrop: 'backdrops/bg_abyss.jpg'
    }
  };
  // 相容舊版主題別名
  THEME_PALETTES.cave_dungeon = THEME_PALETTES.snake_cave;
  THEME_PALETTES.shushan_cloud = THEME_PALETTES.shushan;
  THEME_PALETTES.miao_village = THEME_PALETTES.miao_valley;
  THEME_PALETTES.mist_rift = THEME_PALETTES.time_rift;
  THEME_PALETTES.abyss_altar = THEME_PALETTES.abyss;

  const HERO_IDS = { luxiao: true, lingxi: true, yueling: true, aman: true };

  // 各裝飾物件標準繪製高度與錨點偏移
  const DECOR_SPECS = {
    paifang: { h: 104, yOff: 0, shadowR: 32, zBias: 0.34 },
    pavilion: { h: 116, yOff: 0, shadowR: 34, zBias: 0.22 },
    market_stall: { h: 68, yOff: 0, shadowR: 24, zBias: 0.18 },
    lantern_post: { h: 72, yOff: 0, shadowR: 10, zBias: 0.16 },
    incense_burner: { h: 42, yOff: 0, shadowR: 14, zBias: 0.16 },
    well_stone: { h: 52, yOff: 0, shadowR: 18, zBias: 0.16 },
    inn_table: { h: 32, yOff: 0, shadowR: 18, zBias: 0.14 },
    rock_garden: { h: 48, yOff: 0, shadowR: 18, zBias: 0.15 },
    flower_bush: { h: 26, yOff: 0, shadowR: 14, zBias: 0.08 },
    stone_stele: { h: 56, yOff: 0, shadowR: 16, zBias: 0.16 },
    alch_cauldron: { h: 52, yOff: 0, shadowR: 16, zBias: 0.16 },
    weapon_rack: { h: 48, yOff: 0, shadowR: 16, zBias: 0.15 },
    crystal_pillar: { h: 62, yOff: 0, shadowR: 15, zBias: 0.16 }
  };

  function tileToScreen(gx, gy, camX, camY, canvasW, canvasH) {
    const isoX = (gx - gy) * (TILE_W / 2);
    const isoY = (gx + gy) * (TILE_H / 2);
    return {
      x: canvasW / 2 + isoX - camX,
      y: canvasH / 2 + isoY - camY
    };
  }

  function screenToTile(sx, sy, camX, camY, canvasW, canvasH) {
    const dx = sx - canvasW / 2 + camX;
    const dy = sy - canvasH / 2 + camY;
    const gx = (dx / (TILE_W / 2) + dy / (TILE_H / 2)) / 2;
    const gy = (dy / (TILE_H / 2) - dx / (TILE_W / 2)) / 2;
    return { x: Math.floor(gx + 0.5), y: Math.floor(gy + 0.5) };
  }

  function drawDiamond(ctx, cx, cy, w, h, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - h / 2);
    ctx.lineTo(cx + w / 2, cy);
    ctx.lineTo(cx, cy + h / 2);
    ctx.lineTo(cx - w / 2, cy);
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function drawIsoBlockFallback(ctx, cx, cy, height, topColor, leftColor, rightColor) {
    const hw = TILE_W / 2;
    const hh = TILE_H / 2;
    ctx.beginPath();
    ctx.moveTo(cx - hw, cy - height);
    ctx.lineTo(cx, cy + hh - height);
    ctx.lineTo(cx, cy + hh);
    ctx.lineTo(cx - hw, cy);
    ctx.closePath();
    ctx.fillStyle = leftColor;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx + hw, cy - height);
    ctx.lineTo(cx, cy + hh - height);
    ctx.lineTo(cx, cy + hh);
    ctx.lineTo(cx + hw, cy);
    ctx.closePath();
    ctx.fillStyle = rightColor;
    ctx.fill();

    drawDiamond(ctx, cx, cy - height, TILE_W, TILE_H, topColor, 'rgba(0,0,0,0.22)');
  }

  function drawIsoCliffSkirt(ctx, cx, cy, w, h, depth, showLeft, showRight, leftCol, rightCol) {
    const hw = w / 2;
    const hh = h / 2;
    if (showLeft) {
      const gL = ctx.createLinearGradient(cx - hw, cy, cx - hw, cy + hh + depth);
      gL.addColorStop(0, leftCol);
      gL.addColorStop(0.7, rightCol);
      gL.addColorStop(1, 'rgba(6, 11, 22, 0.92)');
      ctx.beginPath();
      ctx.moveTo(cx - hw, cy);
      ctx.lineTo(cx, cy + hh);
      ctx.lineTo(cx, cy + hh + depth);
      ctx.lineTo(cx - hw, cy + depth);
      ctx.closePath();
      ctx.fillStyle = gL;
      ctx.fill();
    }
    if (showRight) {
      const gR = ctx.createLinearGradient(cx, cy, cx, cy + hh + depth);
      gR.addColorStop(0, rightCol);
      gR.addColorStop(1, 'rgba(4, 8, 18, 0.96)');
      ctx.beginPath();
      ctx.moveTo(cx, cy + hh);
      ctx.lineTo(cx + hw, cy);
      ctx.lineTo(cx + hw, cy + depth);
      ctx.lineTo(cx, cy + hh + depth);
      ctx.closePath();
      ctx.fillStyle = gR;
      ctx.fill();
    }
  }

  function drawPointLight(ctx, x, y, radius, innerColor) {
    const g = ctx.createRadialGradient(x, y, 2, x, y, radius);
    g.addColorStop(0, innerColor);
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawRoundedTag(ctx, cx, bottomY, text, bgFill, borderStroke, textColor) {
    ctx.font = '11px "Microsoft JhengHei", "PingFang TC", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const tw = ctx.measureText(text).width + 12;
    const th = 16;
    const rx = cx - tw / 2;
    const ry = bottomY - 14;
    const r = 3;

    ctx.beginPath();
    ctx.moveTo(rx + r, ry);
    ctx.lineTo(rx + tw - r, ry);
    ctx.quadraticCurveTo(rx + tw, ry, rx + tw, ry + r);
    ctx.lineTo(rx + tw, ry + th - r);
    ctx.quadraticCurveTo(rx + tw, ry + th, rx + tw - r, ry + th);
    ctx.lineTo(rx + r, ry + th);
    ctx.quadraticCurveTo(rx, ry + th, rx, ry + th - r);
    ctx.lineTo(rx, ry + r);
    ctx.quadraticCurveTo(rx, ry, rx + r, ry);
    ctx.closePath();

    ctx.fillStyle = bgFill;
    ctx.fill();
    ctx.strokeStyle = borderStroke;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = textColor;
    ctx.fillText(text, cx, ry + th / 2);
  }

  // NPC 頭頂氣泡短語（賦予城鎮鮮活生命力）
  function drawSpeechBubble(ctx, cx, bottomY, text, alpha) {
    if (!text || alpha <= 0.02) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.font = '11px "Microsoft JhengHei", sans-serif';
    ctx.textAlign = 'center';
    const clean = text.length > 22 ? text.slice(0, 21) + '…' : text;
    const tw = Math.min(230, ctx.measureText(clean).width + 16);
    const th = 21;
    const rx = cx - tw / 2;
    const ry = bottomY - th - 5;
    const r = 6;

    ctx.beginPath();
    ctx.moveTo(rx + r, ry);
    ctx.lineTo(rx + tw - r, ry);
    ctx.quadraticCurveTo(rx + tw, ry, rx + tw, ry + r);
    ctx.lineTo(rx + tw, ry + th - r);
    ctx.quadraticCurveTo(rx + tw, ry + th, rx + tw - r, ry + th);
    ctx.lineTo(cx + 5, ry + th);
    ctx.lineTo(cx, ry + th + 5);
    ctx.lineTo(cx - 5, ry + th);
    ctx.lineTo(rx + r, ry + th);
    ctx.quadraticCurveTo(rx, ry + th, rx, ry + th - r);
    ctx.lineTo(rx, ry + r);
    ctx.quadraticCurveTo(rx, ry, rx + r, ry);
    ctx.closePath();

    ctx.fillStyle = 'rgba(252, 246, 232, 0.94)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(138, 102, 46, 0.85)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#2b1d0e';
    ctx.fillText(clean, cx, ry + 14.5);
    ctx.restore();
  }

  // =========================================================================
  // 繪製主角與鮮活 NPC (支援巡邏步態、轉向、重傷臥榻躺姿、鐵匠打鐵火花、氣泡對話)
  // =========================================================================
  function drawCharacterSprite(ctx, x, y, spriteId, time, opts) {
    opts = opts || {};
    const scale = opts.scale || 1;
    const isFloat = spriteId === 'ghost_npc';
    const isWork = opts.pose === 'work';
    const isCollapse = !opts.battle && opts.pose === 'kneel';
    const phase = opts.walkPhase != null ? opts.walkPhase : time * 13;

    let bob = 0;
    if (isFloat) {
      bob = Math.sin(time * 4) * 4.5;
    } else if (isWork) {
      bob = -Math.abs(Math.sin(time * 7.5)) * 1.5;
    } else if (isCollapse) {
      bob = Math.sin(time * 2.2) * 0.4;
    } else if (opts.moving) {
      // 物理步伐落地微重力下壓（0 ~ 0.8px，模擬踏步足底著地承重，絕無平移飄移）
      bob = Math.sin(phase) > 0 ? 0 : 0.8;
    } else {
      bob = 0;
    }
    const sway = isWork ? Math.sin(time * 7.5) * 0.04 : 0;

    let assetPath = null;
    if (HERO_IDS[spriteId]) {
      assetPath = opts.battle ? `heroes_battle/${spriteId}.png` : `heroes/${spriteId}.png`;
    } else if (spriteId === 'fox') {
      assetPath = 'monsters/fox.png';
    } else {
      assetPath = `npcs/${spriteId}.png`;
    }
    const img = getAsset(assetPath) || getAsset('npcs/elder_man.png');

    // 經典仙劍 2.5D 高精度比例（地圖主角與NPC高達 72px，孩童 52px，白狐 40px；戰鬥 80~88px）
    const baseH = opts.battle
      ? (spriteId === 'aman' ? 78 : (spriteId === 'yueling' ? 80 : 88))
      : (spriteId === 'child_boy' ? 52 : (spriteId === 'fox' ? 40 : 72));

    let drawH = baseH;
    let drawW = 45;
    let frameW = 80;
    let frameH = 128;
    let frameIdx = 0;
    let isMultiFrame = false;

    if (img) {
      isMultiFrame = img.naturalWidth >= img.naturalHeight * 3.2;
      if (isMultiFrame) {
        const totalFrames = 8;
        frameW = img.naturalWidth / totalFrames;
        frameH = img.naturalHeight;
        if (opts.moving) {
          const walkCycle = Math.floor((phase / (Math.PI * 0.5)) % 4 + 4) % 4;
          frameIdx = 4 + walkCycle;
        } else if (isWork) {
          frameIdx = Math.floor(time * 5) % 4;
        } else if (opts.dead || isCollapse || opts.kneel) {
          frameIdx = 0;
        } else {
          frameIdx = Math.floor(time * 3.2) % 4;
        }
        const aspect = frameW / Math.max(1, frameH);
        drawH = baseH;
        drawW = drawH * aspect;
      } else {
        const aspect = img.naturalWidth / Math.max(1, img.naturalHeight);
        drawH = baseH;
        drawW = drawH * aspect;
      }
    }

    ctx.save();
    ctx.translate(x, y);

    if (opts.stealth) ctx.globalAlpha *= 0.48;

    // 病患／重傷者身下鋪設草蓆軟墊，呈現真實臥病姿態！
    if (isCollapse) {
      ctx.fillStyle = 'rgba(158, 126, 78, 0.82)';
      ctx.strokeStyle = 'rgba(92, 68, 36, 0.9)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 3, 28 * scale, 12 * scale, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // =========================================================================
    // 物理真實 2.5D 東南向漫射投射陰影 + 雙足鞋底接觸暗核 (Physical Grounding & Shadow)
    // =========================================================================
    if (!isFloat) {
      if (opts.dead || isCollapse) {
        // 陣亡倒地或昏迷臥榻：沿地面橫向鋪開之身體接觸陰影
        const deadR = drawH * 0.38 * scale;
        const deadH = deadR * 0.42;
        const deadGrad = ctx.createRadialGradient(0, 2, 2, 0, 2, deadR);
        deadGrad.addColorStop(0, 'rgba(10, 14, 24, 0.52)');
        deadGrad.addColorStop(0.7, 'rgba(10, 14, 24, 0.22)');
        deadGrad.addColorStop(1, 'rgba(10, 14, 24, 0)');
        ctx.fillStyle = deadGrad;
        ctx.beginPath();
        ctx.ellipse(0, 2 * scale, deadR, deadH, -0.12, 0, Math.PI * 2);
        ctx.fill();
      } else if (opts.battle) {
        // 戰鬥舞台 45 度透視陰影 + 雙足著地接觸
        const sRx = 26 * scale;
        const sRy = 11 * scale;
        const bGrad = ctx.createRadialGradient(4, -2, 2, 4, -2, sRx);
        bGrad.addColorStop(0, 'rgba(10, 14, 24, 0.50)');
        bGrad.addColorStop(0.65, 'rgba(10, 14, 24, 0.20)');
        bGrad.addColorStop(1, 'rgba(10, 14, 24, 0)');
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.ellipse(4 * scale, -2 * scale, sRx, sRy, 0, 0, Math.PI * 2);
        ctx.fill();

        // 戰鬥雙足底接觸暗核
        ctx.fillStyle = 'rgba(4, 6, 12, 0.72)';
        ctx.beginPath();
        ctx.ellipse(-7 * scale, 0.5 * scale, 4.8 * scale, 2.2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(10 * scale, -3.8 * scale, 4.2 * scale, 2.0 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // 地圖場景：西北上方日光 (NW Sun) 投射於 2:1 地磚之東南向漫反射陰影 (SE Cast Shadow)
        // 嚴格錨定鞋底踏線，底緣絕不向下溢出於前足，100% 杜絕懸空浮空感！
        const isFacingLeft = !!opts.flipX;
        const castX = (isFacingLeft ? -drawW * 0.06 : drawW * 0.16) * scale;
        const castY = (-drawH * 0.035) * scale;
        const castRx = drawW * 0.46 * scale;
        const castRy = drawW * 0.22 * scale;
        const castRot = 0.32; // ~18.3度，吻合 2:1 斜角地磚投影傾角

        const shadowGrad = ctx.createRadialGradient(castX, castY, 2, castX, castY, castRx);
        shadowGrad.addColorStop(0, 'rgba(8, 12, 22, 0.44)');
        shadowGrad.addColorStop(0.55, 'rgba(10, 14, 24, 0.20)');
        shadowGrad.addColorStop(1, 'rgba(10, 14, 24, 0)');
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.ellipse(castX, castY, castRx, castRy, castRot, 0, Math.PI * 2);
        ctx.fill();

        // 雙足鞋底接地環境光遮蔽暗核 (Dual Shoe Sole Contact AO)
        // 前足（左腳）踏地 y=0，後足（右腳）踏地 y=-4.5（透視深度）。
        // 隨行走步態動態交替接地承重與微抬腿，踏地感無比扎實！
        let frontAlpha = 0.72;
        let backAlpha = 0.65;
        let frontLift = 0;
        let backLift = 0;

        if (opts.moving) {
          const stepSin = Math.sin(phase);
          frontAlpha = 0.42 + 0.36 * Math.max(0, stepSin);
          backAlpha = 0.42 + 0.36 * Math.max(0, -stepSin);
          frontLift = Math.max(0, -stepSin) * 1.5;
          backLift = Math.max(0, stepSin) * 1.5;
        }

        const frontX = (isFacingLeft ? drawW * 0.04 : -drawW * 0.04) * scale;
        const frontY = 0.5 * scale;
        const backX = (isFacingLeft ? -drawW * 0.28 : drawW * 0.28) * scale;
        const backY = (-drawH * 0.062) * scale;

        // 前足接觸暗核
        ctx.fillStyle = `rgba(4, 6, 12, ${frontAlpha})`;
        ctx.beginPath();
        ctx.ellipse(frontX, (frontY - frontLift * scale), 4.8 * scale, 2.2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // 後足接觸暗核
        ctx.fillStyle = `rgba(4, 6, 12, ${backAlpha})`;
        ctx.beginPath();
        ctx.ellipse(backX, (backY - backLift * scale), 4.2 * scale, 1.9 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // 幽魂 NPC：離地幽浮虛幻投影
      const ghostR = 16 * scale;
      const gGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, ghostR);
      gGrad.addColorStop(0, 'rgba(128, 222, 234, 0.26)');
      gGrad.addColorStop(1, 'rgba(128, 222, 234, 0)');
      ctx.fillStyle = gGrad;
      ctx.beginPath();
      ctx.ellipse(0, 8 * scale, ghostR, ghostR * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (opts.tiangang) {
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(0, 0, (26 + Math.sin(time * 8) * 2.5) * scale, 13 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.save();
    ctx.scale(scale, scale);
    if (opts.flipX && !opts.battle) {
      ctx.scale(-1, 1);
    }

    if (opts.dead || isCollapse) {
      // 陣亡或劇情昏迷／重病臥榻：真正橫躺於榻上，不再站立！
      ctx.translate(-6, 2);
      ctx.rotate(-Math.PI / 2.25);
    } else if (opts.kneel) {
      ctx.translate(0, 4);
      ctx.rotate(0.09);
    } else if (sway) {
      ctx.rotate(sway);
    }

    if (img) {
      if (isMultiFrame) {
        const sx = frameIdx * frameW;
        ctx.drawImage(img, sx, 0, frameW, frameH, -drawW / 2, -drawH + bob + 1, drawW, drawH);
      } else {
        ctx.drawImage(img, -drawW / 2, -drawH + bob + 1, drawW, drawH);
      }
    } else {
      ctx.fillStyle = '#3b6ea5';
      ctx.beginPath();
      ctx.ellipse(0, -20 + bob, 10, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 病患寒霜微粒／鐵匠打鐵火星
    if (isCollapse) {
      ctx.fillStyle = 'rgba(179, 229, 252, 0.72)';
      for (let i = 0; i < 3; i++) {
        const sx = -10 + i * 10 + Math.sin(time * 2 + i) * 3;
        const sy = -14 - ((time * 12 + i * 7) % 14);
        ctx.beginPath();
        ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (isWork && spriteId === 'blacksmith') {
      const sparkPhase = (time * 7.5) % (Math.PI * 2);
      if (sparkPhase < 1.3) {
        ctx.fillStyle = '#ffb74d';
        for (let i = 0; i < 4; i++) {
          const ang = -0.4 - i * 0.45;
          const dist = sparkPhase * (10 + i * 4);
          ctx.beginPath();
          ctx.arc(10 + Math.cos(ang) * dist, -20 + Math.sin(ang) * dist, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    if (opts.poison) {
      ctx.fillStyle = '#69f0ae';
      ctx.beginPath();
      ctx.arc(-10 * scale, (-44 + ((time * 18) % 12)) * scale, 2.6, 0, Math.PI * 2);
      ctx.arc(10 * scale, (-38 + ((time * 14) % 12)) * scale, 2.1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawMonsterSprite(ctx, x, y, spriteId, time, opts) {
    opts = opts || {};
    const scale = opts.scale || 1;
    const isBoss = spriteId && (spriteId.startsWith('boss_') || opts.isBoss);
    const isFloating = spriteId === 'bee' || spriteId === 'ghost' || spriteId === 'boss_yexiao' || spriteId === 'boss_yinhu' || spriteId === 'boss_swordspirit';
    const hover = isFloating ? Math.sin(time * 4.5) * 4 : 0;

    ctx.save();
    ctx.translate(x, y);

    if (opts.hitFlash) {
      ctx.filter = 'brightness(2.3) contrast(1.15)';
    }

    const assetPath = spriteId && spriteId.startsWith('boss_') ? `bosses/${spriteId}.png` : `monsters/${spriteId}.png`;
    const img = getAsset(assetPath) || getAsset('monsters/plant.png');

    let baseH = 72;
    if (spriteId === 'boss_shuimoshou') baseH = 126;
    else if (spriteId === 'boss_yueling') baseH = 86;
    else if (isBoss) baseH = 104;

    const drawH = baseH * scale;
    const aspect = img ? (img.naturalWidth / Math.max(1, img.naturalHeight)) : 0.8;
    const drawW = drawH * aspect;

    // 怪物/首領地面陰影與接觸暗核 (陸生怪穩固著地，不懸空漂浮)
    if (!isFloating) {
      // 1. 東南向地面投射陰影
      const sRx = (isBoss ? 34 : 22) * scale;
      const sRy = (isBoss ? 14 : 9) * scale;
      const grad = ctx.createRadialGradient(sRx * 0.18, -sRy * 0.22, 2, sRx * 0.18, -sRy * 0.22, sRx);
      grad.addColorStop(0, isBoss ? 'rgba(16, 6, 28, 0.52)' : 'rgba(8, 12, 18, 0.44)');
      grad.addColorStop(0.65, isBoss ? 'rgba(16, 6, 28, 0.20)' : 'rgba(8, 12, 18, 0.18)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(sRx * 0.18, -sRy * 0.22, sRx, sRy, 0.28, 0, Math.PI * 2);
      ctx.fill();

      // 2. 實體接觸暗核 (緊貼底線 y=0)
      ctx.fillStyle = isBoss ? 'rgba(8, 2, 16, 0.78)' : 'rgba(4, 6, 10, 0.72)';
      ctx.beginPath();
      ctx.ellipse(0, 0.5 * scale, (isBoss ? 22 : 14) * scale, (isBoss ? 5.8 : 3.4) * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 飛行怪：柔和擴散離地懸浮投影
      const hScale = Math.max(0.6, 1 - hover * 0.05);
      const sRx = (isBoss ? 28 : 16) * scale * hScale;
      const sRy = sRx * 0.45;
      const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, sRx);
      grad.addColorStop(0, 'rgba(8, 12, 22, 0.30)');
      grad.addColorStop(1, 'rgba(8, 12, 22, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 7 * scale, sRx, sRy, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (isBoss) {
      ctx.strokeStyle = 'rgba(255, 112, 67, 0.38)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, (isBoss ? 36 : 20) * scale + Math.sin(time * 5) * 3, (isBoss ? 15 : 8) * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (img) {
      ctx.drawImage(img, -drawW / 2, -drawH + (isFloating ? hover - 3 : hover) + 1, drawW, drawH);
    } else {
      ctx.fillStyle = isBoss ? '#8e24aa' : '#43a047';
      ctx.beginPath();
      ctx.arc(0, -24 * scale + hover, 18 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // =========================================================================
  // 繪製場景裝飾建築、可互動物件與鮮活 NPC
  // =========================================================================
  function drawMapObject(ctx, x, y, obj, flags, searchedIds, time, highlighted, occludingAlpha) {
    const opened = searchedIds && searchedIds[obj.id];
    ctx.save();
    ctx.translate(x, y);
    if (occludingAlpha != null && occludingAlpha < 1) {
      ctx.globalAlpha *= occludingAlpha;
    }

    // 裝飾性建築與景觀道具 (牌坊、涼亭、市集攤位、街燈、香爐、丹爐、石井等)
    if (obj.type === 'decor') {
      const spec = DECOR_SPECS[obj.sprite] || { h: 54, yOff: 0, shadowR: 16 };
      const img = getAsset(`props/${obj.sprite}.png`);
      if (obj.sprite !== 'paifang' && obj.sprite !== 'flower_bush') {
        const sRx = spec.shadowR;
        const sRy = spec.shadowR * 0.44;
        const grad = ctx.createRadialGradient(sRx * 0.15, -sRy * 0.2, 1, sRx * 0.15, -sRy * 0.2, sRx);
        grad.addColorStop(0, 'rgba(10, 14, 22, 0.44)');
        grad.addColorStop(0.65, 'rgba(10, 14, 22, 0.18)');
        grad.addColorStop(1, 'rgba(10, 14, 22, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(sRx * 0.15, -sRy * 0.2, sRx, sRy, 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(4, 6, 12, 0.65)';
        ctx.beginPath();
        ctx.ellipse(0, 0, sRx * 0.68, sRy * 0.48, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      if (img) {
        const dh = spec.h;
        const dw = dh * (img.naturalWidth / Math.max(1, img.naturalHeight));
        ctx.drawImage(img, -dw / 2, -dh + spec.yOff, dw, dh);
      }
      // 香爐／丹爐裊裊青煙動畫
      if (obj.sprite === 'incense_burner' || obj.sprite === 'alch_cauldron') {
        ctx.fillStyle = obj.sprite === 'alch_cauldron' ? 'rgba(128, 222, 234, 0.35)' : 'rgba(235, 235, 245, 0.34)';
        for (let i = 0; i < 3; i++) {
          const rise = ((time * 16 + i * 11) % 30);
          const wx = Math.sin(time * 2.5 + i + rise * 0.12) * 5;
          ctx.beginPath();
          ctx.arc(wx, -spec.h + 10 - rise, 2.2 + rise * 0.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
      return;
    }

    if (highlighted) {
      const hr = (obj.type === 'boss' ? 28 : 18.5) + Math.sin(time * 7) * 2;
      ctx.strokeStyle = obj.type === 'boss' ? '#ff8a80' : '#ffe082';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, hr, hr * 0.44, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    let labelY = -52;

    if (obj.type === 'chest') {
      const img = getAsset(opened ? 'props/chest_open.png' : 'props/chest_closed.png');
      ctx.fillStyle = 'rgba(0,0,0,0.42)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 15, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();
      if (img) {
        const dh = 28;
        const dw = dh * (img.naturalWidth / Math.max(1, img.naturalHeight));
        ctx.drawImage(img, -dw / 2, -dh, dw, dh);
      }
      if (!opened) {
        ctx.fillStyle = `rgba(255, 238, 145, ${0.52 + Math.sin(time * 5.2) * 0.3})`;
        ctx.beginPath();
        ctx.arc(0, -15 + Math.sin(time * 4) * 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      labelY = -34;
    } else if (obj.type === 'jar' || obj.type === 'barrel') {
      const img = getAsset(obj.type === 'jar' ? 'props/jar.png' : 'props/barrel.png');
      ctx.fillStyle = 'rgba(0,0,0,0.40)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      if (img) {
        const dh = obj.type === 'jar' ? 26 : 28;
        const dw = dh * (img.naturalWidth / Math.max(1, img.naturalHeight));
        if (opened) ctx.globalAlpha *= 0.72;
        ctx.drawImage(img, -dw / 2, -dh, dw, dh);
      }
      labelY = -32;
    } else if (obj.type === 'stone_stele') {
      const img = getAsset('props/stone_stele.png');
      ctx.fillStyle = 'rgba(0,0,0,0.42)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      if (img) {
        const dh = 56;
        const dw = dh * (img.naturalWidth / Math.max(1, img.naturalHeight));
        ctx.drawImage(img, -dw / 2, -dh, dw, dh);
      }
      labelY = -62;
    } else if (obj.type === 'statue') {
      const broken = obj.flag && flags[obj.flag];
      const img = getAsset(broken ? 'props/statue_broken.png' : 'props/statue.png');
      const elemColor = (PalX.ELEMENTS[obj.elem] && PalX.ELEMENTS[obj.elem].color) || '#80deea';
      if (!broken) {
        ctx.strokeStyle = elemColor;
        ctx.globalAlpha *= 0.6 + Math.sin(time * 4) * 0.22;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 19, 8.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (img) {
        const dh = broken ? 34 : 54;
        const dw = dh * (img.naturalWidth / Math.max(1, img.naturalHeight));
        ctx.drawImage(img, -dw / 2, -dh, dw, dh);
      }
      labelY = broken ? -40 : -60;
    } else if (obj.type === 'switch') {
      const active = (obj.flag && flags[obj.flag]) ||
        (obj.interaction === 'snake_switch' && flags.snake_gate_open) ||
        (obj.interaction === 'tower_switch_yin' && flags.tower_yin) ||
        (obj.interaction === 'tower_switch_yang' && flags.tower_yang);
      const img = getAsset(active ? 'props/switch_active.png' : 'props/switch.png');
      if (img) {
        const dw = 52;
        const dh = dw * (img.naturalHeight / Math.max(1, img.naturalWidth));
        ctx.drawImage(img, -dw / 2, -dh * 0.62, dw, dh);
      }
      ctx.fillStyle = active ? '#69f0ae' : '#ffd54f';
      ctx.beginPath();
      ctx.arc(0, -14 + Math.sin(time * 5) * 2.5, 4, 0, Math.PI * 2);
      ctx.fill();
      labelY = -30;
    } else if (obj.type === 'portal') {
      if (obj.sprite === 'boat') {
        const img = getAsset('props/boat.png');
        const bob = Math.sin(time * 2.8) * 2.2;
        if (img) {
          const dw = 72;
          const dh = dw * (img.naturalHeight / Math.max(1, img.naturalWidth));
          ctx.drawImage(img, -dw / 2, -dh * 0.65 + bob, dw, dh);
        }
        labelY = -37;
      } else {
        const img = getAsset('props/portal.png');
        if (img) {
          const dw = 56;
          const dh = dw * (img.naturalHeight / Math.max(1, img.naturalWidth));
          ctx.save();
          ctx.globalAlpha *= 0.88 + Math.sin(time * 4) * 0.12;
          ctx.drawImage(img, -dw / 2, -dh * 0.56, dw, dh);
          ctx.restore();
        }
        const pulse = 20 + Math.sin(time * 5) * 3;
        ctx.strokeStyle = 'rgba(128, 222, 234, 0.78)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, pulse, pulse * 0.48, 0, 0, Math.PI * 2);
        ctx.stroke();
        labelY = -28;
      }
    } else if (obj.type === 'npc') {
      const pose = obj.runtimePose || obj.pose || 'stand';
      drawCharacterSprite(ctx, 0, 0, obj.sprite || 'elder_man', time, {
        scale: 1,
        moving: !!obj.runtimeMoving,
        walkPhase: obj.runtimeWalkPhase,
        flipX: !!obj.runtimeFacingLeft,
        pose
      });
      labelY = pose === 'kneel' ? -28 : (obj.sprite === 'child_boy' || obj.sprite === 'fox' ? -58 : -78);
    } else if (obj.type === 'boss') {
      drawMonsterSprite(ctx, 0, 0, obj.sprite || 'boss_chigui', time, { scale: 0.95, isBoss: true });
      labelY = -106;
    }

    // 頭頂圓角古風名牌 + 服務徽章 + 任務標記 + 氣泡短語
    if (obj.type === 'npc' || obj.type === 'boss' || obj.type === 'portal') {
      const badge = obj.serviceBadge ? `[${obj.serviceBadge}] ` : '';
      const prefix = highlighted
        ? (obj.type === 'boss' ? '【伏魔】' : obj.type === 'portal' ? '【渡口】' : '【會客】')
        : badge;
      const borderCol = highlighted
        ? '#ffe082'
        : (obj.type === 'boss' ? 'rgba(255,138,128,0.65)' : 'rgba(226,190,107,0.5)');
      const txtCol = obj.type === 'boss' ? '#ff8a80' : obj.type === 'portal' ? '#80deea' : '#ffe082';
      drawRoundedTag(ctx, 0, labelY, prefix + obj.name, 'rgba(7, 15, 32, 0.88)', borderCol, txtCol);

      // 任務標記 (! 主線 / 准 可回報支線 / ? 可接支線)
      if (obj.questMarker) {
        const qy = labelY - 19 + Math.sin(time * 6) * 2.2;
        const isMain = obj.questMarker === '!';
        const isTurnIn = obj.questMarker === '✓' || obj.questMarker === '准';
        const qBg = isMain ? '#ffb300' : (isTurnIn ? '#69f0ae' : '#4fc3f7');
        ctx.fillStyle = qBg;
        ctx.beginPath();
        ctx.arc(0, qy - 4, 8.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#081224';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.font = 'bold 11px "Microsoft JhengHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#081224';
        const markerText = isTurnIn ? '准' : (isMain ? '令' : '託');
        ctx.fillText(markerText, 0, qy);
      }

      // 浮動生活氣泡短語
      if (obj.activeBark && !highlighted) {
        const barkTop = obj.questMarker ? labelY - 32 : labelY - 17;
        drawSpeechBubble(ctx, 0, barkTop, obj.activeBark, obj.barkAlpha || 1);
      }
    } else if (highlighted) {
      const hintLabel = opened ? `【已查】${obj.name}` : `【探查】${obj.name}`;
      drawRoundedTag(ctx, 0, labelY + Math.sin(time * 6) * 1.5, hintLabel, 'rgba(12, 26, 52, 0.92)', '#ffe082', '#fff8e1');
    }

    ctx.restore();
  }

  // =========================================================================
  // 右上角即時互動小地圖 (Mini-Map — 支援大尺寸地圖導航、寶箱/傳送門/任務點標示)
  // =========================================================================
  function renderMiniMap(ctx, w, h, map, game) {
    if (!game.showMiniMap) return;
    const rows = map.grid.length;
    const cols = map.grid[0].length;
    const isCompact = w < 640;
    const cell = isCompact ? 2.6 : 3.4;
    const mw = Math.round(cols * cell) + 12;
    const mh = Math.round(rows * cell) + 24;
    const mx = w - mw - 10;
    const my = isCompact ? 8 : 12;

    // 記錄小地圖點擊熱區供滑鼠／觸控收合
    game.miniMapRect = { x: mx, y: my, w: mw, h: mh };

    ctx.save();
    ctx.fillStyle = 'rgba(7, 15, 30, 0.84)';
    ctx.strokeStyle = 'rgba(226, 190, 107, 0.72)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(mx, my, mw, mh, 6) : ctx.rect(mx, my, mw, mh);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 10px "Microsoft JhengHei", sans-serif';
    ctx.fillStyle = '#ffe082';
    ctx.textAlign = 'left';
    ctx.fillText(`【坤輿】${map.name.split('·')[0]}`, mx + 6, my + 13);

    const ox = mx + 6;
    const oy = my + 18;
    const gate1Open = map.gateFlag ? !!game.state.flags[map.gateFlag] : true;
    const gate2Open = map.gate2Flag ? !!game.state.flags[map.gate2Flag] : true;

    for (let y = 0; y < rows; y++) {
      const row = map.grid[y];
      for (let x = 0; x < cols; x++) {
        const ch = row[x];
        if (ch === '#' || ch === 'w') ctx.fillStyle = '#334155';
        else if (ch === '~') ctx.fillStyle = map.theme === 'fire_cavern' ? '#9a3412' : '#1d4ed8';
        else if (ch === 'B' || ch === 'T' || ch === 'W') ctx.fillStyle = '#166534';
        else if ((ch === 'G' && !gate1Open) || (ch === 'H' && !gate2Open)) ctx.fillStyle = '#f59e0b';
        else if (ch === 'r' || ch === 'p' || ch === 'b') ctx.fillStyle = '#94a3b8';
        else if (ch === 'f' || ch === 'c') ctx.fillStyle = '#b45309';
        else ctx.fillStyle = '#3f6212';
        ctx.fillRect(ox + x * cell, oy + y * cell, Math.ceil(cell), Math.ceil(cell));
      }
    }

    // 標示傳送點、未開寶箱與關鍵 NPC
    const liveList = game.getVisibleMapObjects ? game.getVisibleMapObjects(map) : map.objects;
    for (const obj of liveList) {
      if (obj.decor) continue;
      const px = ox + (obj.x + 0.5) * cell;
      const py = oy + (obj.y + 0.5) * cell;
      if (obj.type === 'portal') {
        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(px - 2, py - 2, 4, 4);
      } else if (obj.type === 'chest' && !(game.state.searched && game.state.searched[obj.id])) {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
      } else if (obj.type === 'boss') {
        ctx.fillStyle = '#fb7185';
        ctx.fillRect(px - 2.5, py - 2.5, 5, 5);
      } else if (obj.type === 'npc' && obj.questMarker) {
        ctx.fillStyle = obj.questMarker === '!' ? '#fbbf24' : '#38bdf8';
        ctx.fillRect(px - 2, py - 2, 4, 4);
      }
    }

    // 標示敵人
    for (const en of game.activeMapEnemies || []) {
      if (en.defeated) continue;
      const ex = ox + ((en.rx != null ? en.rx : en.x) + 0.5) * cell;
      const ey = oy + ((en.ry != null ? en.ry : en.y) + 0.5) * cell;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(ex - 1.5, ey - 1.5, 3, 3);
    }

    // 標示主角位置（呼吸閃爍白青光點）
    const rp = game.renderPlayer || game.playerPos;
    const hx = ox + (rp.x + 0.5) * cell;
    const hy = oy + (rp.y + 0.5) * cell;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(hx, hy, 2.8 + Math.sin(game.time * 7) * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();
  }

  // =========================================================================
  // 45度斜視角地圖完整渲染
  // =========================================================================
  function renderMapScene(ctx, canvas, game) {
    const logicalW = game.logicalW || 620;
    const uniformScale = canvas.width / logicalW;

    ctx.save();
    if (uniformScale !== 1) {
      ctx.scale(uniformScale, uniformScale);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const w = logicalW;
    const h = canvas.height / uniformScale;
    game.logicalH = h;
    const map = PalX.MAPS[game.state.mapId];
    if (!map) {
      ctx.restore();
      return;
    }

    const pal = THEME_PALETTES[map.theme] || THEME_PALETTES.jiangnan_town;
    const tileSet = pal.tiles || THEME_PALETTES.jiangnan_town.tiles;
    const time = game.time;
    const camX = game.camX;
    const camY = game.camY;

    // 1. 遠景全景視差山水天幕
    const backdropImg = pal.mapBackdrop ? getAsset(pal.mapBackdrop) : null;
    if (backdropImg) {
      const pxOff = Math.max(-28, Math.min(28, -camX * 0.04));
      const pyOff = Math.max(-20, Math.min(20, -camY * 0.04));
      ctx.drawImage(backdropImg, pxOff - 32, pyOff - 24, w + 64, h + 48);
      const veil = ctx.createLinearGradient(0, 0, 0, h);
      veil.addColorStop(0, 'rgba(7, 15, 30, 0.42)');
      veil.addColorStop(0.5, 'rgba(10, 22, 42, 0.62)');
      veil.addColorStop(1, 'rgba(5, 11, 22, 0.84)');
      ctx.fillStyle = veil;
      ctx.fillRect(0, 0, w, h);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, pal.bgTop);
      grad.addColorStop(1, pal.bgBot);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    const rows = map.grid.length;
    const cols = map.grid[0].length;
    const gateOpen = map.gateFlag ? !!game.state.flags[map.gateFlag] : true;
    const gate2Open = map.gate2Flag ? !!game.state.flags[map.gate2Flag] : true;

    const visibleObjects = game.getVisibleMapObjects ? game.getVisibleMapObjects(map) : map.objects;

    // 判定當前高亮提示之互動物件
    let highlightObj = game.hoverObj || null;
    if (!highlightObj && !game.dialogueActive && !game.modalActive) {
      let bestDist = 99;
      for (const obj of visibleObjects) {
        if (obj.decor) continue;
        const ox = obj.rx != null ? obj.rx : obj.x;
        const oy = obj.ry != null ? obj.ry : obj.y;
        const cd = Math.max(Math.abs(ox - game.playerPos.x), Math.abs(oy - game.playerPos.y));
        if (cd <= 1.35 && game.isBumpInteractable && game.isBumpInteractable(obj)) {
          const md = Math.abs(ox - game.playerPos.x) + Math.abs(oy - game.playerPos.y);
          if (md < bestDist) {
            bestDist = md;
            highlightObj = obj;
          }
        }
      }
    }

    const entities = [];
    const lightSources = [];

    for (const obj of visibleObjects) {
      const gx = obj.rx != null ? obj.rx : obj.x;
      const gy = obj.ry != null ? obj.ry : obj.y;
      const spec = obj.type === 'decor' ? DECOR_SPECS[obj.sprite] : null;
      const zBias = spec ? spec.zBias : 0.15;
      entities.push({ kind: 'obj', gx, gy, zBias, obj });

      if (obj.type === 'decor' && obj.sprite === 'lantern_post') {
        lightSources.push({ gx, gy, yOff: -48, r: 78, col: 'rgba(255, 196, 102, 0.25)' });
      } else if (obj.type === 'decor' && obj.sprite === 'crystal_pillar') {
        lightSources.push({ gx, gy, yOff: -28, r: 68, col: 'rgba(112, 236, 255, 0.22)' });
      } else if (obj.type === 'decor' && obj.sprite === 'alch_cauldron') {
        lightSources.push({ gx, gy, yOff: -20, r: 58, col: 'rgba(255, 158, 88, 0.2)' });
      } else if (obj.type === 'portal') {
        lightSources.push({ gx, gy, yOff: -10, r: 66, col: 'rgba(100, 255, 218, 0.22)' });
      } else if (obj.type === 'chest' && !(game.state.searched && game.state.searched[obj.id])) {
        lightSources.push({ gx, gy, yOff: -14, r: 44, col: 'rgba(255, 213, 79, 0.18)' });
      } else if (obj.type === 'statue' && !(obj.flag && game.state.flags[obj.flag])) {
        lightSources.push({ gx, gy, yOff: -22, r: 56, col: 'rgba(128, 222, 234, 0.19)' });
      } else if (obj.type === 'switch') {
        lightSources.push({ gx, gy, yOff: -10, r: 52, col: 'rgba(255, 213, 79, 0.18)' });
      } else if (obj.type === 'boss') {
        lightSources.push({ gx, gy, yOff: -34, r: 84, col: 'rgba(255, 112, 67, 0.22)' });
      }
    }

    for (const enemy of game.activeMapEnemies) {
      if (enemy.defeated) continue;
      const ex = enemy.rx != null ? enemy.rx : enemy.x;
      const ey = enemy.ry != null ? enemy.ry : enemy.y;
      entities.push({ kind: 'enemy', gx: ex, gy: ey, zBias: 0.2, enemy });
    }

    const activeIds = game.state.activeParty;
    const rp = game.renderPlayer || game.playerPos;
    for (let idx = activeIds.length - 1; idx >= 0; idx--) {
      const tNode = idx === 0 ? null : game.trail[idx - 1];
      const gx = idx === 0 ? rp.x : (tNode && tNode.rx != null ? tNode.rx : (tNode ? tNode.x : rp.x));
      const gy = idx === 0 ? rp.y : (tNode && tNode.ry != null ? tNode.ry : (tNode ? tNode.y : rp.y));
      const facingLeft = idx === 0
        ? !!game.facingLeft
        : (tNode && tNode.facingLeft != null ? tNode.facingLeft : !!game.facingLeft);
      const hero = game.state.heroes[activeIds[idx]];
      entities.push({
        kind: 'party',
        gx,
        gy,
        zBias: 0.25 + (activeIds.length - idx) * 0.01,
        heroId: activeIds[idx],
        isLeader: idx === 0,
        facingLeft,
        poison: !!(hero && hero.poison)
      });
    }

    const liquidImg = getAsset(pal.waterTile || 'tiles/water.png');

    // 第一層：等距地磚、海岸水波泡沫、牆角環境光遮蔽(AO)與地表微細節
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const ch = map.grid[gy][gx];
        const pt = tileToScreen(gx, gy, camX, camY, w, h);
        if (pt.x < -96 || pt.x > w + 96 || pt.y < -110 || pt.y > h + 135) continue;

        if (ch === '#' || ch === 'w') {
          drawDiamond(ctx, pt.x, pt.y, TILE_W, TILE_H, pal.wallRight, null);
          entities.push({
            kind: 'wall',
            gx,
            gy,
            zBias: 0,
            isCourtyard: ch === 'w',
            wallAsset: ch === 'w' ? (tileSet.w || 'tiles/wall_courtyard.png') : tileSet['#']
          });
        } else if (ch === '~') {
          if (liquidImg) {
            ctx.drawImage(liquidImg, pt.x - 35, pt.y - 16, 70, 37);
          } else {
            drawDiamond(ctx, pt.x, pt.y + 2, TILE_W + 2, TILE_H + 1, pal.water, null);
          }
          const wave = Math.sin(time * 2.8 + gx * 0.9 + gy * 1.1) * 5;
          ctx.save();
          ctx.strokeStyle = pal.waterHi;
          ctx.globalAlpha = 0.28 + Math.sin(time * 2.4 + gx + gy) * 0.1;
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(pt.x - 9 + wave, pt.y + 1);
          ctx.quadraticCurveTo(pt.x + wave, pt.y - 1.5, pt.x + 9 + wave, pt.y + 1);
          ctx.stroke();

          // 水岸淺灘泡沫紋（若緊鄰陸地）
          const hasLandN = gy > 0 && map.grid[gy - 1][gx] !== '~' && map.grid[gy - 1][gx] !== '#';
          const hasLandW = gx > 0 && map.grid[gy][gx - 1] !== '~' && map.grid[gy][gx - 1] !== '#';
          if (hasLandN || hasLandW) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            if (hasLandN) {
              ctx.moveTo(pt.x, pt.y - 14);
              ctx.lineTo(pt.x + 28, pt.y);
            }
            if (hasLandW) {
              ctx.moveTo(pt.x - 28, pt.y);
              ctx.lineTo(pt.x, pt.y - 14);
            }
            ctx.stroke();
          }
          ctx.restore();

          if ((map.theme === 'lotus_island' || map.theme === 'jiangnan_town' || map.theme === 'miao_valley') && (gx * 7 + gy * 3) % 6 === 0) {
            const lb = Math.sin(time * 2.4 + gx + gy) * 1.2;
            ctx.fillStyle = '#388e3c';
            ctx.beginPath();
            ctx.ellipse(pt.x, pt.y + 2 + lb, 7.5, 3.8, 0, 0.2, Math.PI * 1.95);
            ctx.fill();
            ctx.fillStyle = '#f8bbd0';
            ctx.beginPath();
            ctx.arc(pt.x + 1, pt.y + lb, 3.0, 0, Math.PI * 2);
            ctx.fill();
          } else if (map.theme === 'fire_cavern' && (gx * 5 + gy * 11) % 7 === 0) {
            lightSources.push({ gx, gy, yOff: 0, r: 56, col: 'rgba(255, 112, 67, 0.19)' });
          }
        } else {
          let tileKey = '.';
          if (ch === 'f') tileKey = 'f';
          else if (ch === 'r') tileKey = 'r';
          else if (ch === 'p') tileKey = 'p';
          else if (ch === 'c') tileKey = 'c';
          else if (ch === 'b') tileKey = 'b';
          else if (ch === 'G') tileKey = gateOpen ? 'b' : 'f';
          else if (ch === 'H') tileKey = gate2Open ? 'r' : 'f';

          if (tileKey === 'b') {
            if (liquidImg) {
              ctx.drawImage(liquidImg, pt.x - 34, pt.y - 14, 68, 36);
            } else {
              drawDiamond(ctx, pt.x, pt.y + 3, TILE_W, TILE_H, pal.water, null);
            }
          }

          const tImg = getAsset(tileSet[tileKey] || tileSet['.']);
          if (tImg) {
            if (tileKey === 'b') {
              ctx.drawImage(tImg, pt.x - 35, pt.y - 21, 70, 41);
            } else if (tileKey === '.' && ((gx * 5 + gy * 3) & 1) === 1) {
              ctx.save();
              ctx.translate(pt.x, pt.y);
              ctx.scale(-1, 1);
              ctx.drawImage(tImg, -34, -17, 68, 36);
              ctx.restore();
            } else {
              ctx.drawImage(tImg, pt.x - 34, pt.y - 17, 68, 36);
            }
          } else {
            drawDiamond(ctx, pt.x, pt.y, TILE_W, TILE_H, pal.ground, 'rgba(0,0,0,0.2)');
          }

          // 牆角立體環境光遮蔽陰影 (Wall-to-floor Ambient Occlusion)
          const wallN = gy > 0 && (map.grid[gy - 1][gx] === '#' || map.grid[gy - 1][gx] === 'w');
          const wallW = gx > 0 && (map.grid[gy][gx - 1] === '#' || map.grid[gy][gx - 1] === 'w');
          if (wallN || wallW) {
            ctx.fillStyle = 'rgba(5, 10, 20, 0.24)';
            if (wallN) {
              ctx.beginPath();
              ctx.moveTo(pt.x, pt.y - 17);
              ctx.lineTo(pt.x + 34, pt.y);
              ctx.lineTo(pt.x + 25, pt.y + 4.5);
              ctx.lineTo(pt.x - 9, pt.y - 12.5);
              ctx.closePath();
              ctx.fill();
            }
            if (wallW) {
              ctx.beginPath();
              ctx.moveTo(pt.x, pt.y - 17);
              ctx.lineTo(pt.x - 34, pt.y);
              ctx.lineTo(pt.x - 25, pt.y + 4.5);
              ctx.lineTo(pt.x + 9, pt.y - 12.5);
              ctx.closePath();
              ctx.fill();
            }
          }

          // 地表微細節（野花／碎石點綴）
          const seed = (gx * 19 + gy * 37) % 17;
          if (tileKey === '.' && seed < 3) {
            ctx.fillStyle = seed === 0 ? pal.blossom : 'rgba(210, 230, 185, 0.45)';
            ctx.beginPath();
            ctx.arc(pt.x + (seed - 1) * 9, pt.y + ((gx + gy) % 3 - 1) * 4, 1.7, 0, Math.PI * 2);
            ctx.fill();
          }

          if ((ch === 'G' && !gateOpen) || (ch === 'H' && !gate2Open)) {
            entities.push({ kind: 'barrier', gx, gy, zBias: 0.18, isSecond: ch === 'H' });
            lightSources.push({ gx, gy, yOff: -16, r: 62, col: ch === 'H' ? 'rgba(128, 222, 234, 0.24)' : 'rgba(255, 183, 77, 0.22)' });
          } else if (ch === 'T' || ch === 'W' || ch === 'B') {
            const treeKey = ch === 'W' ? 'props/tree_willow.png' : (ch === 'B' ? 'props/bamboo_grove.png' : tileSet.T);
            entities.push({ kind: 'tree', gx, gy, zBias: 0.12, treeKind: ch, treeAsset: treeKey });
          }
        }

        if (gy === rows - 1 || gx === cols - 1) {
          const baseY = ch === '~' ? pt.y + 2 : pt.y;
          drawIsoCliffSkirt(
            ctx, pt.x, baseY, TILE_W, TILE_H, 24,
            gy === rows - 1, gx === cols - 1,
            pal.cliffLeft || '#3d4c5c', pal.cliffRight || '#242e38'
          );
        }
      }
    }

    if (game.footsteps && game.footsteps.length) {
      for (const fs of game.footsteps) {
        const fp = tileToScreen(fs.x, fs.y, camX, camY, w, h);
        const ratio = Math.max(0, fs.life / fs.maxLife);
        ctx.save();
        ctx.strokeStyle = pal.waterHi || '#80deea';
        ctx.globalAlpha = ratio * 0.36;
        ctx.lineWidth = 1.3;
        const rr = 6 + (1 - ratio) * 10;
        ctx.beginPath();
        ctx.ellipse(fp.x, fp.y + 2, rr, rr * 0.48, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    if (game.hoverTile && !game.dialogueActive && !game.modalActive) {
      const hx = game.hoverTile.x;
      const hy = game.hoverTile.y;
      if (game.isTileWalkable && game.isTileWalkable(map, hx, hy, false)) {
        const hp = tileToScreen(hx, hy, camX, camY, w, h);
        drawDiamond(ctx, hp.x, hp.y, TILE_W - 6, TILE_H - 3, 'rgba(255, 224, 130, 0.08)', 'rgba(255, 224, 130, 0.45)');
      }
    }

    if (game.moveTarget) {
      const tp = tileToScreen(game.moveTarget.x, game.moveTarget.y, camX, camY, w, h);
      ctx.strokeStyle = '#ffe082';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(tp.x, tp.y, 15 + Math.sin(time * 8) * 3, 7.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 224, 130, 0.55)';
      ctx.beginPath();
      ctx.arc(tp.x, tp.y, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 第二層：深度排序繪製建築、竹柳、景觀道具、鮮活 NPC、精怪與主角隊伍
    const px = rp.x;
    const py = rp.y;
    entities.sort((a, b) => ((a.gx + a.gy + (a.zBias || 0)) - (b.gx + b.gy + (b.zBias || 0))));

    for (const ent of entities) {
      const pt = tileToScreen(ent.gx, ent.gy, camX, camY, w, h);
      if (pt.x < -130 || pt.x > w + 130 || pt.y < -150 || pt.y > h + 150) continue;

      if (ent.kind === 'wall') {
        const wImg = getAsset(ent.wallAsset);
        const occludingPlayer =
          ent.gx >= px - 0.3 && ent.gy >= py - 0.3 &&
          (ent.gx - px) <= 2.2 && (ent.gy - py) <= 2.2 &&
          (ent.gx + ent.gy) > (px + py + 0.15) &&
          ent.gx > 0 && ent.gy > 0 && ent.gx < cols - 1 && ent.gy < rows - 1;

        if (wImg) {
          ctx.save();
          if (occludingPlayer) ctx.globalAlpha = 0.42;
          const dw = 68;
          const dh = ent.isCourtyard
            ? 72
            : 80;
          ctx.drawImage(wImg, pt.x - dw / 2, pt.y + TILE_H / 2 - dh, dw, dh);
          ctx.restore();
        } else {
          drawIsoBlockFallback(ctx, pt.x, pt.y, 20, pal.wallTop, pal.wallLeft, pal.wallRight);
        }
      } else if (ent.kind === 'tree') {
        const tImg = getAsset(ent.treeAsset);
        ctx.fillStyle = 'rgba(0,0,0,0.32)';
        ctx.beginPath();
        ctx.ellipse(pt.x, pt.y + 3, ent.treeKind === 'B' ? 16 : 20, 8.5, 0, 0, Math.PI * 2);
        ctx.fill();
        if (tImg) {
          const dh = ent.treeKind === 'W' ? 88 : (ent.treeKind === 'B' ? 80 : 72);
          const dw = dh * (tImg.naturalWidth / Math.max(1, tImg.naturalHeight));
          const occludingTree =
            ent.gx >= px - 0.2 && ent.gy >= py - 0.2 &&
            (ent.gx - px) <= 1.9 && (ent.gy - py) <= 1.9 &&
            (ent.gx + ent.gy) > (px + py + 0.2);
          const windSway = (ent.treeKind === 'W' || ent.treeKind === 'B')
            ? Math.sin(time * 2.1 + ent.gx * 0.7 + ent.gy * 0.5) * 0.025
            : 0;
          ctx.save();
          ctx.translate(pt.x, pt.y + 9);
          if (occludingTree) ctx.globalAlpha = 0.52;
          if (windSway) ctx.rotate(windSway);
          ctx.drawImage(tImg, -dw / 2, -dh, dw, dh);
          ctx.restore();
        }
      } else if (ent.kind === 'barrier') {
        const pulse = Math.sin(time * 6) * 3;
        const g = ctx.createLinearGradient(pt.x, pt.y - 52, pt.x, pt.y + 8);
        if (ent.isSecond) {
          g.addColorStop(0, 'rgba(128, 222, 234, 0.08)');
          g.addColorStop(0.5, 'rgba(38, 198, 218, 0.58)');
          g.addColorStop(1, 'rgba(178, 235, 242, 0.85)');
        } else {
          g.addColorStop(0, 'rgba(255, 213, 79, 0.08)');
          g.addColorStop(0.5, 'rgba(255, 112, 67, 0.55)');
          g.addColorStop(1, 'rgba(255, 238, 88, 0.82)');
        }
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(pt.x, pt.y - 22, 18 + pulse * 0.4, 28, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = ent.isSecond ? '#84ffff' : '#ffe082';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(pt.x, pt.y + 1, 22, 10, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (ent.kind === 'obj') {
        const isTallDecor = ent.obj.type === 'decor' && (ent.obj.sprite === 'paifang' || ent.obj.sprite === 'pavilion');
        const occludingDecor = isTallDecor &&
          Math.abs(ent.gx - px) <= 1.5 && Math.abs(ent.gy - py) <= 1.5 &&
          (ent.gx + ent.gy) >= (px + py - 0.2);
        drawMapObject(
          ctx, pt.x, pt.y, ent.obj,
          game.state.flags, game.state.searched, time,
          highlightObj && highlightObj.id === ent.obj.id,
          occludingDecor ? 0.58 : 1
        );
      } else if (ent.kind === 'enemy') {
        const leadId = ent.enemy.enemyGroup[0];
        const eData = PalX.ENEMIES[leadId];
        drawMonsterSprite(ctx, pt.x, pt.y, (eData && eData.sprite) || 'plant', time, { scale: 0.78 });
      } else if (ent.kind === 'party') {
        drawCharacterSprite(ctx, pt.x, pt.y, ent.heroId, time, {
          moving: game.isMoving,
          walkPhase: game.walkPhase,
          isLeader: ent.isLeader,
          flipX: ent.facingLeft,
          poison: ent.poison
        });
      }
    }

    // 第三層：動態燈火與靈氣點光源疊加
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const heroScreen = tileToScreen(rp.x, rp.y, camX, camY, w, h);
    drawPointLight(ctx, heroScreen.x, heroScreen.y - 20, 82, pal.lightColor || 'rgba(255, 224, 178, 0.14)');
    for (const ls of lightSources) {
      const lp = tileToScreen(ls.gx, ls.gy, camX, camY, w, h);
      if (lp.x < -100 || lp.x > w + 100 || lp.y < -100 || lp.y > h + 100) continue;
      drawPointLight(ctx, lp.x, lp.y + (ls.yOff || 0), ls.r + Math.sin(time * 3.6 + ls.gx) * 4, ls.col);
    }
    ctx.restore();

    // 飄落花瓣 / 竹葉 / 燈市流螢 / 餘燼粒子
    ctx.fillStyle = pal.blossom;
    for (let i = 0; i < 16; i++) {
      const fx = ((i * 97 + time * (20 + (i % 3) * 5)) % w);
      const fy = map.theme === 'fire_cavern'
        ? h - ((i * 73 + time * (26 + (i % 4) * 6)) % h)
        : ((i * 73 + time * (16 + (i % 3) * 4)) % h);
      ctx.save();
      ctx.globalAlpha = 0.42 + (i % 3) * 0.12;
      ctx.translate(fx, fy);
      ctx.rotate(time * 1.4 + i);
      ctx.beginPath();
      ctx.ellipse(0, 0, 2.8, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const vig = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.28, w * 0.5, h * 0.5, w * 0.74);
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(1, 'rgba(3, 8, 18, 0.34)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    // 第四層：右上角即時小地圖
    if (!game.dialogueActive) {
      renderMiniMap(ctx, w, h, map, game);
    }
    ctx.restore();
  }

  // =========================================================================
  // 響應式45度對角戰鬥站位與渲染 (同時完美適配桌面寬螢幕與手機直向/橫向螢幕！)
  // =========================================================================
  function getHeroBattlePos(idx, count, w, h) {
    const isPortrait = w < h * 0.92;
    if (isPortrait) {
      // 直向手機螢幕：戰鬥介面位於下方 32%，主角群站立於中左戰台，清晰不遮擋！
      const stepX = Math.min(52, w * 0.145);
      const stepY = Math.min(28, h * 0.042);
      return {
        x: w * 0.18 + idx * stepX,
        y: h * 0.48 + idx * stepY
      };
    }
    const stepX = Math.min(64, w * 0.072);
    const stepY = Math.min(40, h * 0.072);
    return {
      x: w * 0.27 + idx * stepX,
      y: h * 0.53 + idx * stepY
    };
  }

  function getEnemyBattlePos(idx, count, w, h) {
    const isPortrait = w < h * 0.92;
    if (isPortrait) {
      if (count === 1) {
        return { x: w * 0.64, y: h * 0.31 };
      }
      const stepX = Math.min(58, (w * 0.44) / Math.max(1, count - 1));
      const stepY = Math.min(28, h * 0.04);
      return {
        x: w * 0.44 + idx * stepX,
        y: h * 0.25 + idx * stepY
      };
    }
    if (count === 1) {
      return { x: w * 0.68, y: h * 0.45 };
    }
    const stepX = Math.min(74, (w * 0.28) / Math.max(1, count - 1));
    const stepY = Math.min(42, h * 0.075);
    return {
      x: w * 0.57 + idx * stepX,
      y: h * 0.38 + idx * stepY
    };
  }

  function renderBattleScene(ctx, canvas, battle, mapTheme, time) {
    const logicalW = (battle.game && battle.game.logicalW) || 620;
    const uniformScale = canvas.width / logicalW;

    ctx.save();
    if (uniformScale !== 1) {
      ctx.scale(uniformScale, uniformScale);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const w = logicalW;
    const h = canvas.height / uniformScale;
    if (battle.game) battle.game.logicalH = h;
    const isPortrait = w < h * 0.92;
    const unitScale = isPortrait ? 1.0 : 1.15;
    const pal = THEME_PALETTES[mapTheme] || THEME_PALETTES.lotus_island;

    ctx.save();
    if (battle.shakeTimer > 0) {
      const mag = battle.shakeTimer * 12;
      ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
    }

    const customArenaImg = pal.battleBackdrop ? getAsset(pal.battleBackdrop) : null;
    const outdoorSkyImg = getAsset(pal.mapBackdrop || 'backdrops/bg_title.jpg');
    const stageTileImg = getAsset(pal.battleTile || 'tiles/jade.png');

    if (customArenaImg) {
      // 保持比例鋪滿戰場背景 (cover 模式避免直向拉伸變形)
      const imgAspect = customArenaImg.naturalWidth / Math.max(1, customArenaImg.naturalHeight);
      const viewAspect = w / Math.max(1, h);
      let dw = w;
      let dh = h;
      if (viewAspect > imgAspect) {
        dh = w / imgAspect;
      } else {
        dw = h * imgAspect;
      }
      ctx.drawImage(customArenaImg, (w - dw) / 2, (h - dh) / 2, dw, dh);
    } else {
      if (outdoorSkyImg) {
        const imgAspect = outdoorSkyImg.naturalWidth / Math.max(1, outdoorSkyImg.naturalHeight);
        const viewAspect = w / Math.max(1, h);
        let dw = w;
        let dh = h;
        if (viewAspect > imgAspect) dh = w / imgAspect;
        else dw = h * imgAspect;
        ctx.drawImage(outdoorSkyImg, (w - dw) / 2, (h - dh) / 2 - 20, dw, dh + 20);
        const tintGrad = ctx.createLinearGradient(0, 0, 0, h);
        tintGrad.addColorStop(0, 'rgba(8, 18, 36, 0.2)');
        tintGrad.addColorStop(0.5, 'rgba(10, 24, 44, 0.34)');
        tintGrad.addColorStop(1, 'rgba(5, 11, 22, 0.82)');
        ctx.fillStyle = tintGrad;
        ctx.fillRect(0, 0, w, h);
      } else {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, pal.bgTop);
        grad.addColorStop(1, '#091020');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      const stageCenterY = isPortrait ? h * 0.39 : h * 0.47;
      const stageScale = isPortrait ? 0.92 : 1.18;
      const bw = TILE_W * stageScale;
      const bh = TILE_H * stageScale;

      for (let gy = -3; gy <= 4; gy++) {
        for (let gx = -3; gx <= 4; gx++) {
          const isoX = (gx - gy) * (bw / 2);
          const isoY = (gx + gy) * (bh / 2);
          const sx = w * 0.50 + isoX;
          const sy = stageCenterY + isoY;
          if (stageTileImg) {
            ctx.drawImage(stageTileImg, sx - bw / 2, sy - bh / 2, bw, bh * 1.06);
          } else {
            drawDiamond(ctx, sx, sy, bw, bh, pal.floor, 'rgba(0,0,0,0.25)');
          }
          if (gy === 4 || gx === 4) {
            drawIsoCliffSkirt(
              ctx, sx, sy, bw, bh, 28,
              gy === 4, gx === 4,
              pal.cliffLeft || '#455a6e', pal.cliffRight || '#253342'
            );
          }
        }
      }

      ctx.save();
      ctx.translate(w * 0.50, stageCenterY + 10);
      ctx.strokeStyle = 'rgba(255, 224, 130, 0.22)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(0, 0, 100 * stageScale, 48 * stageScale, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 敵方陣列
    battle.enemies.forEach((en, idx) => {
      if (en.dead && en.fadeAlpha <= 0) return;
      const pos = getEnemyBattlePos(idx, battle.enemies.length, w, h);
      ctx.save();
      if (en.dead) ctx.globalAlpha = Math.max(0, en.fadeAlpha);

      if (battle.selectedEnemyIdx === idx && !en.dead) {
        const er = (en.isBoss ? 42 : 26) + Math.sin(time * 7) * 2.5;
        ctx.strokeStyle = '#ffeb3b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y + 6, er, en.isBoss ? 15 : 10, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      const lungeX = en.animLunge ? -en.animLunge * 36 : 0;
      const lungeY = en.animLunge ? en.animLunge * 18 : 0;
      const mScale = (en.isBoss ? 1.44 : 1.28) * (isPortrait ? 0.82 : 1.0);
      drawMonsterSprite(ctx, pos.x + lungeX, pos.y + lungeY, en.sprite, time, {
        scale: mScale,
        isBoss: en.isBoss,
        hitFlash: en.hitFlash > 0
      });

      if (en.hitFlash > 0 && !en.dead) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.strokeStyle = '#fff8e1';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pos.x - 24, pos.y - 62);
        ctx.lineTo(pos.x + 24, pos.y - 16);
        ctx.moveTo(pos.x + 22, pos.y - 60);
        ctx.lineTo(pos.x - 22, pos.y - 18);
        ctx.stroke();
        ctx.restore();
      }

      if (!en.dead) {
        const barW = en.isBoss ? (isPortrait ? 112 : 128) : (isPortrait ? 78 : 88);
        const bx = Math.max(8, Math.min(w - barW - 8, pos.x - barW / 2));
        const rawTop = en.sprite === 'boss_shuimoshou' ? 182 : (en.isBoss ? 158 : 98);
        const topOffset = rawTop * (isPortrait ? 0.82 : 1.0);
        const by = Math.max(54, pos.y - topOffset);

        ctx.fillStyle = 'rgba(7, 15, 32, 0.88)';
        ctx.fillRect(bx - 5, by - 17, barW + 10, 26);
        ctx.strokeStyle = en.isBoss ? 'rgba(255, 202, 40, 0.72)' : 'rgba(144, 202, 249, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(bx - 5, by - 17, barW + 10, 26);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(bx, by, barW, 5.5);
        const hpGrad = ctx.createLinearGradient(bx, by, bx + barW, by);
        hpGrad.addColorStop(0, en.isBoss ? '#ff8a65' : '#ef5350');
        hpGrad.addColorStop(1, en.isBoss ? '#ffca28' : '#e53935');
        ctx.fillStyle = hpGrad;
        ctx.fillRect(bx, by, Math.max(0, (en.hp / en.maxHp) * barW), 5.5);

        const elemInfo = PalX.ELEMENTS[en.elem] || PalX.ELEMENTS.none;
        ctx.font = `bold ${isPortrait ? 11 : 12}px "Microsoft JhengHei", serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = elemInfo.color;
        ctx.fillText(`[${elemInfo.name}] ${en.name}`, bx + barW / 2, by - 4);
      }
      ctx.restore();
    });

    // 我方出戰隊伍
    battle.party.forEach((hero, idx) => {
      const pos = getHeroBattlePos(idx, battle.party.length, w, h);
      const isTurn = battle.activeActorId === hero.id && battle.phase === 'input';

      if (isTurn) {
        ctx.strokeStyle = '#4fc3f7';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y + 5, 25 + Math.sin(time * 8) * 3, 10, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      const lungeX = hero.animLunge ? hero.animLunge * 42 : 0;
      const lungeY = hero.animLunge ? -hero.animLunge * 21 : 0;

      if (((hero.buffs && hero.buffs.zuixian > 0) || hero.animLunge > 0.12) && hero.hp > 0) {
        ctx.save();
        ctx.globalAlpha = 0.34;
        drawCharacterSprite(ctx, pos.x - 14 + lungeX * 0.65, pos.y + 5 + lungeY * 0.65, hero.id, time, { scale: unitScale, battle: true });
        ctx.restore();
      }

      drawCharacterSprite(ctx, pos.x + lungeX, pos.y + lungeY, hero.id, time, {
        scale: unitScale,
        battle: true,
        dead: hero.hp <= 0,
        kneel: hero.hp > 0 && hero.hp < hero.maxHp * 0.26,
        stealth: hero.buffs && hero.buffs.stealth > 0,
        tiangang: hero.buffs && hero.buffs.tiangang > 0,
        poison: !!hero.poison
      });

      if (hero.animLunge > 0.08 && hero.hp > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.translate(pos.x + lungeX + 24, pos.y + lungeY - 38);
        ctx.rotate(-0.48);
        ctx.strokeStyle = hero.id === 'yueling' ? '#ff8a80' : (hero.id === 'aman' ? '#ce93d8' : '#80deea');
        ctx.lineWidth = 4 * hero.animLunge;
        ctx.beginPath();
        ctx.arc(0, 0, 34, -0.95, 0.95);
        ctx.stroke();
        ctx.restore();
      }
    });

    for (const vfx of battle.vfxList) {
      drawBattleVfx(ctx, vfx, w, h, time);
    }

    for (const pop of battle.popups) {
      ctx.save();
      ctx.font = `bold ${pop.big ? 22 : 16}px "Microsoft JhengHei", serif`;
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3.6;
      const cx = Math.max(24, Math.min(w - 24, pop.x));
      ctx.strokeText(pop.text, cx, pop.y);
      ctx.fillStyle = pop.color || '#fff';
      ctx.fillText(pop.text, cx, pop.y);
      ctx.restore();
    }

    ctx.restore();
    ctx.restore();
  }

  function drawBattleVfx(ctx, vfx, w, h, time) {
    const p = 1 - vfx.timer / vfx.maxTimer;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const ringAlpha = Math.sin(p * Math.PI) * 0.72;
    if (vfx.kind !== 'wine_god') {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ringAlpha);
      ctx.strokeStyle = vfx.kind === 'fire_pillar' ? '#ff8a65'
        : vfx.kind === 'thunder_strike' ? '#ea80fc'
        : vfx.kind === 'heal_lotus' ? '#69f0ae'
        : '#80deea';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(vfx.x, vfx.y + 6, 34 + p * 24, 14 + p * 10, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (vfx.kind === 'sword_rain') {
      drawPointLight(ctx, vfx.x, vfx.y - 30, 110, 'rgba(128, 222, 234, 0.38)');
      for (let i = 0; i < 16; i++) {
        const sx = vfx.x - 96 + i * 13 + p * 60;
        const sy = vfx.y - 150 + ((i * 37) % 64) + p * 145;
        const sg = ctx.createLinearGradient(sx - 20, sy - 32, sx, sy);
        sg.addColorStop(0, 'rgba(128, 222, 234, 0)');
        sg.addColorStop(0.6, '#80deea');
        sg.addColorStop(1, '#ffffff');
        ctx.strokeStyle = sg;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(sx - 20, sy - 32);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }
    } else if (vfx.kind === 'fire_pillar') {
      const r = 42 + Math.sin(p * Math.PI) * 30;
      const g = ctx.createRadialGradient(vfx.x, vfx.y - 32, 6, vfx.x, vfx.y - 32, r * 1.7);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.28, '#fff59d');
      g.addColorStop(0.62, '#ff5722');
      g.addColorStop(1, 'rgba(183,28,28,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(vfx.x, vfx.y - 40, r, r * 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (vfx.kind === 'ice_storm') {
      drawPointLight(ctx, vfx.x, vfx.y - 24, 100, 'rgba(128, 222, 234, 0.42)');
      ctx.fillStyle = 'rgba(178, 235, 242, 0.85)';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      for (let i = -3; i <= 3; i++) {
        const ix = vfx.x + i * 22;
        const ih = Math.sin(p * Math.PI) * (66 - Math.abs(i) * 6);
        ctx.beginPath();
        ctx.moveTo(ix - 10, vfx.y + 8);
        ctx.lineTo(ix, vfx.y + 8 - ih);
        ctx.lineTo(ix + 10, vfx.y + 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    } else if (vfx.kind === 'thunder_strike') {
      drawPointLight(ctx, vfx.x, vfx.y - 30, 120, 'rgba(225, 190, 231, 0.5)');
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = '#e040fb';
      ctx.shadowBlur = 14;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(vfx.x + 16, 0);
      ctx.lineTo(vfx.x - 14, vfx.y * 0.34);
      ctx.lineTo(vfx.x + 18, vfx.y * 0.64);
      ctx.lineTo(vfx.x, vfx.y);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (vfx.kind === 'wind_vortex') {
      drawPointLight(ctx, vfx.x, vfx.y - 34, 92, 'rgba(128, 203, 196, 0.36)');
      ctx.strokeStyle = '#a7ffeb';
      ctx.lineWidth = 2.8;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.ellipse(vfx.x, vfx.y - i * 15, 22 + i * 10, 8 + i * 3, p * 4.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (vfx.kind === 'earth_rock') {
      ctx.globalCompositeOperation = 'source-over';
      const ry = vfx.y - 120 * (1 - p);
      const rImg = getAsset('tiles/wall_rock.png');
      if (rImg) {
        ctx.drawImage(rImg, vfx.x - 42, ry - 42, 84, 84);
      } else {
        ctx.fillStyle = '#8d6e63';
        ctx.beginPath();
        ctx.arc(vfx.x, ry, 32, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (vfx.kind === 'coin_shower') {
      ctx.fillStyle = '#ffd54f';
      for (let i = 0; i < 18; i++) {
        const cx = vfx.x - 95 + i * 11;
        const cy = vfx.y - 110 + ((p * 150 + i * 23) % 132);
        ctx.beginPath();
        ctx.arc(cx, cy, 5.8, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (vfx.kind === 'wine_god') {
      ctx.fillStyle = 'rgba(255, 213, 79, 0.28)';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#fff8e1';
      ctx.shadowColor = '#ffd54f';
      ctx.shadowBlur = 22;
      ctx.lineWidth = 13 * Math.sin(p * Math.PI);
      ctx.beginPath();
      ctx.moveTo(w * 0.18, 16);
      ctx.lineTo(vfx.x, vfx.y);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-over';
      ctx.font = `bold ${w < 560 ? 26 : 34}px "DFKai-SB", "Noto Serif TC", serif`;
      ctx.strokeStyle = '#2b1400';
      ctx.lineWidth = 5;
      ctx.textAlign = 'center';
      ctx.strokeText(vfx.title || '劍神降臨', w / 2, h * 0.2);
      ctx.fillStyle = '#fff8e1';
      ctx.fillText(vfx.title || '劍神降臨', w / 2, h * 0.2);
    } else if (vfx.kind === 'heal_lotus') {
      drawPointLight(ctx, vfx.x, vfx.y - 20, 74, 'rgba(105, 240, 174, 0.38)');
      ctx.strokeStyle = '#69f0ae';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.ellipse(vfx.x, vfx.y - p * 26, 30 * p + 10, 13 * p + 5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPortrait(canvas, portraitId) {
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const bgGrad = ctx.createRadialGradient(w / 2, h * 0.38, 4, w / 2, h / 2, w * 0.72);
    bgGrad.addColorStop(0, '#2a4a7a');
    bgGrad.addColorStop(1, '#0a1426');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    if (portraitId === 'scroll') {
      ctx.strokeStyle = '#e2be6b';
      ctx.lineWidth = Math.max(2, w * 0.025);
      ctx.strokeRect(w * 0.16, h * 0.2, w * 0.68, h * 0.6);
      ctx.font = `bold ${Math.round(w * 0.22)}px "Noto Serif TC", serif`;
      ctx.fillStyle = '#e2be6b';
      ctx.textAlign = 'center';
      ctx.fillText('燼月', w / 2, h * 0.57);
      return;
    }

    const cleanId = portraitId === 'boss_yueling' ? 'yueling' : (portraitId || 'luxiao');
    const relPath = `portraits/${cleanId}.png`;
    const rec = getImageRecord(relPath);

    if (rec && rec.complete && rec.naturalWidth > 0) {
      ctx.drawImage(rec, 0, 0, w, h);
      return;
    }

    if (rec && !rec.complete && typeof rec.addEventListener === 'function') {
      canvas.__palxPortraitId = portraitId;
      rec.addEventListener('load', function onReady() {
        if (canvas.__palxPortraitId === portraitId) {
          drawPortrait(canvas, portraitId);
        }
      }, { once: true });
    }

    const fallback = getAsset('portraits/elder_man.png');
    if (fallback) {
      ctx.drawImage(fallback, 0, 0, w, h);
    }
  }

  PalX.graphics = {
    TILE_W,
    TILE_H,
    ASSET_MANIFEST,
    getAsset,
    tileToScreen,
    screenToTile,
    renderMapScene,
    renderMiniMap,
    renderBattleScene,
    getHeroBattlePos,
    getEnemyBattlePos,
    drawPortrait
  };
})(typeof window !== 'undefined' ? window : globalThis);
