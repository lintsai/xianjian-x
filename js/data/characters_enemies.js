(function (root) {
  'use strict';

  const PalX = (root.PalX = root.PalX || {});

  const HERO_TEMPLATES = {
    luxiao: {
      id: 'luxiao',
      name: '裴少游',
      courtesy: '字鶴汀',
      title: '煙波少俠',
      color: '#4fc3f7',
      poem: '煙波一棹聽江雨，半枚殘鈴繫舊塵。\n未識天涯風雪惡，敢憑孤劍護斯人。',
      bio: '江南煙波鎮「聽雨渡」撐篙少年兼修傘匠，由老艄公裴爺爺撫養長大。腰懸十八年前江心拾獲的半枚青銅殘鈴與沉鐵舊劍，性情疏朗重義。偶遇瞎眼琴客謝滄海傳授「聽潮劍意」，自此踏入跨越十八載壬戌燼夜的江湖風波。',
      initLevel: 1,
      baseStats: { maxHp: 175, maxMp: 100, atk: 34, mag: 29, def: 23, spd: 27, lck: 29 },
      growth: { maxHp: 35, maxMp: 20, atk: 7, mag: 6, def: 5, spd: 4, lck: 3 },
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
      name: '白芷微',
      courtesy: '號聽雪醫女',
      title: '素娥司音',
      color: '#80deea',
      poem: '竹海聽雪拭素琴，一笛清音渡苦心。\n縱使寒霜侵鬢影，不教人間忘故人。',
      bio: '隱居棲雲竹海「聽雪藥廬」的年輕醫女，上古素娥氏最後傳人。外柔內剛、清雅澄澈，常以素心玉笛替百姓引渡吞噬記憶的「蝕憶燼毒」，卻默默承受寒霜反噬經脈之苦。擅使雙音短劍連擊與五曜靈音。',
      initLevel: 2,
      baseStats: { maxHp: 155, maxMp: 152, atk: 25, mag: 44, def: 21, spd: 26, lck: 27 },
      growth: { maxHp: 29, maxMp: 27, atk: 5, mag: 9, def: 4, spd: 4, lck: 3 },
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
      name: '燕驚鴻',
      courtesy: '號赤羽少主',
      title: '鎮遠少當家',
      color: '#ff8a80',
      poem: '赤羽長鞭破夜闌，孤撐危局劍光寒。\n莫言女子無肝膽，敢向蒼天討舊冤。',
      bio: '蜀中錦官城沒落名門「鎮遠鏢局」獨女、少總鏢頭。十八年前父親燕鐵衣押送封淵重鏢失蹤而背負罵名，她獨力撐起鏢局門楣，颯爽剛烈、重諾守義。擅使赤羽長鞭橫掃群敵與燕氏破陣指劍。',
      initLevel: 6,
      baseStats: { maxHp: 295, maxMp: 145, atk: 62, mag: 38, def: 40, spd: 44, lck: 26 },
      growth: { maxHp: 37, maxMp: 17, atk: 8, mag: 5, def: 5, spd: 5, lck: 3 },
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
      name: '雲珞',
      courtesy: '字阿螢',
      title: '百草司蟲女',
      color: '#ffd54f',
      poem: '雲夢澤深螢火明，百草鼎中煉奇靈。\n笑問人間何處去，竹歌一曲伴君行。',
      bio: '雲夢澤「百草懸空寨」靈蟲機關少女，辛夷藥婆得意傳人。古靈精怪、赤誠樂觀，隨身背著祖傳「百草丹鼎」，擅長驅使大澤流螢奇蟲與祝融地脈風火秘法。',
      initLevel: 15,
      baseStats: { maxHp: 580, maxMp: 445, atk: 115, mag: 162, def: 98, spd: 110, lck: 88 },
      growth: { maxHp: 31, maxMp: 25, atk: 6, mag: 8, def: 5, spd: 5, lck: 5 },
      initEquip: {
        head: 'cuiyuchai',
        cloak: 'mozhupifeng',
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
    return Math.floor(44 * Math.pow(lv, 1.54) + 34 * lv);
  }

  // === 九州妖物與首領資料庫 (34 Enemies & 13 Dramatic Bosses Across 16 Maps) ===
  const ENEMIES = {
    // 第一章：蘆花古渡 & 棲雲竹海
    caoyao: {
      id: 'caoyao', name: '蘆洲噬露草', sprite: 'plant', elem: 'wind',
      hp: 82, mp: 30, atk: 23, mag: 18, def: 10, spd: 18, exp: 26, gold: 32,
      stealItem: 'zhixuecao', stealGold: 25, dropItem: 'zhixuecao', dropRate: 0.38,
      skills: [{ id: 'thorn', name: '蘆葉飛刃', power: 33, elem: 'wind', rate: 0.3 }]
    },
    bishuichan: {
      id: 'bishuichan', name: '沉船墨毒蟾', sprite: 'toad', elem: 'water',
      hp: 102, mp: 40, atk: 26, mag: 22, def: 12, spd: 16, exp: 32, gold: 40,
      stealItem: 'chixuecan', stealGold: 30, dropItem: 'shuerguo', dropRate: 0.35,
      skills: [{ id: 'venom', name: '墨泡毒霧', power: 31, elem: 'poison', inflict: 'chidu', rate: 0.35 }]
    },
    luhuaxiejing: {
      id: 'luhuaxiejing', name: '江灘覆甲獸', sprite: 'marsh_beast', elem: 'water',
      hp: 125, mp: 35, atk: 30, mag: 20, def: 16, spd: 15, exp: 38, gold: 48,
      stealItem: 'xingjundan', stealGold: 35, dropItem: 'zhixuecao', dropRate: 0.35,
      skills: [{ id: 'waveclaw', name: '濁浪撲擊', power: 37, elem: 'water', rate: 0.32 }]
    },
    boss_fuzhou: {
      id: 'boss_fuzhou', name: '覆舟玄蛟', isBoss: true, sprite: 'ash_serpent', elem: 'water',
      hp: 360, mp: 120, atk: 42, mag: 36, def: 19, spd: 23, exp: 135, gold: 240,
      stealItem: 'huanshendan', stealGold: 95, dropItem: 'xingjundan', dropRate: 1.0,
      skills: [
        { id: 'riverwhirl', name: '江心捲浪', power: 48, elem: 'water', all: true, rate: 0.36 },
        { id: 'fang', name: '寒蛟噬骨', power: 58, elem: 'water', rate: 0.3 }
      ]
    },
    fengchaoyao: {
      id: 'fengchaoyao', name: '棲雲竹葉蜂', sprite: 'bee', elem: 'wind',
      hp: 96, mp: 35, atk: 31, mag: 22, def: 10, spd: 28, exp: 34, gold: 38,
      stealItem: 'yinlufeng', stealGold: 28, dropItem: 'meihuabiao', dropRate: 0.28,
      skills: [{ id: 'sting', name: '翠針突刺', power: 38, elem: 'poison', inflict: 'chidu', rate: 0.3 }]
    },
    zhuyingshe: {
      id: 'zhuyingshe', name: '翠竹青影蛇', sprite: 'snake', elem: 'wind',
      hp: 118, mp: 45, atk: 34, mag: 26, def: 14, spd: 27, exp: 42, gold: 46,
      stealItem: 'shuerguo', stealGold: 32, dropItem: 'chixuecan', dropRate: 0.32,
      skills: [{ id: 'bamboobite', name: '竹影掠牙', power: 42, elem: 'poison', inflict: 'chidu', rate: 0.32 }]
    },
    boss_chigui: {
      id: 'boss_chigui', name: '血刃堂主·屠千刃', isBoss: true, sprite: 'boss_chigui', elem: 'fire',
      hp: 580, mp: 190, atk: 55, mag: 46, def: 24, spd: 27, exp: 230, gold: 420,
      stealItem: 'xuelinglong', stealGold: 160, dropItem: 'yinxingzi', dropRate: 1.0,
      skills: [
        { id: 'bloodwave', name: '無生血焰斬', power: 62, elem: 'fire', all: true, rate: 0.38 },
        { id: 'claw', name: '裂竹狂刀', power: 76, elem: 'none', rate: 0.32 }
      ]
    },

    // 第二章：錦官鎮遠鏢局 & 鬼哭礦脈
    boss_yueling: {
      id: 'boss_yueling', name: '燕驚鴻', isBoss: true, sprite: 'boss_yueling', elem: 'thunder',
      hp: 460, mp: 150, atk: 54, mag: 38, def: 25, spd: 35, exp: 200, gold: 320,
      stealItem: 'shaodaozi', stealGold: 130, dropItem: 'xingjundan', dropRate: 1.0,
      skills: [
        { id: 'whip', name: '赤羽流星鞭', power: 58, elem: 'none', rate: 0.4 },
        { id: 'qijianzhi', name: '破風指劍', power: 68, elem: 'sword', rate: 0.3 }
      ]
    },
    heifenghan: {
      id: 'heifenghan', name: '黑風寨索債惡徒', sprite: 'golem', elem: 'earth',
      hp: 260, mp: 40, atk: 50, mag: 24, def: 24, spd: 24, exp: 85, gold: 120,
      stealItem: 'xingjundan', stealGold: 65, dropItem: 'meihuabiao', dropRate: 0.4,
      skills: [{ id: 'club', name: '開山重鎚', power: 56, elem: 'earth', rate: 0.35 }]
    },
    fushejing: {
      id: 'fushejing', name: '暗河金環蟒', sprite: 'snake', elem: 'earth',
      hp: 215, mp: 60, atk: 55, mag: 38, def: 26, spd: 32, exp: 72, gold: 82,
      stealItem: 'dulongsha', stealGold: 48, dropItem: 'xingjundan', dropRate: 0.35,
      skills: [{ id: 'bite', name: '蝕脈毒牙', power: 58, elem: 'poison', inflict: 'chidu', rate: 0.35 }]
    },
    huyaonv: {
      id: 'huyaonv', name: '攝魂幻燈妖', sprite: 'fox', elem: 'wind',
      hp: 200, mp: 95, atk: 47, mag: 58, def: 22, spd: 40, exp: 78, gold: 90,
      stealItem: 'huanshendan', stealGold: 55, dropItem: 'huanshendan', dropRate: 0.32,
      skills: [{ id: 'charm', name: '迷離燈火嵐', power: 54, elem: 'wind', all: true, rate: 0.4 }]
    },
    yanshijia: {
      id: 'yanshijia', name: '鬼哭礦石傀', sprite: 'golem', elem: 'earth',
      hp: 285, mp: 45, atk: 65, mag: 26, def: 45, spd: 19, exp: 88, gold: 98,
      stealItem: 'xiulijian', stealGold: 62, dropItem: 'jinchuangyao', dropRate: 0.28,
      skills: [{ id: 'quake', name: '崩岩重擊', power: 72, elem: 'earth', rate: 0.35 }]
    },
    kuangmaiyouhun: {
      id: 'kuangmaiyouhun', name: '蝕憶礦魂', sprite: 'ghost', elem: 'water',
      hp: 230, mp: 100, atk: 52, mag: 62, def: 28, spd: 36, exp: 84, gold: 92,
      stealItem: 'jiuyinsan', stealGold: 58, dropItem: 'huanshendan', dropRate: 0.3,
      skills: [{ id: 'ashwail', name: '忘憂寒嘯', power: 56, elem: 'water', all: true, rate: 0.38 }]
    },
    boss_shejun: {
      id: 'boss_shejun', name: '金鱗蟒尊', isBoss: true, sprite: 'boss_shejun', elem: 'earth',
      hp: 990, mp: 260, atk: 90, mag: 74, def: 46, spd: 39, exp: 410, gold: 560,
      stealItem: 'xuehama', stealGold: 230, dropItem: 'jinshebian', dropRate: 1.0,
      skills: [
        { id: 'sandstorm', name: '地脈狂沙霧', power: 84, elem: 'earth', all: true, inflict: 'chidu', rate: 0.4 },
        { id: 'tail', name: '金鱗裂岩尾', power: 106, elem: 'none', rate: 0.35 }
      ]
    },
    boss_yinhu: {
      id: 'boss_yinhu', name: '幻月青璃', isBoss: true, sprite: 'boss_yinhu', elem: 'wind',
      hp: 750, mp: 320, atk: 70, mag: 88, def: 35, spd: 49, exp: 350, gold: 480,
      stealItem: 'yuputi', stealGold: 190, dropItem: 'shenxiancha', dropRate: 1.0,
      skills: [
        { id: 'foxfire', name: '幻月迷離風', power: 80, elem: 'wind', all: true, rate: 0.42 },
        { id: 'stun', name: '奪憶媚音', power: 66, elem: 'thunder', inflict: 'stun', rate: 0.28 }
      ]
    },

    // 第三章：落霞山道 & 鎮魔劍獄
    yunlingying: {
      id: 'yunlingying', name: '落霞風隼精', sprite: 'bee', elem: 'wind',
      hp: 320, mp: 90, atk: 84, mag: 72, def: 42, spd: 58, exp: 120, gold: 118,
      stealItem: 'xiulijian', stealGold: 75, dropItem: 'jinchuangyao', dropRate: 0.32,
      skills: [{ id: 'galewing', name: '裂雲羽刃', power: 82, elem: 'wind', all: true, rate: 0.38 }]
    },
    shijiankui: {
      id: 'shijiankui', name: '試劍石甲衛', sprite: 'golem', elem: 'thunder',
      hp: 380, mp: 70, atk: 92, mag: 60, def: 62, spd: 34, exp: 135, gold: 130,
      stealItem: 'leihuozhu', stealGold: 85, dropItem: 'longxiancao', dropRate: 0.3,
      skills: [{ id: 'swordstone', name: '奔雷劍印', power: 88, elem: 'thunder', rate: 0.36 }]
    },
    boss_jiannu: {
      id: 'boss_jiannu', name: '妄劍棄徒·韓梟', isBoss: true, sprite: 'boss_liwujiu', elem: 'thunder',
      hp: 1450, mp: 360, atk: 118, mag: 102, def: 64, spd: 54, exp: 560, gold: 780,
      stealItem: 'hanxingjian', stealGold: 260, dropItem: 'yuputi', dropRate: 1.0,
      skills: [
        { id: 'madblade', name: '狂雷亂劍斬', power: 112, elem: 'thunder', all: true, rate: 0.4 },
        { id: 'pierce', name: '斷情穿心劍', power: 132, elem: 'sword', rate: 0.32 }
      ]
    },
    tongren: {
      id: 'tongren', name: '太微巡獄傀', sprite: 'golem', elem: 'thunder',
      hp: 430, mp: 85, atk: 98, mag: 70, def: 68, spd: 37, exp: 155, gold: 145,
      stealItem: 'leihuozhu', stealGold: 95, dropItem: 'jinchuangyao', dropRate: 0.35,
      skills: [{ id: 'arc', name: '七曜雷樞擊', power: 98, elem: 'thunder', rate: 0.38 }]
    },
    feijiang: {
      id: 'feijiang', name: '劍獄縛魂屍', sprite: 'ghost', elem: 'poison',
      hp: 400, mp: 115, atk: 104, mag: 80, def: 52, spd: 52, exp: 165, gold: 140,
      stealItem: 'huashishui', stealGold: 88, dropItem: 'huashishui', dropRate: 0.4,
      skills: [{ id: 'corpse', name: '寒煞怨爪', power: 94, elem: 'poison', inflict: 'zhangdu', rate: 0.4 }]
    },
    huayao: {
      id: 'huayao', name: '殘卷丹青妖', sprite: 'fox', elem: 'water',
      hp: 375, mp: 185, atk: 80, mag: 110, def: 46, spd: 58, exp: 170, gold: 160,
      stealItem: 'longxiancao', stealGold: 115, dropItem: 'longxiancao', dropRate: 0.35,
      skills: [{ id: 'frost', name: '水墨凝冰曲', power: 90, elem: 'water', all: true, rate: 0.45 }]
    },
    boss_mingwang: {
      id: 'boss_mingwang', name: '雷獄鎮魂將', isBoss: true, sprite: 'boss_mingwang', elem: 'thunder',
      hp: 2550, mp: 650, atk: 145, mag: 138, def: 84, spd: 60, exp: 980, gold: 1450,
      stealItem: 'jincanwang', stealGold: 420, dropItem: 'nuwashi', dropRate: 1.0,
      skills: [
        { id: 'thunderjudgment', name: '太微九霄雷獄', power: 140, elem: 'thunder', all: true, rate: 0.42 },
        { id: 'chain', name: '七曜鎖魂鏈', power: 155, elem: 'none', inflict: 'stun', rate: 0.3 }
      ]
    },

    // 第四章：迷霧瘴林 & 祝融地脈
    mudaoren: {
      id: 'mudaoren', name: '瘴林枯木精', sprite: 'plant', elem: 'earth',
      hp: 660, mp: 185, atk: 140, mag: 120, def: 88, spd: 58, exp: 270, gold: 215,
      stealItem: 'guluan', stealGold: 135, dropItem: 'panguo', dropRate: 0.32,
      skills: [{ id: 'vines', name: '毒藤絞殺陣', power: 124, elem: 'earth', all: true, rate: 0.4 }]
    },
    wuduxie: {
      id: 'wuduxie', name: '雲夢赤尾蜂王', sprite: 'bee', elem: 'poison',
      hp: 620, mp: 160, atk: 150, mag: 122, def: 84, spd: 74, exp: 285, gold: 230,
      stealItem: 'wuyingdu', stealGold: 145, dropItem: 'guluan', dropRate: 0.45,
      skills: [{ id: 'tailsting', name: '蝕脈毒針', power: 146, elem: 'poison', inflict: 'zhangdu', rate: 0.42 }]
    },
    zhaozejuwa: {
      id: 'zhaozejuwa', name: '腐沼吞雲獸', sprite: 'marsh_beast', elem: 'water',
      hp: 710, mp: 180, atk: 146, mag: 128, def: 92, spd: 62, exp: 295, gold: 240,
      stealItem: 'jiuyinsan', stealGold: 140, dropItem: 'shenxiancha', dropRate: 0.3,
      skills: [{ id: 'bogwave', name: '大澤瘴浪', power: 130, elem: 'water', all: true, inflict: 'chidu', rate: 0.4 }]
    },
    boss_fumuzun: {
      id: 'boss_fumuzun', name: '千年腐木毒尊', isBoss: true, sprite: 'boss_shejun', elem: 'earth',
      hp: 2950, mp: 700, atk: 172, mag: 168, def: 102, spd: 74, exp: 1250, gold: 1680,
      stealItem: 'yinxingzi', stealGold: 480, dropItem: 'zijinggao', dropRate: 1.0,
      skills: [
        { id: 'rootstorm', name: '萬古盤根破地', power: 162, elem: 'earth', all: true, rate: 0.44 },
        { id: 'spore', name: '蝕心瘴霧', power: 148, elem: 'poison', all: true, inflict: 'zhangdu', rate: 0.32 }
      ]
    },
    huolingshou: {
      id: 'huolingshou', name: '祝融炎靈獸', sprite: 'firebeast', elem: 'fire',
      hp: 695, mp: 245, atk: 146, mag: 155, def: 80, spd: 70, exp: 310, gold: 255,
      stealItem: 'leihuozhu', stealGold: 155, dropItem: 'shenxiancha', dropRate: 0.32,
      skills: [{ id: 'flare', name: '赤脈炎湧', power: 138, elem: 'fire', all: true, rate: 0.45 }]
    },
    rongyanshe: {
      id: 'rongyanshe', name: '赤脈火鱗蟒', sprite: 'ash_serpent', elem: 'fire',
      hp: 730, mp: 210, atk: 156, mag: 142, def: 86, spd: 72, exp: 320, gold: 265,
      stealItem: 'xuelinglong', stealGold: 165, dropItem: 'panguo', dropRate: 0.3,
      skills: [{ id: 'magmabite', name: '熔岩火牙', power: 155, elem: 'fire', rate: 0.42 }]
    },
    boss_huoqilin: {
      id: 'boss_huoqilin', name: '祝融炎麟獸', isBoss: true, sprite: 'boss_qilin', elem: 'fire',
      hp: 4100, mp: 950, atk: 198, mag: 194, def: 114, spd: 88, exp: 1750, gold: 2350,
      stealItem: 'tianxianglu', stealGold: 650, dropItem: 'baxianshi', dropRate: 1.0,
      skills: [
        { id: 'qilinfire', name: '祝融焚天焰', power: 188, elem: 'fire', all: true, rate: 0.48 },
        { id: 'charge', name: '炎麟裂空衝', power: 228, elem: 'fire', rate: 0.32 }
      ]
    },

    // 第五章：望舒古墟 & 舊歲煙波（十八年前）& 隱藏秘境問心劍塚
    shizhixie靈: {
      id: 'shizhixie靈', name: '歲月殘影', sprite: 'ghost', elem: 'wind',
      hp: 900, mp: 290, atk: 178, mag: 188, def: 106, spd: 98, exp: 440, gold: 325,
      stealItem: 'shenxiancha', stealGold: 185, dropItem: 'shenxiancha', dropRate: 0.35,
      skills: [{ id: 'chrono', name: '迴廊時嵐', power: 168, elem: 'wind', all: true, rate: 0.45 }]
    },
    mojieqishi: {
      id: 'mojieqishi', name: '燼夜魔甲衛', sprite: 'golem', elem: 'thunder',
      hp: 1010, mp: 230, atk: 202, mag: 168, def: 124, spd: 86, exp: 470, gold: 350,
      stealItem: 'xuelinglong', stealGold: 220, dropItem: 'zijinggao', dropRate: 0.3,
      skills: [{ id: 'darkblade', name: '蝕月雷斬', power: 192, elem: 'thunder', rate: 0.42 }]
    },
    boss_yexiao: {
      id: 'boss_yexiao', name: '夜溟魔君·玄燭', isBoss: true, sprite: 'boss_yexiao', elem: 'wind',
      hp: 5100, mp: 1200, atk: 238, mag: 234, def: 136, spd: 114, exp: 2550, gold: 3200,
      stealItem: 'shilianguo', stealGold: 850, dropItem: 'lingshanxianzhi', dropRate: 1.0,
      skills: [
        { id: 'voidstorm', name: '壬戌燼夜嵐', power: 218, elem: 'wind', all: true, rate: 0.46 },
        { id: 'darkseal', name: '玄燭奪魄擊', power: 258, elem: 'thunder', inflict: 'stun', rate: 0.3 }
      ]
    },
    jianzhonghun: {
      id: 'jianzhonghun', name: '古塚殘劍魄', sprite: 'ghost', elem: 'sword',
      hp: 1080, mp: 340, atk: 215, mag: 205, def: 120, spd: 108, exp: 540, gold: 390,
      stealItem: 'lingshanxianzhi', stealGold: 240, dropItem: 'zijinggao', dropRate: 0.35,
      skills: [{ id: 'phantomblade', name: '萬古殘劍雨', power: 195, elem: 'sword', all: true, rate: 0.46 }]
    },
    taia_wei: {
      id: 'taia_wei', name: '鑄天護劍傀', sprite: 'golem', elem: 'earth',
      hp: 1220, mp: 260, atk: 228, mag: 175, def: 142, spd: 92, exp: 580, gold: 420,
      stealItem: 'nuwashi', stealGold: 260, dropItem: 'tianxianglu', dropRate: 0.28,
      skills: [{ id: 'anvilsmash', name: '鑄天震岳鎚', power: 212, elem: 'earth', rate: 0.44 }]
    },
    boss_swordspirit: {
      id: 'boss_swordspirit', name: '問心劍靈·太阿殘魂', isBoss: true, sprite: 'boss_swordspirit', elem: 'sword',
      hp: 7800, mp: 2400, atk: 285, mag: 290, def: 162, spd: 126, exp: 5200, gold: 6800,
      regenPerTurn: 180,
      stealItem: 'jincanwang', stealGold: 1200, dropItem: 'jincanwang', dropRate: 1.0,
      skills: [
        { id: 'taiasword', name: '太阿開天萬劍陣', power: 255, elem: 'sword', all: true, rate: 0.5 },
        { id: 'heartask', name: '一劍問初心', power: 295, elem: 'holy', rate: 0.35 }
      ]
    },

    // 第六章：歸墟沉淵 & 望舒天闕
    baiyuejisi: {
      id: 'baiyuejisi', name: '無生玄衣祭司', sprite: 'ghost', elem: 'poison',
      hp: 1150, mp: 420, atk: 198, mag: 228, def: 128, spd: 108, exp: 580, gold: 430,
      stealItem: 'zijinggao', stealGold: 255, dropItem: 'lingshanxianzhi', dropRate: 0.34,
      skills: [{ id: 'curse', name: '無生滅憶咒', power: 198, elem: 'poison', all: true, inflict: 'zhangdu', rate: 0.48 }]
    },
    shuimofenshen: {
      id: 'shuimofenshen', name: '歸墟蝕月觸', sprite: 'toad', elem: 'water',
      hp: 1310, mp: 360, atk: 228, mag: 218, def: 140, spd: 100, exp: 620, gold: 460,
      stealItem: 'tianxianglu', stealGold: 270, dropItem: 'panguo', dropRate: 0.38,
      skills: [{ id: 'tsunami', name: '溟海狂濤', power: 208, elem: 'water', all: true, rate: 0.45 }]
    },
    guixuyanshou: {
      id: 'guixuyanshou', name: '沉淵鎮界獸', sprite: 'marsh_beast', elem: 'earth',
      hp: 1380, mp: 320, atk: 238, mag: 205, def: 148, spd: 96, exp: 650, gold: 480,
      stealItem: 'xuehama', stealGold: 280, dropItem: 'zijinggao', dropRate: 0.35,
      skills: [{ id: 'abyssquake', name: '沉淵裂地嘯', power: 215, elem: 'earth', all: true, rate: 0.44 }]
    },
    boss_youming: {
      id: 'boss_youming', name: '執劍首座·厲無咎', isBoss: true, sprite: 'boss_liwujiu', elem: 'thunder',
      hp: 6600, mp: 1900, atk: 268, mag: 282, def: 160, spd: 124, exp: 3800, gold: 4800,
      stealItem: 'jincanwang', stealGold: 1000, dropItem: 'tianxianglu', dropRate: 1.0,
      skills: [
        { id: 'darkmoon', name: '太上忘情滅劍陣', power: 248, elem: 'thunder', all: true, rate: 0.45 },
        { id: 'earthcrush', name: '無生斷憶印', power: 268, elem: 'poison', all: true, inflict: 'zhangdu', rate: 0.38 }
      ]
    },
    boss_shuimoshou: {
      id: 'boss_shuimoshou', name: '太古蝕月巨獸', isBoss: true, sprite: 'boss_shuimoshou', elem: 'water',
      hp: 9800, mp: 3200, atk: 308, mag: 318, def: 174, spd: 128, exp: 9999, gold: 9999,
      regenPerTurn: 280,
      stealItem: 'jincanwang', stealGold: 1600, dropItem: 'jincanwang', dropRate: 1.0,
      skills: [
        { id: 'flood', name: '歸墟蝕月·吞天潮', power: 278, elem: 'water', all: true, rate: 0.5 },
        { id: 'tentacle', name: '溟海萬觸絞', power: 322, elem: 'water', inflict: 'stun', rate: 0.3 },
        { id: 'miasma', name: '永寂銀燼嘯', power: 258, elem: 'poison', all: true, inflict: 'zhangdu', rate: 0.2 }
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
