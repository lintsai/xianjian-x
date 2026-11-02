(function (root) {
  'use strict';

  const PalX = (root.PalX = root.PalX || {});

  const TILE_W = 68;
  const TILE_H = 34;

  // =========================================================================
  // AI 生成角色與場景物件素材預載器 (支援 HTTP 與 file:// 雙模式，無 getImageData 污染)
  // =========================================================================
  const ASSET_MANIFEST = [
    // 人物與首領對話半身彩繪像
    'portraits/luxiao.png', 'portraits/lingxi.png', 'portraits/yueling.png', 'portraits/aman.png',
    'portraits/drunk_master.png', 'portraits/elder_woman.png', 'portraits/elder_man.png',
    'portraits/taoist_elder.png', 'portraits/taoist_stern.png', 'portraits/merchant_med.png',
    'portraits/blacksmith.png', 'portraits/child_boy.png', 'portraits/ghost_npc.png',
    'portraits/boss_chigui.png', 'portraits/boss_shejun.png', 'portraits/boss_yinhu.png',
    'portraits/boss_mingwang.png', 'portraits/boss_qilin.png', 'portraits/boss_yexiao.png',
    'portraits/boss_youming.png', 'portraits/boss_shuimoshou.png',
    // 四大主角地圖與對角戰鬥立繪
    'heroes/luxiao.png', 'heroes/lingxi.png', 'heroes/yueling.png', 'heroes/aman.png',
    'heroes_battle/luxiao.png', 'heroes_battle/lingxi.png', 'heroes_battle/yueling.png', 'heroes_battle/aman.png',
    // 城鎮與迷宮 NPC 立繪
    'npcs/drunk_master.png', 'npcs/elder_woman.png', 'npcs/elder_man.png',
    'npcs/taoist_elder.png', 'npcs/taoist_stern.png', 'npcs/merchant_med.png',
    'npcs/blacksmith.png', 'npcs/child_boy.png', 'npcs/ghost_npc.png',
    // 八大鎮關首領與擂台月綾
    'bosses/boss_chigui.png', 'bosses/boss_yueling.png', 'bosses/boss_shejun.png',
    'bosses/boss_yinhu.png', 'bosses/boss_mingwang.png', 'bosses/boss_qilin.png',
    'bosses/boss_yexiao.png', 'bosses/boss_youming.png', 'bosses/boss_shuimoshou.png',
    // 迷宮妖魔精怪
    'monsters/plant.png', 'monsters/toad.png', 'monsters/bee.png', 'monsters/snake.png',
    'monsters/fox.png', 'monsters/golem.png', 'monsters/ghost.png', 'monsters/firebeast.png',
    // 場景可互動道具與奇門機關
    'props/chest_closed.png', 'props/chest_open.png', 'props/jar.png', 'props/barrel.png',
    'props/statue.png', 'props/statue_broken.png', 'props/switch.png', 'props/switch_active.png',
    'props/boat.png', 'props/portal.png', 'props/tree_peach.png', 'props/tree_miao.png', 'props/tree_pine.png',
    // 2.5D 等距地磚、徽派屋舍、山岩峭壁、鎖妖塔符牆、荷葉棧橋與流體水波/岩漿
    'tiles/road.png', 'tiles/grass.png', 'tiles/wood.png', 'tiles/jade.png',
    'tiles/cave_floor.png', 'tiles/tower_floor.png', 'tiles/fire_floor.png', 'tiles/mist_floor.png',
    'tiles/water.png', 'tiles/lava.png', 'tiles/abyss_water.png',
    'tiles/wall_town.png', 'tiles/wall_rock.png', 'tiles/wall_tower.png',
    'tiles/wall_shushan.png', 'tiles/wall_fire.png', 'tiles/wall_abyss.png', 'tiles/bridge.png',
    // 全景標題與對角戰場背景
    'backdrops/bg_title.jpg', 'backdrops/bg_demon_tower.jpg',
    'backdrops/bg_fire_cavern.jpg', 'backdrops/bg_abyss.jpg', 'backdrops/bg_cave.jpg'
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
    const img = getImageRecord(rel);
    if (img && img.complete && img.naturalWidth > 0) {
      return img;
    }
    return null;
  }

  preloadAssets();

  // 主題材質、立體浮島岩層與動態氛圍光配色映射表
  const THEME_PALETTES = {
    jiangnan_town: {
      bgTop: '#162844', bgBot: '#243f5c',
      ground: '#4d7c52', groundStroke: '#3e6642',
      floor: '#8b6340', floorStroke: '#6d4c2f',
      road: '#8a8f99', roadStroke: '#6e737d',
      bridge: '#a47148', water: '#1e5378', waterHi: '#64b5f6',
      wallTop: '#d8d2c5', wallLeft: '#b5afa2', wallRight: '#8e887c',
      cliffLeft: '#465461', cliffRight: '#2c3742',
      lightColor: 'rgba(255, 204, 128, 0.17)',
      blossom: '#f48fb1',
      mapBackdrop: 'backdrops/bg_title.jpg',
      waterTile: 'tiles/water.png',
      tiles: { '.': 'tiles/grass.png', f: 'tiles/wood.png', r: 'tiles/road.png', b: 'tiles/bridge.png', '#': 'tiles/wall_town.png', T: 'props/tree_peach.png' },
      battleTile: 'tiles/road.png', battleBackdrop: null
    },
    lotus_island: {
      bgTop: '#0d2b3e', bgBot: '#1b4d5c',
      ground: '#3f7d63', groundStroke: '#2f624d',
      floor: '#cfdce6', floorStroke: '#9fb4c4',
      road: '#7ea898', roadStroke: '#5d8576',
      bridge: '#569e6e', water: '#134b63', waterHi: '#4dd0e1',
      wallTop: '#7fa1b8', wallLeft: '#5c7d94', wallRight: '#425d70',
      cliffLeft: '#2d5768', cliffRight: '#1b3a47',
      lightColor: 'rgba(128, 222, 234, 0.16)',
      blossom: '#f8bbd0',
      mapBackdrop: 'backdrops/bg_title.jpg',
      waterTile: 'tiles/water.png',
      tiles: { '.': 'tiles/grass.png', f: 'tiles/jade.png', r: 'tiles/road.png', b: 'tiles/bridge.png', '#': 'tiles/wall_rock.png', T: 'props/tree_peach.png' },
      battleTile: 'tiles/grass.png', battleBackdrop: null
    },
    cave_dungeon: {
      bgTop: '#100e1c', bgBot: '#1e1930',
      ground: '#4a4458', groundStroke: '#373244',
      floor: '#5d536b', floorStroke: '#453d52',
      road: '#585266', roadStroke: '#3f3a4a',
      bridge: '#785a46', water: '#1b2e40', waterHi: '#487699',
      wallTop: '#363042', wallLeft: '#292433', wallRight: '#1c1824',
      cliffLeft: '#2e273d', cliffRight: '#1a1524',
      lightColor: 'rgba(149, 117, 205, 0.16)',
      blossom: '#9575cd',
      mapBackdrop: 'backdrops/bg_cave.jpg',
      waterTile: 'tiles/water.png',
      tiles: { '.': 'tiles/cave_floor.png', f: 'tiles/tower_floor.png', r: 'tiles/cave_floor.png', b: 'tiles/bridge.png', '#': 'tiles/wall_rock.png', T: 'props/statue.png' },
      battleTile: 'tiles/cave_floor.png', battleBackdrop: 'backdrops/bg_cave.jpg'
    },
    shushan_cloud: {
      bgTop: '#13294b', bgBot: '#3a6289',
      ground: '#b8cad9', groundStroke: '#93a8ba',
      floor: '#dce7f0', floorStroke: '#b2c5d6',
      road: '#c4d4e3', roadStroke: '#9cb1c4',
      bridge: '#e6c88a', water: '#254366', waterHi: '#90caf9',
      wallTop: '#e8eef5', wallLeft: '#c5d3e0', wallRight: '#9fb1c2',
      cliffLeft: '#6d879e', cliffRight: '#496075',
      lightColor: 'rgba(179, 229, 252, 0.18)',
      blossom: '#fff59d',
      mapBackdrop: 'backdrops/bg_title.jpg',
      waterTile: 'tiles/water.png',
      tiles: { '.': 'tiles/jade.png', f: 'tiles/jade.png', r: 'tiles/road.png', b: 'tiles/bridge.png', '#': 'tiles/wall_shushan.png', T: 'props/tree_pine.png' },
      battleTile: 'tiles/jade.png', battleBackdrop: null
    },
    demon_tower: {
      bgTop: '#140b22', bgBot: '#29153b',
      ground: '#3c314f', groundStroke: '#2b223b',
      floor: '#4c3d63', floorStroke: '#362a47',
      road: '#574670', roadStroke: '#3e3152',
      bridge: '#8c6b3f', water: '#1a0f28', waterHi: '#9575cd',
      wallTop: '#54433a', wallLeft: '#3d3029', wallRight: '#29201b',
      cliffLeft: '#342447', cliffRight: '#1f152e',
      lightColor: 'rgba(206, 147, 216, 0.16)',
      blossom: '#ce93d8',
      mapBackdrop: 'backdrops/bg_demon_tower.jpg',
      waterTile: 'tiles/abyss_water.png',
      tiles: { '.': 'tiles/tower_floor.png', f: 'tiles/tower_floor.png', r: 'tiles/cave_floor.png', b: 'tiles/wood.png', '#': 'tiles/wall_tower.png', T: 'props/statue.png' },
      battleTile: 'tiles/tower_floor.png', battleBackdrop: 'backdrops/bg_demon_tower.jpg'
    },
    miao_village: {
      bgTop: '#1b2e26', bgBot: '#32523f',
      ground: '#5d8247', groundStroke: '#486636',
      floor: '#946846', floorStroke: '#734f34',
      road: '#9c8669', roadStroke: '#7a6850',
      bridge: '#ad7a4c', water: '#215952', waterHi: '#4db6ac',
      wallTop: '#8f6b4a', wallLeft: '#705339', wallRight: '#543e2a',
      cliffLeft: '#524433', cliffRight: '#362c20',
      lightColor: 'rgba(255, 213, 79, 0.17)',
      blossom: '#ffd54f',
      mapBackdrop: 'backdrops/bg_title.jpg',
      waterTile: 'tiles/water.png',
      tiles: { '.': 'tiles/grass.png', f: 'tiles/wood.png', r: 'tiles/road.png', b: 'tiles/bridge.png', '#': 'tiles/wall_town.png', T: 'props/tree_miao.png' },
      battleTile: 'tiles/grass.png', battleBackdrop: null
    },
    fire_cavern: {
      bgTop: '#290c0c', bgBot: '#4f1913',
      ground: '#54322e', groundStroke: '#3d2320',
      floor: '#6b3e38', floorStroke: '#4f2c28',
      road: '#633b34', roadStroke: '#472924',
      bridge: '#8a5236', water: '#b83714', waterHi: '#ffb74d',
      wallTop: '#45221e', wallLeft: '#331815', wallRight: '#210f0d',
      cliffLeft: '#4a1d17', cliffRight: '#2b0f0c',
      lightColor: 'rgba(255, 112, 67, 0.22)',
      blossom: '#ffab40',
      mapBackdrop: 'backdrops/bg_fire_cavern.jpg',
      waterTile: 'tiles/lava.png',
      tiles: { '.': 'tiles/fire_floor.png', f: 'tiles/fire_floor.png', r: 'tiles/fire_floor.png', b: 'tiles/wood.png', '#': 'tiles/wall_fire.png', T: 'tiles/wall_fire.png' },
      battleTile: 'tiles/fire_floor.png', battleBackdrop: 'backdrops/bg_fire_cavern.jpg'
    },
    mist_rift: {
      bgTop: '#0b132b', bgBot: '#1c2541',
      ground: '#3a506b', groundStroke: '#293a4f',
      floor: '#4c698a', floorStroke: '#364d66',
      road: '#5c7da3', roadStroke: '#405975',
      bridge: '#6fffe9', water: '#0f1b38', waterHi: '#64ffda',
      wallTop: '#495f7a', wallLeft: '#344559', wallRight: '#222e3d',
      cliffLeft: '#2d4159', cliffRight: '#1c293a',
      lightColor: 'rgba(100, 255, 218, 0.16)',
      blossom: '#e0fbfc',
      mapBackdrop: 'backdrops/bg_title.jpg',
      waterTile: 'tiles/water.png',
      tiles: { '.': 'tiles/mist_floor.png', f: 'tiles/jade.png', r: 'tiles/mist_floor.png', b: 'tiles/bridge.png', '#': 'tiles/wall_shushan.png', T: 'props/tree_pine.png' },
      battleTile: 'tiles/mist_floor.png', battleBackdrop: null
    },
    abyss_altar: {
      bgTop: '#070b19', bgBot: '#191436',
      ground: '#2d2a4a', groundStroke: '#1e1c33',
      floor: '#3b3761', floorStroke: '#292645',
      road: '#464173', roadStroke: '#302c52',
      bridge: '#9c7a44', water: '#112240', waterHi: '#7c4dff',
      wallTop: '#332e54', wallLeft: '#24203d', wallRight: '#171429',
      cliffLeft: '#241e42', cliffRight: '#141029',
      lightColor: 'rgba(124, 77, 255, 0.18)',
      blossom: '#72efdd',
      mapBackdrop: 'backdrops/bg_abyss.jpg',
      waterTile: 'tiles/abyss_water.png',
      tiles: { '.': 'tiles/tower_floor.png', f: 'tiles/tower_floor.png', r: 'tiles/cave_floor.png', b: 'tiles/wood.png', '#': 'tiles/wall_abyss.png', T: 'props/statue.png' },
      battleTile: 'tiles/tower_floor.png', battleBackdrop: 'backdrops/bg_abyss.jpg'
    }
  };

  const HERO_IDS = { luxiao: true, lingxi: true, yueling: true, aman: true };

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
      ctx.strokeStyle = 'rgba(255, 240, 200, 0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - hw, cy + 0.5);
      ctx.lineTo(cx, cy + hh + 0.5);
      ctx.stroke();
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
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy + hh + 0.5);
      ctx.lineTo(cx + hw, cy + 0.5);
      ctx.stroke();
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
    ctx.font = 'bold 11px "Microsoft JhengHei", serif';
    ctx.textAlign = 'center';
    const tw = ctx.measureText(text).width + 14;
    const th = 17;
    const rx = cx - tw / 2;
    const ry = bottomY - 13;
    const r = 4;

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
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.fillStyle = textColor;
    ctx.fillText(text, cx, bottomY);
  }

  // =========================================================================
  // 繪製主角與 NPC (AI 生成精緻 2.5D 立繪 + 連續步態/呼吸/面向/狀態光效)
  // =========================================================================
  function drawCharacterSprite(ctx, x, y, spriteId, time, opts) {
    opts = opts || {};
    const scale = opts.scale || 1;
    const isFloat = spriteId === 'ghost_npc';
    const phase = opts.walkPhase != null ? opts.walkPhase : time * 13;
    const bob = opts.moving
      ? -Math.abs(Math.sin(phase)) * 3.4
      : (isFloat ? Math.sin(time * 4) * 4.5 : Math.sin(time * 3.2) * 1.1);
    const sway = opts.moving ? Math.sin(phase) * 0.035 : 0;

    ctx.save();
    ctx.translate(x, y);

    if (opts.stealth) ctx.globalAlpha *= 0.48;

    // 腳下柔和雙層落地陰影
    const shadowR = opts.battle ? 23 : 15.5;
    const shadowGrad = ctx.createRadialGradient(0, 4, 2, 0, 4, shadowR * scale);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.48)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(0, 4, (shadowR + 2) * scale, (shadowR * 0.46) * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 領隊主角腳下微光氣韻環（強化複雜地形辨識度）
    if (opts.isLeader && !opts.battle) {
      ctx.strokeStyle = 'rgba(128, 222, 234, 0.36)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.ellipse(0, 3.5, 14, 6.2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 天罡戰氣護體金環
    if (opts.tiangang) {
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(0, 3, (shadowR + 6 + Math.sin(time * 8) * 2.5) * scale, (shadowR * 0.55) * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 解析對應 AI 生成立繪路徑
    let assetPath = null;
    if (HERO_IDS[spriteId]) {
      assetPath = opts.battle ? `heroes_battle/${spriteId}.png` : `heroes/${spriteId}.png`;
    } else {
      assetPath = `npcs/${spriteId}.png`;
    }
    const img = getAsset(assetPath) || getAsset('npcs/elder_man.png');

    ctx.save();
    ctx.scale(scale, scale);
    if (opts.flipX && !opts.battle) {
      ctx.scale(-1, 1);
    }

    if (opts.dead) {
      ctx.translate(0, 4);
      ctx.rotate(-Math.PI / 2.15);
    } else if (opts.kneel) {
      ctx.translate(0, 6);
      ctx.rotate(0.08);
    } else if (sway) {
      ctx.rotate(sway);
    }

    if (img) {
      const baseH = opts.battle
        ? 84
        : (spriteId === 'child_boy' ? 48 : 59);
      const aspect = img.naturalWidth / Math.max(1, img.naturalHeight);
      const drawH = baseH;
      const drawW = drawH * aspect;
      ctx.drawImage(img, -drawW / 2, -drawH + 5 + bob, drawW, drawH);
    } else {
      ctx.fillStyle = '#3b6ea5';
      ctx.beginPath();
      ctx.ellipse(0, -22 + bob, 11, 22, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 中毒綠瘴氣泡提示
    if (opts.poison) {
      ctx.fillStyle = '#69f0ae';
      ctx.beginPath();
      ctx.arc(-10 * scale, (-44 + ((time * 18) % 12)) * scale, 2.6, 0, Math.PI * 2);
      ctx.arc(10 * scale, (-38 + ((time * 14) % 12)) * scale, 2.1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // =========================================================================
  // 繪製迷宮精怪與八大鎮關首領 (AI 生成高精細妖魔與神獸立繪)
  // =========================================================================
  function drawMonsterSprite(ctx, x, y, spriteId, time, opts) {
    opts = opts || {};
    const scale = opts.scale || 1;
    const isBoss = spriteId && spriteId.startsWith('boss_');
    const isFloating = spriteId === 'bee' || spriteId === 'ghost' || spriteId === 'boss_yexiao' || spriteId === 'boss_yinhu';
    const hover = isFloating ? Math.sin(time * 4.5) * 4 : Math.sin(time * 3) * 1.4;

    ctx.save();
    ctx.translate(x, y);

    if (opts.hitFlash) {
      ctx.filter = 'brightness(2.3) contrast(1.15)';
    }

    // 腳下妖氣陰影
    const sRx = (isBoss ? 34 : 20) * scale;
    const sRy = (isBoss ? 13 : 8) * scale;
    ctx.fillStyle = isBoss ? 'rgba(18, 6, 32, 0.52)' : 'rgba(0, 0, 0, 0.42)';
    ctx.beginPath();
    ctx.ellipse(0, 5, sRx, sRy, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isBoss) {
      ctx.strokeStyle = 'rgba(255, 112, 67, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 5, sRx + 4 + Math.sin(time * 5) * 3, sRy + 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    const assetPath = isBoss ? `bosses/${spriteId}.png` : `monsters/${spriteId}.png`;
    const img = getAsset(assetPath) || getAsset('monsters/plant.png');

    if (img) {
      let baseH = 74;
      if (spriteId === 'boss_shuimoshou') baseH = 128;
      else if (spriteId === 'boss_yueling') baseH = 88;
      else if (isBoss) baseH = 112;

      const drawH = baseH * scale;
      const aspect = img.naturalWidth / Math.max(1, img.naturalHeight);
      const drawW = drawH * aspect;
      ctx.drawImage(img, -drawW / 2, -drawH + 7 + hover, drawW, drawH);
    } else {
      ctx.fillStyle = isBoss ? '#8e24aa' : '#43a047';
      ctx.beginPath();
      ctx.arc(0, -24 * scale + hover, 18 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // =========================================================================
  // 繪製場景可互動物件 (AI 生成寶箱、青花酒罈、木桶、奇門石像、太極陣樞、扁舟 + 鄰近/懸停互動提示)
  // =========================================================================
  function drawMapObject(ctx, x, y, obj, flags, searchedIds, time, highlighted) {
    const opened = searchedIds && searchedIds[obj.id];
    ctx.save();
    ctx.translate(x, y);

    // 鄰近或滑鼠懸停時：腳下鎏金玉環提示
    if (highlighted) {
      const hr = (obj.type === 'boss' ? 30 : 21) + Math.sin(time * 7) * 2.2;
      ctx.strokeStyle = obj.type === 'boss' ? '#ff8a80' : '#ffe082';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(0, 3, hr, hr * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    let labelY = -56;

    if (obj.type === 'chest') {
      const img = getAsset(opened ? 'props/chest_open.png' : 'props/chest_closed.png');
      ctx.fillStyle = 'rgba(0,0,0,0.36)';
      ctx.beginPath();
      ctx.ellipse(0, 3, 16, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      if (img) {
        const dh = 39;
        const dw = dh * (img.naturalWidth / Math.max(1, img.naturalHeight));
        ctx.drawImage(img, -dw / 2, -dh + 6, dw, dh);
      }
      if (!opened) {
        ctx.fillStyle = `rgba(255, 238, 145, ${0.52 + Math.sin(time * 5.2) * 0.3})`;
        ctx.beginPath();
        ctx.arc(0, -19 + Math.sin(time * 4) * 2, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      labelY = -38;
    } else if (obj.type === 'jar' || obj.type === 'barrel') {
      const img = getAsset(obj.type === 'jar' ? 'props/jar.png' : 'props/barrel.png');
      ctx.fillStyle = 'rgba(0,0,0,0.34)';
      ctx.beginPath();
      ctx.ellipse(0, 3, 13, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      if (img) {
        const dh = 37;
        const dw = dh * (img.naturalWidth / Math.max(1, img.naturalHeight));
        if (opened) ctx.globalAlpha = 0.72;
        ctx.drawImage(img, -dw / 2, -dh + 5, dw, dh);
        ctx.globalAlpha = 1;
      }
      labelY = -36;
    } else if (obj.type === 'statue') {
      const broken = obj.flag && flags[obj.flag];
      const img = getAsset(broken ? 'props/statue_broken.png' : 'props/statue.png');
      const elemColor = (PalX.ELEMENTS[obj.elem] && PalX.ELEMENTS[obj.elem].color) || '#80deea';
      if (!broken) {
        ctx.strokeStyle = elemColor;
        ctx.globalAlpha = 0.6 + Math.sin(time * 4) * 0.22;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 3, 20, 9, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (img) {
        const dh = broken ? 38 : 57;
        const dw = dh * (img.naturalWidth / Math.max(1, img.naturalHeight));
        ctx.drawImage(img, -dw / 2, -dh + 6, dw, dh);
      }
      labelY = broken ? -42 : -60;
    } else if (obj.type === 'switch') {
      const active = (obj.flag && flags[obj.flag]) ||
        (obj.interaction === 'serpent_switch' && flags.serpent_gate_open) ||
        (obj.interaction === 'qilin_switch' && flags.qilin_gate_open) ||
        (obj.interaction === 'mist_switch' && flags.rift_gate_open) ||
        (obj.interaction === 'abyss_five_pearls_altar' && flags.abyss_seal_open);
      const img = getAsset(active ? 'props/switch_active.png' : 'props/switch.png');
      if (img) {
        const dw = 54;
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
          const dw = 74;
          const dh = dw * (img.naturalHeight / Math.max(1, img.naturalWidth));
          ctx.drawImage(img, -dw / 2, -dh * 0.65 + bob, dw, dh);
        }
        labelY = -37;
      } else {
        const img = getAsset('props/portal.png');
        if (img) {
          const dw = 58;
          const dh = dw * (img.naturalHeight / Math.max(1, img.naturalWidth));
          ctx.globalAlpha = 0.88 + Math.sin(time * 4) * 0.12;
          ctx.drawImage(img, -dw / 2, -dh * 0.56, dw, dh);
          ctx.globalAlpha = 1;
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
      drawCharacterSprite(ctx, 0, 0, obj.sprite || 'elder_man', time, { scale: 1 });
      labelY = obj.sprite === 'child_boy' ? -50 : -61;
    } else if (obj.type === 'boss') {
      drawMonsterSprite(ctx, 0, 0, obj.sprite || 'boss_chigui', time, { scale: 0.78 });
      labelY = -90;
    }

    // 頭頂圓角古風名牌 (NPC / 鎮關 Boss / 傳送點 常駐；可調查器物於懸停或鄰近時浮現提示)
    if (obj.type === 'npc' || obj.type === 'boss' || obj.type === 'portal') {
      const prefix = highlighted
        ? (obj.type === 'boss' ? '⚔️ ' : obj.type === 'portal' ? '🌀 ' : '💬 ')
        : '';
      const borderCol = highlighted
        ? '#ffe082'
        : (obj.type === 'boss' ? 'rgba(255,138,128,0.65)' : 'rgba(226,190,107,0.5)');
      const txtCol = obj.type === 'boss' ? '#ff8a80' : obj.type === 'portal' ? '#80deea' : '#ffe082';
      drawRoundedTag(ctx, 0, labelY, prefix + obj.name, 'rgba(7, 15, 32, 0.88)', borderCol, txtCol);
    } else if (highlighted) {
      const hintLabel = opened ? `${obj.name}（已搜）` : `✨ ${obj.name}`;
      drawRoundedTag(ctx, 0, labelY + Math.sin(time * 6) * 1.5, hintLabel, 'rgba(12, 26, 52, 0.92)', '#ffe082', '#fff8e1');
    }

    ctx.restore();
  }

  // =========================================================================
  // 45度斜視角地圖完整渲染 (全景山水天幕 + 立體浮島岩層 + 子格絲滑插值 + 動態氛圍光影)
  // =========================================================================
  function renderMapScene(ctx, canvas, game) {
    const w = canvas.width;
    const h = canvas.height;
    const map = PalX.MAPS[game.state.mapId];
    if (!map) return;

    const pal = THEME_PALETTES[map.theme] || THEME_PALETTES.jiangnan_town;
    const tileSet = pal.tiles || THEME_PALETTES.jiangnan_town.tiles;
    const time = game.time;
    const camX = game.camX;
    const camY = game.camY;

    // 1. 遠景仙俠全景視差天幕（消除單調深藍空洞背景）
    const backdropImg = pal.mapBackdrop ? getAsset(pal.mapBackdrop) : null;
    if (backdropImg) {
      const pxOff = Math.max(-28, Math.min(28, -camX * 0.05));
      const pyOff = Math.max(-20, Math.min(20, -camY * 0.05));
      ctx.drawImage(backdropImg, pxOff - 32, pyOff - 24, w + 64, h + 48);
      const veil = ctx.createLinearGradient(0, 0, 0, h);
      veil.addColorStop(0, 'rgba(7, 15, 30, 0.44)');
      veil.addColorStop(0.45, 'rgba(10, 22, 42, 0.64)');
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

    // 遠景柔和流動雲煙層
    for (let i = 0; i < 4; i++) {
      const cx = ((i * 270 + time * (9 + i * 2)) % (w + 340)) - 170;
      const cy = 58 + (i % 2) * 58;
      const cg = ctx.createRadialGradient(cx, cy, 8, cx, cy, 130);
      cg.addColorStop(0, 'rgba(225, 242, 255, 0.075)');
      cg.addColorStop(1, 'rgba(225, 242, 255, 0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 130, 34, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const rows = map.grid.length;
    const cols = map.grid[0].length;
    const gateOpen = map.gateFlag ? !!game.state.flags[map.gateFlag] : true;

    // 判定當前高亮提示之互動物件（優先滑鼠懸停，其次為主角身旁1格內可互動物件）
    let highlightObj = game.hoverObj || null;
    if (!highlightObj && !game.dialogueActive && !game.modalActive) {
      let bestDist = 99;
      for (const obj of map.objects) {
        if (obj.requireFlag && !game.state.flags[obj.requireFlag]) continue;
        if (obj.hideFlag && game.state.flags[obj.hideFlag]) continue;
        const cd = Math.max(Math.abs(obj.x - game.playerPos.x), Math.abs(obj.y - game.playerPos.y));
        if (cd <= 1 && game.isBumpInteractable && game.isBumpInteractable(obj)) {
          const md = Math.abs(obj.x - game.playerPos.x) + Math.abs(obj.y - game.playerPos.y);
          if (md < bestDist) {
            bestDist = md;
            highlightObj = obj;
          }
        }
      }
    }

    const entities = [];
    const lightSources = [];

    // 收集場景物件與動態光源點
    for (const obj of map.objects) {
      if (obj.requireFlag && !game.state.flags[obj.requireFlag]) continue;
      if (obj.hideFlag && game.state.flags[obj.hideFlag]) continue;
      entities.push({ kind: 'obj', gx: obj.x, gy: obj.y, zBias: 0.15, obj });

      if (obj.type === 'portal') {
        lightSources.push({ gx: obj.x, gy: obj.y, yOff: -10, r: 66, col: 'rgba(100, 255, 218, 0.22)' });
      } else if (obj.type === 'chest' && !(game.state.searched && game.state.searched[obj.id])) {
        lightSources.push({ gx: obj.x, gy: obj.y, yOff: -14, r: 46, col: 'rgba(255, 213, 79, 0.18)' });
      } else if (obj.type === 'statue' && !(obj.flag && game.state.flags[obj.flag])) {
        lightSources.push({ gx: obj.x, gy: obj.y, yOff: -22, r: 58, col: 'rgba(128, 222, 234, 0.19)' });
      } else if (obj.type === 'switch') {
        lightSources.push({ gx: obj.x, gy: obj.y, yOff: -10, r: 54, col: 'rgba(255, 213, 79, 0.18)' });
      } else if (obj.type === 'npc' && (map.theme === 'jiangnan_town' || map.theme === 'miao_village')) {
        lightSources.push({ gx: obj.x, gy: obj.y, yOff: -24, r: 62, col: 'rgba(255, 193, 107, 0.14)' });
      } else if (obj.type === 'boss') {
        lightSources.push({ gx: obj.x, gy: obj.y, yOff: -34, r: 84, col: 'rgba(255, 112, 67, 0.22)' });
      }
    }

    // 收集明雷巡邏妖魔（採用 60FPS 子格插值座標 rx/ry）
    for (const enemy of game.activeMapEnemies) {
      if (enemy.defeated) continue;
      const ex = enemy.rx != null ? enemy.rx : enemy.x;
      const ey = enemy.ry != null ? enemy.ry : enemy.y;
      entities.push({ kind: 'enemy', gx: ex, gy: ey, zBias: 0.2, enemy });
    }

    // 收集主角與毛毛蟲跟隨隊伍（採用 60FPS 子格插值座標 renderPlayer 與 trail.rx/ry）
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

    // 第一層：繪製等距地面、彩繪流體水波/岩漿、棧橋與外緣 3D 浮島懸崖岩基
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const ch = map.grid[gy][gx];
        const pt = tileToScreen(gx, gy, camX, camY, w, h);
        if (pt.x < -96 || pt.x > w + 96 || pt.y < -110 || pt.y > h + 135) continue;

        if (ch === '#') {
          drawDiamond(ctx, pt.x, pt.y, TILE_W, TILE_H, pal.wallRight, null);
          entities.push({ kind: 'wall', gx, gy, zBias: 0, wallAsset: tileSet['#'] });
        } else if (ch === '~') {
          if (liquidImg) {
            ctx.drawImage(liquidImg, pt.x - 35, pt.y - 16, 70, 37);
          } else {
            drawDiamond(ctx, pt.x, pt.y + 2, TILE_W + 2, TILE_H + 1, pal.water, null);
          }
          // 柔和流動水波微光（無格線外框，讓河道與荷塘渾然一體）
          const wave = Math.sin(time * 2.8 + gx * 0.9 + gy * 1.1) * 5;
          ctx.save();
          ctx.strokeStyle = pal.waterHi;
          ctx.globalAlpha = 0.28 + Math.sin(time * 2.4 + gx + gy) * 0.1;
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(pt.x - 9 + wave, pt.y + 1);
          ctx.quadraticCurveTo(pt.x + wave, pt.y - 1.5, pt.x + 9 + wave, pt.y + 1);
          ctx.stroke();
          ctx.restore();

          if ((map.theme === 'lotus_island' || map.theme === 'jiangnan_town') && (gx * 7 + gy * 3) % 5 === 0) {
            const lb = Math.sin(time * 2.4 + gx + gy) * 1.2;
            ctx.fillStyle = '#388e3c';
            ctx.beginPath();
            ctx.ellipse(pt.x, pt.y + 2 + lb, 7.5, 3.8, 0, 0.2, Math.PI * 1.95);
            ctx.fill();
            ctx.fillStyle = '#f8bbd0';
            ctx.beginPath();
            ctx.arc(pt.x + 1, pt.y + lb, 3.2, 0, Math.PI * 2);
            ctx.fill();
          } else if (map.theme === 'fire_cavern' && (gx * 5 + gy * 11) % 6 === 0) {
            lightSources.push({ gx, gy, yOff: 0, r: 58, col: 'rgba(255, 112, 67, 0.2)' });
          }
        } else {
          let tileKey = '.';
          if (ch === 'f' || ch === 'G') tileKey = 'f';
          else if (ch === 'r') tileKey = 'r';
          else if (ch === 'b') tileKey = 'b';
          if (ch === 'G' && gateOpen) tileKey = 'b';

          if (tileKey === 'b') {
            if (liquidImg) {
              ctx.drawImage(liquidImg, pt.x - 34, pt.y - 14, 68, 36);
            } else {
              drawDiamond(ctx, pt.x, pt.y + 3, TILE_W, TILE_H, pal.water, null);
            }
          }

          const tImg = getAsset(tileSet[tileKey]);
          if (tImg) {
            if (tileKey === 'b') {
              ctx.drawImage(tImg, pt.x - 35, pt.y - 21, 70, 41);
            } else if (tileKey === '.' && ((gx * 5 + gy * 3) & 1) === 1) {
              // 奇偶自然地磚水平鏡像，消除重複紋理感
              ctx.save();
              ctx.translate(pt.x, pt.y);
              ctx.scale(-1, 1);
              ctx.drawImage(tImg, -34, -17, 68, 36);
              ctx.restore();
            } else {
              ctx.drawImage(tImg, pt.x - 34, pt.y - 17, 68, 36);
            }
          } else {
            let fill = pal.ground;
            if (tileKey === 'f') fill = pal.floor;
            else if (tileKey === 'r') fill = pal.road;
            else if (tileKey === 'b') fill = pal.bridge;
            drawDiamond(ctx, pt.x, pt.y, TILE_W, TILE_H, fill, 'rgba(0,0,0,0.2)');
          }

          if (ch === 'G' && !gateOpen) {
            entities.push({ kind: 'barrier', gx, gy, zBias: 0.18 });
            lightSources.push({ gx, gy, yOff: -16, r: 64, col: 'rgba(255, 183, 77, 0.22)' });
          } else if (ch === 'T') {
            entities.push({ kind: 'tree', gx, gy, zBias: 0.12, treeAsset: tileSet.T });
          }
        }

        // 地圖前景外緣繪製 3D 浮島懸崖岩基裙邊
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

    // 步履微塵／水面漣漪
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

    // 滑鼠懸停可行走地磚微光菱形框
    if (game.hoverTile && !game.dialogueActive && !game.modalActive) {
      const hx = game.hoverTile.x;
      const hy = game.hoverTile.y;
      if (game.isTileWalkable && game.isTileWalkable(map, hx, hy, false)) {
        const hp = tileToScreen(hx, hy, camX, camY, w, h);
        drawDiamond(ctx, hp.x, hp.y, TILE_W - 6, TILE_H - 3, 'rgba(255, 224, 130, 0.08)', 'rgba(255, 224, 130, 0.45)');
      }
    }

    // 點擊尋路目標雙環漣漪圈
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

    // 第二層：依等距深度 (gx + gy) 排序繪製 3D 屋舍山岩、水墨古樹、寶箱、NPC、妖魔與絲滑插值主角隊列
    const px = rp.x;
    const py = rp.y;

    entities.sort((a, b) => ((a.gx + a.gy + (a.zBias || 0)) - (b.gx + b.gy + (b.zBias || 0))));

    for (const ent of entities) {
      const pt = tileToScreen(ent.gx, ent.gy, camX, camY, w, h);
      if (pt.x < -110 || pt.x > w + 110 || pt.y < -130 || pt.y > h + 130) continue;

      if (ent.kind === 'wall') {
        const wImg = getAsset(ent.wallAsset);
        // 若立體牆體正好擋在主角正前方 1~2 格內，自動微半透明透視，絕不遮擋視線！
        const occludingPlayer =
          ent.gx >= px - 0.3 && ent.gy >= py - 0.3 &&
          (ent.gx - px) <= 2.2 && (ent.gy - py) <= 2.2 &&
          (ent.gx + ent.gy) > (px + py + 0.15) &&
          ent.gx > 0 && ent.gy > 0 && ent.gx < cols - 1 && ent.gy < rows - 1;

        if (wImg) {
          ctx.save();
          if (occludingPlayer) ctx.globalAlpha = 0.45;
          const dw = 68;
          const dh = Math.min(62, dw * (wImg.naturalHeight / Math.max(1, wImg.naturalWidth)) * 0.82);
          ctx.drawImage(wImg, pt.x - dw / 2, pt.y + TILE_H / 2 - dh, dw, dh);
          ctx.restore();
        } else {
          drawIsoBlockFallback(ctx, pt.x, pt.y, 20, pal.wallTop, pal.wallLeft, pal.wallRight);
        }
      } else if (ent.kind === 'tree') {
        const tImg = getAsset(ent.treeAsset);
        ctx.fillStyle = 'rgba(0,0,0,0.34)';
        ctx.beginPath();
        ctx.ellipse(pt.x, pt.y + 3, 19, 8.5, 0, 0, Math.PI * 2);
        ctx.fill();
        if (tImg) {
          const dh = 70;
          const dw = dh * (tImg.naturalWidth / Math.max(1, tImg.naturalHeight));
          const occludingTree =
            ent.gx >= px - 0.2 && ent.gy >= py - 0.2 &&
            (ent.gx - px) <= 1.8 && (ent.gy - py) <= 1.8 &&
            (ent.gx + ent.gy) > (px + py + 0.2);
          ctx.save();
          if (occludingTree) ctx.globalAlpha = 0.58;
          ctx.drawImage(tImg, pt.x - dw / 2, pt.y - dh + 9, dw, dh);
          ctx.restore();
        }
      } else if (ent.kind === 'barrier') {
        const pulse = Math.sin(time * 6) * 3;
        const g = ctx.createLinearGradient(pt.x, pt.y - 52, pt.x, pt.y + 8);
        g.addColorStop(0, 'rgba(255, 213, 79, 0.08)');
        g.addColorStop(0.5, 'rgba(255, 112, 67, 0.55)');
        g.addColorStop(1, 'rgba(255, 238, 88, 0.82)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(pt.x, pt.y - 22, 18 + pulse * 0.4, 28, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffe082';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(pt.x, pt.y + 1, 22, 10, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (ent.kind === 'obj') {
        drawMapObject(
          ctx, pt.x, pt.y, ent.obj,
          game.state.flags, game.state.searched, time,
          highlightObj && highlightObj.id === ent.obj.id
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

    // 第三層：動態燈火／靈氣點光源疊加 (Screen 柔光濾鏡營造仙俠夜色與洞天氛圍)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const heroScreen = tileToScreen(rp.x, rp.y, camX, camY, w, h);
    drawPointLight(ctx, heroScreen.x, heroScreen.y - 20, 82, pal.lightColor || 'rgba(255, 224, 178, 0.14)');
    for (const ls of lightSources) {
      const lp = tileToScreen(ls.gx, ls.gy, camX, camY, w, h);
      if (lp.x < -90 || lp.x > w + 90 || lp.y < -90 || lp.y > h + 90) continue;
      drawPointLight(ctx, lp.x, lp.y + (ls.yOff || 0), ls.r + Math.sin(time * 3.6 + ls.gx) * 4, ls.col);
    }
    ctx.restore();

    // 飄落桃花瓣 / 蜀山劍氣星塵 / 火窟餘燼粒子
    ctx.fillStyle = pal.blossom;
    for (let i = 0; i < 18; i++) {
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

    // 電影感柔和暗角框景
    const vig = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.28, w * 0.5, h * 0.5, w * 0.72);
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(1, 'rgba(3, 8, 18, 0.36)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  }

  // =========================================================================
  // 仙劍1經典45度斜視角回合制戰鬥畫面渲染 (AI 實景戰場 + 立體浮空石台 + 華麗劍氣法陣)
  // =========================================================================
  function renderBattleScene(ctx, canvas, battle, mapTheme, time) {
    const w = canvas.width;
    const h = canvas.height;
    const pal = THEME_PALETTES[mapTheme] || THEME_PALETTES.lotus_island;

    ctx.save();
    if (battle.shakeTimer > 0) {
      const mag = battle.shakeTimer * 12;
      ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
    }

    const customArenaImg = pal.battleBackdrop ? getAsset(pal.battleBackdrop) : null;
    const outdoorSkyImg = getAsset('backdrops/bg_title.jpg');
    const stageTileImg = getAsset(pal.battleTile || 'tiles/jade.png');

    if (customArenaImg) {
      // 鎖妖塔、火麟洞、隱霧蛇窟、九泉深淵：直接使用 AI 繪製的 45 度八卦石橋實景戰場！
      ctx.drawImage(customArenaImg, 0, 0, w, h);
    } else {
      // 戶外仙島、江南、蜀山、苗疆、時之隙：遠景 AI 雲海仙峰 + 前景 3D 浮空石台戰場！
      if (outdoorSkyImg) {
        ctx.drawImage(outdoorSkyImg, 0, -36, w, h + 36);
        const tintGrad = ctx.createLinearGradient(0, 0, 0, h);
        tintGrad.addColorStop(0, 'rgba(8, 18, 36, 0.18)');
        tintGrad.addColorStop(0.5, 'rgba(10, 24, 44, 0.32)');
        tintGrad.addColorStop(1, 'rgba(5, 11, 22, 0.78)');
        ctx.fillStyle = tintGrad;
        ctx.fillRect(0, 0, w, h);
      } else {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, pal.bgTop);
        grad.addColorStop(1, '#091020');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // 戰台下方深淵托雲陰影
      const platShadow = ctx.createRadialGradient(w * 0.5, h * 0.58, 40, w * 0.5, h * 0.58, 340);
      platShadow.addColorStop(0, 'rgba(3, 8, 20, 0.65)');
      platShadow.addColorStop(1, 'rgba(3, 8, 20, 0)');
      ctx.fillStyle = platShadow;
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.58, 340, 155, 0, 0, Math.PI * 2);
      ctx.fill();

      // 鋪設 8x8 精緻 45 度斜視角仙境高台戰場 + 3D 雕花石壁裙邊
      const bw = TILE_W * 1.18;
      const bh = TILE_H * 1.18;
      for (let gy = -3; gy <= 4; gy++) {
        for (let gx = -3; gx <= 4; gx++) {
          const isoX = (gx - gy) * (bw / 2);
          const isoY = (gx + gy) * (bh / 2);
          const sx = w * 0.50 + isoX;
          const sy = h * 0.47 + isoY;
          if (stageTileImg) {
            ctx.drawImage(stageTileImg, sx - bw / 2, sy - bh / 2, bw, bh * 1.06);
          } else {
            drawDiamond(ctx, sx, sy, bw, bh, pal.floor, pal.floorStroke);
          }
          if (gy === 4 || gx === 4) {
            drawIsoCliffSkirt(
              ctx, sx, sy, bw, bh, 32,
              gy === 4, gx === 4,
              pal.cliffLeft || '#455a6e', pal.cliffRight || '#253342'
            );
          }
        }
      }

      // 戰台中央鑲嵌淡金太極八卦陣紋
      ctx.save();
      ctx.translate(w * 0.50, h * 0.49);
      ctx.strokeStyle = 'rgba(255, 224, 130, 0.22)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, 118, 58, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 0, 86, 42, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 右上角：敵方陣列 (面向左下迎戰我方)
    battle.enemies.forEach((en, idx) => {
      if (en.dead && en.fadeAlpha <= 0) return;
      const pos = getEnemyBattlePos(idx, battle.enemies.length, w, h);
      ctx.save();
      if (en.dead) ctx.globalAlpha = Math.max(0, en.fadeAlpha);

      // 當前鎖定攻擊目標雙層光環
      if (battle.selectedEnemyIdx === idx && !en.dead) {
        const er = (en.isBoss ? 48 : 28) + Math.sin(time * 7) * 2.5;
        ctx.strokeStyle = '#ffeb3b';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y + 6, er, en.isBoss ? 17 : 11, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      const lungeX = en.animLunge ? -en.animLunge * 42 : 0;
      const lungeY = en.animLunge ? en.animLunge * 21 : 0;
      drawMonsterSprite(ctx, pos.x + lungeX, pos.y + lungeY, en.sprite, time, {
        scale: en.isBoss ? 1.48 : 1.32,
        hitFlash: en.hitFlash > 0
      });

      // 敵人受擊劍芒火花
      if (en.hitFlash > 0 && !en.dead) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.strokeStyle = '#fff8e1';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pos.x - 28, pos.y - 68);
        ctx.lineTo(pos.x + 28, pos.y - 18);
        ctx.moveTo(pos.x + 24, pos.y - 66);
        ctx.lineTo(pos.x - 24, pos.y - 20);
        ctx.stroke();
        ctx.restore();
      }

      // 敵人名稱、五靈屬性與血條 (自動避開大型 Boss 頭頂)
      if (!en.dead) {
        const barW = en.isBoss ? 126 : 86;
        const bx = pos.x - barW / 2;
        const topOffset = en.sprite === 'boss_shuimoshou' ? 186 : (en.isBoss ? 164 : 102);
        const by = Math.max(62, pos.y - topOffset);

        ctx.fillStyle = 'rgba(7, 15, 32, 0.88)';
        ctx.fillRect(bx - 5, by - 18, barW + 10, 27);
        ctx.strokeStyle = en.isBoss ? 'rgba(255, 202, 40, 0.72)' : 'rgba(144, 202, 249, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(bx - 5, by - 18, barW + 10, 27);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(bx, by, barW, 6);
        const hpGrad = ctx.createLinearGradient(bx, by, bx + barW, by);
        hpGrad.addColorStop(0, en.isBoss ? '#ff8a65' : '#ef5350');
        hpGrad.addColorStop(1, en.isBoss ? '#ffca28' : '#e53935');
        ctx.fillStyle = hpGrad;
        ctx.fillRect(bx, by, Math.max(0, (en.hp / en.maxHp) * barW), 6);

        const elemInfo = PalX.ELEMENTS[en.elem] || PalX.ELEMENTS.none;
        ctx.font = 'bold 12px "Microsoft JhengHei", serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = elemInfo.color;
        ctx.fillText(`[${elemInfo.name}] ${en.name}`, pos.x, by - 4);
      }
      ctx.restore();
    });

    // 左下角：我方出戰隊伍 (面向右上迎敵，避開左下角十字指令盤)
    battle.party.forEach((hero, idx) => {
      const pos = getHeroBattlePos(idx, battle.party.length, w, h);
      const isTurn = battle.activeActorId === hero.id && battle.phase === 'input';

      if (isTurn) {
        ctx.strokeStyle = '#4fc3f7';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y + 5, 28 + Math.sin(time * 8) * 3, 11, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      const lungeX = hero.animLunge ? hero.animLunge * 48 : 0;
      const lungeY = hero.animLunge ? -hero.animLunge * 24 : 0;

      // 醉仙望月步或出招突進殘影
      if (((hero.buffs && hero.buffs.zuixian > 0) || hero.animLunge > 0.12) && hero.hp > 0) {
        ctx.save();
        ctx.globalAlpha = 0.34;
        drawCharacterSprite(ctx, pos.x - 16 + lungeX * 0.65, pos.y + 6 + lungeY * 0.65, hero.id, time, { scale: 1.38, battle: true });
        ctx.restore();
      }

      drawCharacterSprite(ctx, pos.x + lungeX, pos.y + lungeY, hero.id, time, {
        scale: 1.38,
        battle: true,
        dead: hero.hp <= 0,
        kneel: hero.hp > 0 && hero.hp < hero.maxHp * 0.26,
        stealth: hero.buffs && hero.buffs.stealth > 0,
        tiangang: hero.buffs && hero.buffs.tiangang > 0,
        poison: !!hero.poison
      });

      // 出劍／揮鞭新月劍氣弧光
      if (hero.animLunge > 0.08 && hero.hp > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.translate(pos.x + lungeX + 26, pos.y + lungeY - 42);
        ctx.rotate(-0.48);
        ctx.strokeStyle = hero.id === 'yueling' ? '#ff8a80' : (hero.id === 'aman' ? '#ce93d8' : '#80deea');
        ctx.lineWidth = 4.2 * hero.animLunge;
        ctx.beginPath();
        ctx.arc(0, 0, 38, -0.95, 0.95);
        ctx.stroke();
        ctx.restore();
      }
    });

    // 華麗仙術與五靈珠召喚合擊特效 (VFX)
    for (const vfx of battle.vfxList) {
      drawBattleVfx(ctx, vfx, w, h, time);
    }

    // 戰場前景雲霧與星火微粒
    if (!customArenaImg) {
      ctx.fillStyle = pal.blossom || '#f8bbd0';
      for (let i = 0; i < 12; i++) {
        const px = ((i * 113 + time * 32) % w);
        const py = ((i * 67 + time * 20) % h);
        ctx.globalAlpha = 0.45;
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // 浮動傷害/暴擊/治療/偷竊數字
    for (const pop of battle.popups) {
      ctx.save();
      ctx.font = `bold ${pop.big ? 23 : 17}px "Microsoft JhengHei", serif`;
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3.8;
      ctx.strokeText(pop.text, pop.x, pop.y);
      ctx.fillStyle = pop.color || '#fff';
      ctx.fillText(pop.text, pop.x, pop.y);
      ctx.restore();
    }

    ctx.restore();
  }

  function getHeroBattlePos(idx, count, w, h) {
    // 站位於左下八卦石橋/仙境戰台上，完美避開最左側十字指令盤與右下狀態牌
    const baseX = w * 0.28;
    const baseY = h * 0.55;
    return {
      x: baseX + idx * 64,
      y: baseY + idx * 42
    };
  }

  function getEnemyBattlePos(idx, count, w, h) {
    if (count === 1) {
      return { x: w * 0.68, y: h * 0.46 };
    }
    const baseX = w * 0.58;
    const baseY = h * 0.39;
    return {
      x: baseX + idx * 74,
      y: baseY + idx * 44
    };
  }

  function drawBattleVfx(ctx, vfx, w, h, time) {
    const p = 1 - vfx.timer / vfx.maxTimer;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // 施法目標腳下五靈法陣光環
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
      ctx.ellipse(vfx.x, vfx.y + 6, 36 + p * 26, 15 + p * 11, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (vfx.kind === 'sword_rain') {
      drawPointLight(ctx, vfx.x, vfx.y - 30, 115, 'rgba(128, 222, 234, 0.38)');
      for (let i = 0; i < 16; i++) {
        const sx = vfx.x - 102 + i * 14 + p * 64;
        const sy = vfx.y - 160 + ((i * 37) % 64) + p * 152;
        const sg = ctx.createLinearGradient(sx - 22, sy - 34, sx, sy);
        sg.addColorStop(0, 'rgba(128, 222, 234, 0)');
        sg.addColorStop(0.6, '#80deea');
        sg.addColorStop(1, '#ffffff');
        ctx.strokeStyle = sg;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(sx - 22, sy - 34);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }
    } else if (vfx.kind === 'fire_pillar') {
      const r = 44 + Math.sin(p * Math.PI) * 32;
      const g = ctx.createRadialGradient(vfx.x, vfx.y - 32, 6, vfx.x, vfx.y - 32, r * 1.75);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.28, '#fff59d');
      g.addColorStop(0.62, '#ff5722');
      g.addColorStop(1, 'rgba(183,28,28,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(vfx.x, vfx.y - 42, r, r * 2.25, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (vfx.kind === 'ice_storm') {
      drawPointLight(ctx, vfx.x, vfx.y - 24, 105, 'rgba(128, 222, 234, 0.42)');
      ctx.fillStyle = 'rgba(178, 235, 242, 0.85)';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      for (let i = -3; i <= 3; i++) {
        const ix = vfx.x + i * 24;
        const ih = Math.sin(p * Math.PI) * (70 - Math.abs(i) * 6);
        ctx.beginPath();
        ctx.moveTo(ix - 11, vfx.y + 8);
        ctx.lineTo(ix, vfx.y + 8 - ih);
        ctx.lineTo(ix + 11, vfx.y + 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    } else if (vfx.kind === 'thunder_strike') {
      drawPointLight(ctx, vfx.x, vfx.y - 30, 130, 'rgba(225, 190, 231, 0.5)');
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = '#e040fb';
      ctx.shadowBlur = 14;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(vfx.x + 18, 0);
      ctx.lineTo(vfx.x - 16, vfx.y * 0.34);
      ctx.lineTo(vfx.x + 20, vfx.y * 0.64);
      ctx.lineTo(vfx.x, vfx.y);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (vfx.kind === 'wind_vortex') {
      drawPointLight(ctx, vfx.x, vfx.y - 34, 96, 'rgba(128, 203, 196, 0.36)');
      ctx.strokeStyle = '#a7ffeb';
      ctx.lineWidth = 3;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.ellipse(vfx.x, vfx.y - i * 16, 24 + i * 11, 9 + i * 3, p * 4.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (vfx.kind === 'earth_rock') {
      ctx.globalCompositeOperation = 'source-over';
      const ry = vfx.y - 125 * (1 - p);
      const rImg = getAsset('tiles/wall_rock.png');
      if (rImg) {
        ctx.drawImage(rImg, vfx.x - 44, ry - 44, 88, 88);
      } else {
        ctx.fillStyle = '#8d6e63';
        ctx.beginPath();
        ctx.arc(vfx.x, ry, 34, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (vfx.kind === 'coin_shower') {
      ctx.fillStyle = '#ffd54f';
      for (let i = 0; i < 20; i++) {
        const cx = vfx.x - 106 + i * 11.5;
        const cy = vfx.y - 118 + ((p * 160 + i * 23) % 138);
        ctx.beginPath();
        ctx.arc(cx, cy, 6.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (vfx.kind === 'wine_god') {
      ctx.fillStyle = 'rgba(255, 213, 79, 0.28)';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#fff8e1';
      ctx.shadowColor = '#ffd54f';
      ctx.shadowBlur = 22;
      ctx.lineWidth = 14 * Math.sin(p * Math.PI);
      ctx.beginPath();
      ctx.moveTo(w * 0.18, 16);
      ctx.lineTo(vfx.x, vfx.y);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-over';
      ctx.font = 'bold 36px "DFKai-SB", "Noto Serif TC", serif';
      ctx.strokeStyle = '#2b1400';
      ctx.lineWidth = 5;
      ctx.textAlign = 'center';
      ctx.strokeText(vfx.title || '劍神降臨', w / 2, h * 0.22);
      ctx.fillStyle = '#fff8e1';
      ctx.fillText(vfx.title || '劍神降臨', w / 2, h * 0.22);
    } else if (vfx.kind === 'heal_lotus') {
      drawPointLight(ctx, vfx.x, vfx.y - 20, 76, 'rgba(105, 240, 174, 0.38)');
      ctx.strokeStyle = '#69f0ae';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.ellipse(vfx.x, vfx.y - p * 28, 32 * p + 10, 14 * p + 5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // =========================================================================
  // 對話框、頂部 HUD、戰鬥人物牌與狀態頁之 AI 彩繪半身頭像繪製器
  // =========================================================================
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
      ctx.font = `bold ${Math.round(w * 0.23)}px "Noto Serif TC", serif`;
      ctx.fillStyle = '#e2be6b';
      ctx.textAlign = 'center';
      ctx.fillText('仙劍', w / 2, h * 0.57);
      return;
    }

    const cleanId = portraitId === 'boss_yueling' ? 'yueling' : (portraitId || 'luxiao');
    const relPath = `portraits/${cleanId}.png`;
    const rec = getImageRecord(relPath);

    if (rec && rec.complete && rec.naturalWidth > 0) {
      ctx.drawImage(rec, 0, 0, w, h);
      return;
    }

    // 若圖片尚在非同步載入中，掛載一次性 onload 自動重繪靜態頭像 Canvas
    if (rec && !rec.complete && typeof rec.addEventListener === 'function') {
      canvas.__palxPortraitId = portraitId;
      rec.addEventListener('load', function onReady() {
        if (canvas.__palxPortraitId === portraitId) {
          drawPortrait(canvas, portraitId);
        }
      }, { once: true });
    }

    // 備援回退至 elder_man 頭像或金色紋章
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
    renderBattleScene,
    getHeroBattlePos,
    getEnemyBattlePos,
    drawPortrait
  };
})(typeof window !== 'undefined' ? window : globalThis);
