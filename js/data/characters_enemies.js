(function (root) {
  'use strict';

  const PalX = (root.PalX = root.PalX || {});

  const HERO_TEMPLATES = {
    luxiao: {
      id: 'luxiao',
      name: '陸逍',
      courtesy: '字雲舟',
      title: '忘憂少俠',
      color: '#4fc3f7',
      poem: '翩翩瀟灑美少年，靈島求藥結仙緣。\n千里崎嶇不辭苦，仗劍江湖為紅顏。',
      bio: '臨安渡「忘憂客棧」小夥計，性情灑脫重義、機敏幽默。偶遇醉劍翁傳授蜀山劍訣，自此捲入神農九泉「霧魂」與女媧宿命的驚天波瀾。',
      initLevel: 1,
      baseStats: { maxHp: 165, maxMp: 95, atk: 32, mag: 28, def: 22, spd: 26, lck: 28 },
      growth: { maxHp: 34, maxMp: 19, atk: 7, mag: 6, def: 5, spd: 4, lck: 3 },
      initEquip: {
        head: 'pimao',
        cloak: null,
        body: 'buyi',
        weapon: 'mujian',
        foot: 'caoxie',
        relic: null
      },
      initSkills: ['feiyuntanlong', 'qiliaoshu'],
      levelSkills: [
        { lv: 2, skill: 'bingxinjue' },
        { lv: 5, skill: 'tianshifufa' },
        { lv: 8, skill: 'tiangangzhanqi' },
        { lv: 11, skill: 'zuixianwangyue' },
        { lv: 14, skill: 'wanjianjue' },
        { lv: 17, skill: 'xianfengyunti' },
        { lv: 21, skill: 'qiankunyizhi' },
        { lv: 25, skill: 'tianjian' }
      ]
    },
    lingxi: {
      id: 'lingxi',
      name: '蘇靈汐',
      courtesy: '棲霞聖女',
      title: '女媧遺脈',
      color: '#80deea',
      poem: '仙靈荷影映清波，霧魂宿命奈情何。\n願化甘霖澤萬物，不悔紅塵淚婆娑。',
      bio: '隱居棲霞仙島水月宮的女媧族旁支聖女，外柔內剛、慈悲澄澈。體內封印著九泉「霧魂」半道清氣，精通五靈仙術與雙劍連擊。',
      initLevel: 2,
      baseStats: { maxHp: 148, maxMp: 145, atk: 24, mag: 42, def: 20, spd: 25, lck: 26 },
      growth: { maxHp: 28, maxMp: 26, atk: 5, mag: 9, def: 4, spd: 4, lck: 3 },
      initEquip: {
        head: 'cuiyuchai',
        cloak: 'hujian',
        body: 'tengjia',
        weapon: 'shuanglongjian',
        foot: 'caoxie',
        relic: null
      },
      initSkills: ['guanyinzhou', 'yanzhou', 'bingzhou', 'jingyizhou'],
      levelSkills: [
        { lv: 4, skill: 'leizhou' },
        { lv: 6, skill: 'fengzhou' },
        { lv: 9, skill: 'zhenyuanhuti' },
        { lv: 11, skill: 'huanhunzhou' },
        { lv: 13, skill: 'sanmeizhenhuo' },
        { lv: 16, skill: 'wuleizhou' },
        { lv: 19, skill: 'wuqichaoyuan' },
        { lv: 22, skill: 'taishanyading' },
        { lv: 25, skill: 'fengxuebingtian' },
        { lv: 28, skill: 'mengshe' }
      ]
    },
    yueling: {
      id: 'yueling',
      name: '沈月綾',
      courtesy: '驚鴻千金',
      title: '紅綾女俠',
      color: '#ff8a80',
      poem: '刁蠻少女貴千金，比武擂台動芳心。\n盼能偕老江湖路，紅綾無悔伴君行。',
      bio: '姑蘇城「驚鴻山莊」獨生千金，颯爽傲嬌、嘴硬心軟。擅使長鞭橫掃群敵與家傳剛猛劍指，一旦認定情義便生死相隨。',
      initLevel: 5,
      baseStats: { maxHp: 275, maxMp: 135, atk: 58, mag: 36, def: 38, spd: 42, lck: 25 },
      growth: { maxHp: 36, maxMp: 16, atk: 8, mag: 5, def: 5, spd: 5, lck: 3 },
      initEquip: {
        head: 'cuiyuchai',
        cloak: 'yufengpifeng',
        body: 'tengjia',
        weapon: 'honglingbian',
        foot: 'jifengxue',
        relic: 'huxinjing'
      },
      initSkills: ['qijianzhi', 'ningshenguiyuan'],
      levelSkills: [
        { lv: 8, skill: 'yiyangzhi' },
        { lv: 12, skill: 'qijuejianqi' },
        { lv: 18, skill: 'qiankunyizhi' },
        { lv: 23, skill: 'zhanlongjue' }
      ]
    },
    aman: {
      id: 'aman',
      name: '藍阿蠻',
      courtesy: '巫月少主',
      title: '妙蠱銀鈴',
      color: '#ffd54f',
      poem: '如花苗女鬼精靈，喜逢君子初嚐情。\n落花有意隨流水，銀鈴巧煉萬蠱鳴。',
      bio: '南詔大理白苗巫月神教少主、聖姑親傳弟子。古靈精怪、天真爛漫，隨身攜帶「煉蠱皿」，擅長苗疆奇蠱與炎風大法。',
      initLevel: 15,
      baseStats: { maxHp: 560, maxMp: 430, atk: 112, mag: 158, def: 96, spd: 108, lck: 85 },
      growth: { maxHp: 30, maxMp: 24, atk: 6, mag: 8, def: 5, spd: 5, lck: 5 },
      initEquip: {
        head: 'cuiyuchai',
        cloak: 'yufengpifeng',
        body: 'jinlvyi',
        weapon: 'miaoyindao',
        foot: 'jifengxue',
        relic: 'yufozhu'
      },
      initSkills: ['yufengshu', 'lingxuezhou', 'wanyishixiang', 'guijiang'],
      levelSkills: [
        { lv: 18, skill: 'lianyuzhenhuo' },
        { lv: 22, skill: 'fengjuancanyun' },
        { lv: 25, skill: 'qiankunyizhi' }
      ]
    }
  };

  function expForNextLevel(lv) {
    return Math.floor(45 * Math.pow(lv, 1.55) + 35 * lv);
  }

  // === 敵人與首領資料庫 (24+ Enemies & 8 Iconic Bosses) ===
  const ENEMIES = {
    // 第一章：棲霞仙島
    caoyao: {
      id: 'caoyao', name: '曼陀草妖', sprite: 'plant', elem: 'wind',
      hp: 85, mp: 30, atk: 24, mag: 18, def: 10, spd: 18, exp: 26, gold: 32,
      stealItem: 'zhixuecao', stealGold: 25, dropItem: 'zhixuecao', dropRate: 0.35,
      skills: [{ id: 'thorn', name: '飛葉割', power: 34, elem: 'wind', rate: 0.3 }]
    },
    bishuichan: {
      id: 'bishuichan', name: '碧水毒蟾', sprite: 'toad', elem: 'water',
      hp: 105, mp: 40, atk: 27, mag: 22, def: 13, spd: 16, exp: 32, gold: 40,
      stealItem: 'chixuecan', stealGold: 30, dropItem: 'shuerguo', dropRate: 0.35,
      skills: [{ id: 'venom', name: '毒泡噴射', power: 32, elem: 'poison', inflict: 'chidu', rate: 0.35 }]
    },
    fengchaoyao: {
      id: 'fengchaoyao', name: '虎頭蜂妖', sprite: 'bee', elem: 'wind',
      hp: 92, mp: 35, atk: 30, mag: 20, def: 9, spd: 28, exp: 30, gold: 36,
      stealItem: 'yinlufeng', stealGold: 28, dropItem: 'meihuabiao', dropRate: 0.25,
      skills: [{ id: 'sting', name: '毒針突刺', power: 38, elem: 'poison', inflict: 'chidu', rate: 0.3 }]
    },
    boss_chigui: {
      id: 'boss_chigui', name: '赤鬼統領', isBoss: true, sprite: 'boss_chigui', elem: 'fire',
      hp: 540, mp: 180, atk: 54, mag: 46, def: 24, spd: 26, exp: 210, gold: 380,
      stealItem: 'xuelinglong', stealGold: 150, dropItem: 'yinxingzi', dropRate: 1.0,
      skills: [
        { id: 'bloodwave', name: '赤炎血浪', power: 62, elem: 'fire', all: true, rate: 0.38 },
        { id: 'claw', name: '裂石鬼爪', power: 76, elem: 'none', rate: 0.32 }
      ]
    },

    // 第二章：姑蘇擂台 & 隱霧蛇窟
    boss_yueling: {
      id: 'boss_yueling', name: '沈月綾', isBoss: true, sprite: 'boss_yueling', elem: 'thunder',
      hp: 440, mp: 140, atk: 52, mag: 38, def: 25, spd: 34, exp: 190, gold: 300,
      stealItem: 'guihuajiu', stealGold: 120, dropItem: 'xingjundan', dropRate: 1.0,
      skills: [
        { id: 'whip', name: '驚鴻掠影鞭', power: 58, elem: 'none', rate: 0.4 },
        { id: 'qijianzhi', name: '氣劍指', power: 68, elem: 'sword', rate: 0.3 }
      ]
    },
    fushejing: {
      id: 'fushejing', name: '赤練蛇精', sprite: 'snake', elem: 'earth',
      hp: 210, mp: 60, atk: 54, mag: 38, def: 26, spd: 32, exp: 68, gold: 78,
      stealItem: 'dulongsha', stealGold: 45, dropItem: 'xingjundan', dropRate: 0.35,
      skills: [{ id: 'bite', name: '毒牙噬咬', power: 58, elem: 'poison', inflict: 'chidu', rate: 0.35 }]
    },
    huyaonv: {
      id: 'huyaonv', name: '幻音狐女', sprite: 'fox', elem: 'wind',
      hp: 195, mp: 90, atk: 46, mag: 56, def: 22, spd: 40, exp: 74, gold: 88,
      stealItem: 'huanshendan', stealGold: 55, dropItem: 'huanshendan', dropRate: 0.3,
      skills: [{ id: 'charm', name: '迷魂風刃', power: 52, elem: 'wind', all: true, rate: 0.4 }]
    },
    yanshijia: {
      id: 'yanshijia', name: '鐘乳石魔', sprite: 'golem', elem: 'earth',
      hp: 280, mp: 40, atk: 64, mag: 25, def: 44, spd: 18, exp: 82, gold: 95,
      stealItem: 'xiulijian', stealGold: 60, dropItem: 'jinchuangyao', dropRate: 0.25,
      skills: [{ id: 'quake', name: '落石震擊', power: 72, elem: 'earth', rate: 0.35 }]
    },
    boss_shejun: {
      id: 'boss_shejun', name: '金鱗蛇君', isBoss: true, sprite: 'boss_shejun', elem: 'earth',
      hp: 960, mp: 260, atk: 88, mag: 72, def: 46, spd: 38, exp: 380, gold: 520,
      stealItem: 'xuehama', stealGold: 220, dropItem: 'jinshebian', dropRate: 1.0,
      skills: [
        { id: 'sandstorm', name: '狂沙毒霧', power: 82, elem: 'earth', all: true, inflict: 'chidu', rate: 0.4 },
        { id: 'tail', name: '金鱗擺尾', power: 105, elem: 'none', rate: 0.35 }
      ]
    },
    boss_yinhu: {
      id: 'boss_yinhu', name: '銀狐夫人', isBoss: true, sprite: 'boss_yinhu', elem: 'wind',
      hp: 720, mp: 300, atk: 68, mag: 86, def: 34, spd: 48, exp: 320, gold: 460,
      stealItem: 'yuputi', stealGold: 180, dropItem: 'shenxiancha', dropRate: 1.0,
      skills: [
        { id: 'foxfire', name: '青丘妖風', power: 78, elem: 'wind', all: true, rate: 0.42 },
        { id: 'stun', name: '攝魂媚影', power: 65, elem: 'thunder', inflict: 'stun', rate: 0.28 }
      ]
    },

    // 第三章：鎮妖古塔
    tongren: {
      id: 'tongren', name: '巡塔機關衛', sprite: 'golem', elem: 'thunder',
      hp: 420, mp: 80, atk: 96, mag: 68, def: 68, spd: 36, exp: 145, gold: 140,
      stealItem: 'leihuozhu', stealGold: 90, dropItem: 'jinchuangyao', dropRate: 0.35,
      skills: [{ id: 'arc', name: '雷樞電擊', power: 96, elem: 'thunder', rate: 0.38 }]
    },
    feijiang: {
      id: 'feijiang', name: '紫翼飛僵', sprite: 'ghost', elem: 'poison',
      hp: 390, mp: 110, atk: 102, mag: 78, def: 52, spd: 50, exp: 155, gold: 135,
      stealItem: 'huashishui', stealGold: 85, dropItem: 'huashishui', dropRate: 0.4,
      skills: [{ id: 'corpse', name: '屍瘴鬼爪', power: 92, elem: 'poison', inflict: 'zhangdu', rate: 0.4 }]
    },
    huayao: {
      id: 'huayao', name: '古卷畫妖', sprite: 'fox', elem: 'water',
      hp: 360, mp: 180, atk: 78, mag: 108, def: 46, spd: 56, exp: 160, gold: 155,
      stealItem: 'longxiancao', stealGold: 110, dropItem: 'longxiancao', dropRate: 0.35,
      skills: [{ id: 'frost', name: '墨染玄冰', power: 88, elem: 'water', all: true, rate: 0.45 }]
    },
    boss_mingwang: {
      id: 'boss_mingwang', name: '鎮獄明王', isBoss: true, sprite: 'boss_mingwang', elem: 'thunder',
      hp: 2450, mp: 600, atk: 142, mag: 135, def: 82, spd: 58, exp: 920, gold: 1350,
      stealItem: 'jincanwang', stealGold: 400, dropItem: 'nuwashi', dropRate: 1.0,
      skills: [
        { id: 'thunderjudgment', name: '九幽狂雷獄', power: 138, elem: 'thunder', all: true, rate: 0.42 },
        { id: 'chain', name: '鎖妖縛魂鏈', power: 152, elem: 'none', inflict: 'stun', rate: 0.3 }
      ]
    },

    // 第四章：神木林 & 火麟洞
    mudaoren: {
      id: 'mudaoren', name: '千年樹妖', sprite: 'plant', elem: 'earth',
      hp: 650, mp: 180, atk: 138, mag: 118, def: 88, spd: 58, exp: 260, gold: 210,
      stealItem: 'guluan', stealGold: 130, dropItem: 'panguo', dropRate: 0.3,
      skills: [{ id: 'vines', name: '萬藤絞殺', power: 122, elem: 'earth', all: true, rate: 0.4 }]
    },
    wuduxie: {
      id: 'wuduxie', name: '赤甲毒蠍王', sprite: 'bee', elem: 'poison',
      hp: 610, mp: 150, atk: 148, mag: 120, def: 84, spd: 72, exp: 275, gold: 225,
      stealItem: 'wuyingdu', stealGold: 140, dropItem: 'guluan', dropRate: 0.45,
      skills: [{ id: 'tailsting', name: '斷腸蠍尾', power: 145, elem: 'poison', inflict: 'zhangdu', rate: 0.42 }]
    },
    huolingshou: {
      id: 'huolingshou', name: '熔岩火靈', sprite: 'firebeast', elem: 'fire',
      hp: 680, mp: 240, atk: 142, mag: 152, def: 78, spd: 68, exp: 295, gold: 245,
      stealItem: 'leihuozhu', stealGold: 150, dropItem: 'shenxiancha', dropRate: 0.3,
      skills: [{ id: 'flare', name: '炎波噴湧', power: 135, elem: 'fire', all: true, rate: 0.45 }]
    },
    boss_huoqilin: {
      id: 'boss_huoqilin', name: '赤炎火麒麟', isBoss: true, sprite: 'boss_qilin', elem: 'fire',
      hp: 3900, mp: 900, atk: 195, mag: 190, def: 112, spd: 86, exp: 1650, gold: 2200,
      stealItem: 'tianxianglu', stealGold: 600, dropItem: 'baxianshi', dropRate: 1.0,
      skills: [
        { id: 'qilinfire', name: '麒麟焚天焰', power: 185, elem: 'fire', all: true, rate: 0.48 },
        { id: 'charge', name: '神獸裂空衝', power: 225, elem: 'fire', rate: 0.32 }
      ]
    },

    // 第五章：霧魂時之隙（十年前）
    shizhixie靈: {
      id: 'shizhixie靈', name: '霧魂時影', sprite: 'ghost', elem: 'wind',
      hp: 880, mp: 280, atk: 175, mag: 185, def: 105, spd: 96, exp: 420, gold: 310,
      stealItem: 'shenxiancha', stealGold: 180, dropItem: 'shenxiancha', dropRate: 0.35,
      skills: [{ id: 'chrono', name: '時隙風暴', power: 165, elem: 'wind', all: true, rate: 0.45 }]
    },
    mojieqishi: {
      id: 'mojieqishi', name: '九幽魔衛', sprite: 'golem', elem: 'thunder',
      hp: 980, mp: 220, atk: 198, mag: 165, def: 122, spd: 84, exp: 450, gold: 340,
      stealItem: 'xuelinglong', stealGold: 210, dropItem: 'zijinggao', dropRate: 0.28,
      skills: [{ id: 'darkblade', name: '魔雷斬', power: 190, elem: 'thunder', rate: 0.42 }]
    },
    boss_yexiao: {
      id: 'boss_yexiao', name: '魔界裂隙統領·夜梟', isBoss: true, sprite: 'boss_yexiao', elem: 'wind',
      hp: 4950, mp: 1100, atk: 235, mag: 230, def: 135, spd: 112, exp: 2400, gold: 3000,
      stealItem: 'shilianguo', stealGold: 800, dropItem: 'lingshanxianzhi', dropRate: 1.0,
      skills: [
        { id: 'voidstorm', name: '九幽裂空嵐', power: 215, elem: 'wind', all: true, rate: 0.46 },
        { id: 'darkseal', name: '魔梟奪魄擊', power: 255, elem: 'thunder', inflict: 'stun', rate: 0.3 }
      ]
    },

    // 終章：九泉深淵·拜月水魔祭壇
    baiyuejisi: {
      id: 'baiyuejisi', name: '拜月黑巫師', sprite: 'ghost', elem: 'poison',
      hp: 1120, mp: 400, atk: 195, mag: 225, def: 126, spd: 106, exp: 560, gold: 410,
      stealItem: 'zijinggao', stealGold: 250, dropItem: 'lingshanxianzhi', dropRate: 0.32,
      skills: [{ id: 'curse', name: '毒瘴滅魂咒', power: 195, elem: 'poison', all: true, inflict: 'zhangdu', rate: 0.48 }]
    },
    shuimofenshen: {
      id: 'shuimofenshen', name: '深淵水魔觸', sprite: 'toad', elem: 'water',
      hp: 1280, mp: 350, atk: 225, mag: 215, def: 138, spd: 98, exp: 600, gold: 440,
      stealItem: 'tianxianglu', stealGold: 260, dropItem: 'panguo', dropRate: 0.38,
      skills: [{ id: 'tsunami', name: '濁浪狂濤', power: 205, elem: 'water', all: true, rate: 0.45 }]
    },
    boss_youming: {
      id: 'boss_youming', name: '幽溟教主', isBoss: true, sprite: 'boss_youming', elem: 'earth',
      hp: 6400, mp: 1800, atk: 265, mag: 278, def: 158, spd: 122, exp: 3500, gold: 4500,
      stealItem: 'jincanwang', stealGold: 1000, dropItem: 'tianxianglu', dropRate: 1.0,
      skills: [
        { id: 'darkmoon', name: '拜月血海降', power: 245, elem: 'poison', all: true, inflict: 'zhangdu', rate: 0.45 },
        { id: 'earthcrush', name: '九泉崩滅印', power: 265, elem: 'earth', all: true, rate: 0.38 }
      ]
    },
    boss_shuimoshou: {
      id: 'boss_shuimoshou', name: '合體·渾沌水魔獸', isBoss: true, sprite: 'boss_shuimoshou', elem: 'water',
      hp: 9500, mp: 3000, atk: 305, mag: 315, def: 172, spd: 128, exp: 9999, gold: 9999,
      regenPerTurn: 280,
      stealItem: 'jincanwang', stealGold: 1500, dropItem: 'jincanwang', dropRate: 1.0,
      skills: [
        { id: 'flood', name: '滅世洪流·吞天', power: 275, elem: 'water', all: true, rate: 0.5 },
        { id: 'tentacle', name: '深淵萬觸絞', power: 320, elem: 'water', inflict: 'stun', rate: 0.3 },
        { id: 'miasma', name: '毒瘴海嘯', power: 255, elem: 'poison', all: true, inflict: 'zhangdu', rate: 0.2 }
      ]
    }
  };

  PalX.HERO_TEMPLATES = HERO_TEMPLATES;
  PalX.ENEMIES = ENEMIES;
  PalX.expForNextLevel = expForNextLevel;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      HERO_TEMPLATES,
      ENEMIES,
      expForNextLevel
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
