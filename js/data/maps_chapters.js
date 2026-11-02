(function (root) {
  'use strict';

  const PalX = (root.PalX = root.PalX || {});

  // 圖塊定義:
  // '#' 外牆/山岩(阻擋), 'w' 江南粉牆黛瓦/竹寨圍牆(阻擋), '~' 水域/岩漿/溟海(阻擋)
  // 'T' 古樹(阻擋), 'W' 垂柳(阻擋), 'B' 翠竹林(阻擋)
  // 'G' 第一道機關門/結界, 'H' 第二道密室閘門
  // '.' 自然地面, 'r' 青石街道/山徑, 'p' 雕花廣場白玉磚, 'f' 室內木地板/廳堂, 'c' 錦繡宮毯, 'b' 棧橋/渡橋
  const MAPS = {
  "yanbo_town": {
    "id": "yanbo_town",
    "chapter": "第一章·煙波燼起",
    "name": "煙波鎮·聽雨渡",
    "theme": "jiangnan_town",
    "music": "ferry_town",
    "spawn": {
      "x": 5,
      "y": 5
    },
    "gateFlag": null,
    "gate2Flag": null,
    "grid": [
      "################################",
      "#..............................#",
      "#.wwwwwwww..wwwwww....wwwwwwww.#",
      "#.wfccccfw.Wwffffw...WwffffffwT#",
      "#.wfccccfw..wffffw....wffffffw.#",
      "#.wffffffw..wffffw....wffffffw.#",
      "#.wffffffw.Wwffffw....wffffffw.#",
      "#.wwwffwww..wwffww....wwwffwww.#",
      "#...rrrrrrrrrrrrrrbbbrrrrrrrr..#",
      "#.T.rrrrrrrrrrrrrrbbbrrrrrrrr.T#",
      "#........rrr......~~~rrrrrrrr..#",
      "#.wwwwwwwrrrpppppp~~~rrrrrrrr..#",
      "#.wfffffwrrrpppppp~~~rrrrrrrr..#",
      "#.wffffffrrrpppppp~~~rrrrrrrr..#",
      "#.wffffffrrrppppppbbbrrrrrrrr..#",
      "#.wfffffwrrrppppppbbbrrrrrrrr.T#",
      "#.wwwwwwwrrrpppppp~~~rrrrrrrr..#",
      "#........rrr......~~~rrrrrrrr..#",
      "#.TrrrrrrrrrrrrrrW~~~rrrrrrrr..#",
      "#..rrrrrrrrrrrrrrr~~~...bbb.W..#",
      "#..rrr.........W..~~~W..bbb....#",
      "#~~~~~~~~~~~~~~~~~~~~~~~bbb~~~~#",
      "#~~~~~~~~~~~~~~~~~~~~~~~bbb~~~~#",
      "#~~~~~~~~~~~~~~~~~~~~~~~bbb~~~~#",
      "#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#",
      "################################"
    ],
    "objects": [
      {
        "id": "yb_paifang_1",
        "type": "decor",
        "sprite": "paifang",
        "x": 10,
        "y": 9,
        "name": "",
        "decor": true,
        "blocking": false
      },
      {
        "id": "yb_paifang_2",
        "type": "decor",
        "sprite": "paifang",
        "x": 25,
        "y": 18,
        "name": "",
        "decor": true,
        "blocking": false
      },
      {
        "id": "yb_lantern_1",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 8,
        "y": 8,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "yb_lantern_2",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 16,
        "y": 8,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "yb_lantern_3",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 22,
        "y": 8,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "yb_lantern_4",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 12,
        "y": 17,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "yb_lantern_5",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 23,
        "y": 19,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "yb_lantern_6",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 27,
        "y": 19,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "yb_table_1",
        "type": "decor",
        "sprite": "inn_table",
        "x": 13,
        "y": 4,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "yb_table_2",
        "type": "decor",
        "sprite": "inn_table",
        "x": 16,
        "y": 4,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "yb_stall_1",
        "type": "decor",
        "sprite": "market_stall",
        "x": 23,
        "y": 11,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "yb_stall_2",
        "type": "decor",
        "sprite": "market_stall",
        "x": 27,
        "y": 11,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "yb_stall_3",
        "type": "decor",
        "sprite": "market_stall",
        "x": 27,
        "y": 15,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "yb_well_1",
        "type": "decor",
        "sprite": "well_stone",
        "x": 12,
        "y": 11,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "yb_wpnrack_1",
        "type": "decor",
        "sprite": "weapon_rack",
        "x": 3,
        "y": 12,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "yb_flower_1",
        "type": "decor",
        "sprite": "flower_bush",
        "x": 10,
        "y": 6,
        "name": "",
        "decor": true,
        "blocking": false
      },
      {
        "id": "yb_flower_2",
        "type": "decor",
        "sprite": "flower_bush",
        "x": 21,
        "y": 6,
        "name": "",
        "decor": true,
        "blocking": false
      },
      {
        "id": "yb_flower_3",
        "type": "decor",
        "sprite": "flower_bush",
        "x": 16,
        "y": 17,
        "name": "",
        "decor": true,
        "blocking": false
      },
      {
        "id": "barrel_wine",
        "type": "jar",
        "x": 3,
        "y": 3,
        "name": "草堂陳年酒罈",
        "loot": {
          "item": "guihuajiu",
          "count": 1
        },
        "msg": "揭開紅泥封口，取出一壺醇香撲鼻的【煙波桂花釀】！"
      },
      {
        "id": "jar_secret",
        "type": "jar",
        "x": 8,
        "y": 3,
        "name": "青花儲水大缸",
        "multiClick": 3,
        "loot": {
          "gold": 120,
          "item": "shuerguo",
          "count": 2
        },
        "msg": "連番摸索水缸底座暗格，翻出少游平日修傘攢下的私房錢 120 文與【翠竹甘露實×2】！"
      },
      {
        "id": "barrel_herb",
        "type": "barrel",
        "x": 23,
        "y": 3,
        "name": "藥堂曬藥竹簍",
        "loot": {
          "item": "zhixuecao",
          "count": 3
        },
        "msg": "在藥簍旁拾得許大夫贈與鄰里的【青露草×3】。"
      },
      {
        "id": "chest_yanbo_willow",
        "type": "chest",
        "x": 29,
        "y": 17,
        "name": "江畔古柳木匣",
        "loot": {
          "item": "xiulijian",
          "count": 2,
          "gold": 90
        },
        "msg": "打開古柳下的舊木匣，獲得【穿雲袖箭×2】與 90 文錢！"
      },
      {
        "id": "stele_yanbo",
        "type": "stone_stele",
        "x": 15,
        "y": 11,
        "name": "聽雨渡記碑",
        "interaction": "yanbo_stele"
      },
      {
        "id": "npc_peiye",
        "type": "npc",
        "sprite": "ferryman",
        "x": 6,
        "y": 4,
        "name": "裴老艄公",
        "interaction": "linan_liushen",
        "barks": [
          "「鶴汀啊，修完傘記得把渡船纜繩再緊一緊。」",
          "「今早江上的霧怎地帶著一股寒灰味……」"
        ],
        "states": [
          {
            "when": "cured_liushen",
            "x": 6,
            "y": 4,
            "pose": "stand",
            "barks": [
              "「多虧白姑娘的清心露，爺爺這把老骨頭又能撐篙囉！」",
              "「十八年前那場大霧……你腰間的殘鈴或許真藏著來歷。」"
            ]
          },
          {
            "when": "liushen_sick",
            "x": 4,
            "y": 4,
            "pose": "kneel",
            "barks": [
              "「咳咳……鶴汀……爺爺眼前一片銀灰，怎地想不起……」"
            ]
          }
        ]
      },
      {
        "id": "npc_xiecanghai",
        "type": "npc",
        "sprite": "blind_lute",
        "x": 15,
        "y": 5,
        "name": "瞎眼琴客",
        "interaction": "linan_zuijian",
        "hideFlag": "liushen_sick",
        "barks": [
          "「無酒難調焦尾琴，少年郎，可願尋一壺桂花釀？」",
          "「江潮聲裡有故人劍鳴……」"
        ]
      },
      {
        "id": "npc_xu_doc",
        "type": "npc",
        "sprite": "merchant_med",
        "x": 25,
        "y": 4,
        "name": "許杏林大夫",
        "interaction": "linan_hong",
        "serviceBadge": "藥",
        "questId": "sq_orchid",
        "barks": [
          "「春季江氣濕寒，出門多備幾株青露草吧。」",
          "「若能尋得棲雲竹海的幽谷寒蘭，便能配出清瘴良方了。」"
        ],
        "states": [
          {
            "when": "liushen_sick && !cured_liushen",
            "x": 5,
            "y": 4,
            "facing": "left",
            "barks": [
              "「脈象結霜、神識漸散！快由沉船灘上棲雲竹海求見聽雪醫女！」"
            ]
          }
        ]
      },
      {
        "id": "npc_smith_zhou",
        "type": "npc",
        "sprite": "blacksmith",
        "x": 4,
        "y": 14,
        "name": "周鐵匠",
        "interaction": "linan_smith",
        "serviceBadge": "兵",
        "pose": "work",
        "barks": [
          "「叮噹！好鋼得經千錘百煉！」",
          "「蘆花灘近來水妖作祟，沒把趁手鐵劍可別亂闖！」"
        ]
      },
      {
        "id": "npc_umbrella_lu",
        "type": "npc",
        "sprite": "elder_man",
        "x": 6,
        "y": 12,
        "name": "老傘匠·魯伯",
        "interaction": "sq_umbrella_npc",
        "questId": "sq_umbrella",
        "barks": [
          "「唉，差一根湘妃老竹骨，這把傳家油紙傘便修不好囉……」",
          "「少游的手藝越來越精湛啦！」"
        ]
      },
      {
        "id": "npc_teagirl_ayun",
        "type": "npc",
        "sprite": "tea_girl",
        "x": 13,
        "y": 5,
        "name": "茶肆阿芸",
        "interaction": "sq_letter_npc",
        "serviceBadge": "茶",
        "questId": "sq_letter",
        "barks": [
          "「客官請用新焙的煙波雨前茶！」",
          "「爹爹搭貨船過蘆花灘已半月未歸，不知平安否……」"
        ]
      },
      {
        "id": "npc_storyteller",
        "type": "npc",
        "sprite": "scholar",
        "x": 14,
        "y": 13,
        "name": "白衣說書人",
        "interaction": "yanbo_storyteller",
        "barks": [
          "「話說十八年前壬戌燼夜，四位大俠夜入江心——」",
          "「欲知五曜靈魄下落，且聽下回分解！」"
        ]
      },
      {
        "id": "npc_inn_ferryman",
        "type": "npc",
        "sprite": "ferryman",
        "x": 22,
        "y": 19,
        "name": "守渡老船夫",
        "interaction": "yanbo_inn_rest",
        "serviceBadge": "宿",
        "barks": [
          "「累了便在烏篷船艙歇息一宿，江風最能養神！」"
        ]
      },
      {
        "id": "npc_patrol_sailor",
        "type": "npc",
        "sprite": "escort_captain",
        "x": 10,
        "y": 12,
        "name": "巡渡水手·阿牛",
        "interaction": "yanbo_villager_1",
        "patrol": [
          {
            "x": 10,
            "y": 10
          },
          {
            "x": 10,
            "y": 17
          },
          {
            "x": 16,
            "y": 17
          },
          {
            "x": 16,
            "y": 10
          }
        ],
        "barks": [
          "「大家當心腳下青苔！」",
          "「聽說錦官城那邊最近熱鬧得很，卻也有怪病流傳。」"
        ]
      },
      {
        "id": "npc_patrol_aunt",
        "type": "npc",
        "sprite": "elder_woman",
        "x": 22,
        "y": 13,
        "name": "採蓮陳嫂",
        "interaction": "yanbo_villager_2",
        "patrol": [
          {
            "x": 22,
            "y": 10
          },
          {
            "x": 22,
            "y": 16
          },
          {
            "x": 25,
            "y": 16
          },
          {
            "x": 25,
            "y": 10
          }
        ],
        "barks": [
          "「剛摘的新鮮蓮蓬喲！」",
          "「白醫女真是活菩薩，上回我家老頭子染了寒霧全靠她救回。」"
        ]
      },
      {
        "id": "npc_patrol_kid",
        "type": "npc",
        "sprite": "child_boy",
        "x": 13,
        "y": 15,
        "name": "頑童小石頭",
        "interaction": "yanbo_kid",
        "patrol": [
          {
            "x": 12,
            "y": 15
          },
          {
            "x": 16,
            "y": 15
          },
          {
            "x": 16,
            "y": 12
          }
        ],
        "barks": [
          "「少游哥哥！等我長大也要學劍保護渡口！」",
          "「水缸底下是不是藏了好吃的果子呀？」"
        ]
      },
      {
        "id": "npc_post_guard",
        "type": "npc",
        "sprite": "sect_disciple",
        "x": 5,
        "y": 19,
        "name": "驛道巡衛",
        "interaction": "yanbo_post_guard",
        "barks": [
          "「官道通往巴蜀錦官城，請出示路引或留神山匪。」"
        ],
        "states": [
          {
            "when": "cured_liushen",
            "x": 6,
            "y": 18,
            "barks": [
              "「裴少俠、白醫女一路順風！由西南驛站即可直達錦官城！」"
            ]
          }
        ]
      },
      {
        "id": "boat_sunken_reed",
        "type": "portal",
        "sprite": "boat",
        "x": 25,
        "y": 22,
        "name": "烏篷渡船（往蘆花古渡）",
        "interaction": "linan_boat"
      },
      {
        "id": "portal_jinguan",
        "type": "portal",
        "sprite": "portal",
        "x": 3,
        "y": 20,
        "name": "西南官道驛站（往錦官城）",
        "interaction": "linan_to_suzhou"
      }
    ],
    "enemies": [],
    "shops": {
      "yanbo_med": {
        "name": "杏林藥堂·許大夫",
        "items": [
          "zhixuecao",
          "xingjundan",
          "shuerguo",
          "huanshendan",
          "chixuecan",
          "guihuajiu",
          "yinlufeng"
        ]
      },
      "yanbo_wpn": {
        "name": "聽雨渡·周氏鐵鋪",
        "items": [
          "tiejian",
          "pimao",
          "hujian",
          "tengjia",
          "caoxie",
          "huxinjing",
          "meihuabiao"
        ]
      }
    }
  },
  "sunken_reed": {
    "id": "sunken_reed",
    "chapter": "第一章·煙波燼起",
    "name": "蘆花古渡·沉船灘",
    "theme": "lotus_island",
    "music": "reed_marsh",
    "spawn": {
      "x": 3,
      "y": 23
    },
    "gateFlag": "reed_sluice_open",
    "gate2Flag": null,
    "grid": [
      "############################",
      "#~~~~~~~~~~~~~~~~~~~~~~~~~~#",
      "#~~~~~~~~~~~~~~~~~~~~~~~~~~#",
      "#~~~~~~~~~...........~~~~~~#",
      "#~~~~~~~~~.W..............~#",
      "#~~~~~~~~~..............W.~#",
      "#~~~~~~~~~.........bbb....~#",
      "#~~~~~~~~~................~#",
      "#~~~~~~~~~~~~~GG~~~~~.....~#",
      "#~fffff~~~~~~~bb~~~~~.....~#",
      "#~fffff~~~~~~~bb~~~~~~~~~~~#",
      "#~fffff~~~~~~~bb~~~~~~~~~~~#",
      "#~fffff~~~....bb....~~~~~~~#",
      "#~fffffbbbb.........~~~~~~~#",
      "#~fffff~~~..........~~~~~~~#",
      "#~fffff~~~~~~~~b~~~~~~~~~~~#",
      "#~fffff~~~~~~~~b~~~~~fffff~#",
      "#~~~~~~~~~~~~~~b~~~~~fffff~#",
      "#~~~~~~~~~~~~..b..~~~fffff~#",
      "#~~~~~~~~~~~~.....~~~fffff~#",
      "#~~~~~~~~~~~~....bbbbfffff~#",
      "#~..W...~~~~~.....~~~fffff~#",
      "#~.....bbbbbb.W...~~~fffff~#",
      "#~......~~~~~.....~~~~~~~~~#",
      "#~......~~~~~~~~~~~~~~~~~~~#",
      "############################"
    ],
    "objects": [
      {
        "id": "sr_rock_1",
        "type": "decor",
        "sprite": "rock_garden",
        "x": 12,
        "y": 12,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "sr_rock_2",
        "type": "decor",
        "sprite": "rock_garden",
        "x": 17,
        "y": 12,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "sr_rock_3",
        "type": "decor",
        "sprite": "rock_garden",
        "x": 18,
        "y": 4,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "portal_back_yanbo",
        "type": "portal",
        "sprite": "boat",
        "x": 2,
        "y": 23,
        "name": "返回煙波鎮聽雨渡",
        "targetMap": "yanbo_town",
        "targetX": 25,
        "targetY": 21
      },
      {
        "id": "sw_tide_east",
        "type": "switch",
        "x": 23,
        "y": 18,
        "name": "東沉船·潮汐水閘",
        "interaction": "reed_switch",
        "flag": "reed_sw_1"
      },
      {
        "id": "sw_tide_west",
        "type": "switch",
        "x": 4,
        "y": 11,
        "name": "西沉船·潮汐水閘",
        "interaction": "reed_switch",
        "flag": "reed_sw_2"
      },
      {
        "id": "chest_reed_bamboo",
        "type": "chest",
        "x": 24,
        "y": 21,
        "name": "沉船竹材捆",
        "loot": {
          "item": "umbrella_bamboo",
          "count": 1,
          "extraItem": "xingjundan",
          "extraCount": 2
        },
        "msg": "在沉船底艙尋獲堅韌無比的【湘妃老竹骨】（老傘匠魯伯委託之物）與【護脈行軍散×2】！"
      },
      {
        "id": "chest_reed_letter",
        "type": "chest",
        "x": 3,
        "y": 15,
        "name": "防水油布木匣",
        "loot": {
          "item": "sunken_letter",
          "count": 1,
          "gold": 150
        },
        "msg": "開啟沉船木匣，尋獲封存完好的【油布封存家書】（收信人：茶肆阿芸）與 150 文錢！"
      },
      {
        "id": "chest_reed_ne",
        "type": "chest",
        "x": 23,
        "y": 7,
        "name": "蘆洲秘寶箱",
        "loot": {
          "item": "huanshendan",
          "count": 2,
          "extraItem": "meihuabiao",
          "extraCount": 3
        },
        "msg": "獲得【清心聚氣丸×2】與【柳葉飛鏢×3】！"
      },
      {
        "id": "boss_fuzhou_obj",
        "type": "boss",
        "sprite": "ash_serpent",
        "x": 15,
        "y": 6,
        "name": "覆舟玄蛟",
        "interaction": "reed_boss_fuzhou",
        "hideFlag": "defeated_fuzhou"
      },
      {
        "id": "portal_to_qiyun",
        "type": "portal",
        "sprite": "portal",
        "x": 15,
        "y": 3,
        "name": "翠竹石階（往棲雲竹海）",
        "interaction": "reed_to_qiyun"
      }
    ],
    "enemies": [
      {
        "id": "e_sr_1",
        "enemyGroup": [
          "caoyao",
          "caoyao"
        ],
        "x": 15,
        "y": 20,
        "patrol": [
          {
            "x": 14,
            "y": 20
          },
          {
            "x": 16,
            "y": 20
          }
        ]
      },
      {
        "id": "e_sr_2",
        "enemyGroup": [
          "bishuichan",
          "caoyao"
        ],
        "x": 22,
        "y": 19,
        "patrol": [
          {
            "x": 22,
            "y": 17
          },
          {
            "x": 22,
            "y": 20
          }
        ]
      },
      {
        "id": "e_sr_3",
        "enemyGroup": [
          "luhuaxiejing",
          "bishuichan"
        ],
        "x": 14,
        "y": 13,
        "patrol": [
          {
            "x": 13,
            "y": 13
          },
          {
            "x": 16,
            "y": 13
          }
        ]
      },
      {
        "id": "e_sr_4",
        "enemyGroup": [
          "luhuaxiejing",
          "caoyao"
        ],
        "x": 5,
        "y": 13,
        "patrol": [
          {
            "x": 4,
            "y": 13
          },
          {
            "x": 5,
            "y": 15
          }
        ]
      },
      {
        "id": "e_sr_5",
        "enemyGroup": [
          "bishuichan",
          "luhuaxiejing"
        ],
        "x": 12,
        "y": 6,
        "patrol": [
          {
            "x": 11,
            "y": 6
          },
          {
            "x": 13,
            "y": 6
          }
        ]
      }
    ]
  },
  "qiyun_bamboo": {
    "id": "qiyun_bamboo",
    "chapter": "第一章·棲雲聽雪",
    "name": "棲雲竹海·聽雪藥廬",
    "theme": "bamboo_sea",
    "music": "bamboo_clinic",
    "spawn": {
      "x": 15,
      "y": 23
    },
    "gateFlag": "qixia_seal_broken",
    "gate2Flag": null,
    "grid": [
      "##############################",
      "#BBBBBBBBBBBBBBBBBBBBBBBBBBBB#",
      "#BBBBBBBBBwwwwwwwwwwwBBBBBBBB#",
      "#BBBBBBBBBwffcccccffwBB.....B#",
      "#BBBBBBBBBwffcccccffwBB.....B#",
      "#BBBBBBBBBwffcccccffwBB.....B#",
      "#BBBBBBBBBwfffffffffwBB.....B#",
      "#BBBBBBBBBwwwwfffwwwwBB.....B#",
      "#BBB..........GGG...........B#",
      "#BBB..........rrr..........BB#",
      "#BBB..........rrr..........BB#",
      "#BBB..........rrr..........BB#",
      "#BBBBBBbbBBBBBbbbBBBBbbBBBBBB#",
      "#B~~~~~bb~~~~~bbb~~~~bb~~~~~B#",
      "#BBBBBBbbBBBBBbbbBBBBbbBBBBBB#",
      "#BBB..........rrr.........BBB#",
      "#BBB..........rrr.........BBB#",
      "#BBB..........rrr.........BBB#",
      "#BBB..........rrr.........BBB#",
      "#BBBBBBBBBBBBBrrrBBBBBBBBBBBB#",
      "#BBBBBBBBBBB..rrr..BBBBBBBBBB#",
      "#BBBBBBBBBBB..rrr..BBBBBBBBBB#",
      "#BBBBBBBBBBB..rrr..BBBBBBBBBB#",
      "#BBBBBBBBBBB..rrr..BBBBBBBBBB#",
      "#BBBBBBBBBBB.......BBBBBBBBBB#",
      "##############################"
    ],
    "objects": [
      {
        "id": "qy_alch_1",
        "type": "decor",
        "sprite": "alch_cauldron",
        "x": 11,
        "y": 4,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "qy_table_1",
        "type": "decor",
        "sprite": "inn_table",
        "x": 18,
        "y": 4,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "qy_lantern_1",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 12,
        "y": 6,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "qy_lantern_2",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 18,
        "y": 6,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "qy_flower_1",
        "type": "decor",
        "sprite": "flower_bush",
        "x": 24,
        "y": 4,
        "name": "",
        "decor": true,
        "blocking": false
      },
      {
        "id": "qy_flower_2",
        "type": "decor",
        "sprite": "flower_bush",
        "x": 26,
        "y": 5,
        "name": "",
        "decor": true,
        "blocking": false
      },
      {
        "id": "qy_flower_3",
        "type": "decor",
        "sprite": "flower_bush",
        "x": 13,
        "y": 5,
        "name": "",
        "decor": true,
        "blocking": false
      },
      {
        "id": "portal_back_reed",
        "type": "portal",
        "sprite": "portal",
        "x": 15,
        "y": 24,
        "name": "下山石階（返蘆花古渡）",
        "targetMap": "sunken_reed",
        "targetX": 15,
        "targetY": 4
      },
      {
        "id": "statue_1_obj",
        "type": "statue",
        "elem": "wind",
        "x": 5,
        "y": 16,
        "name": "四象音碑·宮音石",
        "interaction": "qixia_statue",
        "flag": "statue_1"
      },
      {
        "id": "statue_2_obj",
        "type": "statue",
        "elem": "fire",
        "x": 24,
        "y": 16,
        "name": "四象音碑·商音石",
        "interaction": "qixia_statue",
        "flag": "statue_2"
      },
      {
        "id": "statue_3_obj",
        "type": "statue",
        "elem": "water",
        "x": 5,
        "y": 9,
        "name": "四象音碑·角音石",
        "interaction": "qixia_statue",
        "flag": "statue_3"
      },
      {
        "id": "statue_4_obj",
        "type": "statue",
        "elem": "thunder",
        "x": 21,
        "y": 9,
        "name": "四象音碑·羽音石",
        "interaction": "qixia_statue",
        "flag": "statue_4"
      },
      {
        "id": "chest_qy_orchid",
        "type": "chest",
        "x": 25,
        "y": 4,
        "name": "幽谷寒蘭叢",
        "loot": {
          "item": "frost_orchid",
          "count": 1,
          "extraItem": "memory_shard",
          "extraCount": 1
        },
        "msg": "採得晶瑩如雪的【幽谷寒蘭】（許杏林大夫委託之藥引），並在蘭根石縫拾獲一枚【宿命殘簡】！"
      },
      {
        "id": "chest_qy_1",
        "type": "chest",
        "x": 7,
        "y": 17,
        "name": "竹林藥匣",
        "loot": {
          "item": "xingjundan",
          "count": 2,
          "gold": 130
        },
        "msg": "開啟竹林藥匣，獲得【護脈行軍散×2】與 130 文錢！"
      },
      {
        "id": "chest_qy_2",
        "type": "chest",
        "x": 8,
        "y": 9,
        "name": "青苔劍匣",
        "loot": {
          "item": "mozhupifeng",
          "count": 1
        },
        "msg": "開啟青苔劍匣，獲得雅致護具【棲雲墨竹氅】！"
      },
      {
        "id": "npc_lingxi_palace",
        "type": "npc",
        "sprite": "lingxi",
        "x": 15,
        "y": 4,
        "name": "白芷微",
        "interaction": "qixia_meet_lingxi",
        "hideFlag": "lingxi_joined",
        "barks": [
          "「竹音亂了……山外有人闖入四象音陣？」"
        ]
      },
      {
        "id": "npc_clinic_boy",
        "type": "npc",
        "sprite": "child_boy",
        "x": 12,
        "y": 5,
        "name": "藥童青竹",
        "interaction": "qiyun_clinic_boy",
        "pose": "work",
        "barks": [
          "「師姐替山下百姓拔除燼毒，昨夜又咳了半宿寒霜……」",
          "「無生教那些惡人總想搶咱們藥廬的素娥玉簡！」"
        ]
      },
      {
        "id": "boss_chigui_obj",
        "type": "boss",
        "sprite": "boss_chigui",
        "x": 15,
        "y": 19,
        "name": "血刃堂主·屠千刃",
        "interaction": "qixia_boss_chigui",
        "requireFlag": "lingxi_joined",
        "hideFlag": "defeated_chigui"
      }
    ],
    "enemies": [
      {
        "id": "e_qy_1",
        "enemyGroup": [
          "fengchaoyao",
          "caoyao"
        ],
        "x": 10,
        "y": 16,
        "patrol": [
          {
            "x": 9,
            "y": 16
          },
          {
            "x": 12,
            "y": 16
          }
        ]
      },
      {
        "id": "e_qy_2",
        "enemyGroup": [
          "zhuyingshe",
          "fengchaoyao"
        ],
        "x": 19,
        "y": 16,
        "patrol": [
          {
            "x": 18,
            "y": 16
          },
          {
            "x": 22,
            "y": 16
          }
        ]
      },
      {
        "id": "e_qy_3",
        "enemyGroup": [
          "zhuyingshe",
          "bishuichan"
        ],
        "x": 10,
        "y": 10,
        "patrol": [
          {
            "x": 9,
            "y": 10
          },
          {
            "x": 12,
            "y": 10
          }
        ]
      },
      {
        "id": "e_qy_4",
        "enemyGroup": [
          "fengchaoyao",
          "zhuyingshe",
          "caoyao"
        ],
        "x": 19,
        "y": 10,
        "patrol": [
          {
            "x": 18,
            "y": 10
          },
          {
            "x": 20,
            "y": 10
          }
        ]
      }
    ]
  },
  "jinguan_city": {
    "id": "jinguan_city",
    "chapter": "第二章·錦官夜雨",
    "name": "錦官城·燈市與鎮遠鏢局",
    "theme": "lantern_city",
    "music": "lantern_city",
    "spawn": {
      "x": 3,
      "y": 14
    },
    "gateFlag": null,
    "gate2Flag": null,
    "grid": [
      "##################################",
      "#................................#",
      "#.wwwwwwwwwwww...wwwwww..........#",
      "#.wfffffwwfffwrrrwffffwwwwwwwwww.#",
      "#.wfffffwwfffwrrrwffffwwpcccccpw.#",
      "#.wfffffwwfffwrrrwffffwwpcccccpw.#",
      "#.wfffffwwfffwrrrwffffwwpcccccpw.#",
      "#.wfffffwwfffwrrrwffffwwpcccccpw.#",
      "#.wwwffwwwwfwwrrrwwffwwwpppppppw.#",
      "#...rrr....rrrrrr..rr..wpppppppw.#",
      "#...rrr....Wrrrrr..rr.Wwpppppppw.#",
      "#.T.rrr....rrrppppprr..wpppppppw.#",
      "#...rrr....rrrppppprr..wwwppwwww.#",
      "#.rrrrrrrrrrppppppprrrrrrrrrrrrr.#",
      "#.rrrrrrrrrrppppppprrrrrrrrrrrrr.#",
      "#.rrrrrrrrrrppppppprrrrrrrrrrrrr.#",
      "#.T.........ppppppp..............#",
      "#...........ppppppp............T.#",
      "#.wwwwwww~~...rrr...W.......W....#",
      "#.wfffffw~~.W.rrr................#",
      "#.wffffffbbrrrrrr................#",
      "#.wffffffbbrrrrrrrrrrrrrrrrrrrrr.#",
      "#.wfffffw~~...rrrrrrrrrrrrrrrrrr.#",
      "#.wfffffw~~...rrrrrrrrrrrrrrrrrr.#",
      "#.wwwwwww~~...rrr................#",
      "#........~~...rrr..............T.#",
      "#........~~......................#",
      "##################################"
    ],
    "objects": [
      {
        "id": "jg_paifang_1",
        "type": "decor",
        "sprite": "paifang",
        "x": 4,
        "y": 14,
        "name": "",
        "decor": true,
        "blocking": false
      },
      {
        "id": "jg_paifang_2",
        "type": "decor",
        "sprite": "paifang",
        "x": 15,
        "y": 11,
        "name": "",
        "decor": true,
        "blocking": false
      },
      {
        "id": "jg_paifang_3",
        "type": "decor",
        "sprite": "paifang",
        "x": 26,
        "y": 13,
        "name": "",
        "decor": true,
        "blocking": false
      },
      {
        "id": "jg_lantern_1",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 7,
        "y": 13,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "jg_lantern_2",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 12,
        "y": 12,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "jg_lantern_3",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 18,
        "y": 12,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "jg_lantern_4",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 23,
        "y": 13,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "jg_lantern_5",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 30,
        "y": 13,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "jg_lantern_6",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 14,
        "y": 7,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "jg_lantern_7",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 16,
        "y": 19,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "jg_lantern_8",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 24,
        "y": 21,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "jg_lantern_9",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 29,
        "y": 21,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "jg_stall_1",
        "type": "decor",
        "sprite": "market_stall",
        "x": 12,
        "y": 16,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "jg_stall_2",
        "type": "decor",
        "sprite": "market_stall",
        "x": 18,
        "y": 16,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "jg_stall_3",
        "type": "decor",
        "sprite": "market_stall",
        "x": 22,
        "y": 16,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "jg_table_1",
        "type": "decor",
        "sprite": "inn_table",
        "x": 4,
        "y": 4,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "jg_table_2",
        "type": "decor",
        "sprite": "inn_table",
        "x": 11,
        "y": 4,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "jg_wpn_1",
        "type": "decor",
        "sprite": "weapon_rack",
        "x": 24,
        "y": 5,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "jg_wpn_2",
        "type": "decor",
        "sprite": "weapon_rack",
        "x": 30,
        "y": 5,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "jg_wpn_3",
        "type": "decor",
        "sprite": "weapon_rack",
        "x": 4,
        "y": 19,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "jg_censer_1",
        "type": "decor",
        "sprite": "incense_burner",
        "x": 27,
        "y": 4,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "chest_jg_1",
        "type": "chest",
        "x": 30,
        "y": 10,
        "name": "鏢局庫房木箱",
        "loot": {
          "item": "leihuozhu",
          "count": 2,
          "gold": 260
        },
        "msg": "開啟鏢局舊箱，獲得【驚雷烈火彈×2】與 260 文錢！"
      },
      {
        "id": "jar_jg_inn",
        "type": "jar",
        "x": 3,
        "y": 3,
        "name": "客棧窖藏酒罈",
        "loot": {
          "item": "shaodaozi",
          "count": 2
        },
        "msg": "獲得巴蜀烈酒【錦官烈火燒×2】！"
      },
      {
        "id": "npc_yueling_stage",
        "type": "npc",
        "sprite": "yueling",
        "x": 27,
        "y": 6,
        "name": "燕驚鴻",
        "interaction": "suzhou_arena_yueling",
        "hideFlag": "yueling_joined",
        "barks": [
          "「鎮遠鏢局的牌匾，誰敢動一寸，先問過我手中赤羽鞭！」"
        ]
      },
      {
        "id": "npc_qin_escort",
        "type": "npc",
        "sprite": "escort_captain",
        "x": 25,
        "y": 9,
        "name": "老鏢師·秦叔",
        "interaction": "sq_escort_npc",
        "questId": "sq_escort",
        "barks": [
          "「老總鏢頭燕鐵衣絕不是貪生棄鏢之人！」",
          "「少當家一個人撐著偌大鏢局，苦了這孩子……」"
        ]
      },
      {
        "id": "npc_inn_tang",
        "type": "npc",
        "sprite": "tea_girl",
        "x": 6,
        "y": 4,
        "name": "唐掌櫃",
        "interaction": "jinguan_inn",
        "serviceBadge": "宿",
        "barks": [
          "「錦官客棧上房雅座，歇一宿精神百倍！」"
        ]
      },
      {
        "id": "npc_doc_sun",
        "type": "npc",
        "sprite": "merchant_med",
        "x": 19,
        "y": 4,
        "name": "孫先生",
        "interaction": "suzhou_med_shop",
        "serviceBadge": "藥",
        "barks": [
          "「城外無生教散發的『忘憂丹』萬萬不可服食啊！」"
        ]
      },
      {
        "id": "npc_smith_han",
        "type": "npc",
        "sprite": "blacksmith",
        "x": 5,
        "y": 21,
        "name": "韓大匠",
        "interaction": "sq_star_iron_npc",
        "serviceBadge": "兵",
        "pose": "work",
        "questId": "sq_star_iron",
        "barks": [
          "「若有鬼哭暗河底的『沉淵寒鐵礦』，老夫定能鑄出絕世名器！」",
          "「好劍配英雄！」"
        ]
      },
      {
        "id": "npc_poet_lu",
        "type": "npc",
        "sprite": "scholar",
        "x": 11,
        "y": 6,
        "name": "茶樓雅士·陸子衿",
        "interaction": "sq_poem_npc",
        "questId": "sq_poem",
        "barks": [
          "「錦官燈火三千盞，誰對清詞換玉珠？」",
          "「好茶配好詩，惜無知音人！」"
        ]
      },
      {
        "id": "npc_miner_wife",
        "type": "npc",
        "sprite": "elder_woman",
        "x": 23,
        "y": 22,
        "name": "礦工之妻·林嫂",
        "interaction": "sq_miner_wife_npc",
        "questId": "sq_miners",
        "barks": [
          "「我家當家的去東郊礦脈做工，被無生教扣住半個月了……嗚嗚……」"
        ],
        "states": [
          {
            "when": "saved_miners",
            "x": 23,
            "y": 22,
            "barks": [
              "「當家的平安回來了！多謝幾位救命大俠！」"
            ]
          }
        ]
      },
      {
        "id": "npc_rescued_miner",
        "type": "npc",
        "sprite": "ferryman",
        "x": 24,
        "y": 22,
        "name": "獲救礦工·趙大",
        "interaction": "jinguan_rescued_miner",
        "requireFlag": "saved_miners",
        "barks": [
          "「無生教逼我們開採陰石煉忘憂丹，幸虧少俠出手相救！」"
        ]
      },
      {
        "id": "npc_diviner_yuan",
        "type": "npc",
        "sprite": "elder_man",
        "x": 13,
        "y": 12,
        "name": "袁天機",
        "interaction": "jinguan_diviner",
        "serviceBadge": "卜",
        "barks": [
          "「紫微星動、望舒蒙塵，少俠命帶五曜破局之象！」"
        ]
      },
      {
        "id": "npc_patrol_constable",
        "type": "npc",
        "sprite": "escort_captain",
        "x": 15,
        "y": 14,
        "name": "巡城捕頭",
        "interaction": "jinguan_citizen_1",
        "patrol": [
          {
            "x": 8,
            "y": 14
          },
          {
            "x": 22,
            "y": 14
          }
        ],
        "barks": [
          "「夜間賞燈請看管好隨身荷包！」",
          "「東郊鬼哭礦脈已被無生教盤踞，百姓切勿靠近！」"
        ]
      },
      {
        "id": "npc_patrol_scholar",
        "type": "npc",
        "sprite": "scholar",
        "x": 15,
        "y": 18,
        "name": "賞燈書生",
        "interaction": "jinguan_citizen_2",
        "patrol": [
          {
            "x": 15,
            "y": 10
          },
          {
            "x": 15,
            "y": 22
          }
        ],
        "barks": [
          "「花重錦官城，今夜燈市果真名不虛傳。」"
        ]
      },
      {
        "id": "npc_flower_girl",
        "type": "npc",
        "sprite": "tea_girl",
        "x": 17,
        "y": 13,
        "name": "賣花小妹",
        "interaction": "jinguan_citizen_3",
        "patrol": [
          {
            "x": 17,
            "y": 13
          },
          {
            "x": 21,
            "y": 13
          }
        ],
        "barks": [
          "「剛摘的夜來香與海棠花喲！」"
        ]
      },
      {
        "id": "npc_sect_guard",
        "type": "npc",
        "sprite": "sect_disciple",
        "x": 15,
        "y": 3,
        "name": "玄霄守山弟子",
        "interaction": "jinguan_north_guard",
        "barks": [
          "「北上落霞山道乃玄霄劍宗清修之地，閒雜人等止步。」"
        ],
        "states": [
          {
            "when": "defeated_shejun",
            "x": 16,
            "y": 3,
            "barks": [
              "「原來是攜鎮遠血旗上山稟報要事的少俠，請由北門登落霞山道！」"
            ]
          }
        ]
      },
      {
        "id": "portal_back_yanbo_road",
        "type": "portal",
        "sprite": "portal",
        "x": 2,
        "y": 14,
        "name": "東返煙波鎮驛道",
        "targetMap": "yanbo_town",
        "targetX": 4,
        "targetY": 20
      },
      {
        "id": "portal_to_mine",
        "type": "portal",
        "sprite": "portal",
        "x": 31,
        "y": 22,
        "name": "東郊礦道（往鬼哭礦脈）",
        "interaction": "suzhou_to_snake"
      },
      {
        "id": "portal_to_luoxia",
        "type": "portal",
        "sprite": "portal",
        "x": 15,
        "y": 2,
        "name": "北山古道（往落霞山道）",
        "interaction": "jinguan_to_luoxia"
      }
    ],
    "enemies": [],
    "shops": {
      "suzhou_med": {
        "name": "錦官百草堂·孫先生",
        "items": [
          "xingjundan",
          "jinchuangyao",
          "huanshendan",
          "longxiancao",
          "jiuyinsan",
          "huanhunxiang",
          "shaodaozi",
          "yinlufeng"
        ]
      },
      "suzhou_wpn": {
        "name": "韓氏神兵坊",
        "items": [
          "qingfengjian",
          "yunvshuangjian",
          "cuiyuchai",
          "zijinkuan",
          "yufengpifeng",
          "suozijia",
          "jinlvyi",
          "jifengxue",
          "xiulijian",
          "leihuozhu"
        ]
      }
    }
  },
  "ghost_mine": {
    "id": "ghost_mine",
    "chapter": "第二章·鬼哭幽泉",
    "name": "鬼哭礦脈·暗河溶洞",
    "theme": "snake_cave",
    "music": "cave_mine",
    "spawn": {
      "x": 3,
      "y": 24
    },
    "gateFlag": "snake_gate_open",
    "gate2Flag": "mine_inner_open",
    "grid": [
      "##############################",
      "##############################",
      "##########fffffffffff#########",
      "##########fffcccccfff#########",
      "##########fffcccccfff#########",
      "###......#fffcccccfff#########",
      "###......#fffffffffff#########",
      "###......#####HHH#############",
      "###......####rrrrr~~~~~~~~~~##",
      "###......####rrrrr~~~~~~~~~~##",
      "###......#####GGG#~~~~~~~~~~##",
      "###......####rrrrr~~~......~##",
      "###.........#rrrrr~~~......~##",
      "###........rrrrrrr~~~......~##",
      "###........rrrrrrrbbb......~##",
      "###........rrrrrrr~~~......~##",
      "########rrr#######~~~......~##",
      "########rrr#######~~~..b...~##",
      "########rrr#######~~~~~b~~~~##",
      "########rrr#######~~~~~b~~~~##",
      "########rrr#######~~~~~b~~~~##",
      "########rrr#######~~.......~##",
      "##......rrr#######~~.......~##",
      "##.........#######~~.......~##",
      "##.........#######~~.......~##",
      "##.........#######~~~~~~~~~~##",
      "##############################",
      "##############################"
    ],
    "objects": [
      {
        "id": "gm_cauldron_1",
        "type": "decor",
        "sprite": "alch_cauldron",
        "x": 12,
        "y": 3,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "gm_cauldron_2",
        "type": "decor",
        "sprite": "alch_cauldron",
        "x": 18,
        "y": 3,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "gm_crystal_1",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 22,
        "y": 12,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "gm_crystal_2",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 25,
        "y": 12,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "gm_crystal_3",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 11,
        "y": 5,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "portal_mine_to_jg",
        "type": "portal",
        "sprite": "portal",
        "x": 2,
        "y": 24,
        "name": "返回錦官城東郊",
        "targetMap": "jinguan_city",
        "targetX": 30,
        "targetY": 22
      },
      {
        "id": "sw_mine_west",
        "type": "switch",
        "x": 5,
        "y": 6,
        "name": "礦道鐵閘絞盤",
        "interaction": "snake_switch"
      },
      {
        "id": "npc_captive_miner",
        "type": "npc",
        "sprite": "ferryman",
        "x": 4,
        "y": 9,
        "name": "被囚礦工·趙大",
        "interaction": "mine_rescue_miners",
        "hideFlag": "saved_miners",
        "pose": "kneel",
        "barks": [
          "「救命啊……無生教妖人把閘門鑰匙藏在東邊暗河島上了……」"
        ]
      },
      {
        "id": "chest_mine_key",
        "type": "chest",
        "x": 25,
        "y": 14,
        "name": "暗河督工鐵箱",
        "loot": {
          "item": "sheyao_key",
          "count": 1,
          "extraItem": "jinchuangyao",
          "extraCount": 2
        },
        "msg": "開啟督工鐵箱，取得【玄鐵礦脈鑰】與【杏林玉肌膏×2】！"
      },
      {
        "id": "lock_mine_inner",
        "type": "statue",
        "elem": "earth",
        "x": 15,
        "y": 8,
        "name": "玄鐵丹室鎖孔",
        "interaction": "mine_unlock_inner"
      },
      {
        "id": "chest_star_iron",
        "type": "chest",
        "x": 24,
        "y": 23,
        "name": "寒潭星紋礦石",
        "loot": {
          "item": "star_iron",
          "count": 1,
          "extraItem": "memory_shard",
          "extraCount": 1
        },
        "msg": "在暗河寒潭邊拾獲【沉淵寒鐵礦】（韓大匠委託奇材）與一枚【宿命殘簡】！"
      },
      {
        "id": "chest_mine_loot",
        "type": "chest",
        "x": 7,
        "y": 23,
        "name": "廢棄礦車木箱",
        "loot": {
          "item": "longxiancao",
          "count": 2,
          "gold": 220
        },
        "msg": "獲得【幽泉碧靈草×2】與 220 文錢！"
      },
      {
        "id": "boss_shejun_obj",
        "type": "boss",
        "sprite": "boss_shejun",
        "x": 15,
        "y": 4,
        "name": "金鱗蟒尊與幻月青璃",
        "interaction": "snake_boss_fight",
        "hideFlag": "defeated_shejun"
      }
    ],
    "enemies": [
      {
        "id": "e_gm_1",
        "enemyGroup": [
          "fushejing",
          "kuangmaiyouhun"
        ],
        "x": 9,
        "y": 18,
        "patrol": [
          {
            "x": 9,
            "y": 16
          },
          {
            "x": 9,
            "y": 20
          }
        ]
      },
      {
        "id": "e_gm_2",
        "enemyGroup": [
          "yanshijia",
          "fushejing"
        ],
        "x": 6,
        "y": 13,
        "patrol": [
          {
            "x": 4,
            "y": 13
          },
          {
            "x": 8,
            "y": 13
          }
        ]
      },
      {
        "id": "e_gm_3",
        "enemyGroup": [
          "kuangmaiyouhun",
          "huyaonv"
        ],
        "x": 6,
        "y": 8,
        "patrol": [
          {
            "x": 5,
            "y": 8
          },
          {
            "x": 7,
            "y": 10
          }
        ]
      },
      {
        "id": "e_gm_4",
        "enemyGroup": [
          "huyaonv",
          "fushejing"
        ],
        "x": 23,
        "y": 14,
        "patrol": [
          {
            "x": 22,
            "y": 13
          },
          {
            "x": 24,
            "y": 16
          }
        ]
      },
      {
        "id": "e_gm_5",
        "enemyGroup": [
          "yanshijia",
          "huyaonv",
          "kuangmaiyouhun"
        ],
        "x": 22,
        "y": 22,
        "patrol": [
          {
            "x": 21,
            "y": 22
          },
          {
            "x": 24,
            "y": 22
          }
        ]
      }
    ]
  },
  "luoxia_trail": {
    "id": "luoxia_trail",
    "chapter": "第三章·落霞問劍",
    "name": "落霞山道·試劍古徑",
    "theme": "shushan",
    "music": "mountain_trail",
    "spawn": {
      "x": 4,
      "y": 23
    },
    "gateFlag": null,
    "gate2Flag": null,
    "grid": [
      "############################",
      "############################",
      "#########ppppppppppp########",
      "#########pTpppppppTp########",
      "#########ppppppppppp########",
      "#########ppppppppppp########",
      "##~~~~~~~~~~~bbb~~~~~~~~~~##",
      "##~~~~~~~~~~~bbb~~~~~~~~~~##",
      "##~~~~~~~~~~~bbb~~~~~~~~~~##",
      "####.T.......bbb.........###",
      "####..rrrrrrrrrrrrrrrrr..###",
      "####..rrrrrrrrrrrrrrrrr..###",
      "####.....................###",
      "#####################rrrr###",
      "#####################rrrr###",
      "##########...........rrrT###",
      "##########.pppppppppprrrr###",
      "##########.pppppppppppp..###",
      "##########...............###",
      "##########rrrr##############",
      "##########rrrr##############",
      "###.T.....rrrr##############",
      "###.rrrrrrrrrr##############",
      "###.rrrrrrrr.###############",
      "###..........###############",
      "############################"
    ],
    "objects": [
      {
        "id": "lx_pav_1",
        "type": "decor",
        "sprite": "pavilion",
        "x": 19,
        "y": 15,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "lx_table_1",
        "type": "decor",
        "sprite": "inn_table",
        "x": 16,
        "y": 15,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "lx_paifang_1",
        "type": "decor",
        "sprite": "paifang",
        "x": 14,
        "y": 5,
        "name": "",
        "decor": true,
        "blocking": false
      },
      {
        "id": "lx_lantern_1",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 12,
        "y": 5,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "lx_lantern_2",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 16,
        "y": 5,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "portal_lx_to_jg",
        "type": "portal",
        "sprite": "portal",
        "x": 3,
        "y": 23,
        "name": "下山返錦官城",
        "targetMap": "jinguan_city",
        "targetX": 15,
        "targetY": 3
      },
      {
        "id": "npc_tea_rest_lx",
        "type": "npc",
        "sprite": "tea_girl",
        "x": 17,
        "y": 15,
        "name": "望雲茶娘",
        "interaction": "luoxia_tea_rest",
        "serviceBadge": "宿",
        "barks": [
          "「登落霞山路險，喝碗雲霧熱茶歇歇腳吧！」"
        ]
      },
      {
        "id": "stele_sword_oath",
        "type": "stone_stele",
        "x": 5,
        "y": 11,
        "name": "二百年前試劍殘碑",
        "interaction": "luoxia_oath_stele"
      },
      {
        "id": "chest_lx_1",
        "type": "chest",
        "x": 23,
        "y": 17,
        "name": "崖畔雲紋箱",
        "loot": {
          "item": "shenxiancha",
          "count": 2,
          "gold": 300
        },
        "msg": "獲得【聽雨雲霧茗×2】與 300 文錢！"
      },
      {
        "id": "chest_lx_2",
        "type": "chest",
        "x": 23,
        "y": 9,
        "name": "古松劍匣",
        "loot": {
          "item": "hanxingjian",
          "count": 1
        },
        "msg": "開啟古松劍匣，獲得名劍【落霞寒星劍】！"
      },
      {
        "id": "boss_jiannu_obj",
        "type": "boss",
        "sprite": "boss_liwujiu",
        "x": 14,
        "y": 4,
        "name": "妄劍棄徒·韓梟",
        "interaction": "luoxia_boss_jiannu",
        "hideFlag": "defeated_jiannu"
      },
      {
        "id": "portal_lx_to_sect",
        "type": "portal",
        "sprite": "portal",
        "x": 14,
        "y": 2,
        "name": "登頂入玄霄劍宗",
        "interaction": "luoxia_to_sect"
      }
    ],
    "enemies": [
      {
        "id": "e_lx_1",
        "enemyGroup": [
          "yunlingying",
          "yunlingying"
        ],
        "x": 11,
        "y": 19,
        "patrol": [
          {
            "x": 11,
            "y": 18
          },
          {
            "x": 11,
            "y": 21
          }
        ]
      },
      {
        "id": "e_lx_2",
        "enemyGroup": [
          "shijiankui",
          "yunlingying"
        ],
        "x": 22,
        "y": 13,
        "patrol": [
          {
            "x": 22,
            "y": 11
          },
          {
            "x": 22,
            "y": 15
          }
        ]
      },
      {
        "id": "e_lx_3",
        "enemyGroup": [
          "shijiankui",
          "shijiankui"
        ],
        "x": 10,
        "y": 10,
        "patrol": [
          {
            "x": 8,
            "y": 10
          },
          {
            "x": 12,
            "y": 10
          }
        ]
      },
      {
        "id": "e_lx_4",
        "enemyGroup": [
          "yunlingying",
          "shijiankui"
        ],
        "x": 18,
        "y": 10,
        "patrol": [
          {
            "x": 16,
            "y": 10
          },
          {
            "x": 20,
            "y": 10
          }
        ]
      }
    ]
  },
  "xuanxiao_sect": {
    "id": "xuanxiao_sect",
    "chapter": "第三章·太微雲闕",
    "name": "玄霄劍宗·太微廣場",
    "theme": "shushan",
    "music": "immortal_sect",
    "spawn": {
      "x": 16,
      "y": 24
    },
    "gateFlag": null,
    "gate2Flag": null,
    "grid": [
      "################################",
      "#..............................#",
      "#.........wwwwwwwwwwwww........#",
      "#.........wffcccccccffw........#",
      "#..T...T..wffcccccccffwppppppp.#",
      "#.........wffcccccccffwppppppp.#",
      "#.........wffcccccccffwppppppp.#",
      "#.........wffcccccccffwppppppp.#",
      "#.........wwwwwfffwwwwwppppppp.#",
      "#..............ccc.............#",
      "#.wwwwwwwppppppcccppppppwwwwww.#",
      "#.wfffffwppppppcccppppppwffffw.#",
      "#.wfffffwppppppcccppppppwffffw.#",
      "#.wffffffppppppcccppppppfffffw.#",
      "#.wffffffppppppcccppppppfffffw.#",
      "#.wfffffwppppppcccppppppwffffw.#",
      "#.wfffffwppppppcccppppppwffffw.#",
      "#.wwwwwwwppppppcccppppppwwwwww.#",
      "#........ppppppcccpppppp.......#",
      "#.........T..ppcccpp..T........#",
      "#~~~~~~~~~~~.ppcccpp.~~~~~~~~~~#",
      "#~~~~~~~~~~~.ppcccpp.~~~~~~~~~~#",
      "#~~~~~~~~~~~.ppcccpp.~~~~~~~~~~#",
      "#~~~~~~~~~~~.ppcccpp.~~~~~~~~~~#",
      "#~~~~~~~~~~~.ppcccpp.~~~~~~~~~~#",
      "#~~~~~~~~~~~.ppppppp.~~~~~~~~~~#",
      "#~~~~~~~~~~~.........~~~~~~~~~~#",
      "################################"
    ],
    "objects": [
      {
        "id": "xx_paifang_1",
        "type": "decor",
        "sprite": "paifang",
        "x": 16,
        "y": 20,
        "name": "",
        "decor": true,
        "blocking": false
      },
      {
        "id": "xx_paifang_2",
        "type": "decor",
        "sprite": "paifang",
        "x": 26,
        "y": 6,
        "name": "",
        "decor": true,
        "blocking": false
      },
      {
        "id": "xx_censer_1",
        "type": "decor",
        "sprite": "incense_burner",
        "x": 16,
        "y": 14,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "xx_lantern_1",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 12,
        "y": 9,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "xx_lantern_2",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 20,
        "y": 9,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "xx_lantern_3",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 13,
        "y": 19,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "xx_lantern_4",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 19,
        "y": 19,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "xx_wpn_1",
        "type": "decor",
        "sprite": "weapon_rack",
        "x": 4,
        "y": 11,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "xx_wpn_2",
        "type": "decor",
        "sprite": "weapon_rack",
        "x": 27,
        "y": 11,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "xx_wpn_3",
        "type": "decor",
        "sprite": "weapon_rack",
        "x": 12,
        "y": 4,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "xx_wpn_4",
        "type": "decor",
        "sprite": "weapon_rack",
        "x": 20,
        "y": 4,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "xx_crystal_1",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 10,
        "y": 11,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "xx_crystal_2",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 22,
        "y": 11,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "chest_xx_1",
        "type": "chest",
        "x": 4,
        "y": 6,
        "name": "雲台仙匣",
        "loot": {
          "item": "yuputi",
          "count": 1,
          "extraItem": "shenxiancha",
          "extraCount": 1
        },
        "msg": "開啟雲台仙匣，獲得靈果【寒潭玉蓮子】與【聽雨雲霧茗】！"
      },
      {
        "id": "npc_qingxu",
        "type": "npc",
        "sprite": "taoist_elder",
        "x": 14,
        "y": 4,
        "name": "清虛長老",
        "interaction": "shushan_main_event",
        "barks": [
          "「天地清濁自有定數，切莫為外物迷失本心。」"
        ]
      },
      {
        "id": "npc_liwujiu",
        "type": "npc",
        "sprite": "taoist_stern",
        "x": 18,
        "y": 4,
        "name": "執劍首座·厲無咎",
        "interaction": "shushan_main_event",
        "barks": [
          "「情之一字，乃世間萬劫之源。斬斷記憶，方得太上清靜！」"
        ]
      },
      {
        "id": "npc_xiecanghai_sect",
        "type": "npc",
        "sprite": "blind_lute",
        "x": 16,
        "y": 16,
        "name": "謝滄海",
        "interaction": "shushan_zuijian_jiushen",
        "requireFlag": "entered_demon_tower",
        "barks": [
          "「少游，過來！老夫把這式『醉月狂歌』傳給你，去劍獄救人！」"
        ]
      },
      {
        "id": "npc_xx_med",
        "type": "npc",
        "sprite": "merchant_med",
        "x": 4,
        "y": 14,
        "name": "丹閣執事",
        "interaction": "shushan_med_shop",
        "serviceBadge": "藥",
        "barks": [
          "「太微靈丹，清心固本。」"
        ]
      },
      {
        "id": "npc_xx_wpn",
        "type": "npc",
        "sprite": "blacksmith",
        "x": 4,
        "y": 16,
        "name": "鑄劍執事",
        "interaction": "shushan_wpn_shop",
        "serviceBadge": "兵",
        "barks": [
          "「七曜星鐵所鑄名劍，唯正氣凜然者可佩。」"
        ]
      },
      {
        "id": "npc_xx_guest",
        "type": "npc",
        "sprite": "tea_girl",
        "x": 27,
        "y": 16,
        "name": "迎客道童",
        "interaction": "xuanxiao_rest",
        "serviceBadge": "宿",
        "barks": [
          "「遠客可在東廂客房靜坐調息，恢復真元。」"
        ]
      },
      {
        "id": "npc_lingfeng",
        "type": "npc",
        "sprite": "sect_disciple",
        "x": 26,
        "y": 13,
        "name": "試劍師兄·凌風",
        "interaction": "sq_duel_disciple",
        "questId": "sq_sword_duel",
        "barks": [
          "「聽聞山下少俠領悟了謝師叔的聽潮劍意，可敢與我切磋三招？」"
        ]
      },
      {
        "id": "npc_librarian",
        "type": "npc",
        "sprite": "scholar",
        "x": 28,
        "y": 12,
        "name": "藏書閣知客",
        "interaction": "xuanxiao_lore_npc",
        "barks": [
          "「古籍記載鑄天氏曾留下一枚『太阿古劍佩』，乃開啟問心劍塚之鑰。」"
        ]
      },
      {
        "id": "npc_patrol_disc_1",
        "type": "npc",
        "sprite": "sect_disciple",
        "x": 12,
        "y": 13,
        "name": "巡山執劍弟子",
        "interaction": "xuanxiao_disc_talk",
        "patrol": [
          {
            "x": 11,
            "y": 12
          },
          {
            "x": 11,
            "y": 17
          },
          {
            "x": 14,
            "y": 17
          },
          {
            "x": 14,
            "y": 12
          }
        ],
        "barks": [
          "「厲首座近來頻繁出入後山禁地，神色頗為凝重……」"
        ]
      },
      {
        "id": "npc_patrol_disc_2",
        "type": "npc",
        "sprite": "sect_disciple",
        "x": 20,
        "y": 15,
        "name": "護法弟子",
        "interaction": "xuanxiao_disc_talk",
        "patrol": [
          {
            "x": 18,
            "y": 12
          },
          {
            "x": 21,
            "y": 12
          },
          {
            "x": 21,
            "y": 17
          },
          {
            "x": 18,
            "y": 17
          }
        ],
        "barks": [
          "「鎮魔劍獄由北斗七曜大陣封鎖，擅闖者必受天雷轟擊！」"
        ]
      },
      {
        "id": "portal_xx_to_lx",
        "type": "portal",
        "sprite": "portal",
        "x": 16,
        "y": 25,
        "name": "下山返落霞山道",
        "targetMap": "luoxia_trail",
        "targetX": 14,
        "targetY": 3
      },
      {
        "id": "portal_xx_to_prison",
        "type": "portal",
        "sprite": "portal",
        "x": 28,
        "y": 4,
        "name": "鎮魔劍獄入口",
        "interaction": "shushan_to_tower"
      }
    ],
    "enemies": [],
    "shops": {
      "shushan_med": {
        "name": "玄霄丹鼎閣",
        "items": [
          "jinchuangyao",
          "panguo",
          "longxiancao",
          "shenxiancha",
          "jiuyinsan",
          "huanhunxiang",
          "shaodaozi"
        ]
      },
      "shushan_wpn": {
        "name": "太微鑄劍堂",
        "items": [
          "qixingjian",
          "yunvshuangjian",
          "jinshebian",
          "zijinkuan",
          "fengwenpifeng",
          "jinlvyi",
          "buyunlv",
          "yufozhu"
        ]
      }
    }
  },
  "sword_prison": {
    "id": "sword_prison",
    "chapter": "第三章·七曜鎮魔",
    "name": "鎮魔劍獄·七曜鎖魂陣",
    "theme": "demon_tower",
    "music": "sword_prison",
    "spawn": {
      "x": 16,
      "y": 25
    },
    "gateFlag": "tower_seal_open",
    "gate2Flag": null,
    "grid": [
      "################################",
      "################################",
      "##########ppppppppppppp#########",
      "##########ppppcccccpppp#########",
      "##########ppppcccccpppp#########",
      "##########ppppcccccpppp#########",
      "##########ppppcccccpppp#########",
      "###fffffffppppcccccppppfffffff##",
      "###fffffffpppppppppppppfffffff##",
      "###fffffff#####GGG#####fffffff##",
      "###fffffffffffffffffffffffffff##",
      "###fffffffffffffffffffffffffff##",
      "###fffffffffffffffffffffffffff##",
      "###fffffffffffffffffffffffffff##",
      "###fffffff#####fff#####fffffff##",
      "###fffffff#####fff#####fffffff##",
      "###fffffff#####fff#####fffffff##",
      "###fffffffffffffffffffffffffff##",
      "###fffffffffffffffffffffffffff##",
      "###fffffffffffffffffffffffffff##",
      "###fffffffffffffffffffffffffff##",
      "###############fff##############",
      "############fffffffff###########",
      "############fffffffff###########",
      "############fffffffff###########",
      "############fffffffff###########",
      "############fffffffff###########",
      "################################"
    ],
    "objects": [
      {
        "id": "sp_crystal_1",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 11,
        "y": 7,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "sp_crystal_2",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 21,
        "y": 7,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "sp_crystal_3",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 13,
        "y": 23,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "sp_crystal_4",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 19,
        "y": 23,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "sp_wpn_1",
        "type": "decor",
        "sprite": "weapon_rack",
        "x": 4,
        "y": 8,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "sp_wpn_2",
        "type": "decor",
        "sprite": "weapon_rack",
        "x": 28,
        "y": 8,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "portal_prison_to_xx",
        "type": "portal",
        "sprite": "portal",
        "x": 16,
        "y": 26,
        "name": "返回太微廣場",
        "targetMap": "xuanxiao_sect",
        "targetX": 27,
        "targetY": 5
      },
      {
        "id": "sw_tower_yin",
        "type": "switch",
        "x": 5,
        "y": 8,
        "name": "七曜·太陰陣樞",
        "interaction": "tower_switch_yin"
      },
      {
        "id": "sw_tower_yang",
        "type": "switch",
        "x": 27,
        "y": 8,
        "name": "七曜·太陽陣樞",
        "interaction": "tower_switch_yang"
      },
      {
        "id": "npc_sword_ghost",
        "type": "npc",
        "sprite": "ghost_npc",
        "x": 4,
        "y": 14,
        "name": "守劍癡魂·裴玄",
        "interaction": "sq_sword_ghost_npc",
        "questId": "sq_sword_oath",
        "barks": [
          "「二百年了……師兄，你說過在落霞亭試劍後便來接我出獄……」"
        ]
      },
      {
        "id": "npc_paint_spirit",
        "type": "npc",
        "sprite": "tea_girl",
        "x": 28,
        "y": 14,
        "name": "丹青畫靈·素心",
        "interaction": "sq_paint_spirit_npc",
        "questId": "sq_painting",
        "barks": [
          "「畫中歲月不知年，誰解殘詩破墨淵？」"
        ]
      },
      {
        "id": "chest_sp_1",
        "type": "chest",
        "x": 7,
        "y": 19,
        "name": "古獄劍匣",
        "loot": {
          "item": "qixingjian",
          "count": 1
        },
        "msg": "開啟古獄劍匣，獲得名劍【太微七曜劍】！"
      },
      {
        "id": "chest_sp_2",
        "type": "chest",
        "x": 25,
        "y": 19,
        "name": "鎖魂秘箱",
        "loot": {
          "item": "zijinggao",
          "count": 1,
          "extraItem": "huanhunxiang",
          "extraCount": 2
        },
        "msg": "獲得【素娥凝玉膏×1】與【引魄返魂香×2】！"
      },
      {
        "id": "boss_mingwang_obj",
        "type": "boss",
        "sprite": "boss_mingwang",
        "x": 16,
        "y": 5,
        "name": "雷獄鎮魂將",
        "interaction": "tower_boss_mingwang",
        "hideFlag": "defeated_mingwang"
      }
    ],
    "enemies": [
      {
        "id": "e_sp_1",
        "enemyGroup": [
          "tongren",
          "feijiang"
        ],
        "x": 11,
        "y": 18,
        "patrol": [
          {
            "x": 10,
            "y": 18
          },
          {
            "x": 13,
            "y": 18
          }
        ]
      },
      {
        "id": "e_sp_2",
        "enemyGroup": [
          "feijiang",
          "huayao"
        ],
        "x": 6,
        "y": 12,
        "patrol": [
          {
            "x": 6,
            "y": 10
          },
          {
            "x": 6,
            "y": 15
          }
        ]
      },
      {
        "id": "e_sp_3",
        "enemyGroup": [
          "tongren",
          "huayao"
        ],
        "x": 21,
        "y": 18,
        "patrol": [
          {
            "x": 19,
            "y": 18
          },
          {
            "x": 22,
            "y": 18
          }
        ]
      },
      {
        "id": "e_sp_4",
        "enemyGroup": [
          "huayao",
          "feijiang",
          "tongren"
        ],
        "x": 26,
        "y": 12,
        "patrol": [
          {
            "x": 26,
            "y": 10
          },
          {
            "x": 26,
            "y": 15
          }
        ]
      },
      {
        "id": "e_sp_5",
        "enemyGroup": [
          "tongren",
          "tongren"
        ],
        "x": 16,
        "y": 14,
        "patrol": [
          {
            "x": 16,
            "y": 12
          },
          {
            "x": 16,
            "y": 16
          }
        ]
      }
    ]
  },
  "yunmeng_village": {
    "id": "yunmeng_village",
    "chapter": "第四章·雲夢百草",
    "name": "雲夢澤·百草懸空寨",
    "theme": "miao_valley",
    "music": "marsh_village",
    "spawn": {
      "x": 16,
      "y": 15
    },
    "gateFlag": null,
    "gate2Flag": null,
    "grid": [
      "################################",
      "#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#",
      "#~~~~~~~~~~wwwwwwwwwww~~~~~~~~~#",
      "#~~......~~wfcccccccfw~~~~~~~~~#",
      "#~~......~~wfcccccccfw~~~~~~~~~#",
      "#~~.....bbfffcccccccfw~~~~~~~~~#",
      "#~~.W....~~wfcccccccfw~~~~~~~~~#",
      "#~~......~~wfffffffffw~~~~~~~~~#",
      "#~~~~~~~~~~wwwwfffwwww~~~~~~~~~#",
      "#~~~~~~~~~~~~~~bbb~~~~~~~~~~~~~#",
      "#~~~~~~~~~~~~~~bbb~~~~~~~ffffff#",
      "#~ffffff~~~~~~~bbb~~~~~~~ffffff#",
      "#~ffffff~~~fffffffffff~~~ffffff#",
      "#~ffffff~~~fffffffffff~~~ffffff#",
      "#~ffffffbbbbfffffffffbbbbffffff#",
      "#~ffffffbbbbfffffffffbbbbffffff#",
      "#~ffffffbbbbfffffffffbbbbffffff#",
      "#~ffffff~~~fffffffffff~~~ffffff#",
      "#~ffffff~~~ffffbbbffff~~~ffffff#",
      "#~ffffff~~~~~~~bbb~~~~~~~ffffff#",
      "#~~~~~~~~~~~~~~bbb~~~~~~~~~~~~~#",
      "#~~~~~~~~~.............~~~~~~~~#",
      "#~~~~~~~~~.............~~~~~~~~#",
      "#~~~~~~~~~.W.........W.~~~~~~~~#",
      "#~~~~~~~~~.............~~~~~~~~#",
      "################################"
    ],
    "objects": [
      {
        "id": "ym_cauldron_1",
        "type": "decor",
        "sprite": "alch_cauldron",
        "x": 16,
        "y": 14,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "ym_lantern_1",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 12,
        "y": 12,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "ym_lantern_2",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 20,
        "y": 12,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "ym_lantern_3",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 12,
        "y": 17,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "ym_lantern_4",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 20,
        "y": 17,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "ym_flower_1",
        "type": "decor",
        "sprite": "flower_bush",
        "x": 13,
        "y": 22,
        "name": "",
        "decor": true,
        "blocking": false
      },
      {
        "id": "ym_flower_2",
        "type": "decor",
        "sprite": "flower_bush",
        "x": 19,
        "y": 22,
        "name": "",
        "decor": true,
        "blocking": false
      },
      {
        "id": "npc_xinyi",
        "type": "npc",
        "sprite": "matriarch",
        "x": 16,
        "y": 4,
        "name": "辛夷藥婆",
        "interaction": "miao_shenggu",
        "barks": [
          "「素娥寒霜與斷脈重傷皆非尋常草藥可醫，須借神木與祝融純陽之力！」"
        ]
      },
      {
        "id": "npc_yueling_injured",
        "type": "npc",
        "sprite": "yueling",
        "x": 13,
        "y": 4,
        "name": "燕驚鴻",
        "interaction": "yunmeng_check_yueling",
        "pose": "kneel",
        "barks": [
          "「唔……別管我……先救芷微妹子……」"
        ],
        "states": [
          {
            "when": "saved_yueling",
            "x": 13,
            "y": 5,
            "pose": "stand",
            "barks": [
              "「本少主的筋骨全好啦！隨時可以再戰三百回合！」"
            ]
          }
        ]
      },
      {
        "id": "npc_lingxi_injured",
        "type": "npc",
        "sprite": "lingxi",
        "x": 19,
        "y": 4,
        "name": "白芷微",
        "interaction": "yunmeng_check_lingxi",
        "pose": "kneel",
        "hideFlag": "saved_yueling",
        "barks": [
          "「少游……小心大澤瘴氣……」"
        ]
      },
      {
        "id": "npc_yunluo",
        "type": "npc",
        "sprite": "aman",
        "x": 16,
        "y": 16,
        "name": "雲珞",
        "interaction": "miao_aman_join",
        "hideFlag": "aman_joined",
        "barks": [
          "「百草鼎已經生好火囉！就等少游哥哥一塊進瘴林尋藥啦！」"
        ]
      },
      {
        "id": "npc_ym_med",
        "type": "npc",
        "sprite": "merchant_med",
        "x": 4,
        "y": 13,
        "name": "百草藥師",
        "interaction": "miao_med_shop",
        "serviceBadge": "藥",
        "barks": [
          "「靈蟲繭配凝霧寒露，百草鼎裡能煉出奇丹喔！」"
        ]
      },
      {
        "id": "npc_ym_wpn",
        "type": "npc",
        "sprite": "blacksmith",
        "x": 27,
        "y": 13,
        "name": "大澤靈匠",
        "interaction": "miao_wpn_shop",
        "serviceBadge": "兵",
        "barks": [
          "「千年神木與天蠶絲鍛造的護具，水火不侵！」"
        ]
      },
      {
        "id": "npc_ym_rest",
        "type": "npc",
        "sprite": "tea_girl",
        "x": 4,
        "y": 17,
        "name": "竹樓侍女",
        "interaction": "yunmeng_rest",
        "serviceBadge": "宿",
        "barks": [
          "「竹樓清風徐來，歇息片刻即可回滿氣血真氣。」"
        ]
      },
      {
        "id": "npc_alch_ge",
        "type": "npc",
        "sprite": "elder_man",
        "x": 13,
        "y": 15,
        "name": "煉丹葛伯",
        "interaction": "sq_alchemy_ge_npc",
        "questId": "sq_alchemy",
        "barks": [
          "「老朽研究了半輩子，只差一顆『幻霧隱靈丹』便能驗證古方囉！」"
        ]
      },
      {
        "id": "npc_boy_amu",
        "type": "npc",
        "sprite": "child_boy",
        "x": 27,
        "y": 17,
        "name": "尋獸阿木",
        "interaction": "sq_fawn_boy_npc",
        "questId": "sq_spirit_fawn",
        "barks": [
          "「小靈鹿跑進東邊迷霧瘴林裡去了，要是被毒霧傷著可怎麼辦……」"
        ]
      },
      {
        "id": "npc_patrol_villager",
        "type": "npc",
        "sprite": "ferryman",
        "x": 15,
        "y": 22,
        "name": "巡寨獵手",
        "interaction": "yunmeng_villager",
        "patrol": [
          {
            "x": 12,
            "y": 22
          },
          {
            "x": 20,
            "y": 22
          }
        ],
        "barks": [
          "「進迷霧瘴林切記先點亮三座驅瘴風圖騰！」"
        ]
      },
      {
        "id": "portal_ym_to_miasma",
        "type": "portal",
        "sprite": "portal",
        "x": 29,
        "y": 15,
        "name": "東入迷霧瘴林",
        "interaction": "miao_to_qilin"
      },
      {
        "id": "portal_ym_to_ruins",
        "type": "portal",
        "sprite": "portal",
        "x": 5,
        "y": 4,
        "name": "北往望舒古墟",
        "interaction": "miao_to_rift"
      }
    ],
    "enemies": [],
    "shops": {
      "miao_med": {
        "name": "百草懸空藥棧",
        "items": [
          "panguo",
          "zijinggao",
          "shenxiancha",
          "lingshanxianzhi",
          "jiuyinsan",
          "tianxianglu",
          "guluan",
          "huashishui"
        ]
      },
      "miao_wpn": {
        "name": "雲夢靈器坊",
        "items": [
          "wuyuezhang",
          "jiujiebian",
          "chongtiankuan",
          "fengwenpifeng",
          "tiancanyi",
          "buyunlv",
          "wuyingdu",
          "xuelinglong"
        ]
      }
    }
  },
  "miasma_forest": {
    "id": "miasma_forest",
    "chapter": "第四章·千年神木",
    "name": "迷霧瘴林·千年神木谷",
    "theme": "miao_valley",
    "music": "reed_marsh",
    "spawn": {
      "x": 3,
      "y": 14
    },
    "gateFlag": "miasma_cleared",
    "gate2Flag": null,
    "grid": [
      "##############################",
      "#BBBBBBBBBBBBBBBBBBBBBBBBBBBB#",
      "#BBBBBBBBBBBBBBBBBBBBBBBBBBBB#",
      "#BBBBBBBBBBBBBBBBBBBBBBBBBBBB#",
      "#BBBBBBBBBBBBBBBBBBBB.......B#",
      "#BBBBBBB............B...T.T.B#",
      "#BBBBBBB............B.......B#",
      "#BBBBBBB............B.......B#",
      "#BBBBBBB...TTTTTT...B.......B#",
      "#BBBBBBB...TTTTTT...B.......B#",
      "#BBBBBBB...TTTTTT...B.......B#",
      "#BBBBBBB...TTTTTT...B.......B#",
      "#B.................rG.......B#",
      "#B.................rG.......B#",
      "#B.................rG.......B#",
      "#B.................rG.......B#",
      "#B.........BBBBBB...B.......B#",
      "#BBBBBBB...BBBBBB...B.......B#",
      "#BBBBBBB...BBBBBB...B.......B#",
      "#BBBBBBB...BBBBBB...B.......B#",
      "#BBBBBBB............B.......B#",
      "#BBBBBBB............B.......B#",
      "#BBBBBBB............B.......B#",
      "#BBBBBBBBBBBBBBBBBBBB.......B#",
      "#BBBBBBBBBBBBBBBBBBBBBBBBBBBB#",
      "##############################"
    ],
    "objects": [
      {
        "id": "mf_flower_1",
        "type": "decor",
        "sprite": "flower_bush",
        "x": 23,
        "y": 8,
        "name": "",
        "decor": true,
        "blocking": false
      },
      {
        "id": "mf_flower_2",
        "type": "decor",
        "sprite": "flower_bush",
        "x": 26,
        "y": 11,
        "name": "",
        "decor": true,
        "blocking": false
      },
      {
        "id": "mf_flower_3",
        "type": "decor",
        "sprite": "flower_bush",
        "x": 9,
        "y": 21,
        "name": "",
        "decor": true,
        "blocking": false
      },
      {
        "id": "portal_mf_to_ym",
        "type": "portal",
        "sprite": "portal",
        "x": 2,
        "y": 14,
        "name": "西返百草懸空寨",
        "targetMap": "yunmeng_village",
        "targetX": 28,
        "targetY": 15
      },
      {
        "id": "totem_wind_1",
        "type": "switch",
        "x": 9,
        "y": 6,
        "name": "驅瘴風圖騰·乾位",
        "interaction": "miasma_totem",
        "flag": "wtotem_1"
      },
      {
        "id": "totem_wind_2",
        "type": "switch",
        "x": 18,
        "y": 6,
        "name": "驅瘴風圖騰·艮位",
        "interaction": "miasma_totem",
        "flag": "wtotem_2"
      },
      {
        "id": "totem_wind_3",
        "type": "switch",
        "x": 14,
        "y": 21,
        "name": "驅瘴風圖騰·巽位",
        "interaction": "miasma_totem",
        "flag": "wtotem_3"
      },
      {
        "id": "npc_lost_fawn",
        "type": "npc",
        "sprite": "fox",
        "x": 17,
        "y": 21,
        "name": "受驚的小靈鹿",
        "interaction": "sq_rescue_fawn",
        "hideFlag": "fawn_rescued",
        "barks": [
          "「呦呦……（被毒霧困住瑟瑟發抖）」"
        ]
      },
      {
        "id": "chest_mf_1",
        "type": "chest",
        "x": 14,
        "y": 13,
        "name": "古藤寶箱",
        "loot": {
          "item": "lingshanxianzhi",
          "count": 1,
          "gold": 400
        },
        "msg": "獲得【雲夢千年芝×1】與 400 文錢！"
      },
      {
        "id": "boss_fumuzun_obj",
        "type": "boss",
        "sprite": "boss_shejun",
        "x": 25,
        "y": 7,
        "name": "千年腐木毒尊",
        "interaction": "miasma_boss_fight",
        "hideFlag": "defeated_fumuzun"
      },
      {
        "id": "chest_wutong_pith",
        "type": "chest",
        "x": 25,
        "y": 4,
        "name": "千年梧桐靈髓樹洞",
        "interaction": "qilin_phoenix_chest"
      },
      {
        "id": "portal_mf_to_zhurong",
        "type": "portal",
        "sprite": "portal",
        "x": 26,
        "y": 22,
        "name": "地脈裂口（往祝融赤炎熔窟）",
        "interaction": "miasma_to_zhurong"
      }
    ],
    "enemies": [
      {
        "id": "e_mf_1",
        "enemyGroup": [
          "mudaoren",
          "wuduxie"
        ],
        "x": 10,
        "y": 10,
        "patrol": [
          {
            "x": 9,
            "y": 10
          },
          {
            "x": 10,
            "y": 14
          }
        ]
      },
      {
        "id": "e_mf_2",
        "enemyGroup": [
          "zhaozejuwa",
          "mudaoren"
        ],
        "x": 17,
        "y": 10,
        "patrol": [
          {
            "x": 17,
            "y": 8
          },
          {
            "x": 17,
            "y": 13
          }
        ]
      },
      {
        "id": "e_mf_3",
        "enemyGroup": [
          "wuduxie",
          "zhaozejuwa"
        ],
        "x": 12,
        "y": 20,
        "patrol": [
          {
            "x": 10,
            "y": 20
          },
          {
            "x": 15,
            "y": 20
          }
        ]
      },
      {
        "id": "e_mf_4",
        "enemyGroup": [
          "mudaoren",
          "wuduxie",
          "zhaozejuwa"
        ],
        "x": 23,
        "y": 15,
        "patrol": [
          {
            "x": 22,
            "y": 13
          },
          {
            "x": 25,
            "y": 17
          }
        ]
      }
    ]
  },
  "zhurong_cavern": {
    "id": "zhurong_cavern",
    "chapter": "第四章·祝融炎脈",
    "name": "祝融地脈·赤炎熔窟",
    "theme": "fire_cavern",
    "music": "fire_sanctum",
    "spawn": {
      "x": 16,
      "y": 25
    },
    "gateFlag": "fire_bridge_open",
    "gate2Flag": null,
    "grid": [
      "################################",
      "#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#",
      "#~~~~~~~~~ppppppppppppp~~~~~~~~#",
      "#~~~~~~~~~ppppcccccpppp~~~~~~~~#",
      "#~~~~~~~~~ppppcccccpppp~~~~~~~~#",
      "#~~~~~~~~~ppppcccccpppp~~~~~~~~#",
      "#~~~~~~~~~ppppcccccpppp~~~~~~~~#",
      "#~~~~~~~~~ppppppppppppp~~~~~~~~#",
      "#~~.....~~ppppppppppppp~~.....~#",
      "#~~.....~~~~~~~bbb~~~~~~~.....~#",
      "#~~.....~~~~~~~GGG~~~~~~~.....~#",
      "#~~.....~~~~~~~bbb~~~~~~~.....~#",
      "#~~.....~~~~~~~bbb~~~~~~~.....~#",
      "#~~.....~~.....bbb.....~~.....~#",
      "#~~.....bbb...........bbb.....~#",
      "#~~.....bbb...........bbb.....~#",
      "#~~.....~~.............~~.....~#",
      "#~~.....~~~~~~~bbb~~~~~~~.....~#",
      "#~~.....~~~~~~~bbb~~~~~~~.....~#",
      "#~~.....~~~~~~~bbb~~~~~~~.....~#",
      "#~~.....~~~~~~~bbb~~~~~~~.....~#",
      "#~~~~~~~~~~~~~~bbb~~~~~~~~~~~~~#",
      "#~~~~~~~~~~~...bbb...~~~~~~~~~~#",
      "#~~~~~~~~~~~.........~~~~~~~~~~#",
      "#~~~~~~~~~~~.........~~~~~~~~~~#",
      "#~~~~~~~~~~~.........~~~~~~~~~~#",
      "#~~~~~~~~~~~.........~~~~~~~~~~#",
      "################################"
    ],
    "objects": [
      {
        "id": "zr_crystal_1",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 12,
        "y": 4,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "zr_crystal_2",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 20,
        "y": 4,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "zr_crystal_3",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 11,
        "y": 13,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "zr_crystal_4",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 21,
        "y": 13,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "portal_zr_to_mf",
        "type": "portal",
        "sprite": "portal",
        "x": 16,
        "y": 26,
        "name": "返回千年神木谷",
        "targetMap": "miasma_forest",
        "targetX": 25,
        "targetY": 22
      },
      {
        "id": "sw_fire_west",
        "type": "switch",
        "x": 5,
        "y": 10,
        "name": "祝融火曜石樞·西",
        "interaction": "zhurong_switch",
        "flag": "fsw_1"
      },
      {
        "id": "sw_fire_east",
        "type": "switch",
        "x": 27,
        "y": 10,
        "name": "祝融火曜石樞·東",
        "interaction": "zhurong_switch",
        "flag": "fsw_2"
      },
      {
        "id": "chest_zr_shard",
        "type": "chest",
        "x": 5,
        "y": 19,
        "name": "赤曜石匣",
        "loot": {
          "item": "memory_shard",
          "count": 1,
          "extraItem": "xuelinglong",
          "extraCount": 2
        },
        "msg": "開啟赤曜石匣，獲得【宿命殘簡】與【赤魄流火珠×2】！"
      },
      {
        "id": "chest_zr_armor",
        "type": "chest",
        "x": 27,
        "y": 19,
        "name": "炎脈寶箱",
        "loot": {
          "item": "jiujiebian",
          "count": 1,
          "gold": 600
        },
        "msg": "開啟炎脈寶箱，獲得神鞭【九節驚雷赤鞭】與 600 文錢！"
      },
      {
        "id": "boss_qilin_obj",
        "type": "boss",
        "sprite": "boss_qilin",
        "x": 16,
        "y": 4,
        "name": "祝融炎麟獸",
        "interaction": "qilin_boss_fight",
        "hideFlag": "defeated_qilin"
      }
    ],
    "enemies": [
      {
        "id": "e_zr_1",
        "enemyGroup": [
          "huolingshou",
          "rongyanshe"
        ],
        "x": 16,
        "y": 18,
        "patrol": [
          {
            "x": 16,
            "y": 16
          },
          {
            "x": 16,
            "y": 20
          }
        ]
      },
      {
        "id": "e_zr_2",
        "enemyGroup": [
          "rongyanshe",
          "huolingshou"
        ],
        "x": 5,
        "y": 14,
        "patrol": [
          {
            "x": 5,
            "y": 12
          },
          {
            "x": 5,
            "y": 17
          }
        ]
      },
      {
        "id": "e_zr_3",
        "enemyGroup": [
          "huolingshou",
          "huolingshou"
        ],
        "x": 27,
        "y": 14,
        "patrol": [
          {
            "x": 27,
            "y": 12
          },
          {
            "x": 27,
            "y": 17
          }
        ]
      },
      {
        "id": "e_zr_4",
        "enemyGroup": [
          "rongyanshe",
          "huolingshou",
          "rongyanshe"
        ],
        "x": 16,
        "y": 14,
        "patrol": [
          {
            "x": 13,
            "y": 14
          },
          {
            "x": 19,
            "y": 14
          }
        ]
      }
    ]
  },
  "wangshu_ruins": {
    "id": "wangshu_ruins",
    "chapter": "第五章·望舒古墟",
    "name": "望舒古墟·歲月迴廊",
    "theme": "time_rift",
    "music": "memory_echo",
    "spawn": {
      "x": 15,
      "y": 23
    },
    "gateFlag": null,
    "gate2Flag": null,
    "grid": [
      "##############################",
      "#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#",
      "#~~~~~~~~~ppppppppppp~~~~~~~~#",
      "#~~~~~~~~~ppppppppppp~~~~~~~~#",
      "#~~~~~~~~~ppppppppppp~~~~~~~~#",
      "#~~~~~~~~~ppppppppppp~~~~~~~~#",
      "#~~~~~~~~~ppppppppppp~~~~~~~~#",
      "#~~~~~~~~~~~~~bbb~~~~~~~~~~~~#",
      "#~~~~~~~~~~~~~bbb~~~~~~~~~~~~#",
      "#~ppppp~~~~~~~bbb~~~~~~~ppppp#",
      "#~ppppp~~pppppbbbppppp~~ppppp#",
      "#~ppppp~~ppppcccccpppp~~ppppp#",
      "#~pppppbbbpppcccccpppbbbppppp#",
      "#~pppppbbbpppcccccpppbbbppppp#",
      "#~ppppp~~ppppcccccpppp~~ppppp#",
      "#~ppppp~~ppppppppppppp~~ppppp#",
      "#~ppppp~~~~~~~bbb~~~~~~~ppppp#",
      "#~~~~~~~~~~~~~bbb~~~~~~~~~~~~#",
      "#~~~~~~~~~~~~~bbb~~~~~~~~~~~~#",
      "#~~~~~~~~~~~~~bbb~~~~~~~~~~~~#",
      "#~~~~~~~~~~pppbbbppp~~~~~~~~~#",
      "#~~~~~~~~~~ppppppppp~~~~~~~~~#",
      "#~~~~~~~~~~ppppppppp~~~~~~~~~#",
      "#~~~~~~~~~~ppppppppp~~~~~~~~~#",
      "#~~~~~~~~~~ppppppppp~~~~~~~~~#",
      "##############################"
    ],
    "objects": [
      {
        "id": "wr_crystal_1",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 10,
        "y": 11,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "wr_crystal_2",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 20,
        "y": 11,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "wr_crystal_3",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 12,
        "y": 3,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "wr_crystal_4",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 18,
        "y": 3,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "wr_paifang_1",
        "type": "decor",
        "sprite": "paifang",
        "x": 15,
        "y": 8,
        "name": "",
        "decor": true,
        "blocking": false
      },
      {
        "id": "portal_wr_to_ym",
        "type": "portal",
        "sprite": "portal",
        "x": 15,
        "y": 24,
        "name": "南返百草懸空寨",
        "targetMap": "yunmeng_village",
        "targetX": 5,
        "targetY": 5
      },
      {
        "id": "mirror_longtan",
        "type": "statue",
        "elem": "water",
        "x": 15,
        "y": 12,
        "name": "歸墟照影碑",
        "interaction": "rift_longtan_mirror"
      },
      {
        "id": "portal_secret_grotto",
        "type": "portal",
        "sprite": "portal",
        "x": 4,
        "y": 12,
        "name": "太阿古劍門（往問心劍塚）",
        "interaction": "ruins_to_secret_grotto"
      },
      {
        "id": "chest_wr_1",
        "type": "chest",
        "x": 26,
        "y": 12,
        "name": "望舒月華匣",
        "loot": {
          "item": "wuchenjian",
          "count": 1,
          "extraItem": "tianshezhang",
          "extraCount": 1
        },
        "msg": "開啟月華古匣，獲得名器【聽潮望舒劍】與【素娥月華笛杖】！"
      },
      {
        "id": "portal_wr_to_past",
        "type": "portal",
        "sprite": "portal",
        "x": 15,
        "y": 3,
        "name": "歲月鏡門（往十八年前壬戌燼夜）",
        "targetMap": "past_yanbo_night",
        "targetX": 14,
        "targetY": 22
      }
    ],
    "enemies": [
      {
        "id": "e_wr_1",
        "enemyGroup": [
          "shizhixie靈",
          "shizhixie靈"
        ],
        "x": 15,
        "y": 17,
        "patrol": [
          {
            "x": 15,
            "y": 16
          },
          {
            "x": 15,
            "y": 19
          }
        ]
      },
      {
        "id": "e_wr_2",
        "enemyGroup": [
          "mojieqishi",
          "shizhixie靈"
        ],
        "x": 25,
        "y": 14,
        "patrol": [
          {
            "x": 25,
            "y": 10
          },
          {
            "x": 25,
            "y": 15
          }
        ]
      }
    ]
  },
  "past_yanbo_night": {
    "id": "past_yanbo_night",
    "chapter": "第五章·壬戌燼夜",
    "name": "舊歲煙波·壬戌燼夜（十八年前）",
    "theme": "time_rift",
    "music": "memory_echo",
    "spawn": {
      "x": 14,
      "y": 22
    },
    "gateFlag": null,
    "gate2Flag": null,
    "grid": [
      "############################",
      "#..........................#",
      "#~~~~~~~~~~~~~~~~~~~~~~~~~~#",
      "#~~~~~~~~~~~bbbbb~~~~~~~~~~#",
      "#~~~~~~~~~~~bbbbb~~~~~~~~~~#",
      "#~~~~~~~~~~~bbbbb~~~~~~~~~~#",
      "#...........bbbbb..........#",
      "#...W.......bbbbb......W...#",
      "#.........rrrrrrrrr........#",
      "#.........rrrrrrrrr........#",
      "#..wwwwwwwrrrrrrrrrwwwwwww.#",
      "#..wfffffwrrrrrrrrrwfffffw.#",
      "#..wfffffwrrrrrrrrrwfffffw.#",
      "#..wffffffrrrrrrrrrffffffw.#",
      "#..wfffffwrrrrrrrrrwfffffw.#",
      "#..wfffffwrrrrrrrrrwfffffw.#",
      "#..wwwwwwwrrrrrrrrrwwwwwww.#",
      "#.........rrrrrrrrr........#",
      "#.........rrrrrrrrr........#",
      "#.........rrrrrrrrr........#",
      "#...W.....rrrrrrrrr....W...#",
      "#.........rrrrrrrrr........#",
      "#.........rrrrrrrrr........#",
      "#.........rrrrrrrrr........#",
      "#..........................#",
      "############################"
    ],
    "objects": [
      {
        "id": "py_lantern_1",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 11,
        "y": 9,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "py_lantern_2",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 17,
        "y": 9,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "py_lantern_3",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 11,
        "y": 18,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "py_lantern_4",
        "type": "decor",
        "sprite": "lantern_post",
        "x": 17,
        "y": 18,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "portal_past_to_wr",
        "type": "portal",
        "sprite": "portal",
        "x": 14,
        "y": 24,
        "name": "返回望舒古墟",
        "targetMap": "wangshu_ruins",
        "targetX": 15,
        "targetY": 4
      },
      {
        "id": "npc_past_yantiyi",
        "type": "npc",
        "sprite": "escort_captain",
        "x": 21,
        "y": 13,
        "name": "燕鐵衣（十八年前）",
        "interaction": "past_yantiyi_talk",
        "barks": [
          "「鎮淵重石若失控沉江，我燕鐵衣便以血肉之軀將它鎖入江底！絕不負蒼生！」"
        ]
      },
      {
        "id": "npc_past_xie",
        "type": "npc",
        "sprite": "sect_disciple",
        "x": 13,
        "y": 9,
        "name": "青年謝滄海",
        "interaction": "past_xie_talk",
        "barks": [
          "「師兄厲無咎竟想私留燼毒研究忘情之法……我謝滄海縱自毀雙目，也絕不與他同流合污！」"
        ]
      },
      {
        "id": "npc_past_cradle",
        "type": "npc",
        "sprite": "child_boy",
        "x": 6,
        "y": 13,
        "name": "護舟小童阿鶴",
        "interaction": "rift_young_luxiao",
        "barks": [
          "「白姨把滄瀾水魄託付在蘆葦舟裡……得有那半枚弦月銅鈴才能換回！」"
        ]
      },
      {
        "id": "boss_yexiao_obj",
        "type": "boss",
        "sprite": "boss_yexiao",
        "x": 14,
        "y": 5,
        "name": "夜溟魔君·玄燭",
        "interaction": "rift_boss_yexiao",
        "hideFlag": "defeated_yexiao"
      },
      {
        "id": "portal_past_to_guixu",
        "type": "portal",
        "sprite": "portal",
        "x": 14,
        "y": 3,
        "name": "時空裂淵（往歸墟沉淵古道）",
        "interaction": "rift_to_abyss"
      }
    ],
    "enemies": [
      {
        "id": "e_py_1",
        "enemyGroup": [
          "mojieqishi",
          "shizhixie靈"
        ],
        "x": 14,
        "y": 17,
        "patrol": [
          {
            "x": 12,
            "y": 17
          },
          {
            "x": 16,
            "y": 17
          }
        ]
      },
      {
        "id": "e_py_2",
        "enemyGroup": [
          "mojieqishi",
          "mojieqishi"
        ],
        "x": 14,
        "y": 12,
        "patrol": [
          {
            "x": 12,
            "y": 12
          },
          {
            "x": 16,
            "y": 12
          }
        ]
      }
    ]
  },
  "guixu_causeway": {
    "id": "guixu_causeway",
    "chapter": "第六章·歸墟沉淵",
    "name": "歸墟溟海·沉淵古道",
    "theme": "abyss",
    "music": "fire_sanctum",
    "spawn": {
      "x": 15,
      "y": 23
    },
    "gateFlag": "causeway_seal_open",
    "gate2Flag": null,
    "grid": [
      "##############################",
      "#~~~~~~~~~~~~~~~~~~~~~~~~~~~~#",
      "#~~~~~~~~~~ppppppppp~~~~~~~~~#",
      "#~~~~~~~~~~ppppppppp~~~~~~~~~#",
      "#~~~~~~~~~~ppppppppp~~~~~~~~~#",
      "#~~~~~~~~~~ppppppppp~~~~~~~~~#",
      "#~~~~~~~~~~ppppppppp~~~~~~~~~#",
      "#~~~~~~~~~~~~~bbb~~~~~~~~~~~~#",
      "#~ppppp~~~~~~~GGG~~~~~~~ppppp#",
      "#~ppppp~~~~~~~bbb~~~~~~~ppppp#",
      "#~ppppp~~~~~~~bbb~~~~~~~ppppp#",
      "#~ppppp~~pppppbbbppppp~~ppppp#",
      "#~pppppbbbpppppppppppbbbppppp#",
      "#~pppppbbbpppppppppppbbbppppp#",
      "#~ppppp~~ppppppppppppp~~ppppp#",
      "#~ppppp~~~~~~~bbb~~~~~~~ppppp#",
      "#~ppppp~~~~~~~bbb~~~~~~~ppppp#",
      "#~~~~~~~~~~~~~bbb~~~~~~~~~~~~#",
      "#~~~~~~~~~~~~~bbb~~~~~~~~~~~~#",
      "#~~~~~~~~~ppppbbbpppp~~~~~~~~#",
      "#~~~~~~~~~ppppppppppp~~~~~~~~#",
      "#~~~~~~~~~ppppppppppp~~~~~~~~#",
      "#~~~~~~~~~ppppppppppp~~~~~~~~#",
      "#~~~~~~~~~ppppppppppp~~~~~~~~#",
      "#~~~~~~~~~ppppppppppp~~~~~~~~#",
      "##############################"
    ],
    "objects": [
      {
        "id": "gc_crystal_1",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 11,
        "y": 20,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "gc_crystal_2",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 19,
        "y": 20,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "gc_crystal_3",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 12,
        "y": 4,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "gc_crystal_4",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 18,
        "y": 4,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "portal_gc_to_past",
        "type": "portal",
        "sprite": "portal",
        "x": 15,
        "y": 24,
        "name": "返回壬戌裂隙",
        "targetMap": "past_yanbo_night",
        "targetX": 14,
        "targetY": 4
      },
      {
        "id": "npc_gc_supply",
        "type": "npc",
        "sprite": "escort_captain",
        "x": 12,
        "y": 22,
        "name": "鎮遠行營鏢師",
        "interaction": "guixu_supply_shop",
        "serviceBadge": "藥",
        "barks": [
          "「少當家！鎮遠舊部湊齊了最好的靈藥甲冑，助你們決戰天闕！」"
        ]
      },
      {
        "id": "npc_gc_xie",
        "type": "npc",
        "sprite": "blind_lute",
        "x": 18,
        "y": 22,
        "name": "謝滄海",
        "interaction": "guixu_camp_rest",
        "serviceBadge": "宿",
        "barks": [
          "「此去望舒天闕便是生死決戰，先在我琴音下調息回滿真元吧！」"
        ]
      },
      {
        "id": "sw_abyss_west",
        "type": "switch",
        "x": 4,
        "y": 10,
        "name": "無生血陣樞·西",
        "interaction": "causeway_switch",
        "flag": "csw_1"
      },
      {
        "id": "sw_abyss_east",
        "type": "switch",
        "x": 26,
        "y": 10,
        "name": "無生血陣樞·東",
        "interaction": "causeway_switch",
        "flag": "csw_2"
      },
      {
        "id": "chest_gc_1",
        "type": "chest",
        "x": 4,
        "y": 15,
        "name": "沉淵玄甲箱",
        "loot": {
          "item": "tiancanyi",
          "count": 1,
          "extraItem": "tianxianglu",
          "extraCount": 1
        },
        "msg": "獲得【鑄天玄蠶寶甲】與【九轉續命露】！"
      },
      {
        "id": "chest_gc_2",
        "type": "chest",
        "x": 26,
        "y": 15,
        "name": "沉淵神冠箱",
        "loot": {
          "item": "chongtiankuan",
          "count": 1,
          "extraItem": "lingshanxianzhi",
          "extraCount": 2
        },
        "msg": "獲得【望舒曜金冠】與【雲夢千年芝×2】！"
      },
      {
        "id": "portal_gc_to_citadel",
        "type": "portal",
        "sprite": "portal",
        "x": 15,
        "y": 3,
        "name": "登臨望舒天闕",
        "targetMap": "lunar_citadel",
        "targetX": 16,
        "targetY": 25
      }
    ],
    "enemies": [
      {
        "id": "e_gc_1",
        "enemyGroup": [
          "baiyuejisi",
          "shuimofenshen"
        ],
        "x": 15,
        "y": 13,
        "patrol": [
          {
            "x": 12,
            "y": 13
          },
          {
            "x": 18,
            "y": 13
          }
        ]
      },
      {
        "id": "e_gc_2",
        "enemyGroup": [
          "guixuyanshou",
          "baiyuejisi"
        ],
        "x": 4,
        "y": 12,
        "patrol": [
          {
            "x": 4,
            "y": 11
          },
          {
            "x": 4,
            "y": 14
          }
        ]
      },
      {
        "id": "e_gc_3",
        "enemyGroup": [
          "shuimofenshen",
          "guixuyanshou"
        ],
        "x": 26,
        "y": 12,
        "patrol": [
          {
            "x": 26,
            "y": 11
          },
          {
            "x": 26,
            "y": 14
          }
        ]
      }
    ],
    "shops": {
      "guixu_supply": {
        "name": "遠征行營補給官",
        "items": [
          "zijinggao",
          "lingshanxianzhi",
          "tianxianglu",
          "jiuyinsan",
          "shaodaozi",
          "xuelinglong",
          "tiancanyi",
          "chongtiankuan"
        ]
      }
    }
  },
  "lunar_citadel": {
    "id": "lunar_citadel",
    "chapter": "終章·燼月長歌",
    "name": "望舒天闕·五曜封天壇",
    "theme": "abyss",
    "music": "immortal_sect",
    "spawn": {
      "x": 16,
      "y": 25
    },
    "gateFlag": "abyss_seal_open",
    "gate2Flag": null,
    "grid": [
      "################################",
      "#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#",
      "#~~~~~~~~ppppppppppppppp~~~~~~~#",
      "#~~~~~~~~ppppcccccccpppp~~~~~~~#",
      "#~~~~~~~~ppppcccccccpppp~~~~~~~#",
      "#~~~~~~~~ppppcccccccpppp~~~~~~~#",
      "#~~~~~~~~ppppcccccccpppp~~~~~~~#",
      "#~~~~~~~~ppppcccccccpppp~~~~~~~#",
      "#~~~~~~~~ppppppppppppppp~~~~~~~#",
      "#~~~~~~~~~~~~~~GGG~~~~~~~~~~~~~#",
      "#~~~~~~~~~~~~~~bbb~~~~~~~~~~~~~#",
      "#~~~~~~~pppppppbbbppppppp~~~~~~#",
      "#~~~~~~~pppppcccccccppppp~~~~~~#",
      "#~~~~~~~pppppcccccccppppp~~~~~~#",
      "#~~~~~~~pppppcccccccppppp~~~~~~#",
      "#~~~~~~~pppppcccccccppppp~~~~~~#",
      "#~~~~~~~ppppppppppppppppp~~~~~~#",
      "#~~~~~~~~~~~~~~bbb~~~~~~~~~~~~~#",
      "#~~~~~~~~~~~~~~bbb~~~~~~~~~~~~~#",
      "#~~~~~~~~~~~~~~bbb~~~~~~~~~~~~~#",
      "#~~~~~~~~~~~~~~bbb~~~~~~~~~~~~~#",
      "#~~~~~~~~~~ppppbbbpppp~~~~~~~~~#",
      "#~~~~~~~~~~ppppppppppp~~~~~~~~~#",
      "#~~~~~~~~~~ppppppppppp~~~~~~~~~#",
      "#~~~~~~~~~~ppppppppppp~~~~~~~~~#",
      "#~~~~~~~~~~ppppppppppp~~~~~~~~~#",
      "#~~~~~~~~~~ppppppppppp~~~~~~~~~#",
      "################################"
    ],
    "objects": [
      {
        "id": "lc_crystal_1",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 9,
        "y": 12,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "lc_crystal_2",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 23,
        "y": 12,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "lc_crystal_3",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 10,
        "y": 3,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "lc_crystal_4",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 22,
        "y": 3,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "lc_crystal_5",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 16,
        "y": 2,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "lc_paifang_1",
        "type": "decor",
        "sprite": "paifang",
        "x": 16,
        "y": 18,
        "name": "",
        "decor": true,
        "blocking": false
      },
      {
        "id": "portal_lc_to_gc",
        "type": "portal",
        "sprite": "portal",
        "x": 16,
        "y": 26,
        "name": "返回沉淵古道",
        "targetMap": "guixu_causeway",
        "targetX": 15,
        "targetY": 4
      },
      {
        "id": "stele_party_select",
        "type": "switch",
        "x": 13,
        "y": 23,
        "name": "點將誓師碑（調整出戰三人）",
        "interaction": "abyss_party_selector"
      },
      {
        "id": "stele_full_heal",
        "type": "stone_stele",
        "x": 19,
        "y": 23,
        "name": "望舒月泉碑（完全恢復）",
        "interaction": "citadel_heal_spring"
      },
      {
        "id": "altar_five_luminaries",
        "type": "statue",
        "elem": "holy",
        "x": 16,
        "y": 13,
        "name": "五曜封天總樞祭壇",
        "interaction": "abyss_wuling_altar"
      },
      {
        "id": "chest_lc_1",
        "type": "chest",
        "x": 10,
        "y": 14,
        "name": "天闕聖露匣",
        "loot": {
          "item": "tianxianglu",
          "count": 2,
          "extraItem": "jincanwang",
          "extraCount": 1
        },
        "msg": "獲得【九轉續命露×2】與【金蠶靈王×1】！"
      },
      {
        "id": "boss_final_obj",
        "type": "boss",
        "sprite": "boss_liwujiu",
        "x": 16,
        "y": 5,
        "name": "執劍首座·厲無咎",
        "interaction": "abyss_final_boss"
      }
    ],
    "enemies": [
      {
        "id": "e_lc_1",
        "enemyGroup": [
          "baiyuejisi",
          "shuimofenshen",
          "guixuyanshou"
        ],
        "x": 20,
        "y": 14,
        "patrol": [
          {
            "x": 19,
            "y": 14
          },
          {
            "x": 22,
            "y": 14
          }
        ]
      }
    ]
  },
  "sword_trial_grotto": {
    "id": "sword_trial_grotto",
    "chapter": "隱藏秘境·問心劍塚",
    "name": "問心劍塚·太古試煉窟",
    "theme": "demon_tower",
    "music": "sword_prison",
    "spawn": {
      "x": 14,
      "y": 23
    },
    "gateFlag": "trial_gate_open",
    "gate2Flag": null,
    "grid": [
      "############################",
      "############################",
      "########ppppppppppppp#######",
      "########ppppcccccpppp#######",
      "########ppppcccccpppp#######",
      "########ppppcccccpppp#######",
      "########ppppcccccpppp#######",
      "########ppppcccccpppp#######",
      "########ppppppppppppp#######",
      "#############GGG############",
      "#############ppp############",
      "#############ppp############",
      "###fffffffffffpfffffffffff##",
      "###fffffffffffpfffffffffff##",
      "###fffffffffffpfffffffffff##",
      "###fffffffffffpfffffffffff##",
      "###fffffffffffpfffffffffff##",
      "#############ppp############",
      "#############ppp############",
      "#############ppp############",
      "##########ppppppppp#########",
      "##########ppppppppp#########",
      "##########ppppppppp#########",
      "##########ppppppppp#########",
      "##########ppppppppp#########",
      "############################"
    ],
    "objects": [
      {
        "id": "stg_wpn_1",
        "type": "decor",
        "sprite": "weapon_rack",
        "x": 5,
        "y": 12,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "stg_wpn_2",
        "type": "decor",
        "sprite": "weapon_rack",
        "x": 23,
        "y": 12,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "stg_wpn_3",
        "type": "decor",
        "sprite": "weapon_rack",
        "x": 10,
        "y": 3,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "stg_wpn_4",
        "type": "decor",
        "sprite": "weapon_rack",
        "x": 18,
        "y": 3,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "stg_crystal_1",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 9,
        "y": 6,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "stg_crystal_2",
        "type": "decor",
        "sprite": "crystal_pillar",
        "x": 19,
        "y": 6,
        "name": "",
        "decor": true,
        "blocking": true
      },
      {
        "id": "portal_stg_to_wr",
        "type": "portal",
        "sprite": "portal",
        "x": 14,
        "y": 24,
        "name": "返回望舒古墟",
        "targetMap": "wangshu_ruins",
        "targetX": 5,
        "targetY": 12
      },
      {
        "id": "sw_trial_1",
        "type": "switch",
        "x": 4,
        "y": 14,
        "name": "問心劍碑·仁劍",
        "interaction": "trial_switch",
        "flag": "tsw_1"
      },
      {
        "id": "sw_trial_2",
        "type": "switch",
        "x": 24,
        "y": 14,
        "name": "問心劍碑·義劍",
        "interaction": "trial_switch",
        "flag": "tsw_2"
      },
      {
        "id": "chest_leg_1",
        "type": "chest",
        "x": 6,
        "y": 15,
        "name": "鑄天神兵匣·壹",
        "loot": {
          "item": "zhenyuan_shenbian",
          "count": 1,
          "extraItem": "shennong_zhang",
          "extraCount": 1
        },
        "msg": "開啟鑄天神兵匣，獲得傳說神兵【鎮遠焚天龍鞭】與【百草乾坤神杖】！"
      },
      {
        "id": "chest_leg_2",
        "type": "chest",
        "x": 22,
        "y": 15,
        "name": "鑄天神兵匣·貳",
        "loot": {
          "item": "sue_tianlai",
          "count": 1,
          "extraItem": "jincanwang",
          "extraCount": 1
        },
        "msg": "開啟鑄天神兵匣，獲得傳說神兵【九霄望舒玉笛劍】與【金蠶靈王】！"
      },
      {
        "id": "boss_swordspirit_obj",
        "type": "boss",
        "sprite": "boss_swordspirit",
        "x": 14,
        "y": 5,
        "name": "問心劍靈·太阿殘魂",
        "interaction": "trial_superboss_fight",
        "hideFlag": "defeated_swordspirit"
      },
      {
        "id": "chest_leg_taia",
        "type": "chest",
        "x": 14,
        "y": 3,
        "name": "太阿本源劍台",
        "interaction": "trial_taia_chest"
      }
    ],
    "enemies": [
      {
        "id": "e_stg_1",
        "enemyGroup": [
          "jianzhonghun",
          "taia_wei"
        ],
        "x": 9,
        "y": 14,
        "patrol": [
          {
            "x": 7,
            "y": 14
          },
          {
            "x": 11,
            "y": 14
          }
        ]
      },
      {
        "id": "e_stg_2",
        "enemyGroup": [
          "taia_wei",
          "jianzhonghun"
        ],
        "x": 19,
        "y": 14,
        "patrol": [
          {
            "x": 17,
            "y": 14
          },
          {
            "x": 21,
            "y": 14
          }
        ]
      },
      {
        "id": "e_stg_3",
        "enemyGroup": [
          "jianzhonghun",
          "taia_wei",
          "jianzhonghun"
        ],
        "x": 14,
        "y": 15,
        "patrol": [
          {
            "x": 14,
            "y": 12
          },
          {
            "x": 14,
            "y": 18
          }
        ]
      }
    ]
  }
};

  PalX.MAPS = MAPS;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MAPS };
  }
})(typeof window !== 'undefined' ? window : globalThis);
