(function (root) {
  'use strict';

  const PalX = (root.PalX = root.PalX || {});

  const ELEMENTS = {
    none: { id: 'none', name: '無', color: '#d8d0c0' },
    water: { id: 'water', name: '水', color: '#4fc3f7', counters: 'fire', weakTo: 'earth' },
    fire: { id: 'fire', name: '火', color: '#ff7043', counters: 'thunder', weakTo: 'water' },
    thunder: { id: 'thunder', name: '雷', color: '#ce93d8', counters: 'wind', weakTo: 'fire' },
    wind: { id: 'wind', name: '風', color: '#80cbc4', counters: 'earth', weakTo: 'thunder' },
    earth: { id: 'earth', name: '土', color: '#d4a359', counters: 'water', weakTo: 'wind' },
    sword: { id: 'sword', name: '劍', color: '#90caf9' },
    poison: { id: 'poison', name: '蠱', color: '#9ccc65' },
    holy: { id: 'holy', name: '聖', color: '#ffe082' }
  };

  function getElementMultiplier(attackElem, targetElem) {
    if (!attackElem || !targetElem || attackElem === 'none' || targetElem === 'none') return 1.0;
    if (attackElem === 'holy') return 1.25;
    const info = ELEMENTS[attackElem];
    if (!info) return 1.0;
    if (info.counters === targetElem) return 1.5;
    if (info.weakTo === targetElem) return 0.68;
    if (attackElem === targetElem) return 0.55;
    return 1.0;
  }

  const EQUIP_SLOTS = [
    { id: 'head', name: '頭戴' },
    { id: 'cloak', name: '披掛' },
    { id: 'body', name: '身穿' },
    { id: 'weapon', name: '手持' },
    { id: 'foot', name: '足穿' },
    { id: 'relic', name: '配戴' }
  ];

  const ITEMS = {
    // === 恢復仙藥 (Medicines) ===
    zhixuecao: {
      id: 'zhixuecao', name: '止血草', category: 'medicine', tier: 1, price: 30,
      target: 'ally', usableInField: true, hp: 75,
      desc: '尋常山野草藥，可恢復單人 75 點體力。'
    },
    xingjundan: {
      id: 'xingjundan', name: '行軍丹', category: 'medicine', tier: 2, price: 85,
      target: 'ally', usableInField: true, hp: 180,
      desc: '江湖俠客常備良藥，恢復單人 180 點體力。'
    },
    jinchuangyao: {
      id: 'jinchuangyao', name: '金創藥', category: 'medicine', tier: 3, price: 210,
      target: 'ally', usableInField: true, hp: 420,
      desc: '上等刀傷聖藥，恢復單人 420 點體力。'
    },
    panguo: {
      id: 'panguo', name: '蟠果', category: 'medicine', tier: 4, price: 460,
      target: 'ally', usableInField: true, hp: 850,
      desc: '蜀山仙果，恢復單人 850 點體力。'
    },
    zijinggao: {
      id: 'zijinggao', name: '紫菁玉蓉膏', category: 'medicine', tier: 5, price: 900,
      target: 'allAllies', usableInField: true, hp: 600,
      desc: '宮廷秘傳玉膏，恢復我方全體 600 點體力。'
    },
    shuerguo: {
      id: 'shuerguo', name: '鼠兒果', category: 'medicine', tier: 1, price: 45,
      target: 'ally', usableInField: true, mp: 45,
      desc: '林間甘甜野果，恢復單人 45 點真氣。'
    },
    huanshendan: {
      id: 'huanshendan', name: '還神丹', category: 'medicine', tier: 2, price: 130,
      target: 'ally', usableInField: true, mp: 110,
      desc: '凝神聚氣丹藥，恢復單人 110 點真氣。'
    },
    longxiancao: {
      id: 'longxiancao', name: '龍涎草', category: 'medicine', tier: 3, price: 290,
      target: 'ally', usableInField: true, mp: 240,
      desc: '深谷靈草，恢復單人 240 點真氣。'
    },
    shenxiancha: {
      id: 'shenxiancha', name: '神仙茶', category: 'medicine', tier: 4, price: 560,
      target: 'ally', usableInField: true, hp: 450, mp: 260,
      desc: '清香沁脾的仙茗，同時恢復 450 體力與 260 真氣。'
    },
    lingshanxianzhi: {
      id: 'lingshanxianzhi', name: '靈山仙芝', category: 'medicine', tier: 5, price: 980,
      target: 'allAllies', usableInField: true, hp: 500, mp: 300,
      desc: '千年瑞芝，恢復我方全體 500 體力與 300 真氣。'
    },
    chixuecan: {
      id: 'chixuecan', name: '赤血蠶', category: 'medicine', tier: 2, price: 70,
      target: 'ally', usableInField: true, hp: 60, curePoison: true, cureStatus: true,
      desc: '以毒攻毒的靈蠶，解除一切中毒與異常狀態並小補體力。'
    },
    jiuyinsan: {
      id: 'jiuyinsan', name: '九陰散', category: 'medicine', tier: 3, price: 150,
      target: 'allAllies', usableInField: true, curePoison: true, cureStatus: true,
      desc: '清涼解毒奇散，解除我方全體中毒、定身、瘋魔與昏睡。'
    },
    huanhunxiang: {
      id: 'huanhunxiang', name: '還魂香', category: 'medicine', tier: 3, price: 280,
      target: 'deadAlly', usableInField: true, revive: true, hpPct: 0.4,
      desc: '引魂返魄奇香，使昏厥陣亡同伴甦醒並恢復四成體力。'
    },
    tianxianglu: {
      id: 'tianxianglu', name: '天香續命露', category: 'medicine', tier: 5, price: 1200,
      target: 'anyAlly', usableInField: true, revive: true, hpPct: 1.0, mpPct: 0.5, curePoison: true,
      desc: '仙家救命聖露，可復活陣亡者並回滿體力、恢復五成真氣！'
    },
    guihuajiu: {
      id: 'guihuajiu', name: '桂花酒', category: 'medicine', tier: 2, price: 95,
      isWine: true, target: 'ally', usableInField: false, buff: { id: 'tiangang', turns: 3 }, hp: 50,
      desc: '江南醇香佳釀。飲用後三回合武術大增；亦是施展絕技【酒神】必需之酒！'
    },
    shaodaozi: {
      id: 'shaodaozi', name: '燒刀子', category: 'medicine', tier: 3, price: 180,
      isWine: true, target: 'ally', usableInField: false, buff: { id: 'tiangang', turns: 4 }, hp: 100,
      desc: '辛辣剛猛烈酒。飲用後四回合武術大增；亦可供【酒神】消耗！'
    },
    yinlufeng: {
      id: 'yinlufeng', name: '引路蜂', category: 'medicine', tier: 2, price: 100,
      target: 'self', usableInField: true, escapeMaze: true,
      desc: '識途靈蜂，在迷宮中使用可瞬間飛回迷宮入口處。'
    },

    // === 修行靈果 (Permanent Stat Elixirs — 仙劍1經典靈果) ===
    yinxingzi: {
      id: 'yinxingzi', name: '銀杏子', category: 'elixir', tier: 4, price: 650,
      target: 'ally', usableInField: true, permStat: { maxHp: 22 },
      desc: '千年古樹靈果，服用後永久提升體力上限 +22。'
    },
    yuputi: {
      id: 'yuputi', name: '玉菩提', category: 'elixir', tier: 4, price: 680,
      target: 'ally', usableInField: true, permStat: { maxMp: 18 },
      desc: '佛門清淨靈實，服用後永久提升真氣上限 +18。'
    },
    xuehama: {
      id: 'xuehama', name: '雪蛤蟆', category: 'elixir', tier: 4, price: 750,
      target: 'ally', usableInField: true, permStat: { atk: 6 },
      desc: '寒潭奇珍，服用後永久提升武術 +6。'
    },
    shilianguo: {
      id: 'shilianguo', name: '試煉果', category: 'elixir', tier: 4, price: 750,
      target: 'ally', usableInField: true, permStat: { mag: 6 },
      desc: '女媧試煉秘果，服用後永久提升靈力 +6。'
    },
    nuwashi: {
      id: 'nuwashi', name: '女媧石', category: 'elixir', tier: 4, price: 750,
      target: 'ally', usableInField: true, permStat: { def: 6 },
      desc: '五彩補天遺石，服用後永久提升防禦 +6。'
    },
    baxianshi: {
      id: 'baxianshi', name: '八仙石', category: 'elixir', tier: 4, price: 780,
      target: 'ally', usableInField: true, permStat: { spd: 5, lck: 6 },
      desc: '蘊含仙家氣運之奇石，永久提升身法 +5、吉運 +6。'
    },
    jincanwang: {
      id: 'jincanwang', name: '金蠶王', category: 'elixir', tier: 6, price: 2400,
      target: 'ally', usableInField: true, levelUp: 1,
      desc: '萬蠱之尊！服用後修行等級直接提升 1 級，全屬性成長並領悟對應仙術！'
    },

    // === 暗器、毒物與奇蠱 (Throwables & Tactical Gu) ===
    meihuabiao: {
      id: 'meihuabiao', name: '梅花鏢', category: 'throw', tier: 1, price: 65,
      target: 'enemy', throwDmg: 120, elem: 'none',
      desc: '精鐵暗器，投擲對單一敵人造成 120 點無視防禦傷害。'
    },
    xiulijian: {
      id: 'xiulijian', name: '袖裡劍', category: 'throw', tier: 2, price: 150,
      target: 'enemy', throwDmg: 260, elem: 'sword',
      desc: '藏於袖中之短劍，投擲對單一敵人造成 260 點銳利傷害。'
    },
    leihuozhu: {
      id: 'leihuozhu', name: '雷火珠', category: 'throw', tier: 3, price: 320,
      target: 'allEnemies', throwDmg: 340, elem: 'fire',
      desc: '霹靂堂秘製火器，投擲炸裂對敵全體造成 340 點火系爆破傷害！'
    },
    dulongsha: {
      id: 'dulongsha', name: '赤蠍毒砂', category: 'throw', tier: 2, price: 160,
      target: 'allEnemies', throwDmg: 150, elem: 'poison', inflict: 'chidu',
      desc: '苗疆赤蠍研磨之毒砂，投擲損傷敵全體並使其染上【赤毒】。'
    },
    wuyingdu: {
      id: 'wuyingdu', name: '無影毒', category: 'throw', tier: 4, price: 520,
      target: 'enemy', throwDmg: 480, elem: 'poison', inflict: 'zhangdu',
      desc: '無色無味劇毒，投擲重創單體並附加每回合劇烈扣血之【瘴毒】！'
    },
    xuelinglong: {
      id: 'xuelinglong', name: '血玲瓏', category: 'throw', tier: 5, price: 780,
      target: 'allEnemies', throwDmg: 680, elem: 'none',
      desc: '赤鬼秘寶，投擲迸發漫天血芒，對敵全體造成 680 點無視防禦重創！'
    },
    huashishui: {
      id: 'huashishui', name: '化屍水', category: 'throw', tier: 3, price: 260,
      target: 'enemy', throwDmg: 310, elem: 'poison',
      desc: '極陰腐蝕毒水，可投擲傷敵，更是【煉蠱皿】煉製隱蠱的關鍵藥引！'
    },
    guluan: {
      id: 'guluan', name: '五毒蠱卵', category: 'throw', tier: 2, price: 120,
      target: 'enemy', throwDmg: 140, elem: 'poison', inflict: 'chidu',
      desc: '尚未孵化的苗疆蟲卵，投入【煉蠱皿】與靈藥合煉常有奇效。'
    },
    yingu: {
      id: 'yingu', name: '隱蠱', category: 'medicine', tier: 5, price: 1100,
      target: 'allAllies', usableInField: false, buff: { id: 'stealth', turns: 3 },
      desc: '仙劍傳奇奇蠱！戰鬥中使用令我方全體隱身 3 回合，免疫一切敵方攻擊！'
    },

    // === 六部位裝備 — 手持武器 (Weapons) ===
    mujian: {
      id: 'mujian', name: '家傳木劍', category: 'equip', slot: 'weapon', price: 20,
      who: ['luxiao'], stats: { atk: 7, lck: 3 }, throwDmg: 90,
      desc: '陸逍自幼把玩的桃木劍，劍柄刻著模糊的「逍」字，似乎藏著十年前的秘密。'
    },
    tiejian: {
      id: 'tiejian', name: '精鐵長劍', category: 'equip', slot: 'weapon', price: 160,
      who: ['luxiao', 'yueling'], stats: { atk: 19 }, throwDmg: 220,
      desc: '渡口鐵匠鍛打的鋼劍，鋒刃堅實。亦可於戰鬥中直接投擲傷敵。'
    },
    qingfengjian: {
      id: 'qingfengjian', name: '青鋒寶劍', category: 'equip', slot: 'weapon', price: 420,
      who: ['luxiao', 'yueling'], stats: { atk: 36, spd: 5 }, throwDmg: 420,
      desc: '劍身輕盈如秋水，出劍迅捷。'
    },
    qixingjian: {
      id: 'qixingjian', name: '七星磐龍劍', category: 'equip', slot: 'weapon', price: 1100,
      who: ['luxiao'], stats: { atk: 68, mag: 18, lck: 14 }, critBonus: 0.15, throwDmg: 780,
      desc: '蜀山劍塚古劍，鑲嵌北斗七星玉樞，大幅提升暴擊機率。'
    },
    wuchenjian: {
      id: 'wuchenjian', name: '太極無塵劍', category: 'equip', slot: 'weapon', price: 2600,
      who: ['luxiao'], stats: { atk: 112, mag: 35, spd: 16, lck: 18 }, doubleHit: true, throwDmg: 1350,
      desc: '清濁同源之曠世神劍，劍氣自生，普通攻擊可觸發【二連擊】！'
    },
    shuanglongjian: {
      id: 'shuanglongjian', name: '雙龍短劍', category: 'equip', slot: 'weapon', price: 320,
      who: ['lingxi'], stats: { atk: 24, mag: 14, spd: 6 }, doubleHit: true, throwDmg: 340,
      desc: '棲霞島雙股靈劍，蘇靈汐佩戴時普通攻擊可施展【二連擊】！'
    },
    yunvshuangjian: {
      id: 'yunvshuangjian', name: '玉女雙劍', category: 'equip', slot: 'weapon', price: 860,
      who: ['lingxi'], stats: { atk: 48, mag: 32, spd: 12 }, doubleHit: true, throwDmg: 640,
      desc: '寒玉雕琢之雌雄雙劍，輕靈無匹，普通攻擊【二連擊】。'
    },
    tianshezhang: {
      id: 'tianshezhang', name: '天蛇靈杖', category: 'equip', slot: 'weapon', price: 2800,
      who: ['lingxi'], stats: { atk: 76, mag: 95, def: 24, maxMp: 80 }, mpRegen: 18, throwDmg: 1200,
      desc: '女媧族歷代傳承聖杖！五靈仙術威力暴增，每回合自動凝聚 18 點真氣。'
    },
    honglingbian: {
      id: 'honglingbian', name: '紅綾長鞭', category: 'equip', slot: 'weapon', price: 480,
      who: ['yueling'], stats: { atk: 34, spd: 10 }, splashAll: true, throwDmg: 410,
      desc: '驚鴻山莊沈月綾隨身長鞭，普通攻擊可【橫掃敵方全體】！'
    },
    jinshebian: {
      id: 'jinshebian', name: '金蛇軟鞭', category: 'equip', slot: 'weapon', price: 1050,
      who: ['yueling'], stats: { atk: 62, spd: 15, lck: 10 }, splashAll: true, throwDmg: 720,
      desc: '隱霧金鱗鍛造之奇鞭，普通攻擊【橫掃敵方全體】，破風生威。'
    },
    jiujiebian: {
      id: 'jiujiebian', name: '九節雷火鞭', category: 'equip', slot: 'weapon', price: 2300,
      who: ['yueling'], stats: { atk: 96, mag: 25, spd: 20 }, splashAll: true, throwDmg: 1150,
      desc: '引九天雷火淬煉之神鞭，普通攻擊【橫掃敵方全體】並帶雷火之威！'
    },
    miaoyindao: {
      id: 'miaoyindao', name: '苗銀百毒刀', category: 'equip', slot: 'weapon', price: 920,
      who: ['aman'], stats: { atk: 54, mag: 42, lck: 15 }, poisonHit: 'chidu', throwDmg: 650,
      desc: '白苗少主佩刀，刀鋒淬有百草奇蠱，普攻有機率令敵人染上赤毒。'
    },
    wuyuezhang: {
      id: 'wuyuezhang', name: '聖靈巫月杖', category: 'equip', slot: 'weapon', price: 2400,
      who: ['aman'], stats: { atk: 72, mag: 88, spd: 18, lck: 22 }, poisonHit: 'zhangdu', throwDmg: 1100,
      desc: '巫月神教鎮教寶杖，銀鈴搖動間萬蠱臣服，大幅強化巫蠱與火風仙術。'
    },

    // === 頭戴 (Head) ===
    pimao: {
      id: 'pimao', name: '青布方巾', category: 'equip', slot: 'head', price: 75,
      stats: { def: 6, maxHp: 15 }, desc: '輕便乾淨的青布頭巾。'
    },
    cuiyuchai: {
      id: 'cuiyuchai', name: '翠玉金釵', category: 'equip', slot: 'head', price: 260,
      who: ['lingxi', 'yueling', 'aman'], stats: { def: 14, mag: 12, lck: 6 },
      desc: '江南巧匠打造的翡翠金釵，溫潤生輝。'
    },
    zijinkuan: {
      id: 'zijinkuan', name: '紫金道冠', category: 'equip', slot: 'head', price: 680,
      stats: { def: 26, mag: 18, maxMp: 35 }, desc: '蜀山仙門紫金冠，清心凝神。'
    },
    chongtiankuan: {
      id: 'chongtiankuan', name: '鳳翼沖天冠', category: 'equip', slot: 'head', price: 1450,
      stats: { def: 42, atk: 15, mag: 24, lck: 12 }, desc: '上古神將戰冠，威風凜凜。'
    },

    // === 披掛 (Cloak) ===
    hujian: {
      id: 'hujian', name: '麻布披肩', category: 'equip', slot: 'cloak', price: 90,
      stats: { def: 7, spd: 3 }, desc: '遮風擋雨的行旅披肩。'
    },
    yufengpifeng: {
      id: 'yufengpifeng', name: '御風披風', category: 'equip', slot: 'cloak', price: 360,
      stats: { def: 18, spd: 10, lck: 5 }, desc: '織入風靈絲線的披風，行走如風。'
    },
    fengwenpifeng: {
      id: 'fengwenpifeng', name: '鳳紋雲錦披', category: 'equip', slot: 'cloak', price: 980,
      stats: { def: 34, mag: 20, spd: 14, maxHp: 60 }, desc: '雲錦繡鳳之華貴披掛，水火難侵。'
    },

    // === 身穿 (Body) ===
    buyi: {
      id: 'buyi', name: '粗布短褐', category: 'equip', slot: 'body', price: 60,
      stats: { def: 8 }, desc: '客棧夥計日常穿著的短衫。'
    },
    tengjia: {
      id: 'tengjia', name: '靈藤護甲', category: 'equip', slot: 'body', price: 240,
      stats: { def: 20, maxHp: 35 }, desc: '以韌藤浸泡藥汁編織的輕甲。'
    },
    jinlvyi: {
      id: 'jinlvyi', name: '金縷霓裳', category: 'equip', slot: 'body', price: 780,
      who: ['lingxi', 'yueling', 'aman'], stats: { def: 38, mag: 22, spd: 10 },
      desc: '金絲織就的仙家羽衣，輕若無物卻刀劍難傷。'
    },
    tiancanyi: {
      id: 'tiancanyi', name: '天蠶玄甲衣', category: 'equip', slot: 'body', price: 1500,
      stats: { def: 64, maxHp: 110, mag: 24 },
      desc: '雪山天蠶絲混合玄鐵甲片織成，護體神衣。'
    },

    // === 足穿 (Footwear) ===
    caoxie: {
      id: 'caoxie', name: '輕便草鞋', category: 'equip', slot: 'foot', price: 50,
      stats: { def: 3, spd: 5 }, desc: '柔軟耐磨的草編鞋。'
    },
    jifengxue: {
      id: 'jifengxue', name: '疾風靴', category: 'equip', slot: 'foot', price: 310,
      stats: { def: 12, spd: 14 }, desc: '靴底刻有輕身符文，大幅提升身法。'
    },
    buyunlv: {
      id: 'buyunlv', name: '魅影步雲履', category: 'equip', slot: 'foot', price: 1100,
      stats: { def: 26, spd: 28, lck: 14 }, desc: '踏雲無痕之仙履，閃避與出手速度極快。'
    },

    // === 配戴法寶與五靈珠 (Relics — 改變合擊技！) ===
    huxinjing: {
      id: 'huxinjing', name: '青銅護心鏡', category: 'equip', slot: 'relic', price: 200,
      stats: { def: 14, maxHp: 40 }, desc: '護住心脈的古銅鏡。'
    },
    yufozhu: {
      id: 'yufozhu', name: '玉佛珠', category: 'equip', slot: 'relic', price: 650,
      stats: { def: 16, mag: 20, lck: 12 }, coopOverride: 'fofawubian',
      desc: '蘊含佛門梵音的寶珠。配戴者參與【合擊】時可觸發絕學【佛法無邊】！'
    },
    fenglingzhu: {
      id: 'fenglingzhu', name: '風靈珠', category: 'equip', slot: 'relic', price: 0, isKeyRelic: true,
      stats: { mag: 28, spd: 24, lck: 10 }, resistElem: 'wind', coopOverride: 'fengshen',
      desc: '五靈奇珠之一，蘊藏九天罡風。配戴後【合擊】昇華為神召【風神】！'
    },
    leilingzhu: {
      id: 'leilingzhu', name: '雷靈珠', category: 'equip', slot: 'relic', price: 0, isKeyRelic: true,
      stats: { atk: 20, mag: 34, spd: 12 }, resistElem: 'thunder', coopOverride: 'leishen',
      desc: '五靈奇珠之一，紫電奔雷流轉。配戴後【合擊】昇華為神召【雷神】！'
    },
    huolingzhu: {
      id: 'huolingzhu', name: '火靈珠', category: 'equip', slot: 'relic', price: 0, isKeyRelic: true,
      stats: { atk: 28, mag: 32, maxHp: 60 }, resistElem: 'fire', coopOverride: 'huoshen',
      desc: '五靈奇珠之一，焚天炎波不息。配戴後【合擊】昇華為神召【火神】！'
    },
    tulingzhu: {
      id: 'tulingzhu', name: '土靈珠', category: 'equip', slot: 'relic', price: 0, isKeyRelic: true,
      stats: { def: 38, maxHp: 90, mag: 20 }, resistElem: 'earth', coopOverride: 'shanshen',
      usableInField: true, escapeMaze: true,
      desc: '五靈奇珠之一，厚德載物。配戴後【合擊】化為【山神】，迷宮中亦可隨時脫出！'
    },
    shuilingzhu: {
      id: 'shuilingzhu', name: '水靈珠', category: 'equip', slot: 'relic', price: 0, isKeyRelic: true,
      stats: { mag: 38, maxMp: 75, lck: 16 }, resistElem: 'water', hpRegen: 35, coopOverride: 'xueyao',
      desc: '五靈奇珠之一，十年前宿命信物。每回合回血，配戴後【合擊】昇華為【雪妖】！'
    },
    shenglingzhu: {
      id: 'shenglingzhu', name: '聖靈珠', category: 'equip', slot: 'relic', price: 0, isKeyRelic: true,
      stats: { atk: 35, mag: 55, def: 35, spd: 25, lck: 25 }, hpRegen: 45, mpRegen: 15, coopOverride: 'wushen',
      desc: '五靈齊聚融合之女媧至寶！配戴後【合擊】將召喚毀天滅地的終極神威【武神】！'
    },

    // === 劇情法寶與關鍵道具 (Key Items) ===
    zijinyulu: {
      id: 'zijinyulu', name: '紫金九泉露', category: 'key',
      desc: '棲霞仙島蘇靈汐所贈仙露，能拔除柳嬸體內的寒髓陰毒。'
    },
    liangumin: {
      id: 'liangumin', name: '煉蠱皿', category: 'key',
      desc: '苗疆秘傳紫陶皿，可在選單【煉蠱】中將任意兩種草藥、毒物或蠱卵合煉成奇珍！'
    },
    sheyao_key: {
      id: 'sheyao_key', name: '青銅蛇首鑰', category: 'key',
      desc: '開啟隱霧蛇窟深處玄鐵閘門的青銅密鑰。'
    },
    fenghuangyu: {
      id: 'fenghuangyu', name: '神木鳳凰羽', category: 'key',
      desc: '神木林梧桐枝頭拾獲的涅槃靈羽，聖姑救治沈月綾的續命奇珍之一。'
    },
    huoqilinjiao: {
      id: 'huoqilinjiao', name: '赤炎麒麟角', category: 'key',
      desc: '火麟洞神獸褪下之靈角，蘊含純陽生機，聖姑救治沈月綾的續命奇珍之一。'
    },
    memory_shard: {
      id: 'memory_shard', name: '宿命記憶碎片', category: 'key',
      desc: '散落於霧魂時空裂隙中的晶瑩碎片。集齊一定數量可於【龍潭古鏡】叩問逆命之機。'
    },
    longtan_pact: {
      id: 'longtan_pact', name: '龍潭逆命契', category: 'key',
      desc: '於霧魂時之隙「龍潭古鏡」凝結之羈絆印記——以凡人執念斬斷女媧殉道死劫！'
    }
  };

  // === 煉蠱皿配方矩陣 (Gu Alchemy Recipes) ===
  const EXACT_GU_RECIPES = {
    'dulongsha+huashishui': 'yingu',
    'wuyingdu+huashishui': 'yingu',
    'guluan+huashishui': 'yingu',
    'xuehama+shilianguo': 'jincanwang',
    'tianxianglu+zijinggao': 'jincanwang',
    'tianxianglu+lingshanxianzhi': 'jincanwang',
    'nuwashi+baxianshi': 'jincanwang',
    'zhixuecao+shuerguo': 'xingjundan',
    'xingjundan+huanshendan': 'shenxiancha',
    'jinchuangyao+longxiancao': 'zijinggao',
    'panguo+shenxiancha': 'lingshanxianzhi',
    'zijinggao+huanhunxiang': 'tianxianglu',
    'dulongsha+leihuozhu': 'xuelinglong',
    'meihuabiao+dulongsha': 'xiulijian',
    'xiulijian+huashishui': 'wuyingdu',
    'guluan+jinchuangyao': 'yinxingzi',
    'guluan+longxiancao': 'yuputi',
    'guluan+shaodaozi': 'xuehama',
    'guluan+shenxiancha': 'shilianguo',
    'guluan+jiuyinsan': 'nuwashi',
    'chixuecan+guihuajiu': 'baxianshi'
  };

  function craftGu(idA, idB) {
    const a = ITEMS[idA];
    const b = ITEMS[idB];
    if (!a || !b) return null;
    if (a.category === 'key' || b.category === 'key' || a.category === 'equip' || b.category === 'equip') {
      return null;
    }

    const key1 = `${idA}+${idB}`;
    const key2 = `${idB}+${idA}`;
    if (EXACT_GU_RECIPES[key1]) return ITEMS[EXACT_GU_RECIPES[key1]];
    if (EXACT_GU_RECIPES[key2]) return ITEMS[EXACT_GU_RECIPES[key2]];

    // 同物升階 (Same-item upgrade)
    if (idA === idB) {
      const sameChain = {
        zhixuecao: 'xingjundan',
        xingjundan: 'jinchuangyao',
        jinchuangyao: 'panguo',
        panguo: 'yinxingzi',
        shuerguo: 'huanshendan',
        huanshendan: 'longxiancao',
        longxiancao: 'yuputi',
        meihuabiao: 'xiulijian',
        xiulijian: 'leihuozhu',
        leihuozhu: 'xuelinglong',
        guluan: 'wuyingdu',
        wuyingdu: 'yingu',
        tianxianglu: 'jincanwang',
        lingshanxianzhi: 'jincanwang'
      };
      if (sameChain[idA]) return ITEMS[sameChain[idA]];
    }

    // 智慧品階融合保底 (Tier-based alchemy fallback)
    const sumTier = (a.tier || 1) + (b.tier || 1);
    const hasThrow = a.category === 'throw' || b.category === 'throw';
    if (idA === 'huashishui' || idB === 'huashishui') {
      return sumTier >= 6 ? ITEMS.yingu : ITEMS.wuyingdu;
    }
    if (hasThrow) {
      if (sumTier >= 8) return ITEMS.yingu;
      if (sumTier >= 6) return ITEMS.xuelinglong;
      if (sumTier >= 4) return ITEMS.leihuozhu;
      return ITEMS.dulongsha;
    }
    if (sumTier >= 9) return ITEMS.jincanwang;
    if (sumTier >= 7) return ITEMS.tianxianglu;
    if (sumTier >= 5) return ITEMS.shenxiancha;
    if (sumTier >= 3) return ITEMS.jinchuangyao;
    return ITEMS.xingjundan;
  }

  // === 仙術與武學總表 (40+ Authentic Skills) ===
  const SKILLS = {
    // 陸逍技能 (蜀山劍仙 + 江湖奇技)
    feiyuntanlong: {
      id: 'feiyuntanlong', name: '飛雲探龍手', mp: 8, elem: 'none', type: 'steal', target: 'enemy',
      desc: '家傳妙手空空絕技！從敵人或首領身上探取文錢與珍稀寶物。'
    },
    qiliaoshu: {
      id: 'qiliaoshu', name: '氣療術', mp: 10, elem: 'none', type: 'heal', target: 'ally',
      power: 110, usableInField: true,
      desc: '以純陽真氣活血化瘀，恢復單人約 110+ 點體力。'
    },
    yujianshu: {
      id: 'yujianshu', name: '御劍術', mp: 14, elem: 'sword', type: 'attack', target: 'enemy',
      power: 95, scale: 'both',
      desc: '醉劍翁夜授蜀山入門劍訣，以氣御劍凌空斬敵！'
    },
    bingxinjue: {
      id: 'bingxinjue', name: '冰心訣', mp: 14, elem: 'water', type: 'cleanse', target: 'ally',
      power: 70, usableInField: true,
      desc: '清心鎮邪，解除單人所有中毒與負面狀態並小幅回血。'
    },
    tianshifufa: {
      id: 'tianshifufa', name: '天師符法', mp: 22, elem: 'thunder', type: 'attack', target: 'enemy',
      power: 165, scale: 'both',
      desc: '敕令五雷靈符轟擊邪祟，對妖魔造成強大雷屬性傷害。'
    },
    tiangangzhanqi: {
      id: 'tiangangzhanqi', name: '天罡戰氣', mp: 24, elem: 'none', type: 'buff', target: 'self',
      buff: { id: 'tiangang', turns: 4 },
      desc: '激發北斗天罡真元，4 回合內物理武術傷害翻倍！'
    },
    zuixianwangyue: {
      id: 'zuixianwangyue', name: '醉仙望月步', mp: 28, elem: 'wind', type: 'buff', target: 'self',
      buff: { id: 'zuixian', turns: 5 },
      desc: '似醉非醉之仙家步法！5 回合內閃避大增且普通攻擊化為【二連擊】！'
    },
    wanjianjue: {
      id: 'wanjianjue', name: '萬劍訣', mp: 36, elem: 'sword', type: 'attack', target: 'allEnemies',
      power: 195, scale: 'both',
      desc: '化一劍為萬千劍雨傾瀉而下，重創敵方全體！'
    },
    xianfengyunti: {
      id: 'xianfengyunti', name: '仙風雲體術', mp: 20, elem: 'wind', type: 'buff', target: 'allAllies',
      buff: { id: 'yunti', turns: 4 },
      desc: '清風托體，提升我方全體身法速度與閃避 4 回合。'
    },
    tianjian: {
      id: 'tianjian', name: '天劍', mp: 54, elem: 'sword', type: 'attack', target: 'allEnemies',
      power: 310, scale: 'both',
      desc: '人劍合一化作擎天巨劍斬落，對敵方全體造成驚天劍傷！'
    },
    qiankunyizhi: {
      id: 'qiankunyizhi', name: '乾坤一擲', mp: 25, coinCost: 400, elem: 'none', type: 'coinAttack', target: 'allEnemies',
      power: 460,
      desc: '一擲千金豪氣干雲！消耗 400 文錢，對敵全體造成無視防禦的巨額傷害！'
    },
    jiushen: {
      id: 'jiushen', name: '酒神', mp: 1, requireWine: true, elem: 'holy', type: 'wineGod', target: 'allEnemies',
      desc: '醉劍翁畢生至高神通！消耗一壺酒並傾盡當前全部真氣（傷害=真氣×8），一生限用九次！'
    },

    // 蘇靈汐技能 (五靈仙術 + 女媧聖禱)
    guanyinzhou: {
      id: 'guanyinzhou', name: '觀音咒', mp: 15, elem: 'water', type: 'heal', target: 'ally',
      power: 185, usableInField: true,
      desc: '慈航甘露普渡，恢復單人大量體力。'
    },
    yanzhou: {
      id: 'yanzhou', name: '炎咒', mp: 13, elem: 'fire', type: 'attack', target: 'enemy',
      power: 105, scale: 'mag',
      desc: '召引赤焰灼燒單一敵人（火剋雷）。'
    },
    bingzhou: {
      id: 'bingzhou', name: '冰咒', mp: 13, elem: 'water', type: 'attack', target: 'enemy',
      power: 105, scale: 'mag',
      desc: '凝水成冰刺穿單一敵人（水剋火）。'
    },
    leizhou: {
      id: 'leizhou', name: '雷咒', mp: 14, elem: 'thunder', type: 'attack', target: 'enemy',
      power: 112, scale: 'mag',
      desc: '引落落雷劈擊單一敵人（雷剋風）。'
    },
    fengzhou: {
      id: 'fengzhou', name: '旋風咒', mp: 22, elem: 'wind', type: 'attack', target: 'allEnemies',
      power: 140, scale: 'mag',
      desc: '呼嘯風刃席捲全場，攻擊敵方全體（風剋土）。'
    },
    jingyizhou: {
      id: 'jingyizhou', name: '淨衣咒', mp: 16, elem: 'water', type: 'cleanse', target: 'allAllies',
      power: 80, usableInField: true,
      desc: '清泉滌塵，解除我方全體中毒與異常狀態並小補體力。'
    },
    zhenyuanhuti: {
      id: 'zhenyuanhuti', name: '真元護體', mp: 22, elem: 'earth', type: 'buff', target: 'allAllies',
      buff: { id: 'zhenyuan', turns: 4 },
      desc: '大地靈光護佑全身，4 回合內我方全體防禦大幅提升！'
    },
    wuleizhou: {
      id: 'wuleizhou', name: '五雷正法', mp: 34, elem: 'thunder', type: 'attack', target: 'enemy',
      power: 275, scale: 'mag',
      desc: '九霄狂雷轟頂，對單一強敵造成毀滅性雷系傷害！'
    },
    sanmeizhenhuo: {
      id: 'sanmeizhenhuo', name: '三昧真火', mp: 36, elem: 'fire', type: 'attack', target: 'allEnemies',
      power: 225, scale: 'mag',
      desc: '紅蓮業火焚盡八荒，對敵方全體造成猛烈火傷！'
    },
    taishanyading: {
      id: 'taishanyading', name: '泰山壓頂', mp: 35, elem: 'earth', type: 'attack', target: 'allEnemies',
      power: 220, scale: 'mag',
      desc: '召喚萬鈞巨岩轟然鎮落，對敵方全體造成土系重創（土剋水）！'
    },
    huanhunzhou: {
      id: 'huanhunzhou', name: '還魂咒', mp: 38, elem: 'holy', type: 'revive', target: 'deadAlly',
      hpPct: 0.55, usableInField: true,
      desc: '女媧回春祝禱，喚醒陣亡同伴並恢復五成以上體力。'
    },
    wuqichaoyuan: {
      id: 'wuqichaoyuan', name: '五氣朝元', mp: 46, elem: 'water', type: 'heal', target: 'allAllies',
      power: 390, usableInField: true,
      desc: '匯聚天地五靈甘霖，大幅恢復我方全體體力！'
    },
    fengxuebingtian: {
      id: 'fengxuebingtian', name: '風雪冰天', mp: 52, elem: 'water', type: 'attack', target: 'allEnemies',
      power: 325, scale: 'mag',
      desc: '極寒暴雪冰封萬里，對敵全體造成極高水系傷害（克制火系神效）！'
    },
    mengshe: {
      id: 'mengshe', name: '夢蛇·聖靈天舞', mp: 68, elem: 'holy', type: 'mengshe', target: 'allEnemies',
      power: 410,
      desc: '覺醒女媧聖女真身神力！對敵全體降下聖靈天罰，並賦予全隊真元與回春祝福！'
    },

    // 沈月綾技能 (驚鴻武學 + 豪門快劍)
    qijianzhi: {
      id: 'qijianzhi', name: '氣劍指', mp: 14, elem: 'sword', type: 'attack', target: 'enemy',
      power: 120, scale: 'atk',
      desc: '駢指如劍破空點出，凌厲指風貫穿單敵。'
    },
    ningshenguiyuan: {
      id: 'ningshenguiyuan', name: '凝神歸元', mp: 16, elem: 'none', type: 'heal', target: 'ally',
      power: 165, usableInField: true,
      desc: '驚鴻內家調息法門，恢復單人體力。'
    },
    yiyangzhi: {
      id: 'yiyangzhi', name: '驚鴻一陽指', mp: 26, elem: 'fire', type: 'attack', target: 'enemy',
      power: 235, scale: 'atk', ignoreDef: 0.4,
      desc: '凝聚純陽指力破甲穿心，無視敵人四成防禦！'
    },
    qijuejianqi: {
      id: 'qijuejianqi', name: '七決劍氣', mp: 34, elem: 'sword', type: 'attack', target: 'allEnemies',
      power: 215, scale: 'atk',
      desc: '七道驚鴻劍氣縱橫交錯，斬擊敵方全體！'
    },
    zhanlongjue: {
      id: 'zhanlongjue', name: '斬龍訣', mp: 48, elem: 'thunder', type: 'attack', target: 'allEnemies',
      power: 320, scale: 'atk',
      desc: '驚鴻山莊鎮莊絕學，刀鞭化作紫電狂龍橫掃千軍！'
    },

    // 藍阿蠻技能 (苗疆巫蠱 + 炎風秘術)
    yufengshu: {
      id: 'yufengshu', name: '御蜂術', mp: 16, elem: 'wind', type: 'attack', target: 'allEnemies',
      power: 135, scale: 'mag', inflict: 'chidu',
      desc: '吹響銀笛驅使毒蜂群襲敵全體，並高機率附加【赤毒】。'
    },
    lingxuezhou: {
      id: 'lingxuezhou', name: '靈血咒', mp: 20, elem: 'water', type: 'cleanse', target: 'allAllies',
      power: 180, usableInField: true,
      desc: '巫月神教秘禱，恢復我方全體體力並拔除一切蠱毒。'
    },
    wanyishixiang: {
      id: 'wanyishixiang', name: '萬蟻蝕象', mp: 28, elem: 'earth', type: 'attack', target: 'enemy',
      power: 245, scale: 'mag', inflict: 'zhangdu',
      desc: '噬靈金蟻啃噬強敵護甲，造成土系重創並附加劇烈【瘴毒】！'
    },
    guijiang: {
      id: 'guijiang', name: '鬼降幻蠱', mp: 26, elem: 'poison', type: 'attack', target: 'allEnemies',
      power: 155, scale: 'mag', inflict: 'stun',
      desc: '詭秘巫音擾亂心神，傷敵全體並有機率令敵人【定身】無法行動！'
    },
    lianyuzhenhuo: {
      id: 'lianyuzhenhuo', name: '煉獄真火', mp: 48, elem: 'fire', type: 'attack', target: 'allEnemies',
      power: 315, scale: 'mag',
      desc: '召喚南詔地脈炎波噴薄而出，焚燒敵方全體！'
    },
    fengjuancanyun: {
      id: 'fengjuancanyun', name: '風捲殘雲', mp: 50, elem: 'wind', type: 'attack', target: 'allEnemies',
      power: 325, scale: 'mag',
      desc: '九天狂飆撕裂大地，對敵方全體造成毀滅性風系傷害！'
    }
  };

  // === 合擊絕技 (Co-op Skills — 含五靈珠/聖靈珠神召變化！) ===
  const COOP_SKILLS = {
    hetiqigong: {
      id: 'hetiqigong', name: '合體劍氣', elem: 'sword', power: 240, hpCostPct: 0.08,
      poem: '雙劍同心破雲霄！', desc: '陸逍領銜全隊真氣合一，化為璀璨劍虹貫穿全場！'
    },
    chiyanlianhua: {
      id: 'chiyanlianhua', name: '五靈蓮華', elem: 'fire', power: 260, hpCostPct: 0.08,
      poem: '聖蓮綻世滌妖氛！', desc: '蘇靈汐引導同伴靈力綻放五彩聖蓮，灼盡群邪！'
    },
    xianyuezhan: {
      id: 'xianyuezhan', name: '驚鴻弦月斬', elem: 'thunder', power: 270, hpCostPct: 0.08,
      poem: '弦月如鉤斬驚鴻！', desc: '沈月綾借眾人之力騰空揮出滿月雷霆斬擊！'
    },
    tiannusanhua: {
      id: 'tiannusanhua', name: '天女散花', elem: 'poison', power: 265, hpCostPct: 0.08,
      inflict: 'chidu', poem: '銀鈴漫舞落繁花！', desc: '藍阿蠻攜眾人靈氣灑下漫天蝶蠱奇花！'
    },
    fofawubian: {
      id: 'fofawubian', name: '佛法無邊', elem: 'holy', power: 340, hpCostPct: 0.07,
      poem: '梵音普照鎮諸魔！', desc: '【玉佛珠合擊】萬丈金光化作梵天掌印鎮壓全體邪祟！'
    },
    fengshen: {
      id: 'fengshen', name: '風神·九天狂嵐', elem: 'wind', power: 470, hpCostPct: 0.09,
      poem: '扶搖萬里喚風神！', desc: '【風靈珠合擊】召喚上古風神降臨，青嵐龍捲席捲天地！'
    },
    leishen: {
      id: 'leishen', name: '雷神·紫電天罰', elem: 'thunder', power: 485, hpCostPct: 0.09,
      poem: '九霄神雷誅萬邪！', desc: '【雷靈珠合擊】召喚雷神怒擊天鼓，萬道紫雷轟碎敵陣！'
    },
    huoshen: {
      id: 'huoshen', name: '火神·炎波焚世', elem: 'fire', power: 480, hpCostPct: 0.09,
      poem: '祝融烈焰照乾坤！', desc: '【火靈珠合擊】召喚火神吐納九泉炎波，焚盡世間濁魔！'
    },
    shanshen: {
      id: 'shanshen', name: '山神·星隕崩岳', elem: 'earth', power: 475, hpCostPct: 0.09,
      poem: '五嶽移山鎮九幽！', desc: '【土靈珠合擊】召喚巍峨山神投落神峰，震碎八方妖魔！'
    },
    xueyao: {
      id: 'xueyao', name: '雪妖·寒髓冰封', elem: 'water', power: 475, hpCostPct: 0.09,
      healPct: 0.2, poem: '冰封千里雪漫天！', desc: '【水靈珠合擊】召喚冰雪女神凍結全場，並以甘霖治癒全隊！'
    },
    wushen: {
      id: 'wushen', name: '武神·斬破宿命', elem: 'holy', power: 720, hpCostPct: 0.1,
      poem: '五靈歸一召武神，一劍開天破宿命！',
      desc: '【聖靈珠終極合擊】五靈化聖召喚曠古武神巨影，揮落開天闢地之神劍！'
    }
  };

  function resolveCoopSkill(livingParty) {
    if (!livingParty || livingParty.length < 2) return null;
    // Priority: Shenglingzhu > Spirit Pearls > Yufozhu > Leader default
    const priorityOrder = ['wushen', 'leishen', 'huoshen', 'xueyao', 'shanshen', 'fengshen', 'fofawubian'];
    const foundOverrides = [];
    for (const member of livingParty) {
      const relicId = member.equip && member.equip.relic;
      if (relicId && ITEMS[relicId] && ITEMS[relicId].coopOverride) {
        foundOverrides.push(ITEMS[relicId].coopOverride);
      }
    }
    for (const p of priorityOrder) {
      if (foundOverrides.includes(p)) return COOP_SKILLS[p];
    }
    const leader = livingParty[0];
    if (leader.id === 'yueling') return COOP_SKILLS.xianyuezhan;
    if (leader.id === 'lingxi') return COOP_SKILLS.chiyanlianhua;
    if (leader.id === 'aman') return COOP_SKILLS.tiannusanhua;
    return COOP_SKILLS.hetiqigong;
  }

  PalX.ELEMENTS = ELEMENTS;
  PalX.getElementMultiplier = getElementMultiplier;
  PalX.EQUIP_SLOTS = EQUIP_SLOTS;
  PalX.ITEMS = ITEMS;
  PalX.SKILLS = SKILLS;
  PalX.COOP_SKILLS = COOP_SKILLS;
  PalX.craftGu = craftGu;
  PalX.resolveCoopSkill = resolveCoopSkill;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      ELEMENTS,
      getElementMultiplier,
      EQUIP_SLOTS,
      ITEMS,
      SKILLS,
      COOP_SKILLS,
      craftGu,
      resolveCoopSkill
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
