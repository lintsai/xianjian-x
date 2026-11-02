(function (root) {
  'use strict';

  const PalX = (root.PalX = root.PalX || {});

  const SPEAKERS = {
    luxiao: { name: '裴少游', portrait: 'luxiao', title: '煙波少俠' },
    lingxi: { name: '白芷微', portrait: 'lingxi', title: '聽雪醫女' },
    yueling: { name: '燕驚鴻', portrait: 'yueling', title: '鎮遠少當家' },
    aman: { name: '雲珞', portrait: 'aman', title: '百草司蟲女' },
    liushen: { name: '裴老艄公', portrait: 'ferryman', title: '聽雨渡老翁' },
    zuijian: { name: '謝滄海', portrait: 'blind_lute', title: '瞎眼琴劍客' },
    xudoc: { name: '許杏林', portrait: 'merchant_med', title: '杏林堂大夫' },
    ayun: { name: '阿芸', portrait: 'tea_girl', title: '聽雨茶肆少女' },
    lubo: { name: '魯伯', portrait: 'elder_man', title: '老修傘匠' },
    chigui: { name: '屠千刃', portrait: 'boss_chigui', title: '無生教血刃堂主' },
    qinshu: { name: '秦叔', portrait: 'escort_captain', title: '鎮遠老鏢師' },
    handajiang: { name: '韓大匠', portrait: 'blacksmith', title: '錦官鑄劍名家' },
    luzijin: { name: '陸子衿', portrait: 'scholar', title: '望江茶樓雅士' },
    shejun: { name: '金鱗蟒尊', portrait: 'boss_shejun', title: '暗河鎮爐妖尊' },
    yinhu: { name: '幻月青璃', portrait: 'boss_yinhu', title: '無生惑心妖姬' },
    hanxiao: { name: '韓梟', portrait: 'boss_liwujiu', title: '妄劍棄徒' },
    lingxu: { name: '清虛長老', portrait: 'taoist_elder', title: '玄霄護法長老' },
    cangming: { name: '厲無咎', portrait: 'boss_liwujiu', title: '玄霄執劍首座' },
    lingfeng: { name: '凌風', portrait: 'sect_disciple', title: '太微試劍首徒' },
    peixuan: { name: '守劍癡魂·裴玄', portrait: 'ghost_npc', title: '古獄孤魂' },
    mingwang: { name: '雷獄鎮魂將', portrait: 'boss_mingwang', title: '七曜鎮獄神傀' },
    shenggu: { name: '辛夷藥婆', portrait: 'matriarch', title: '百草懸空寨主' },
    qilin: { name: '祝融炎麟獸', portrait: 'boss_qilin', title: '地脈護道神獸' },
    yantiyi: { name: '燕鐵衣', portrait: 'escort_captain', title: '鎮遠老總鏢頭' },
    young_xie: { name: '青年謝滄海', portrait: 'sect_disciple', title: '十八年前玄霄首徒' },
    young_luxiao: { name: '護舟小童·阿鶴', portrait: 'child_boy', title: '壬戌燼夜見證者' },
    yexiao: { name: '夜溟魔君·玄燭', portrait: 'boss_yexiao', title: '歸墟裂隙魔君' },
    youming: { name: '厲無咎', portrait: 'boss_liwujiu', title: '無生教主·執劍首座' },
    swordspirit: { name: '太阿劍靈', portrait: 'boss_swordspirit', title: '鑄天問心殘魂' },
    narrator: { name: '【燼月卷軸】', portrait: 'scroll', title: '' }
  };

  const OPENING_SCENE = {
    poemTitle: '《仙劍X · 燼月長歌》',
    poem: '煙波一棹聽江雨，半枚殘鈴繫舊塵。\n莫道天涯風雪惡，敢憑孤劍護斯人。',
    lines: [
      { speaker: 'narrator', text: '太初墜星撕裂歸墟溟海，鑄天氏與素娥氏以「五曜靈魄」封淵於望舒天闕之下。然每逢甲子，裂隙便滲出吞噬世人記憶與生機的銀灰「燼毒」。十八年前「壬戌燼夜」一役後，江霧暫平，卻留下無數未解之謎……' },
      { speaker: 'liushen', text: '「鶴汀！江上起霧啦，還抱著你那柄沒開鋒的舊鐵劍發呆！快起來把茶肆訂的油紙傘送去！」' },
      { speaker: 'luxiao', text: '「來啦裴爺爺！我方才聽江潮拍岸，總覺得這柄舊鐵劍在嗡嗡作響，說不定我裴少游天生便是塊練劍仙的料呢！」' },
      { speaker: 'liushen', text: '「少貧嘴！東邊『聽雨茶肆』來了位雙目覆綾的瞎眼琴客，說沒喝到咱們草堂窖藏的【煙波桂花釀】便彈不出曲子。你去屋角酒罈摸一壺送去，別怠慢了遠客。」' },
      { speaker: 'narrator', text: '【操作指引】電腦可用【方向鍵 / WASD】或【滑鼠點擊地面】行走，手機可用左下【虛擬搖桿】與右下【查/疾】鍵；靠近人物、酒罈、木桶或寶箱即可對話與搜刮奇珍！' }
    ]
  };

  // 12 樁完整支線奇遇定義（供任務卷軸與 NPC 頭頂 ? / ✓ 標記即時追蹤）
  const SIDE_QUESTS = [
    {
      id: 'sq_umbrella',
      title: '傳家油紙傘',
      region: '煙波鎮 · 蘆花古渡',
      giver: '老傘匠·魯伯',
      startFlag: 'sq_umbrella_started',
      readyItem: 'umbrella_bamboo',
      doneFlag: 'sq_umbrella_done',
      desc: '煙波鎮西鐵鋪旁的老傘匠魯伯想修好亡妻留下的油紙傘，急需一根沉船灘的【湘妃老竹骨】。',
      rewardText: '法寶【聽雨油紙傘墜】、200 文錢'
    },
    {
      id: 'sq_letter',
      title: '江心平安信',
      region: '煙波鎮 · 蘆花古渡',
      giver: '茶肆阿芸',
      startFlag: 'sq_letter_started',
      readyItem: 'sunken_letter',
      doneFlag: 'sq_letter_done',
      desc: '聽雨茶肆的阿芸憂心行船半月未歸的父親，託你在蘆花沉船灘留意是否有貨船遺留的信物或家書。',
      rewardText: '【聽雨雲霧茗×2】、【煙波桂花釀×2】'
    },
    {
      id: 'sq_orchid',
      title: '幽谷覓寒蘭',
      region: '煙波鎮 · 棲雲竹海',
      giver: '許杏林大夫',
      startFlag: 'sq_orchid_started',
      readyItem: 'frost_orchid',
      doneFlag: 'sq_orchid_done',
      desc: '杏林藥堂的許大夫欲研製預防寒霧的湯劑，請你在棲雲竹海東北深谷採集一株【幽谷寒蘭】。',
      rewardText: '修行靈果【千年梧桐實】、260 文錢'
    },
    {
      id: 'sq_poem',
      title: '望江茶樓對詩',
      region: '錦官城',
      giver: '茶樓雅士·陸子衿',
      startFlag: 'sq_poem_started',
      doneFlag: 'sq_poem_done',
      desc: '錦官城北望江茶樓的陸子衿以詩會友，若能對出他的三聯仙俠詩句，便以古寺寶珠相贈。',
      rewardText: '合擊法寶【菩提清音珠】（解鎖梵音鎮魔印！）'
    },
    {
      id: 'sq_star_iron',
      title: '沉淵寒鐵鑄甲',
      region: '錦官城 · 鬼哭礦脈',
      giver: '韓大匠',
      startFlag: 'sq_star_iron_started',
      readyItem: 'star_iron',
      doneFlag: 'sq_star_iron_done',
      desc: '錦官城西南神兵坊的韓大匠聽聞鬼哭暗河底藏有【沉淵寒鐵礦】，願免費為你鍛造護身重甲。',
      rewardText: '【玄鐵鎖子甲】、【驚雷烈火彈×3】'
    },
    {
      id: 'sq_escort',
      title: '鎮遠忠魂撫恤',
      region: '錦官城 · 鬼哭礦脈',
      giver: '老鏢師·秦叔',
      startFlag: 'sq_escort_started',
      readyFlag: 'defeated_shejun',
      doneFlag: 'sq_escort_done',
      desc: '鎮遠鏢局老鏢師秦叔堅信老總鏢頭燕鐵衣絕非叛徒，盼你在鬼哭礦脈尋回當年失蹤鏢隊的蛛絲馬跡。',
      rewardText: '修行靈果【赤麟鍛骨丹】、450 文錢'
    },
    {
      id: 'sq_miners',
      title: '解救暗河礦工',
      region: '錦官城 · 鬼哭礦脈',
      giver: '礦工之妻·林嫂',
      startFlag: 'sq_miners_started',
      readyFlag: 'saved_miners',
      doneFlag: 'sq_miners_done',
      desc: '錦官城東郊的林嫂哭訴丈夫趙大被無生教扣留在鬼哭礦脈西翼礦牢，救出礦工後記得回城報平安。',
      rewardText: '修行靈砂【凌波星辰砂】、350 文錢'
    },
    {
      id: 'sq_sword_duel',
      title: '太微三招試劍',
      region: '玄霄劍宗',
      giver: '試劍師兄·凌風',
      startFlag: 'sq_sword_duel_started',
      doneFlag: 'sq_sword_duel_done',
      desc: '玄霄劍宗東院的凌風師兄欲領教謝滄海一脈的「聽潮劍意」，堂堂正正與他切磋獲勝吧。',
      rewardText: '修行靈果【望舒凝華果】、400 文錢'
    },
    {
      id: 'sq_sword_oath',
      title: '二百年守劍之約',
      region: '落霞山道 · 鎮魔劍獄',
      giver: '守劍癡魂·裴玄',
      startFlag: 'sq_sword_oath_started',
      readyItem: 'broken_sword_token',
      doneFlag: 'sq_sword_oath_done',
      desc: '鎮魔劍獄西牢的孤魂裴玄苦候師兄二百年。落霞山道古碑石縫中的【守約舊劍穗】或許能解開他的執念。',
      rewardText: '隱藏秘境鑰匙【太阿古劍佩】（開啟問心劍塚！）'
    },
    {
      id: 'sq_painting',
      title: '丹青畫靈解謎',
      region: '鎮魔劍獄',
      giver: '丹青畫靈·素心',
      startFlag: 'sq_painting_started',
      doneFlag: 'sq_painting_done',
      desc: '鎮魔劍獄東牢古卷中的畫靈素心被墨煞困鎖，回答她關於五曜生剋與素娥清音的叩問以助其脫困。',
      rewardText: '【宿命殘簡】、修行靈果【寒潭玉蓮子】'
    },
    {
      id: 'sq_alchemy',
      title: '古方幻霧隱靈',
      region: '雲夢澤·百草懸空寨',
      giver: '煉丹葛伯',
      startFlag: 'sq_alchemy_started',
      readyItem: 'yingu',
      doneFlag: 'sq_alchemy_done',
      desc: '百草懸空寨的葛伯一生醉心古丹方，請用【百草丹鼎】（如靈蟲繭＋凝霧寒露）煉出一顆【幻霧隱靈丹】給他品鑑。',
      rewardText: '保留幻霧隱靈丹，並獲贈至寶【金蠶靈王】！'
    },
    {
      id: 'sq_spirit_fawn',
      title: '迷霧尋回靈鹿',
      region: '百草懸空寨 · 迷霧瘴林',
      giver: '尋獸阿木',
      startFlag: 'sq_fawn_started',
      readyFlag: 'fawn_rescued',
      doneFlag: 'sq_fawn_done',
      desc: '懸空寨少年阿木飼養的小靈鹿誤入迷霧瘴林東南角，驅散瘴氣並安撫小靈鹿後回報阿木。',
      rewardText: '修行奇石【鑄天玄武石】、【九轉續命露】'
    }
  ];

  function getQuestObjective(flags) {
    if (!flags.gave_wine_to_zuijian) {
      return '在煙波鎮聽雨草堂翻找【煙波桂花釀】（調查屋角酒罈），送往聽雨茶肆給【瞎眼琴客】。';
    }
    if (!flags.liushen_sick) {
      return '返回聽雨草堂與【裴老艄公】交談。';
    }
    if (!flags.lingxi_joined) {
      if (!flags.reed_sluice_open) {
        return '由煙波鎮南渡口乘船前往【蘆花古渡·沉船灘】，扳動東西兩座沉船潮汐水閘打通北岸航道。';
      }
      if (!flags.defeated_fuzhou) {
        return '擊敗蘆花古渡北岸攔路的【覆舟玄蛟】，登上棲雲竹海！';
      }
      if (!flags.qixia_seal_broken) {
        return '在【棲雲竹海】共鳴四座四象音碑（宮、商、角、羽），解開聽雪藥廬音律結界。';
      }
      return '進入棲雲竹海北側聽雪藥廬，向【白芷微】求取拔除燼毒之靈露。';
    }
    if (!flags.defeated_chigui) {
      return '與白芷微並肩下山，擊退強闖竹海的無生教【血刃堂主·屠千刃】！';
    }
    if (!flags.cured_liushen) {
      return '返回煙波鎮聽雨草堂，以聽雪清心露救醒臥榻的【裴老艄公】。';
    }
    if (!flags.yueling_joined) {
      return '經煙波鎮西南驛站前往巴蜀【錦官城】，赴城東【鎮遠鏢局】查訪十八年前封淵重鏢線索。';
    }
    if (!flags.defeated_shejun) {
      return '由錦官城東南進入【鬼哭礦脈·暗河溶洞】，解救礦工、尋得玄鐵鑰並擊敗雙妖尊奪回【扶搖風魄】！';
    }
    if (!flags.defeated_jiannu) {
      return '攜染血鎮遠殘旗由錦官城北門攀登【落霞山道】，擊敗攔路棄徒韓梟登上玄霄劍宗。';
    }
    if (!flags.entered_demon_tower) {
      return '進入【玄霄劍宗·太微廣場】北殿稟報真相，面對執劍首座厲無咎的發難。';
    }
    if (!flags.defeated_mingwang) {
      return '在太微廣場受謝滄海傳授【醉月狂歌】後闖入【鎮魔劍獄】，開啟太陰太陽雙樞救出白芷微！';
    }
    if (!flags.aman_joined) {
      return '在【雲夢澤·百草懸空寨】北廳向辛夷藥婆問診，並與寨口【雲珞】會合取得百草丹鼎。';
    }
    if (!flags.defeated_fumuzun || !flags.got_fenghuangyu) {
      return '由懸空寨東橋進入【迷霧瘴林】，點亮三座驅瘴風圖騰，擊敗腐木毒尊取得【梧桐鳳血髓】與【坤輿土魄】！';
    }
    if (!flags.defeated_qilin) {
      return '由神木谷東南地脈裂口深入【祝融赤炎熔窟】，開啟雙火樞並通過【祝融炎麟獸】試煉取得赤炎丹與【焚天火魄】！';
    }
    if (!flags.saved_yueling) {
      return '攜梧桐鳳血髓與祝融赤炎丹返回百草懸空寨，交予【辛夷藥婆】救醒燕驚鴻與白芷微！';
    }
    if (!flags.defeated_yexiao) {
      return '由懸空寨西北踏入【望舒古墟】（可於照影碑締造守歲契或開啟問心劍塚），穿過鏡門回到十八年前【壬戌燼夜】尋回【滄瀾水魄】！';
    }
    if (!flags.causeway_seal_open) {
      return '橫跨【歸墟溟海·沉淵古道】，破除東西兩座無生血陣樞，登臨望舒天闕！';
    }
    if (!flags.abyss_seal_open) {
      return '在【望舒天闕】五曜封天總樞祭壇嵌入五顆靈魄，融合【望舒五曜聖魄】！';
    }
    return '迎戰【執劍首座·厲無咎】與破淵而出的【太古蝕月巨獸】，譜寫燼月長歌終章！';
  }

  const ENDINGS = {
    true_ending: {
      id: 'true_ending',
      badge: '【圓滿真結局 · 破命同舟】',
      title: '燼散月明 · 煙波共白首',
      poem: '歸墟霧散見晴空，守歲同心宿命終。\n聽雨渡頭春水暖，一船星月醉江風。',
      scenes: [
        { speaker: 'narrator', text: '太古蝕月巨獸在【鑄天劍神】萬丈神威下轟然崩解！然而歸墟裂隙劇烈震盪，漫天銀灰寒霜倒捲而上，眼看便要吞噬整座望舒天闕！' },
        { speaker: 'lingxi', text: '「少游、驚鴻姐姐、阿螢……能與你們同行這一路，芷微此生已無憾事。素娥司音本就為封淵而生，這最後一道寒淵，便由我化霜鎮守——」' },
        { speaker: 'luxiao', text: '「不准去！白芷微，妳忘了我們在照影碑前立下的誓言嗎？！」' },
        { speaker: 'narrator', text: '千鈞一髮之際，裴少游懷中的【同心守歲契】與那半枚跨越十八載風霜的青銅古鈴同時迸發出璀璨金輝！五枚宿命殘簡化作壬戌四義與四人一路走來的萬千記憶星河，將反噬白芷微經脈的素娥寒霜盡數消融！' },
        { speaker: 'aman', text: '「太好啦！我把百草鼎裡的祝融暖陽清氣全都引進五曜大陣了！芷微姐姐鬢邊的寒霜退去啦！」' },
        { speaker: 'yueling', text: '「哼，鎮遠鏢局保的鏢，從來沒有半路折損的道理！說好回江南喝桂花釀，少一個人本少主都不答應！」' },
        { speaker: 'lingxi', text: '「少游……我的經脈不再結冰了，歸墟溟海也徹底平息了……我們，真的活下來了？」' },
        { speaker: 'luxiao', text: '「哈哈，有痛苦也好，有風雨也罷，正因為記得彼此，這人間才值得走一遭！走，回煙波鎮聽雨渡，裴爺爺和謝前輩還在等咱們開席呢！」' },
        { speaker: 'narrator', text: '三月春風拂過江南煙波鎮，垂柳新綠，江水澄碧。一葉烏篷船載著四位少年俠侶的笑語歌聲緩緩駛入春江花月之中，成就九州千古流傳的劍俠佳話。' }
      ]
    },
    classic_ending: {
      id: 'classic_ending',
      badge: '【正統結局 · 仙俠悲歌】',
      title: '孤笛聽雪 · 煙波待故人',
      poem: '素心一曲鎮寒波，玉笛空留舊渡坡。\n年年江上春雨落，猶問歸舟載雪麼。',
      scenes: [
        { speaker: 'narrator', text: '太古蝕月巨獸雖遭重創伏誅，歸墟溟海卻掀動滔天銀灰狂潮，五曜大陣獨缺一道司音靈脈鎮壓陣眼，九州人間危在旦夕！' },
        { speaker: 'lingxi', text: '「少游……還記得初見時，你在聽雪藥廬門外笨拙叩響四象音碑的模樣嗎？這世間最美的風景，芷微都已經記在心裡了。」' },
        { speaker: 'luxiao', text: '「芷微！妳把玉笛放下——妳答應過要回煙波鎮看春雨的！快回來——！」' },
        { speaker: 'lingxi', text: '「莫怕遺忘，莫怨離別……願以素娥清音，換九州萬家永記故人！」' },
        { speaker: 'narrator', text: '白衣醫女翩然踏月而起，吹響最後一曲《望舒天籟》。清越笛音化作萬里晶瑩雪蓮，將翻湧的歸墟溟海永遠冰封於天闕之下。風雪散盡時，祭壇上唯餘一支溫潤的【素心玉笛】靜靜橫陳……' },
        { speaker: 'aman', text: '「芷微姐姐……嗚嗚……為什麼救了天下所有人的記憶，卻唯獨留不下她自己……」' },
        { speaker: 'narrator', text: '經年之後，江南煙波鎮春雨如絲。鎮遠鏢局重振聲威，燕驚鴻常策馬自巴蜀趕來江南；只是聽雨渡口那艘烏篷船頭，總立著一位腰懸玉笛與舊鐵劍的青衫青年，望著蘆花深處的濛濛江霧，久久不曾收篙……' }
      ]
    },
    lone_ending: {
      id: 'lone_ending',
      badge: '【蒼涼結局 · 孤劍遠行】',
      title: '萬里孤鴻 · 劍影入蒼茫',
      poem: '十八年來一夢遙，江天暮雪劍蕭蕭。\n不教故人見白首，獨聽寒江夜雨潮。',
      scenes: [
        { speaker: 'narrator', text: '歸墟終封，蝕月巨獸化為飛灰。然最後關頭，裴少游強行以聽潮劍體替白芷微截下一半歸墟寒煞，自知寒毒入骨、不願令故人徒增傷悲。' },
        { speaker: 'luxiao', text: '「謝前輩……原來當年你背著焦尾琴獨走天涯時，心裡裝的是這樣的山水。」' },
        { speaker: 'narrator', text: '他在聽雨渡口悄悄留下一柄修補完好的油紙傘與平安書信，在黎明江霧散去前孤身仗劍遠行。此後九州江湖多了一位聽潮無名劍客，每逢月明之夜，猶聞遠山傳來似哭似笑的醉月劍歌……' }
      ]
    }
  };

  PalX.SPEAKERS = SPEAKERS;
  PalX.OPENING_SCENE = OPENING_SCENE;
  PalX.SIDE_QUESTS = SIDE_QUESTS;
  PalX.getQuestObjective = getQuestObjective;
  PalX.ENDINGS = ENDINGS;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SPEAKERS, OPENING_SCENE, SIDE_QUESTS, getQuestObjective, ENDINGS };
  }
})(typeof window !== 'undefined' ? window : globalThis);
