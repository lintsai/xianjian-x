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
    poison: { id: 'poison', name: '蝕', color: '#9ccc65' },
    holy: { id: 'holy', name: '曜', color: '#ffe082' }
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
    // === 恢復靈藥 (Medicines) ===
    zhixuecao: {
      id: 'zhixuecao', name: '青露草', category: 'medicine', tier: 1, price: 30,
      target: 'ally', usableInField: true, hp: 85,
      desc: '江畔常見的止血青草，可恢復單人 85 點體力。'
    },
    xingjundan: {
      id: 'xingjundan', name: '護脈行軍散', category: 'medicine', tier: 2, price: 85,
      target: 'ally', usableInField: true, hp: 200,
      desc: '走鏢俠客常備良藥，恢復單人 200 點體力。'
    },
    jinchuangyao: {
      id: 'jinchuangyao', name: '杏林玉肌膏', category: 'medicine', tier: 3, price: 210,
      target: 'ally', usableInField: true, hp: 460,
      desc: '名醫精煉的外傷良膏，恢復單人 460 點體力。'
    },
    panguo: {
      id: 'panguo', name: '棲雲雪蓮果', category: 'medicine', tier: 4, price: 460,
      target: 'ally', usableInField: true, hp: 920,
      desc: '竹海高崖孕育的雪白靈果，恢復單人 920 點體力。'
    },
    zijinggao: {
      id: 'zijinggao', name: '素娥凝玉膏', category: 'medicine', tier: 5, price: 900,
      target: 'allAllies', usableInField: true, hp: 650,
      desc: '聽雪藥廬秘傳玉膏，恢復我方全體 650 點體力。'
    },
    shuerguo: {
      id: 'shuerguo', name: '翠竹甘露實', category: 'medicine', tier: 1, price: 45,
      target: 'ally', usableInField: true, mp: 50,
      desc: '竹林間凝結露水之野果，恢復單人 50 點真氣。'
    },
    huanshendan: {
      id: 'huanshendan', name: '清心聚氣丸', category: 'medicine', tier: 2, price: 130,
      target: 'ally', usableInField: true, mp: 120,
      desc: '凝神定志的丹丸，恢復單人 120 點真氣。'
    },
    longxiancao: {
      id: 'longxiancao', name: '幽泉碧靈草', category: 'medicine', tier: 3, price: 290,
      target: 'ally', usableInField: true, mp: 260,
      desc: '暗河深谷孕育的奇草，恢復單人 260 點真氣。'
    },
    shenxiancha: {
      id: 'shenxiancha', name: '聽雨雲霧茗', category: 'medicine', tier: 4, price: 560,
      target: 'ally', usableInField: true, hp: 480, mp: 280,
      desc: '清香沁脾的上品靈茶，同時恢復 480 體力與 280 真氣。'
    },
    lingshanxianzhi: {
      id: 'lingshanxianzhi', name: '雲夢千年芝', category: 'medicine', tier: 5, price: 980,
      target: 'allAllies', usableInField: true, hp: 560, mp: 320,
      desc: '大澤千年瑞芝，恢復我方全體 560 體力與 320 真氣。'
    },
    chixuecan: {
      id: 'chixuecan', name: '清瘴碧蠶丹', category: 'medicine', tier: 2, price: 70,
      target: 'ally', usableInField: true, hp: 70, curePoison: true, cureStatus: true,
      desc: '百草寨解毒靈丹，解除單人一切中毒與異常狀態並小補體力。'
    },
    jiuyinsan: {
      id: 'jiuyinsan', name: '滌塵清心散', category: 'medicine', tier: 3, price: 150,
      target: 'allAllies', usableInField: true, curePoison: true, cureStatus: true,
      desc: '清涼奇散，解除我方全體中毒、定身與異常狀態。'
    },
    huanhunxiang: {
      id: 'huanhunxiang', name: '引魄返魂香', category: 'medicine', tier: 3, price: 280,
      target: 'deadAlly', usableInField: true, revive: true, hpPct: 0.45,
      desc: '引魂歸竅的奇香，使昏厥同伴甦醒並恢復四成半體力。'
    },
    tianxianglu: {
      id: 'tianxianglu', name: '九轉續命露', category: 'medicine', tier: 5, price: 1200,
      target: 'anyAlly', usableInField: true, revive: true, hpPct: 1.0, mpPct: 0.5, curePoison: true,
      desc: '稀世救命聖露，可甦醒陣亡同伴並回滿體力、恢復五成真氣！'
    },
    guihuajiu: {
      id: 'guihuajiu', name: '煙波桂花釀', category: 'medicine', tier: 2, price: 95,
      isWine: true, target: 'ally', usableInField: false, buff: { id: 'tiangang', turns: 3 }, hp: 60,
      desc: '聽雨渡醇香佳釀。飲用後三回合武術大增；亦是施展禁招【醉月狂歌】必需之酒！'
    },
    shaodaozi: {
      id: 'shaodaozi', name: '錦官烈火燒', category: 'medicine', tier: 3, price: 180,
      isWine: true, target: 'ally', usableInField: false, buff: { id: 'tiangang', turns: 4 }, hp: 120,
      desc: '巴蜀辛辣烈酒。飲用後四回合武術大增；亦可供【醉月狂歌】消耗！'
    },
    yinlufeng: {
      id: 'yinlufeng', name: '識途流螢引', category: 'medicine', tier: 2, price: 100,
      target: 'self', usableInField: true, escapeMaze: true,
      desc: '大澤識途靈螢，在迷宮中使用可瞬間飛回入口處。'
    },

    // === 修行靈果與奇珍 (Permanent Stat Elixirs) ===
    yinxingzi: {
      id: 'yinxingzi', name: '千年梧桐實', category: 'elixir', tier: 4, price: 650,
      target: 'ally', usableInField: true, permStat: { maxHp: 26 },
      desc: '神木谷千年靈果，服用後永久提升體力上限 +26。'
    },
    yuputi: {
      id: 'yuputi', name: '寒潭玉蓮子', category: 'elixir', tier: 4, price: 680,
      target: 'ally', usableInField: true, permStat: { maxMp: 20 },
      desc: '澄澈靈蓮之實，服用後永久提升真氣上限 +20。'
    },
    xuehama: {
      id: 'xuehama', name: '赤麟鍛骨丹', category: 'elixir', tier: 4, price: 750,
      target: 'ally', usableInField: true, permStat: { atk: 7 },
      desc: '淬鍊筋骨之奇珍，服用後永久提升武術 +7。'
    },
    shilianguo: {
      id: 'shilianguo', name: '望舒凝華果', category: 'elixir', tier: 4, price: 750,
      target: 'ally', usableInField: true, permStat: { mag: 7 },
      desc: '月華凝聚之秘果，服用後永久提升靈力 +7。'
    },
    nuwashi: {
      id: 'nuwashi', name: '鑄天玄武石', category: 'elixir', tier: 4, price: 750,
      target: 'ally', usableInField: true, permStat: { def: 7 },
      desc: '上古鑄天氏遺石，服用後永久提升防禦 +7。'
    },
    baxianshi: {
      id: 'baxianshi', name: '凌波星辰砂', category: 'elixir', tier: 4, price: 780,
      target: 'ally', usableInField: true, permStat: { spd: 6, lck: 6 },
      desc: '蘊含星宿氣運之奇砂，永久提升身法 +6、吉運 +6。'
    },
    jincanwang: {
      id: 'jincanwang', name: '金蠶靈王', category: 'elixir', tier: 6, price: 2400,
      target: 'ally', usableInField: true, levelUp: 1,
      desc: '雲夢萬蟲之尊！服用後修行等級直接提升 1 級，全屬性成長並領悟對應絕學！'
    },

    // === 暗器、靈蟲與戰術奇物 (Throwables) ===
    meihuabiao: {
      id: 'meihuabiao', name: '柳葉飛鏢', category: 'throw', tier: 1, price: 65,
      target: 'enemy', throwDmg: 130, elem: 'none',
      desc: '鎮遠鏢局制式暗器，投擲對單一敵人造成 130 點無視防禦傷害。'
    },
    xiulijian: {
      id: 'xiulijian', name: '穿雲袖箭', category: 'throw', tier: 2, price: 150,
      target: 'enemy', throwDmg: 280, elem: 'sword',
      desc: '精巧破甲袖箭，投擲對單一敵人造成 280 點銳利傷害。'
    },
    leihuozhu: {
      id: 'leihuozhu', name: '驚雷烈火彈', category: 'throw', tier: 3, price: 320,
      target: 'allEnemies', throwDmg: 360, elem: 'fire',
      desc: '巴蜀火器名家秘製，炸裂對敵全體造成 360 點火系爆破傷害！'
    },
    dulongsha: {
      id: 'dulongsha', name: '蝕骨飛蝗砂', category: 'throw', tier: 2, price: 160,
      target: 'allEnemies', throwDmg: 165, elem: 'poison', inflict: 'chidu',
      desc: '大澤毒砂，投擲損傷敵全體並使其染上【赤毒】。'
    },
    wuyingdu: {
      id: 'wuyingdu', name: '冥淵寒瘴散', category: 'throw', tier: 4, price: 520,
      target: 'enemy', throwDmg: 520, elem: 'poison', inflict: 'zhangdu',
      desc: '極寒奇毒，投擲重創單體並附加每回合劇烈扣血之【瘴毒】！'
    },
    xuelinglong: {
      id: 'xuelinglong', name: '赤魄流火珠', category: 'throw', tier: 5, price: 780,
      target: 'allEnemies', throwDmg: 720, elem: 'fire',
      desc: '赤炎秘寶，投擲迸發漫天流火，對敵全體造成 720 點無視防禦重創！'
    },
    huashishui: {
      id: 'huashishui', name: '凝霧寒露', category: 'throw', tier: 3, price: 260,
      target: 'enemy', throwDmg: 320, elem: 'water',
      desc: '極陰寒露，可投擲傷敵，更是【百草丹鼎】煉製幻霧隱靈丹的關鍵藥引！'
    },
    guluan: {
      id: 'guluan', name: '百草靈蟲繭', category: 'throw', tier: 2, price: 120,
      target: 'enemy', throwDmg: 150, elem: 'poison', inflict: 'chidu',
      desc: '雲夢澤靈蟲繭，投入【百草丹鼎】與靈藥合煉常有奇效。'
    },
    yingu: {
      id: 'yingu', name: '幻霧隱靈丹', category: 'medicine', tier: 5, price: 1100,
      target: 'allAllies', usableInField: false, buff: { id: 'stealth', turns: 3 },
      desc: '百草鼎至高秘丹！戰鬥中使用令我方全體隱入雲霧 3 回合，免疫敵方攻擊！'
    },

    // === 六部位裝備 — 手持武器 (Expanded Progression Tiers + 4 Ultimate Legendary Weapons!) ===
    mujian: {
      id: 'mujian', name: '沉鐵無鋒劍', category: 'equip', slot: 'weapon', price: 30,
      who: ['luxiao'], stats: { atk: 9, lck: 4 }, throwDmg: 110,
      desc: '十八年前裴爺爺自蘆葦破舟中與少游一同拾起的舊鐵劍，劍格刻有半闕潮紋。'
    },
    tiejian: {
      id: 'tiejian', name: '煙波百煉劍', category: 'equip', slot: 'weapon', price: 170,
      who: ['luxiao', 'yueling'], stats: { atk: 21 }, throwDmg: 240,
      desc: '聽雨渡周鐵匠千錘百煉的精鋼長劍，鋒刃堅實。'
    },
    qingfengjian: {
      id: 'qingfengjian', name: '秋水青鋒劍', category: 'equip', slot: 'weapon', price: 450,
      who: ['luxiao', 'yueling'], stats: { atk: 38, spd: 6 }, throwDmg: 440,
      desc: '錦官名匠鍛打的輕靈寶劍，出劍如秋水掠波。'
    },
    hanxingjian: {
      id: 'hanxingjian', name: '落霞寒星劍', category: 'equip', slot: 'weapon', price: 780,
      who: ['luxiao'], stats: { atk: 54, mag: 12, spd: 8 }, throwDmg: 620,
      desc: '玄霄外門執劍良兵，劍脊映照寒星清輝。'
    },
    qixingjian: {
      id: 'qixingjian', name: '太微七曜劍', category: 'equip', slot: 'weapon', price: 1250,
      who: ['luxiao'], stats: { atk: 74, mag: 22, lck: 14 }, critBonus: 0.15, throwDmg: 820,
      desc: '鎮魔劍獄古劍，鑲嵌七曜星樞，大幅提升暴擊率。'
    },
    wuchenjian: {
      id: 'wuchenjian', name: '聽潮望舒劍', category: 'equip', slot: 'weapon', price: 2600,
      who: ['luxiao'], stats: { atk: 112, mag: 36, spd: 16, lck: 18 }, doubleHit: true, throwDmg: 1350,
      desc: '潮汐與月華共鳴之名劍，劍氣自生，普通攻擊可觸發【二連擊】！'
    },
    taia_sword: {
      id: 'taia_sword', name: '太阿問心神劍', category: 'equip', slot: 'weapon', price: 4200,
      who: ['luxiao'], stats: { atk: 148, mag: 52, spd: 24, lck: 26 }, doubleHit: true, critBonus: 0.22, throwDmg: 1800,
      desc: '【問心劍塚傳說神兵】太古鑄天氏首劍！普通攻擊【二連擊】且暴擊率激增！'
    },

    shuanglongjian: {
      id: 'shuanglongjian', name: '聽雪雙音劍', category: 'equip', slot: 'weapon', price: 320,
      who: ['lingxi'], stats: { atk: 24, mag: 16, spd: 6 }, doubleHit: true, throwDmg: 340,
      desc: '白芷微隨身雌雄短劍，出劍伴隨清越笛音，普通攻擊自動【二連擊】！'
    },
    yunvshuangjian: {
      id: 'yunvshuangjian', name: '寒玉清商雙劍', category: 'equip', slot: 'weapon', price: 880,
      who: ['lingxi'], stats: { atk: 50, mag: 36, spd: 12 }, doubleHit: true, throwDmg: 660,
      desc: '幽泉寒玉雕琢之雙劍，清音破邪，普通攻擊【二連擊】。'
    },
    tianshezhang: {
      id: 'tianshezhang', name: '素娥月華笛杖', category: 'equip', slot: 'weapon', price: 2700,
      who: ['lingxi'], stats: { atk: 78, mag: 98, def: 24, maxMp: 85 }, mpRegen: 18, throwDmg: 1200,
      desc: '素娥氏歷代司音聖器！五曜靈音威力暴增，每回合自動凝聚 18 點真氣。'
    },
    sue_tianlai: {
      id: 'sue_tianlai', name: '九霄望舒玉笛劍', category: 'equip', slot: 'weapon', price: 4200,
      who: ['lingxi'], stats: { atk: 105, mag: 132, def: 32, maxMp: 120 }, doubleHit: true, mpRegen: 26, throwDmg: 1600,
      desc: '【問心劍塚傳說神兵】笛劍合一之素娥至寶！普攻【二連擊】且每回合回氣 26 點！'
    },

    honglingbian: {
      id: 'honglingbian', name: '赤羽流星鞭', category: 'equip', slot: 'weapon', price: 480,
      who: ['yueling'], stats: { atk: 36, spd: 10 }, splashAll: true, throwDmg: 420,
      desc: '鎮遠鏢局燕驚鴻隨身長鞭，鞭影如火，普通攻擊可【橫掃敵方全體】！'
    },
    jinshebian: {
      id: 'jinshebian', name: '金鱗破陣鞭', category: 'equip', slot: 'weapon', price: 1080,
      who: ['yueling'], stats: { atk: 65, spd: 16, lck: 10 }, splashAll: true, throwDmg: 740,
      desc: '以溶洞金鱗鍛造之軟鞭，普通攻擊【橫掃敵方全體】，破風裂甲。'
    },
    jiujiebian: {
      id: 'jiujiebian', name: '九節驚雷赤鞭', category: 'equip', slot: 'weapon', price: 2350,
      who: ['yueling'], stats: { atk: 98, mag: 26, spd: 20 }, splashAll: true, throwDmg: 1180,
      desc: '引落霞天雷淬煉之神鞭，普通攻擊【橫掃敵方全體】並挾雷火之威！'
    },
    zhenyuan_shenbian: {
      id: 'zhenyuan_shenbian', name: '鎮遠焚天龍鞭', category: 'equip', slot: 'weapon', price: 4200,
      who: ['yueling'], stats: { atk: 134, mag: 38, spd: 28, lck: 20 }, splashAll: true, critBonus: 0.18, throwDmg: 1650,
      desc: '【問心劍塚傳說神兵】燕氏先祖遺留之赤金龍鞭，橫掃千軍、無堅不摧！'
    },

    miaoyindao: {
      id: 'miaoyindao', name: '百草流螢刃', category: 'equip', slot: 'weapon', price: 920,
      who: ['aman'], stats: { atk: 56, mag: 44, lck: 16 }, poisonHit: 'chidu', throwDmg: 650,
      desc: '雲珞隨身彎刃，刃鋒塗有大澤奇草，普攻有機率令敵人染上赤毒。'
    },
    wuyuezhang: {
      id: 'wuyuezhang', name: '神木萬靈杖', category: 'equip', slot: 'weapon', price: 2450,
      who: ['aman'], stats: { atk: 74, mag: 92, spd: 18, lck: 22 }, poisonHit: 'zhangdu', throwDmg: 1120,
      desc: '千年梧桐芯雕琢之靈杖，翠鈴輕響間百蟲聽令，大幅強化風火與靈蟲秘術。'
    },
    shennong_zhang: {
      id: 'shennong_zhang', name: '百草乾坤神杖', category: 'equip', slot: 'weapon', price: 4200,
      who: ['aman'], stats: { atk: 98, mag: 128, spd: 25, lck: 30 }, poisonHit: 'zhangdu', mpRegen: 20, throwDmg: 1580,
      desc: '【問心劍塚傳說神兵】蘊藏大澤生滅造化之神杖，靈力浩瀚並附劇烈瘴蝕！'
    },

    // === 頭戴 (Head) ===
    pimao: {
      id: 'pimao', name: '青竹斗笠巾', category: 'equip', slot: 'head', price: 75,
      stats: { def: 7, maxHp: 18 }, desc: '煙波渡船家常戴的輕便方巾，遮雨防風。'
    },
    cuiyuchai: {
      id: 'cuiyuchai', name: '聽雪碧玉簪', category: 'equip', slot: 'head', price: 260,
      who: ['lingxi', 'yueling', 'aman'], stats: { def: 15, mag: 13, lck: 6 },
      desc: '溫潤清透的碧玉髮簪，清心養神。'
    },
    zijinkuan: {
      id: 'zijinkuan', name: '太微星紋冠', category: 'equip', slot: 'head', price: 680,
      stats: { def: 28, mag: 20, maxMp: 40 }, desc: '玄霄劍宗內門道冠，凝神聚氣。'
    },
    chongtiankuan: {
      id: 'chongtiankuan', name: '望舒曜金冠', category: 'equip', slot: 'head', price: 1500,
      stats: { def: 46, atk: 16, mag: 26, lck: 14 }, desc: '上古望舒神將戰冠，金輝凜然。'
    },

    // === 披掛 (Cloak) ===
    hujian: {
      id: 'hujian', name: '蓑煙麻披肩', category: 'equip', slot: 'cloak', price: 90,
      stats: { def: 8, spd: 3 }, desc: '江南行旅遮風擋雨的麻布披肩。'
    },
    yufengpifeng: {
      id: 'yufengpifeng', name: '鎮遠赤羽披', category: 'equip', slot: 'cloak', price: 380,
      stats: { def: 19, spd: 11, lck: 6 }, desc: '鏢局少主颯爽披風，行動迅捷如風。'
    },
    mozhupifeng: {
      id: 'mozhupifeng', name: '棲雲墨竹氅', category: 'equip', slot: 'cloak', price: 720,
      stats: { def: 28, mag: 16, spd: 12, maxHp: 45 }, desc: '織入寒竹靈絲的雅致鶴氅。'
    },
    fengwenpifeng: {
      id: 'fengwenpifeng', name: '流雲鳳羽氅', category: 'equip', slot: 'cloak', price: 1150,
      stats: { def: 38, mag: 24, spd: 16, maxHp: 75 }, desc: '雲錦繡鳳之華貴仙氅，水火難侵。'
    },

    // === 身穿 (Body) ===
    buyi: {
      id: 'buyi', name: '江風粗布衫', category: 'equip', slot: 'body', price: 60,
      stats: { def: 9 }, desc: '撐篙少年日常穿著的乾淨短衫。'
    },
    tengjia: {
      id: 'tengjia', name: '翠竹韌藤甲', category: 'equip', slot: 'body', price: 250,
      stats: { def: 22, maxHp: 40 }, desc: '以老竹與韌藤浸泡藥汁編織的輕甲。'
    },
    suozijia: {
      id: 'suozijia', name: '玄鐵鎖子甲', category: 'equip', slot: 'body', price: 620,
      who: ['luxiao', 'yueling'], stats: { def: 36, atk: 8, maxHp: 65 },
      desc: '錦官鐵匠精鍛的護身鎖甲，堅固異常。'
    },
    jinlvyi: {
      id: 'jinlvyi', name: '素娥流光裳', category: 'equip', slot: 'body', price: 820,
      who: ['lingxi', 'yueling', 'aman'], stats: { def: 40, mag: 24, spd: 11 },
      desc: '月華銀絲織就的羽衣，輕若無物卻刀劍難傷。'
    },
    tiancanyi: {
      id: 'tiancanyi', name: '鑄天玄蠶寶甲', category: 'equip', slot: 'body', price: 1650,
      stats: { def: 68, maxHp: 130, mag: 26 },
      desc: '冰蠶絲混合鑄天玄鐵織成之護體神衣。'
    },

    // === 足穿 (Footwear) ===
    caoxie: {
      id: 'caoxie', name: '踏浪草編履', category: 'equip', slot: 'foot', price: 50,
      stats: { def: 4, spd: 5 }, desc: '柔軟防滑的渡口草鞋。'
    },
    jifengxue: {
      id: 'jifengxue', name: '追風走鏢靴', category: 'equip', slot: 'foot', price: 320,
      stats: { def: 13, spd: 15 }, desc: '鏢師日行百里的輕便快靴，大幅提升身法。'
    },
    buyunlv: {
      id: 'buyunlv', name: '望舒踏月履', category: 'equip', slot: 'foot', price: 1150,
      stats: { def: 28, spd: 30, lck: 15 }, desc: '踏月無痕之仙履，閃避與出手速度極快。'
    },

    // === 配戴法寶與五曜靈魄 (Relics — 改變合擊技！) ===
    huxinjing: {
      id: 'huxinjing', name: '古銅護心鏡', category: 'equip', slot: 'relic', price: 220,
      stats: { def: 15, maxHp: 45 }, desc: '護住心脈的青銅古鏡。'
    },
    yuansi_umb: {
      id: 'yuansi_umb', name: '聽雨油紙傘墜', category: 'equip', slot: 'relic', price: 450,
      stats: { def: 14, mag: 16, spd: 10, lck: 12 }, hpRegen: 18,
      desc: '煙波鎮老傘匠精製的平安傘墜，每回合微幅恢復氣血。'
    },
    yufozhu: {
      id: 'yufozhu', name: '菩提清音珠', category: 'equip', slot: 'relic', price: 680,
      stats: { def: 18, mag: 22, lck: 14 }, coopOverride: 'fofawubian',
      desc: '蘊含古寺梵音的寶珠。配戴者參與【合擊】時可觸發絕學【梵音鎮魔】！'
    },
    fenglingzhu: {
      id: 'fenglingzhu', name: '扶搖風魄', category: 'equip', slot: 'relic', price: 0, isKeyRelic: true,
      stats: { mag: 30, spd: 25, lck: 12 }, resistElem: 'wind', coopOverride: 'fengshen',
      desc: '五曜鎮淵靈魄之一，蘊藏九天罡風。配戴後【合擊】昇華為神召【風曜·扶搖萬里】！'
    },
    leilingzhu: {
      id: 'leilingzhu', name: '驚蟄雷魄', category: 'equip', slot: 'relic', price: 0, isKeyRelic: true,
      stats: { atk: 22, mag: 36, spd: 14 }, resistElem: 'thunder', coopOverride: 'leishen',
      desc: '五曜鎮淵靈魄之一，紫電奔雷流轉。配戴後【合擊】昇華為神召【雷曜·紫電天罰】！'
    },
    huolingzhu: {
      id: 'huolingzhu', name: '焚天火魄', category: 'equip', slot: 'relic', price: 0, isKeyRelic: true,
      stats: { atk: 30, mag: 34, maxHp: 70 }, resistElem: 'fire', coopOverride: 'huoshen',
      desc: '五曜鎮淵靈魄之一，祝融真火不息。配戴後【合擊】昇華為神召【火曜·祝融焚世】！'
    },
    tulingzhu: {
      id: 'tulingzhu', name: '坤輿土魄', category: 'equip', slot: 'relic', price: 0, isKeyRelic: true,
      stats: { def: 40, maxHp: 100, mag: 22 }, resistElem: 'earth', coopOverride: 'shanshen',
      usableInField: true, escapeMaze: true,
      desc: '五曜鎮淵靈魄之一，厚德鎮岳。配戴後【合擊】化為【土曜·星隕崩岳】，迷宮中亦可脫出！'
    },
    shuilingzhu: {
      id: 'shuilingzhu', name: '滄瀾水魄', category: 'equip', slot: 'relic', price: 0, isKeyRelic: true,
      stats: { mag: 40, maxMp: 80, lck: 18 }, resistElem: 'water', hpRegen: 38, coopOverride: 'xueyao',
      desc: '五曜鎮淵靈魄之一，十八年前壬戌燼夜信物。每回合回血，【合擊】昇華為【水曜·滄瀾冰封】！'
    },
    shenglingzhu: {
      id: 'shenglingzhu', name: '望舒五曜聖魄', category: 'equip', slot: 'relic', price: 0, isKeyRelic: true,
      stats: { atk: 38, mag: 58, def: 38, spd: 26, lck: 26 }, hpRegen: 48, mpRegen: 18, coopOverride: 'wushen',
      desc: '五曜靈魄歸一之至高聖物！配戴後【合擊】將召喚開天闢地的終極神威【鑄天劍神】！'
    },

    // === 劇情與支線關鍵信物 (Key Items) ===
    zijinyulu: {
      id: 'zijinyulu', name: '聽雪清心露', category: 'key',
      desc: '白芷微以素娥清音凝成的靈露，能拔除裴爺爺體內的蝕憶燼毒。'
    },
    liangumin: {
      id: 'liangumin', name: '百草丹鼎', category: 'key',
      desc: '雲夢澤神農一脈祖傳小鼎，可在選單【百草鼎】將任意兩種草藥、靈蟲或暗器合煉成奇珍！'
    },
    sheyao_key: {
      id: 'sheyao_key', name: '玄鐵礦脈鑰', category: 'key',
      desc: '開啟鬼哭礦脈深處無生教丹室閘門的玄鐵密鑰。'
    },
    zhenyuan_flag: {
      id: 'zhenyuan_flag', name: '染血鎮遠殘旗', category: 'key',
      desc: '十八年前燕鐵衣遺落於暗河的鏢旗一角，血字直指玄霄劍宗內鬼。'
    },
    fenghuangyu: {
      id: 'fenghuangyu', name: '梧桐鳳血髓', category: 'key',
      desc: '千年神木谷古梧桐凝結的赤紅靈髓，辛夷藥婆救治燕驚鴻與白芷微的續命奇珍之一。'
    },
    huoqilinjiao: {
      id: 'huoqilinjiao', name: '祝融赤炎丹', category: 'key',
      desc: '祝融地脈炎麟神獸贈予之純陽內丹，能化解素娥寒霜與斷脈重傷。'
    },
    memory_shard: {
      id: 'memory_shard', name: '宿命殘簡', category: 'key',
      desc: '記載壬戌燼夜真相與羈絆的望舒玉簡殘片。集齊 4 枚以上可於【歸墟照影碑】締造逆命之契。'
    },
    longtan_pact: {
      id: 'longtan_pact', name: '同心守歲契', category: 'key',
      desc: '於望舒古墟「歸墟照影碑」前以四人羈絆凝結之靈契——不教任何人獨自化霜殉道！'
    },
    // 支線奇遇專屬道具
    umbrella_bamboo: {
      id: 'umbrella_bamboo', name: '湘妃老竹骨', category: 'key',
      desc: '蘆花古渡拾獲的堅韌竹骨，煙波鎮老傘匠修補傳家油紙傘急需的材料。'
    },
    sunken_letter: {
      id: 'sunken_letter', name: '油布封存家書', category: 'key',
      desc: '沉船灘木匣中尋獲的防水家書，收信人是煙波鎮茶肆的阿芸姑娘。'
    },
    frost_orchid: {
      id: 'frost_orchid', name: '幽谷寒蘭', category: 'key',
      desc: '棲雲竹海深處盛開的罕見靈蘭，許杏林大夫研製解毒湯藥的珍貴藥引。'
    },
    star_iron: {
      id: 'star_iron', name: '沉淵寒鐵礦', category: 'key',
      desc: '鬼哭礦脈暗河底拾獲的星紋寒鐵，錦官城鐵匠夢寐以求的鍛劍奇材。'
    },
    broken_sword_token: {
      id: 'broken_sword_token', name: '守約舊劍穗', category: 'key',
      desc: '落霞山道古亭石縫中尋獲的褪色劍穗，似乎屬於玄霄劍獄中某位苦候故人之人。'
    },
    taia_jade: {
      id: 'taia_jade', name: '太阿古劍佩', category: 'key',
      desc: '鑄天氏留下的古老劍形玉佩。持此佩可於第五章【望舒古墟】開啟隱藏秘境【問心劍塚】！'
    }
  };

  // === 百草丹鼎配方矩陣 (Alchemy Recipes) ===
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

  // === 武學與五曜仙術總表 (100% Original Names & Lore, Authentic Tactical Depth) ===
  const SKILLS = {
    // 裴少游技能 (聽潮劍意 + 江湖奇技)
    feiyuntanlong: {
      id: 'feiyuntanlong', name: '妙手摘星', mp: 8, elem: 'none', type: 'steal', target: 'enemy',
      desc: '煙波渡練就的靈巧身手！從敵人或首領身上探取文錢與珍稀寶物。'
    },
    qiliaoshu: {
      id: 'qiliaoshu', name: '渡氣回春', mp: 10, elem: 'none', type: 'heal', target: 'ally',
      power: 115, usableInField: true,
      desc: '以溫煦內息活血化瘀，恢復單人約 115+ 點體力。'
    },
    yujianshu: {
      id: 'yujianshu', name: '聽潮御劍', mp: 14, elem: 'sword', type: 'attack', target: 'enemy',
      power: 102, scale: 'both',
      desc: '謝滄海夜授劍意，聽江潮起落而御劍凌空斬敵！'
    },
    bingxinjue: {
      id: 'bingxinjue', name: '清心止水訣', mp: 14, elem: 'water', type: 'cleanse', target: 'ally',
      power: 75, usableInField: true,
      desc: '心若止水不染塵埃，解除單人所有中毒與負面狀態並小幅回血。'
    },
    tianshifufa: {
      id: 'tianshifufa', name: '驚雷破邪符', mp: 22, elem: 'thunder', type: 'attack', target: 'enemy',
      power: 170, scale: 'both',
      desc: '引動九霄奔雷劍符轟擊邪祟，造成強大雷屬性傷害。'
    },
    tiangangzhanqi: {
      id: 'tiangangzhanqi', name: '北斗戰意', mp: 24, elem: 'none', type: 'buff', target: 'self',
      buff: { id: 'tiangang', turns: 4 },
      desc: '激發北斗七曜戰意，4 回合內物理武術傷害翻倍！'
    },
    zuixianwangyue: {
      id: 'zuixianwangyue', name: '踏月留香步', mp: 28, elem: 'wind', type: 'buff', target: 'self',
      buff: { id: 'zuixian', turns: 5 },
      desc: '踏波逐月之瀟灑步法！5 回合內閃避大增且普通攻擊化為【二連擊】！'
    },
    wanjianjue: {
      id: 'wanjianjue', name: '千山煙雨劍', mp: 36, elem: 'sword', type: 'attack', target: 'allEnemies',
      power: 205, scale: 'both',
      desc: '劍氣化作漫天江南煙雨傾瀉而下，重創敵方全體！'
    },
    xianfengyunti: {
      id: 'xianfengyunti', name: '御風行雲訣', mp: 20, elem: 'wind', type: 'buff', target: 'allAllies',
      buff: { id: 'yunti', turns: 4 },
      desc: '江風托體，提升我方全體身法速度與閃避 4 回合。'
    },
    tianjian: {
      id: 'tianjian', name: '太虛破曉劍', mp: 54, elem: 'sword', type: 'attack', target: 'allEnemies',
      power: 325, scale: 'both',
      desc: '人劍合一化作撕裂長夜的破曉巨劍，對敵方全體造成驚天劍傷！'
    },
    qiankunyizhi: {
      id: 'qiankunyizhi', name: '千金散盡', mp: 25, coinCost: 400, elem: 'none', type: 'coinAttack', target: 'allEnemies',
      power: 470,
      desc: '千金散盡還復來！消耗 400 文錢漫天激射，對敵全體造成無視防禦的巨額傷害！'
    },
    jiushen: {
      id: 'jiushen', name: '醉月狂歌', mp: 1, requireWine: true, elem: 'holy', type: 'wineGod', target: 'allEnemies',
      desc: '謝滄海畢生至高劍意！飲盡一壺酒並傾盡當前全部真氣（傷害=真氣×8），整場旅途限用九次！'
    },

    // 白芷微技能 (素娥五曜清音 + 聽雪醫術)
    guanyinzhou: {
      id: 'guanyinzhou', name: '甘露清音', mp: 15, elem: 'water', type: 'heal', target: 'ally',
      power: 190, usableInField: true,
      desc: '玉笛吹奏回春清曲，恢復單人大量體力。'
    },
    yanzhou: {
      id: 'yanzhou', name: '離火引', mp: 13, elem: 'fire', type: 'attack', target: 'enemy',
      power: 108, scale: 'mag',
      desc: '笛音激盪離火灼燒單一敵人（火剋雷）。'
    },
    bingzhou: {
      id: 'bingzhou', name: '寒江雪', mp: 13, elem: 'water', type: 'attack', target: 'enemy',
      power: 108, scale: 'mag',
      desc: '凝霜成刃刺穿單一敵人（水剋火）。'
    },
    leizhou: {
      id: 'leizhou', name: '驚蟄引', mp: 14, elem: 'thunder', type: 'attack', target: 'enemy',
      power: 116, scale: 'mag',
      desc: '清商高音引落春雷劈擊單敵（雷剋風）。'
    },
    fengzhou: {
      id: 'fengzhou', name: '扶搖風刃', mp: 22, elem: 'wind', type: 'attack', target: 'allEnemies',
      power: 145, scale: 'mag',
      desc: '竹海狂風席捲全場，攻擊敵方全體（風剋土）。'
    },
    jingyizhou: {
      id: 'jingyizhou', name: '滌塵清曲', mp: 16, elem: 'water', type: 'cleanse', target: 'allAllies',
      power: 85, usableInField: true,
      desc: '清音滌盡燼毒，解除我方全體中毒與異常狀態並小補體力。'
    },
    zhenyuanhuti: {
      id: 'zhenyuanhuti', name: '坤元護身曲', mp: 22, elem: 'earth', type: 'buff', target: 'allAllies',
      buff: { id: 'zhenyuan', turns: 4 },
      desc: '厚土靈韻護佑周身，4 回合內我方全體防禦大幅提升！'
    },
    wuleizhou: {
      id: 'wuleizhou', name: '九霄神雷引', mp: 34, elem: 'thunder', type: 'attack', target: 'enemy',
      power: 285, scale: 'mag',
      desc: '九天紫電轟頂，對單一強敵造成毀滅性雷系傷害！'
    },
    sanmeizhenhuo: {
      id: 'sanmeizhenhuo', name: '紅蓮焚天曲', mp: 36, elem: 'fire', type: 'attack', target: 'allEnemies',
      power: 230, scale: 'mag',
      desc: '赤蓮烈焰焚盡邪祟，對敵方全體造成猛烈火傷！'
    },
    taishanyading: {
      id: 'taishanyading', name: '萬壑崩雲', mp: 35, elem: 'earth', type: 'attack', target: 'allEnemies',
      power: 225, scale: 'mag',
      desc: '千鈞山岳鎮落，對敵方全體造成土系重創（土剋水）！'
    },
    huanhunzhou: {
      id: 'huanhunzhou', name: '返魂仙曲', mp: 38, elem: 'holy', type: 'revive', target: 'deadAlly',
      hpPct: 0.58, usableInField: true,
      desc: '素娥氏秘傳招魂仙音，喚醒陣亡同伴並恢復近六成體力。'
    },
    wuqichaoyuan: {
      id: 'wuqichaoyuan', name: '五曜歸元曲', mp: 46, elem: 'water', type: 'heal', target: 'allAllies',
      power: 405, usableInField: true,
      desc: '匯聚天地五曜甘霖，大幅恢復我方全體體力！'
    },
    fengxuebingtian: {
      id: 'fengxuebingtian', name: '千里聽雪封天', mp: 52, elem: 'water', type: 'attack', target: 'allEnemies',
      power: 335, scale: 'mag',
      desc: '極寒飛雪冰封萬里，對敵全體造成極高水系傷害！'
    },
    mengshe: {
      id: 'mengshe', name: '素娥·望舒天籟', mp: 68, elem: 'holy', type: 'mengshe', target: 'allEnemies',
      power: 425,
      desc: '覺醒素娥司音本源聖曲！對敵全體降下月華天罰，並賦予全隊坤元與回春祝福！'
    },

    // 燕驚鴻技能 (鎮遠鏢局絕學 + 剛猛破陣武功)
    qijianzhi: {
      id: 'qijianzhi', name: '破風指劍', mp: 14, elem: 'sword', type: 'attack', target: 'enemy',
      power: 125, scale: 'atk',
      desc: '駢指如刀破空點出，凌厲勁風貫穿單敵。'
    },
    ningshenguiyuan: {
      id: 'ningshenguiyuan', name: '歸元調息', mp: 16, elem: 'none', type: 'heal', target: 'ally',
      power: 170, usableInField: true,
      desc: '鎮遠鏢局內家護脈法門，恢復單人體力。'
    },
    yiyangzhi: {
      id: 'yiyangzhi', name: '赤羽穿雲勁', mp: 26, elem: 'fire', type: 'attack', target: 'enemy',
      power: 245, scale: 'atk', ignoreDef: 0.4,
      desc: '凝聚純陽赤羽掌指破甲穿心，無視敵人四成防禦！'
    },
    qijuejianqi: {
      id: 'qijuejianqi', name: '七星裂空斬', mp: 34, elem: 'sword', type: 'attack', target: 'allEnemies',
      power: 222, scale: 'atk',
      desc: '七道赤紅鞭劍氣芒縱橫交錯，斬擊敵方全體！'
    },
    zhanlongjue: {
      id: 'zhanlongjue', name: '驚鴻斬天闕', mp: 48, elem: 'thunder', type: 'attack', target: 'allEnemies',
      power: 330, scale: 'atk',
      desc: '燕氏家傳至高絕學，長鞭化作紫電赤龍橫掃千軍！'
    },

    // 雲珞技能 (百草靈蟲奇術 + 雲夢大澤風火法)
    yufengshu: {
      id: 'yufengshu', name: '流螢飛蝗陣', mp: 16, elem: 'wind', type: 'attack', target: 'allEnemies',
      power: 140, scale: 'mag', inflict: 'chidu',
      desc: '搖動翠鈴驅使大澤靈蟲席捲全場，高機率附加【赤毒】。'
    },
    lingxuezhou: {
      id: 'lingxuezhou', name: '百草回脈訣', mp: 20, elem: 'water', type: 'cleanse', target: 'allAllies',
      power: 190, usableInField: true,
      desc: '百草懸空寨秘術，恢復我方全體體力並拔除一切毒素。'
    },
    wanyishixiang: {
      id: 'wanyishixiang', name: '玄蟻破甲陣', mp: 28, elem: 'earth', type: 'attack', target: 'enemy',
      power: 255, scale: 'mag', inflict: 'zhangdu',
      desc: '噬鐵玄蟻啃噬強敵護甲，造成土系重創並附加劇烈【瘴毒】！'
    },
    guijiang: {
      id: 'guijiang', name: '雲夢迷魂霧', mp: 26, elem: 'poison', type: 'attack', target: 'allEnemies',
      power: 162, scale: 'mag', inflict: 'stun',
      desc: '奇香幻霧擾亂心神，傷敵全體並有機率令敵人【定身】無法行動！'
    },
    lianyuzhenhuo: {
      id: 'lianyuzhenhuo', name: '祝融地脈火', mp: 48, elem: 'fire', type: 'attack', target: 'allEnemies',
      power: 325, scale: 'mag',
      desc: '引動大澤祝融地火噴薄而出，焚燒敵方全體！'
    },
    fengjuancanyun: {
      id: 'fengjuancanyun', name: '九天狂嵐引', mp: 50, elem: 'wind', type: 'attack', target: 'allEnemies',
      power: 335, scale: 'mag',
      desc: '呼喚大澤九天狂飆撕裂大地，對敵方全體造成毀滅性風系傷害！'
    }
  };

  // === 合擊絕技 (Co-op Skills — 含五曜靈魄與望舒聖魄神召變化！) ===
  const COOP_SKILLS = {
    hetiqigong: {
      id: 'hetiqigong', name: '聽潮合璧劍', elem: 'sword', power: 245, hpCostPct: 0.08,
      poem: '江潮共鳴破雲霄！', desc: '裴少游領銜全隊真氣合一，化為璀璨劍虹貫穿全場！'
    },
    chiyanlianhua: {
      id: 'chiyanlianhua', name: '素娥映月華', elem: 'water', power: 265, hpCostPct: 0.08,
      poem: '清笛映月滌塵囂！', desc: '白芷微引導同伴靈力綻放澄澈月華，淨化群邪！'
    },
    xianyuezhan: {
      id: 'xianyuezhan', name: '赤羽裂雲斬', elem: 'thunder', power: 275, hpCostPct: 0.08,
      poem: '赤羽驚鴻裂夜空！', desc: '燕驚鴻借眾人之力騰空揮出滿月雷火斬擊！'
    },
    tiannusanhua: {
      id: 'tiannusanhua', name: '百草流螢舞', elem: 'poison', power: 270, hpCostPct: 0.08,
      inflict: 'chidu', poem: '萬點流螢落繁花！', desc: '雲珞攜眾人靈氣灑下漫天流螢奇花！'
    },
    fofawubian: {
      id: 'fofawubian', name: '梵音鎮魔印', elem: 'holy', power: 350, hpCostPct: 0.07,
      poem: '清鐘梵音鎮諸邪！', desc: '【菩提清音珠合擊】萬丈金光化作古鐘梵印鎮壓全體邪祟！'
    },
    fengshen: {
      id: 'fengshen', name: '風曜·扶搖萬里', elem: 'wind', power: 480, hpCostPct: 0.09,
      poem: '扶搖九天捲狂嵐！', desc: '【扶搖風魄合擊】喚醒太古風曜神威，青嵐龍捲席捲天地！'
    },
    leishen: {
      id: 'leishen', name: '雷曜·紫電天罰', elem: 'thunder', power: 495, hpCostPct: 0.09,
      poem: '驚蟄神雷誅萬邪！', desc: '【驚蟄雷魄合擊】喚醒太古雷曜怒擊天鼓，萬道紫雷轟碎敵陣！'
    },
    huoshen: {
      id: 'huoshen', name: '火曜·祝融焚世', elem: 'fire', power: 490, hpCostPct: 0.09,
      poem: '祝融赤焰照乾坤！', desc: '【焚天火魄合擊】喚醒祝融火曜傾瀉天火，焚盡世間濁魔！'
    },
    shanshen: {
      id: 'shanshen', name: '土曜·星隕崩岳', elem: 'earth', power: 485, hpCostPct: 0.09,
      poem: '坤輿移山鎮九幽！', desc: '【坤輿土魄合擊】喚醒坤輿土曜投落神峰，震碎八方妖邪！'
    },
    xueyao: {
      id: 'xueyao', name: '水曜·滄瀾冰封', elem: 'water', power: 485, hpCostPct: 0.09,
      healPct: 0.22, poem: '滄瀾萬里雪漫天！', desc: '【滄瀾水魄合擊】喚醒滄瀾水曜凍結全場，並以甘霖治癒全隊！'
    },
    wushen: {
      id: 'wushen', name: '鑄天劍神·斬破宿命', elem: 'holy', power: 750, hpCostPct: 0.1,
      poem: '五曜歸一喚劍神，一劍開天破宿命！',
      desc: '【望舒五曜聖魄終極合擊】五曜合一召喚太古鑄天劍神巨影，揮落斬斷宿命之神劍！'
    }
  };

  function resolveCoopSkill(livingParty) {
    if (!livingParty || livingParty.length < 2) return null;
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
