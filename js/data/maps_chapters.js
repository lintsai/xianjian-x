(function (root) {
  'use strict';

  const PalX = (root.PalX = root.PalX || {});

  // 圖塊定義:
  // '#' 牆壁/山岩(阻擋), '~' 水域/岩漿/深淵(阻擋), 'T' 古樹/石柱(阻擋)
  // 'G' 機關門/結界(未解鎖時阻擋，解鎖後可行走)
  // '.' 草地/地面, 'f' 室內木地板/大殿石磚, 'r' 石板街道, 'b' 棧橋/荷葉橋
  const MAPS = {
    // =========================================================================
    // 1. 第一章：臨安渡·忘憂客棧 (16x14)
    // =========================================================================
    linan_inn: {
      id: 'linan_inn',
      chapter: '第一章·臨安晨鐘',
      name: '臨安渡·忘憂客棧',
      theme: 'jiangnan_town',
      music: 'town',
      spawn: { x: 3, y: 3 },
      gateFlag: null,
      grid: [
        '################',
        '#ffffff#..T...T#',
        '#ffffff#...rr..#',
        '#ffffff....rr..#',
        '#ffffff#..rrr..#',
        '###ff###.rrrrr.#',
        '#..rr....rr.rr.#',
        '#T.rrrrrrrr.rr.#',
        '#..rr..T....rr.#',
        '#..rr....T..rr~#',
        '#..rrrrrrr..bb~#',
        '#T....rr....bb~#',
        '#~~~~~~~~~~~bb~#',
        '################'
      ],
      shops: {
        linan_med: {
          name: '濟世堂·洪大夫藥鋪',
          items: ['zhixuecao', 'xingjundan', 'shuerguo', 'huanshendan', 'chixuecan', 'guihuajiu', 'yinlufeng']
        },
        linan_wpn: {
          name: '臨安鐵匠鋪',
          items: ['tiejian', 'pimao', 'hujian', 'tengjia', 'caoxie', 'meihuabiao']
        }
      },
      objects: [
        { id: 'barrel_wine', type: 'jar', x: 1, y: 1, name: '客棧陳年酒罈', loot: { item: 'guihuajiu', count: 1 }, msg: '在酒罈夾層裡摸出一壺香氣四溢的【桂花酒】！' },
        { id: 'jar_secret', type: 'jar', x: 5, y: 1, name: '客棧青花水缸', multiClick: 3, loot: { gold: 80, item: 'shuerguo', count: 2 }, msg: '連番摸索水缸底座暗格，竟翻出陸逍藏的私房錢 80 文與【鼠兒果×2】！' },
        { id: 'barrel_herb', type: 'barrel', x: 1, y: 4, name: '廚房木桶', loot: { item: 'zhixuecao', count: 2 }, msg: '在木桶旁找到晾乾的【止血草×2】。' },
        { id: 'chest_linan_well', type: 'chest', x: 13, y: 2, name: '古柳樹下木匣', loot: { item: 'memory_shard', count: 1, extraItem: 'meihuabiao', extraCount: 3 }, msg: '打開古柳樹根下的舊木匣，拾獲晶瑩剔透的【宿命記憶碎片】與【梅花鏢×3】！' },
        { id: 'npc_liushen', type: 'npc', sprite: 'elder_woman', x: 2, y: 2, name: '柳嬸', interaction: 'linan_liushen' },
        { id: 'npc_zuijian', type: 'npc', sprite: 'drunk_master', x: 5, y: 4, name: '醉劍翁', interaction: 'linan_zuijian', hideFlag: 'liushen_sick' },
        { id: 'npc_hong', type: 'npc', sprite: 'merchant_med', x: 10, y: 4, name: '洪大夫', interaction: 'linan_hong' },
        { id: 'npc_smith', type: 'npc', sprite: 'blacksmith', x: 4, y: 8, name: '張鐵匠', interaction: 'linan_smith' },
        { id: 'npc_diviner', type: 'npc', sprite: 'elder_man', x: 9, y: 10, name: '算命瞎仙', interaction: 'linan_diviner' },
        { id: 'boat_qixia', type: 'portal', sprite: 'boat', x: 12, y: 11, name: '蘆葦扁舟（往棲霞仙島）', interaction: 'linan_boat' },
        { id: 'portal_suzhou', type: 'portal', sprite: 'portal', x: 2, y: 10, name: '官道驛站（往姑蘇城）', interaction: 'linan_to_suzhou' }
      ],
      enemies: []
    },

    // =========================================================================
    // 2. 第一章迷宮：棲霞仙島·奇門荷花陣 (16x15)
    // =========================================================================
    qixia_island: {
      id: 'qixia_island',
      chapter: '第一章·棲霞仙蹤',
      name: '棲霞仙島·奇門荷花陣',
      theme: 'lotus_island',
      music: 'dungeon',
      spawn: { x: 2, y: 13 },
      gateFlag: 'qixia_seal_broken',
      grid: [
        '################',
        '#~~~~~ffff~~~~~#',
        '#~~~~~ffff~~~~~#',
        '#~~~~~~GG~~~~~~#',
        '#~~..~~bb~~..~~#',
        '#~~.bbbbbbbb.~~#',
        '#~~~b~~~~~~b~~~#',
        '#~~.b..~~..b.~~#',
        '#~~.bbbbbbbb.~~#',
        '#~~~~~~bb~~~~~~#',
        '#~~..~~bb~~..~~#',
        '#~~.bbbbbbbb.~~#',
        '#~~~b~~~~~~b~~~#',
        '#..bb~~~~~~bb..#',
        '################'
      ],
      objects: [
        { id: 'portal_back_linan', type: 'portal', sprite: 'boat', x: 1, y: 13, name: '返回臨安渡口', targetMap: 'linan_inn', targetX: 12, targetY: 10 },
        { id: 'statue_wind', type: 'statue', elem: 'wind', x: 3, y: 10, name: '奇門·巽風石像', interaction: 'qixia_statue', flag: 'statue_1' },
        { id: 'statue_fire', type: 'statue', elem: 'fire', x: 12, y: 10, name: '奇門·離火石像', interaction: 'qixia_statue', flag: 'statue_2' },
        { id: 'statue_water', type: 'statue', elem: 'water', x: 3, y: 4, name: '奇門·坎水石像', interaction: 'qixia_statue', flag: 'statue_3' },
        { id: 'statue_thunder', type: 'statue', elem: 'thunder', x: 12, y: 4, name: '奇門·震雷石像', interaction: 'qixia_statue', flag: 'statue_4' },
        { id: 'chest_qixia_1', type: 'chest', x: 14, y: 13, name: '荷塘寶箱', loot: { item: 'xingjundan', count: 2 }, msg: '開啟荷塘寶箱，獲得【行軍丹×2】！' },
        { id: 'chest_qixia_2', type: 'chest', x: 5, y: 7, name: '石橋寶箱', loot: { item: 'shuerguo', count: 2, gold: 120 }, msg: '開啟石橋寶箱，獲得【鼠兒果×2】與 120 文錢！' },
        { id: 'chest_qixia_3', type: 'chest', x: 10, y: 7, name: '霧蓮寶箱', loot: { item: 'xiulijian', count: 2 }, msg: '開啟霧蓮寶箱，獲得暗器【袖裡劍×2】！' },
        { id: 'npc_lingxi_palace', type: 'npc', sprite: 'lingxi', x: 7, y: 2, name: '蘇靈汐', interaction: 'qixia_meet_lingxi', hideFlag: 'lingxi_joined' },
        { id: 'boss_chigui_obj', type: 'boss', sprite: 'boss_chigui', x: 7, y: 9, name: '赤鬼統領', interaction: 'qixia_boss_chigui', requireFlag: 'lingxi_joined', hideFlag: 'defeated_chigui' }
      ],
      enemies: [
        { id: 'e_qx_1', enemyGroup: ['caoyao', 'caoyao'], x: 7, y: 11, patrol: [{ x: 6, y: 11 }, { x: 9, y: 11 }] },
        { id: 'e_qx_2', enemyGroup: ['bishuichan', 'caoyao'], x: 4, y: 8, patrol: [{ x: 4, y: 7 }, { x: 4, y: 8 }] },
        { id: 'e_qx_3', enemyGroup: ['fengchaoyao', 'bishuichan'], x: 11, y: 8, patrol: [{ x: 11, y: 7 }, { x: 11, y: 8 }] },
        { id: 'e_qx_4', enemyGroup: ['fengchaoyao', 'caoyao', 'bishuichan'], x: 7, y: 5, patrol: [{ x: 6, y: 5 }, { x: 9, y: 5 }] }
      ]
    },

    // =========================================================================
    // 3. 第二章：姑蘇城·比武招親擂台 (16x14)
    // =========================================================================
    suzhou_city: {
      id: 'suzhou_city',
      chapter: '第二章·姑蘇煙雨',
      name: '姑蘇城·驚鴻比武擂台',
      theme: 'jiangnan_town',
      music: 'town',
      spawn: { x: 2, y: 11 },
      gateFlag: null,
      grid: [
        '################',
        '#..T.ffffff.T..#',
        '#....ffffff....#',
        '#..T.ffffff.T..#',
        '#......rr......#',
        '#.rrrrrrrrrrrr.#',
        '#.rr...rr...rr.#',
        '#~~~~~~bb~~~~~~#',
        '#.rrrrrrrrrrrr.#',
        '#.rr..T..T..rr.#',
        '#.rr........rr.#',
        '#.rrrrrrrrrrrr.#',
        '#..T........T..#',
        '################'
      ],
      shops: {
        suzhou_wpn: {
          name: '姑蘇神兵坊',
          items: ['qingfengjian', 'cuiyuchai', 'yufengpifeng', 'tengjia', 'jifengxue', 'huxinjing', 'xiulijian', 'leihuozhu']
        },
        suzhou_med: {
          name: '姑蘇回春堂',
          items: ['xingjundan', 'jinchuangyao', 'huanshendan', 'chixuecan', 'jiuyinsan', 'huanhunxiang', 'shaodaozi', 'yinlufeng']
        }
      },
      objects: [
        { id: 'portal_suzhou_linan', type: 'portal', sprite: 'portal', x: 1, y: 11, name: '返回臨安渡', targetMap: 'linan_inn', targetX: 2, targetY: 9 },
        { id: 'npc_yueling_stage', type: 'npc', sprite: 'yueling', x: 7, y: 2, name: '沈月綾', interaction: 'suzhou_arena_duel', hideFlag: 'yueling_joined' },
        { id: 'npc_shentiannan', type: 'npc', sprite: 'elder_man', x: 9, y: 2, name: '沈莊主', interaction: 'suzhou_master_shen' },
        { id: 'npc_suzhou_wpn', type: 'npc', sprite: 'blacksmith', x: 3, y: 6, name: '神兵坊掌櫃', interaction: 'shop_suzhou_wpn' },
        { id: 'npc_suzhou_med', type: 'npc', sprite: 'merchant_med', x: 12, y: 6, name: '回春堂掌櫃', interaction: 'shop_suzhou_med' },
        { id: 'npc_suzhou_inn', type: 'npc', sprite: 'elder_woman', x: 4, y: 10, name: '悅來客棧老闆娘', interaction: 'inn_rest', cost: 60 },
        { id: 'jar_suzhou_1', type: 'jar', x: 13, y: 10, name: '酒肆青瓷罈', loot: { item: 'shaodaozi', count: 1 }, msg: '在酒肆角落拾得烈酒【燒刀子×1】！' },
        { id: 'chest_suzhou_mem', type: 'chest', x: 2, y: 2, name: '擂台畫舫錦盒', loot: { item: 'memory_shard', count: 1, gold: 200 }, msg: '在畫舫錦盒中發現一枚閃爍微光的【宿命記憶碎片】與 200 文錢！' },
        { id: 'portal_to_serpent', type: 'portal', sprite: 'portal', x: 14, y: 8, name: '城東山道（往隱霧蛇窟）', interaction: 'suzhou_to_serpent' }
      ],
      enemies: []
    },

    // =========================================================================
    // 4. 第二章迷宮：隱霧蛇窟 (16x15)
    // =========================================================================
    serpent_cave: {
      id: 'serpent_cave',
      chapter: '第二章·隱霧蛇窟',
      name: '隱霧蛇窟·深淵妖殿',
      theme: 'cave_dungeon',
      music: 'dungeon',
      spawn: { x: 2, y: 13 },
      gateFlag: 'serpent_gate_open',
      grid: [
        '################',
        '#..#..ffff..#..#',
        '#..#..ffff..#..#',
        '#..####GG####..#',
        '#.....#..#.....#',
        '#.###.#..#.###.#',
        '#.#...#..#...#.#',
        '#.#.###..###.#.#',
        '#.#..........#.#',
        '#.#####..#####.#',
        '#.....#..#.....#',
        '###.#.#..#.#.###',
        '#...#......#...#',
        '#..............#',
        '################'
      ],
      objects: [
        { id: 'portal_cave_back', type: 'portal', sprite: 'portal', x: 1, y: 13, name: '返回姑蘇城', targetMap: 'suzhou_city', targetX: 13, targetY: 8 },
        { id: 'switch_serpent', type: 'switch', x: 2, y: 1, name: '青銅蛇首機關樞', interaction: 'serpent_switch' },
        { id: 'chest_cave_1', type: 'chest', x: 13, y: 1, name: '蛇窟秘寶箱', loot: { item: 'yinxingzi', count: 1, extraItem: 'leihuozhu', extraCount: 2 }, msg: '開啟秘寶箱，獲得靈果【銀杏子×1】與【雷火珠×2】！' },
        { id: 'chest_cave_2', type: 'chest', x: 3, y: 6, name: '白骨木箱', loot: { item: 'jinchuangyao', count: 2, gold: 260 }, msg: '獲得【金創藥×2】與 260 文錢！' },
        { id: 'chest_cave_3', type: 'chest', x: 12, y: 6, name: '青苔石匣', loot: { item: 'dulongsha', count: 2, extraItem: 'huanshendan', extraCount: 2 }, msg: '獲得【赤蠍毒砂×2】與【還神丹×2】！' },
        { id: 'boss_shejun_obj', type: 'boss', sprite: 'boss_shejun', x: 7, y: 2, name: '金鱗蛇君與銀狐夫人', interaction: 'serpent_boss_fight', hideFlag: 'defeated_shejun' },
        { id: 'portal_to_shushan', type: 'portal', sprite: 'portal', x: 8, y: 1, name: '暗道出口（往蜀山雲海）', interaction: 'serpent_to_shushan', requireFlag: 'defeated_shejun' }
      ],
      enemies: [
        { id: 'e_sc_1', enemyGroup: ['fushejing', 'fushejing'], x: 7, y: 12, patrol: [{ x: 6, y: 12 }, { x: 9, y: 12 }] },
        { id: 'e_sc_2', enemyGroup: ['huyaonv', 'fushejing'], x: 7, y: 8, patrol: [{ x: 5, y: 8 }, { x: 10, y: 8 }] },
        { id: 'e_sc_3', enemyGroup: ['yanshijia', 'fushejing'], x: 2, y: 4, patrol: [{ x: 2, y: 4 }, { x: 4, y: 4 }] },
        { id: 'e_sc_4', enemyGroup: ['huyaonv', 'yanshijia'], x: 13, y: 4, patrol: [{ x: 11, y: 4 }, { x: 13, y: 4 }] },
        { id: 'e_sc_5', enemyGroup: ['fushejing', 'huyaonv', 'yanshijia'], x: 7, y: 5, patrol: [{ x: 7, y: 4 }, { x: 7, y: 6 }] }
      ]
    },

    // =========================================================================
    // 5. 第三章：蜀山雲海·丹霞仙境 (16x14)
    // =========================================================================
    shushan_sect: {
      id: 'shushan_sect',
      chapter: '第三章·蜀山問情',
      name: '蜀山雲海·丹霞仙境',
      theme: 'shushan_cloud',
      music: 'town',
      spawn: { x: 7, y: 12 },
      gateFlag: null,
      grid: [
        '################',
        '#~~~ffffffff~~~#',
        '#~~~ffffffff~~~#',
        '#~~~~~~bb~~~~~~#',
        '#..ffffffffff..#',
        '#..ffffffffff..#',
        '#..ff..rr..ff..#',
        '#~~~...rr...~~~#',
        '#.ffff.rr.ffff.#',
        '#.ffff.rr.ffff.#',
        '#~~~~~~rr~~~~~~#',
        '#....rrrrrr....#',
        '#....rrrrrr....#',
        '################'
      ],
      shops: {
        shushan_shop: {
          name: '蜀山丹霞仙庫',
          items: ['jinchuangyao', 'panguo', 'longxiancao', 'shenxiancha', 'jiuyinsan', 'huanhunxiang', 'zijinkuan', 'yufozhu', 'leihuozhu']
        }
      },
      objects: [
        { id: 'portal_shushan_back', type: 'portal', sprite: 'portal', x: 5, y: 12, name: '下山雲梯（往姑蘇）', targetMap: 'suzhou_city', targetX: 13, targetY: 8 },
        { id: 'npc_lingxu', type: 'npc', sprite: 'taoist_elder', x: 7, y: 5, name: '凌虛掌門', interaction: 'shushan_lingxu' },
        { id: 'npc_cangming', type: 'npc', sprite: 'taoist_stern', x: 7, y: 2, name: '蒼溟長老', interaction: 'shushan_cangming', hideFlag: 'entered_demon_tower' },
        { id: 'npc_shushan_shop', type: 'npc', sprite: 'merchant_med', x: 3, y: 9, name: '丹房執事', interaction: 'shop_shushan' },
        { id: 'npc_shushan_inn', type: 'npc', sprite: 'elder_man', x: 12, y: 9, name: '雲海知客道人', interaction: 'inn_rest', cost: 100 },
        { id: 'sword_monument', type: 'statue', elem: 'sword', x: 12, y: 4, name: '蜀山古劍塚', interaction: 'shushan_sword_mound' },
        { id: 'portal_demon_tower', type: 'portal', sprite: 'portal', x: 8, y: 1, name: '鎮妖古塔入口', interaction: 'shushan_enter_tower' }
      ],
      enemies: []
    },

    // =========================================================================
    // 6. 第三章迷宮：鎮妖古塔·陰陽太極層 (16x15)
    // =========================================================================
    demon_tower: {
      id: 'demon_tower',
      chapter: '第三章·鎖妖問情',
      name: '鎮妖古塔·陰陽太極層',
      theme: 'demon_tower',
      music: 'dungeon',
      spawn: { x: 7, y: 13 },
      gateFlag: 'tower_seal_open',
      grid: [
        '################',
        '#~~~~ffffff~~~~#',
        '#~~~~ffffff~~~~#',
        '#~~~~~~GG~~~~~~#',
        '#.ffff.bb.ffff.#',
        '#.f..f.bb.f..f.#',
        '#.f..f.bb.f..f.#',
        '#.ffff.ff.ffff.#',
        '#~~~f..ff..f~~~#',
        '#.fff.ffff.fff.#',
        '#.f...ffff...f.#',
        '#.ffffffffffff.#',
        '#~~~~~~ff~~~~~~#',
        '#.....ffff.....#',
        '################'
      ],
      objects: [
        { id: 'portal_tower_back', type: 'portal', sprite: 'portal', x: 5, y: 13, name: '退回蜀山廣場', targetMap: 'shushan_sect', targetX: 7, targetY: 2 },
        { id: 'npc_thinking_ghost', type: 'npc', sprite: 'ghost_npc', x: 2, y: 10, name: '沉思鬼', interaction: 'tower_thinking_ghost' },
        { id: 'npc_book_fairy', type: 'npc', sprite: 'elder_man', x: 13, y: 10, name: '冰晶書中仙', interaction: 'tower_book_fairy' },
        { id: 'switch_yin', type: 'switch', x: 2, y: 4, name: '太極·太陰陣樞', interaction: 'tower_switch', flag: 'tower_yin' },
        { id: 'switch_yang', type: 'switch', x: 13, y: 4, name: '太極·太陽陣樞', interaction: 'tower_switch', flag: 'tower_yang' },
        { id: 'chest_tower_1', type: 'chest', x: 4, y: 5, name: '古塔劍匣', loot: { item: 'yunvshuangjian', count: 1 }, msg: '開啟劍匣，獲得寒氣森然的【玉女雙劍】（蘇靈汐二連擊名劍）！' },
        { id: 'chest_tower_2', type: 'chest', x: 11, y: 5, name: '鎮妖寶箱', loot: { item: 'tianxianglu', count: 1, extraItem: 'memory_shard', extraCount: 1 }, msg: '獲得仙家聖藥【天香續命露×1】與【宿命記憶碎片】！' },
        { id: 'boss_mingwang_obj', type: 'boss', sprite: 'boss_mingwang', x: 7, y: 2, name: '鎮獄明王', interaction: 'tower_boss_mingwang', hideFlag: 'defeated_mingwang' }
      ],
      enemies: [
        { id: 'e_dt_1', enemyGroup: ['tongren', 'feijiang'], x: 7, y: 11, patrol: [{ x: 4, y: 11 }, { x: 10, y: 11 }] },
        { id: 'e_dt_2', enemyGroup: ['feijiang', 'huayao'], x: 4, y: 7, patrol: [{ x: 2, y: 7 }, { x: 5, y: 7 }] },
        { id: 'e_dt_3', enemyGroup: ['tongren', 'huayao'], x: 11, y: 7, patrol: [{ x: 10, y: 7 }, { x: 13, y: 7 }] },
        { id: 'e_dt_4', enemyGroup: ['tongren', 'feijiang', 'huayao'], x: 7, y: 6, patrol: [{ x: 7, y: 5 }, { x: 7, y: 8 }] }
      ]
    },

    // =========================================================================
    // 7. 第四章：南詔大理·白苗聖姑谷 (16x14)
    // =========================================================================
    miao_village: {
      id: 'miao_village',
      chapter: '第四章·南詔苗疆',
      name: '南詔大理·白苗聖姑谷',
      theme: 'miao_village',
      music: 'town',
      spawn: { x: 7, y: 7 },
      gateFlag: null,
      grid: [
        '################',
        '#..T..rrrr..T..#',
        '#.ffff.rr.ffff.#',
        '#.ffff.rr.ffff.#',
        '#..ff..rr..ff..#',
        '#..rrrrrrrrrr..#',
        '#..rr......rr..#',
        '#..rr..rr..rr..#',
        '#..rrrrrr..rr..#',
        '#T.rr......rrrr#',
        '#..rr.ffff.rr..#',
        '#..rr.ffff.rr.T#',
        '#..T........T..#',
        '################'
      ],
      shops: {
        miao_med: {
          name: '白苗萬蠱藥坊',
          items: ['panguo', 'longxiancao', 'shenxiancha', 'jiuyinsan', 'huanhunxiang', 'shaodaozi', 'huashishui', 'guluan', 'wuyingdu']
        },
        miao_wpn: {
          name: '南詔神兵銀坊',
          items: ['fengwenpifeng', 'jinlvyi', 'buyunlv', 'yufozhu', 'leihuozhu', 'xuelinglong']
        }
      },
      objects: [
        { id: 'npc_shenggu', type: 'npc', sprite: 'elder_woman', x: 3, y: 3, name: '聖姑', interaction: 'miao_shenggu' },
        { id: 'npc_aman', type: 'npc', sprite: 'aman', x: 8, y: 5, name: '藍阿蠻', interaction: 'miao_aman_join', hideFlag: 'aman_joined' },
        { id: 'npc_miao_med', type: 'npc', sprite: 'merchant_med', x: 12, y: 3, name: '蠱藥婆婆', interaction: 'shop_miao_med' },
        { id: 'npc_miao_wpn', type: 'npc', sprite: 'blacksmith', x: 7, y: 11, name: '苗銀匠師', interaction: 'shop_miao_wpn' },
        { id: 'npc_miao_inn', type: 'npc', sprite: 'elder_man', x: 11, y: 8, name: '竹樓客舍主人', interaction: 'inn_rest', cost: 120 },
        { id: 'jar_miao_1', type: 'jar', x: 2, y: 2, name: '聖姑藥簍', loot: { item: 'guluan', count: 2, extraItem: 'huashishui', extraCount: 1 }, msg: '在藥簍裡找到【五毒蠱卵×2】與【化屍水×1】（快試試用煉蠱皿合成隱蠱！）' },
        { id: 'portal_miao_shushan', type: 'portal', sprite: 'portal', x: 2, y: 11, name: '蜀南驛道（回蜀山）', targetMap: 'shushan_sect', targetX: 7, targetY: 11 },
        { id: 'portal_to_qilin', type: 'portal', sprite: 'portal', x: 14, y: 9, name: '神木火麟洞入口', interaction: 'miao_to_qilin' },
        { id: 'portal_to_mist', type: 'portal', sprite: 'portal', x: 7, y: 1, name: '女媧神殿·霧魂泉眼', interaction: 'miao_to_mist' }
      ],
      enemies: []
    },

    // =========================================================================
    // 8. 第四章迷宮：神木林·赤炎火麟洞 (16x15)
    // =========================================================================
    fire_qilin_cave: {
      id: 'fire_qilin_cave',
      chapter: '第四章·神木煉蠱',
      name: '神木林·赤炎火麟洞',
      theme: 'fire_cavern',
      music: 'dungeon',
      spawn: { x: 2, y: 13 },
      gateFlag: 'qilin_gate_open',
      grid: [
        '################',
        '#~~~~ffffff~~~~#',
        '#~~~~ffffff~~~~#',
        '#~~~~~~GG~~~~~~#',
        '#..T...bb...T..#',
        '#..bbbbbbbbbb..#',
        '#..b~~~bb~~~b..#',
        '#..b...bb...b..#',
        '#..bbbbbbbbbb..#',
        '#~~~b~~~~~~b~~~#',
        '#...b..TT..b...#',
        '#...bbbbbbbb...#',
        '#..T...bb...T..#',
        '#.....bbbb.....#',
        '################'
      ],
      objects: [
        { id: 'portal_qilin_back', type: 'portal', sprite: 'portal', x: 1, y: 13, name: '返回白苗聖姑谷', targetMap: 'miao_village', targetX: 13, targetY: 9 },
        { id: 'chest_phoenix', type: 'chest', x: 2, y: 4, name: '神木梧桐鳳巢', loot: { item: 'fenghuangyu', count: 1 }, msg: '在神木梧桐枝頭拾獲流光溢彩的續命奇珍【神木鳳凰羽】！' },
        { id: 'switch_qilin', type: 'switch', x: 13, y: 4, name: '南詔祝融火圖騰', interaction: 'qilin_switch' },
        { id: 'chest_qilin_1', type: 'chest', x: 4, y: 7, name: '熔岩寶箱', loot: { item: 'xuehama', count: 1, extraItem: 'shenxiancha', extraCount: 2 }, msg: '開啟熔岩寶箱，獲得【雪蛤蟆×1】與【神仙茶×2】！' },
        { id: 'chest_qilin_2', type: 'chest', x: 11, y: 7, name: '赤晶寶箱', loot: { item: 'xuelinglong', count: 1, gold: 500 }, msg: '開啟赤晶寶箱，獲得秘寶【血玲瓏×1】與 500 文錢！' },
        { id: 'boss_qilin_obj', type: 'boss', sprite: 'boss_qilin', x: 7, y: 2, name: '赤炎火麒麟', interaction: 'qilin_boss_fight', hideFlag: 'defeated_qilin' }
      ],
      enemies: [
        { id: 'e_fq_1', enemyGroup: ['mudaoren', 'wuduxie'], x: 7, y: 11, patrol: [{ x: 4, y: 11 }, { x: 10, y: 11 }] },
        { id: 'e_fq_2', enemyGroup: ['wuduxie', 'huolingshou'], x: 3, y: 8, patrol: [{ x: 3, y: 6 }, { x: 3, y: 8 }] },
        { id: 'e_fq_3', enemyGroup: ['huolingshou', 'huolingshou'], x: 12, y: 8, patrol: [{ x: 12, y: 6 }, { x: 12, y: 8 }] },
        { id: 'e_fq_4', enemyGroup: ['mudaoren', 'wuduxie', 'huolingshou'], x: 7, y: 5, patrol: [{ x: 5, y: 5 }, { x: 10, y: 5 }] }
      ]
    },

    // =========================================================================
    // 9. 第五章：霧魂時之隙·十年前南詔 (16x15)
    // =========================================================================
    mist_dream_past: {
      id: 'mist_dream_past',
      chapter: '第五章·霧魂回夢',
      name: '霧魂時之隙·十年前南詔',
      theme: 'mist_rift',
      music: 'sad',
      spawn: { x: 7, y: 13 },
      gateFlag: 'rift_gate_open',
      grid: [
        '################',
        '#~~~~ffffff~~~~#',
        '#~~~~ffffff~~~~#',
        '#~~~~~~GG~~~~~~#',
        '#..ff..bb..ff..#',
        '#..ffbbbbbbff..#',
        '#~~~b~~~~~~b~~~#',
        '#..ff..ff..ff..#',
        '#..ffffffffff..#',
        '#~~~~~~bb~~~~~~#',
        '#.ffff.bb.ffff.#',
        '#.ffff.bb.ffff.#',
        '#~~~~~~bb~~~~~~#',
        '#.....ffff.....#',
        '################'
      ],
      objects: [
        { id: 'portal_mist_back', type: 'portal', sprite: 'portal', x: 5, y: 13, name: '返回現世白苗谷', targetMap: 'miao_village', targetX: 7, targetY: 2 },
        { id: 'npc_young_luxiao', type: 'npc', sprite: 'child_boy', x: 2, y: 11, name: '十年前的小陸逍', interaction: 'mist_young_luxiao' },
        { id: 'altar_longtan', type: 'statue', elem: 'holy', x: 13, y: 11, name: '九泉·龍潭古鏡祭壇', interaction: 'mist_longtan_mirror' },
        { id: 'switch_mist', type: 'switch', x: 7, y: 7, name: '霧魂凝時神碑', interaction: 'mist_switch' },
        { id: 'chest_mist_staff', type: 'chest', x: 3, y: 4, name: '前代聖女遺匣', loot: { item: 'tianshezhang', count: 1 }, msg: '開啟聖女遺匣，女媧聖器【天蛇靈杖】綻放萬丈碧光！' },
        { id: 'chest_mist_armor', type: 'chest', x: 12, y: 4, name: '時隙仙匣', loot: { item: 'tiancanyi', count: 1, extraItem: 'lingshanxianzhi', extraCount: 1 }, msg: '獲得護體神衣【天蠶玄甲衣】與【靈山仙芝×1】！' },
        { id: 'boss_yexiao_obj', type: 'boss', sprite: 'boss_yexiao', x: 7, y: 2, name: '魔界裂隙統領·夜梟', interaction: 'mist_boss_yexiao', hideFlag: 'defeated_yexiao' },
        { id: 'portal_to_abyss', type: 'portal', sprite: 'portal', x: 8, y: 1, name: '九泉深淵裂口（終章決戰）', interaction: 'mist_to_abyss', requireFlag: 'defeated_yexiao' }
      ],
      enemies: [
        { id: 'e_md_1', enemyGroup: ['shizhixie靈', 'mojieqishi'], x: 7, y: 10, patrol: [{ x: 7, y: 9 }, { x: 7, y: 12 }] },
        { id: 'e_md_2', enemyGroup: ['shizhixie靈', 'shizhixie靈'], x: 4, y: 8, patrol: [{ x: 2, y: 8 }, { x: 6, y: 8 }] },
        { id: 'e_md_3', enemyGroup: ['mojieqishi', 'mojieqishi'], x: 11, y: 8, patrol: [{ x: 9, y: 8 }, { x: 13, y: 8 }] },
        { id: 'e_md_4', enemyGroup: ['shizhixie靈', 'mojieqishi', 'shizhixie靈'], x: 7, y: 5, patrol: [{ x: 5, y: 5 }, { x: 10, y: 5 }] }
      ]
    },

    // =========================================================================
    // 10. 終章：九泉深淵·拜月水魔祭壇 (16x15)
    // =========================================================================
    abyss_altar: {
      id: 'abyss_altar',
      chapter: '終章·宿命迴響',
      name: '九泉深淵·拜月水魔祭壇',
      theme: 'abyss_altar',
      music: 'dungeon',
      spawn: { x: 7, y: 13 },
      gateFlag: 'abyss_seal_open',
      grid: [
        '################',
        '#~~~ffffffff~~~#',
        '#~~~ffffffff~~~#',
        '#~~~~~~GG~~~~~~#',
        '#..ff..bb..ff..#',
        '#..ffffffffff..#',
        '#~~~~~~bb~~~~~~#',
        '#.ffff.ff.ffff.#',
        '#.ffff.ff.ffff.#',
        '#~~~~~~bb~~~~~~#',
        '#..ffffffffff..#',
        '#..ff..bb..ff..#',
        '#~~~ffffffff~~~#',
        '#...ffffffff...#',
        '################'
      ],
      shops: {
        abyss_final: {
          name: '蜀山遠征軍需劍客',
          items: [
            'wuchenjian', 'jiujiebian', 'wuyuezhang', 'chongtiankuan', 'tiancanyi', 'buyunlv',
            'zijinggao', 'lingshanxianzhi', 'tianxianglu', 'shaodaozi', 'xuelinglong', 'yingu'
          ]
        }
      },
      objects: [
        { id: 'portal_abyss_back', type: 'portal', sprite: 'portal', x: 4, y: 13, name: '返回霧魂時之隙', targetMap: 'mist_dream_past', targetX: 7, targetY: 2 },
        { id: 'npc_abyss_shop', type: 'npc', sprite: 'drunk_master', x: 10, y: 13, name: '蜀山行商劍客', interaction: 'shop_abyss_final' },
        { id: 'spring_heal', type: 'statue', elem: 'water', x: 11, y: 13, name: '春滋靈泉投影（免費全滿恢復）', interaction: 'abyss_free_heal' },
        { id: 'party_pedestal', type: 'statue', elem: 'sword', x: 7, y: 10, name: '決戰點將台（編組出戰三人）', interaction: 'abyss_party_select' },
        { id: 'altar_five_pearls', type: 'switch', x: 7, y: 7, name: '五靈封魔總樞祭壇', interaction: 'abyss_five_pearls_altar' },
        { id: 'chest_abyss_1', type: 'chest', x: 2, y: 8, name: '深淵古神匣', loot: { item: 'jincanwang', count: 1, extraItem: 'shaodaozi', extraCount: 2 }, msg: '開啟古神匣，獲得曠世奇珍【金蠶王×1】與【燒刀子×2】！' },
        { id: 'chest_abyss_2', type: 'chest', x: 13, y: 8, name: '九泉秘寶匣', loot: { item: 'yingu', count: 1, extraItem: 'tianxianglu', extraCount: 1 }, msg: '獲得【隱蠱×1】與【天香續命露×1】！' },
        { id: 'boss_final_obj', type: 'boss', sprite: 'boss_youming', x: 7, y: 2, name: '幽溟教主與渾沌水魔獸', interaction: 'abyss_final_battle' }
      ],
      enemies: [
        { id: 'e_ab_1', enemyGroup: ['baiyuejisi', 'shuimofenshen'], x: 5, y: 10, patrol: [{ x: 3, y: 10 }, { x: 6, y: 10 }] },
        { id: 'e_ab_2', enemyGroup: ['shuimofenshen', 'shuimofenshen'], x: 10, y: 10, patrol: [{ x: 9, y: 10 }, { x: 12, y: 10 }] },
        { id: 'e_ab_3', enemyGroup: ['baiyuejisi', 'shuimofenshen', 'baiyuejisi'], x: 7, y: 5, patrol: [{ x: 4, y: 5 }, { x: 11, y: 5 }] }
      ]
    }
  };

  PalX.MAPS = MAPS;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MAPS };
  }
})(typeof window !== 'undefined' ? window : globalThis);
