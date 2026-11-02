(function (root) {
  'use strict';

  const PalX = (root.PalX = root.PalX || {});

  // 角色頭像設定與預設表情色調
  const SPEAKERS = {
    luxiao: { name: '陸逍', portrait: 'luxiao', title: '忘憂少俠' },
    lingxi: { name: '蘇靈汐', portrait: 'lingxi', title: '棲霞聖女' },
    yueling: { name: '沈月綾', portrait: 'yueling', title: '驚鴻千金' },
    aman: { name: '藍阿蠻', portrait: 'aman', title: '白苗少主' },
    liushen: { name: '柳嬸', portrait: 'elder_woman', title: '客棧掌櫃' },
    zuijian: { name: '醉劍翁', portrait: 'drunk_master', title: '蜀山狂客' },
    chigui: { name: '赤鬼統領', portrait: 'boss_chigui', title: '幽溟先鋒' },
    shentiannan: { name: '沈天南', portrait: 'elder_man', title: '驚鴻莊主' },
    shejun: { name: '金鱗蛇君', portrait: 'boss_shejun', title: '隱霧妖王' },
    lingxu: { name: '凌虛道長', portrait: 'taoist_elder', title: '蜀山掌門' },
    cangming: { name: '蒼溟長老', portrait: 'taoist_stern', title: '執劍長老' },
    mingwang: { name: '鎮獄明王', portrait: 'boss_mingwang', title: '鎮塔神魔' },
    shenggu: { name: '聖姑', portrait: 'elder_woman', title: '巫月神醫' },
    qilin: { name: '赤炎火麒麟', portrait: 'boss_qilin', title: '南詔神獸' },
    young_luxiao: { name: '小陸逍', portrait: 'child_boy', title: '十年前稚子' },
    youming: { name: '幽溟教主', portrait: 'boss_youming', title: '拜月遺脈' },
    narrator: { name: '【宿命旁白】', portrait: 'scroll', title: '' }
  };

  // 開場序幕詩卷與對白
  const OPENING_SCENE = {
    poemTitle: '《仙劍X · 霧魂殘夢》',
    poem: '三皇開天清濁分，九泉脈動繫凡塵。\n一壺桂酒江湖夢，十載霧魂宿命人。',
    lines: [
      { speaker: 'narrator', text: '太古三皇絕地天通之後，神農九泉散落六界。十年前，南詔與蜀山地脈交界之「霧魂」泉眼遭「毒瘴」侵蝕，一場驚天大戰後，裂隙暫封，無數俠客卻埋骨煙塵……' },
      { speaker: 'liushen', text: '「陸逍！太陽都曬到客棧招牌上了，還抱著你那把破木劍做大俠夢！快起來招呼客人！」' },
      { speaker: 'luxiao', text: '「哎喲柳嬸，手下留情！我方才在夢裡正御劍斬妖除魔呢，差一劍就成了蜀山劍仙啦！」' },
      { speaker: 'liushen', text: '「少貧嘴！大堂角落來了位衣衫襤褸的老道士，嚷著沒酒不肯走。你去看看酒罈裡還有沒有【桂花酒】，別怠慢了人家。」' },
      { speaker: 'narrator', text: '【操作指引】使用【方向鍵 / WASD】或【滑鼠點擊地面】行走；靠近人物、木桶、水缸或寶箱按【空白鍵 / Enter】或直接點擊即可對話與翻箱搜刮！' }
    ]
  };

  // 各章節當前任務指引計算
  function getQuestObjective(flags) {
    if (!flags.gave_wine_to_zuijian) {
      return '在客棧內翻找【桂花酒】（調查左上酒罈），拿給大堂的【醉劍翁】。';
    }
    if (!flags.liushen_sick) {
      return '與【柳嬸】交談，回報招待客人之事。';
    }
    if (!flags.lingxi_joined) {
      if (!flags.qixia_seal_broken) {
        return '搭渡口蘆葦舟登【棲霞仙島】，擊碎四座奇門石像破除水月宮結界求藥。';
      }
      return '進入棲霞仙島北側水月宮，向聖女【蘇靈汐】求取九泉清露。';
    }
    if (!flags.defeated_chigui) {
      return '護送蘇靈汐離島，擊退攔路的【赤鬼統領】！';
    }
    if (!flags.cured_liushen) {
      return '返回臨安渡忘憂客棧，以紫金九泉露救醒【柳嬸】。';
    }
    if (!flags.yueling_joined) {
      return '經臨安渡西南驛站前往【姑蘇城】，調查比武招親擂台與靈汐身世線索。';
    }
    if (!flags.defeated_shejun) {
      return '由姑蘇城東進入【隱霧蛇窟】，扳動蛇首機關並擊敗妖王救回蘇靈汐！';
    }
    if (!flags.entered_demon_tower) {
      return '由蛇窟北側暗道登上【蜀山丹霞仙境】，拜見凌虛掌門並面對蒼溟長老。';
    }
    if (!flags.defeated_mingwang) {
      return '闖入【鎮妖古塔】，開啟太陰太陽雙陣樞，擊敗鎮獄明王救出蘇靈汐！';
    }
    if (!flags.aman_joined) {
      return '在【白苗聖姑谷】詢問聖姑救治沈月綾之法，並與白苗少主【藍阿蠻】會合。';
    }
    if (!flags.defeated_qilin) {
      return '前往村東【神木火麟洞】，尋得【神木鳳凰羽】並擊敗火麒麟取得【赤炎麒麟角】！';
    }
    if (!flags.saved_yueling) {
      return '攜鳳凰羽與麒麟角返回白苗聖姑谷，交予【聖姑】為沈月綾施展續命仙術。';
    }
    if (!flags.defeated_yexiao) {
      return '由白苗谷北側進入【霧魂時之隙】回到十年前，解開木劍宿命並尋回【水靈珠】！';
    }
    if (!flags.abyss_seal_open) {
      return '踏入【九泉深淵】，在五靈總樞祭壇嵌入五顆靈珠融合【聖靈珠】！';
    }
    return '迎戰【幽溟教主】與【合體·渾沌水魔獸】，見證宿命終局！';
  }

  // 三大史詩結局文本與詩詞
  const ENDINGS = {
    true_ending: {
      id: 'true_ending',
      badge: '【隱藏真結局 · 逆命團圓】',
      title: '龍潭春曉 · 四海逍遙',
      poem: '霧魂散盡見晴空，龍潭鏡轉宿命終。\n臨安桃花依舊笑，仗劍偕行醉春風。',
      scenes: [
        { speaker: 'narrator', text: '渾沌水魔獸在【武神】神威下轟然崩解，然深淵濁浪反噬，九泉霧魂裂隙即將吞沒整座南詔大地！' },
        { speaker: 'lingxi', text: '「雲舟哥哥、月綾姐姐、阿蠻……謝謝你們陪靈汐走過這一路。身為女媧族人，以血脈封印九泉濁厄，本就是我的宿命——」' },
        { speaker: 'luxiao', text: '「慢著！什麼狗屁宿命，我陸逍偏不認！」' },
        { speaker: 'narrator', text: '千鈞一髮之際，陸逍懷中的【龍潭逆命契】與那柄跨越十年的【家傳木劍】同時迸發出萬丈清輝！五枚宿命記憶碎片化作神農龍潭鏡影，替蘇靈汐承接了九泉反噬的濁煞！' },
        { speaker: 'aman', text: '「快看！我吹響巫月引魂笛，把散逸的春滋清氣全都引過來啦！靈汐姐姐體內的濁鎖碎開了！」' },
        { speaker: 'yueling', text: '「哼，說好了一起吃到老、玩到老，誰敢先走一步，本姑娘的紅綾鞭可不答應！」' },
        { speaker: 'lingxi', text: '「雲舟哥哥……我、我還活著？天蛇杖沒有折斷，霧魂泉眼也平息了……」' },
        { speaker: 'luxiao', text: '「哈哈，三皇立誓也好，六界輪迴也罷——只要我們四人並肩，這人間便永遠有春天！走，回臨安渡喝柳嬸釀的桂花酒去！」' },
        { speaker: 'narrator', text: '春風拂過臨安渡口，桃花漫天飛舞。忘憂客棧門前笑語盈盈，四道年輕的身影踏歌遠行，留下一段打破宿命的千古劍俠佳話。' }
      ]
    },
    classic_ending: {
      id: 'classic_ending',
      badge: '【正統結局 · 仙一悲歌】',
      title: '雪落天蛇 · 宿命迴響',
      poem: '碧血丹心化清波，天蛇獨立夕陽坡。\n孤劍踏雪歸何處，梅下紅傘淚婆娑。',
      scenes: [
        { speaker: 'narrator', text: '渾沌水魔獸雖遭重創，卻借九泉毒瘴掀動滅世海嘯！整座深淵天崩地裂，人間危在旦夕！' },
        { speaker: 'lingxi', text: '「雲舟哥哥……還記得棲霞島荷花池畔的紅線嗎？靈汐此生能遇見你，已是三生有幸。」' },
        { speaker: 'luxiao', text: '「靈汐！妳要做什麼？！快回來——！」' },
        { speaker: 'lingxi', text: '「天地萬靈，聽吾女媧祈願——以吾神血，靖平九泉！」' },
        { speaker: 'narrator', text: '白衣聖女翩然飛向滔天巨浪，化作一道璀璨奪目的五彩霞光，與狂暴的水魔獸同歸於盡。洪水退去，殘陽如血，荒原上唯餘一柄【天蛇靈杖】靜靜佇立風中……' },
        { speaker: 'aman', text: '「靈汐姐姐……嗚嗚……為什麼女媧族的人，總逃不過這樣的宿命……」' },
        { speaker: 'narrator', text: '數月後，南詔初雪紛飛。陸逍背負長劍與天蛇靈杖，神情蕭索地辭別白苗谷。' },
        { speaker: 'narrator', text: '風雪蒼茫的山道盡頭，寒梅樹下，一道熟悉的紅衣身影撐著油紙傘，由聖姑傀儡續命術喚醒的【沈月綾】正靜靜凝望著他。四目相對，萬語千言盡化作漫天飛雪……' }
      ]
    },
    lone_ending: {
      id: 'lone_ending',
      badge: '【蒼涼結局 · 孤劍問天】',
      title: '回夢遊仙 · 醉臥忘憂',
      poem: '十載江湖一夢遙，故人散盡雪瀟瀟。\n獨酌桂酒臨江月，猶聽荷塘玉笛簫。',
      scenes: [
        { speaker: 'narrator', text: '水魔獸伏誅，九泉裂隙終歸沉寂。蘇靈汐以女媧血脈化光殉道，而遠在苗疆的沈月綾亦因生機耗盡陷入永眠。' },
        { speaker: 'luxiao', text: '「醉劍翁前輩……原來當年你在忘憂客棧獨飲桂花酒時，心裡便是這般滋味麼？」' },
        { speaker: 'narrator', text: '此後人間多了一位青衫醉劍客，仗劍獨行於蜀山雲海與臨安渡口之間。每逢月明之夜，總在蘆葦舟頭仰天痛飲，夢回那年荷花盛開的棲霞仙島……' }
      ]
    }
  };

  PalX.SPEAKERS = SPEAKERS;
  PalX.OPENING_SCENE = OPENING_SCENE;
  PalX.getQuestObjective = getQuestObjective;
  PalX.ENDINGS = ENDINGS;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SPEAKERS, OPENING_SCENE, getQuestObjective, ENDINGS };
  }
})(typeof window !== 'undefined' ? window : globalThis);
