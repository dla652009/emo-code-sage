export const langOption = {
  2: '英语',
  3: '繁中',
  4: '日语',
  //5: '韩语',
  6: '西语',
  // 7: '简中',
  8: '德语',
  9: '法语',
  /*10: '俄语',*/
  11: '意语',
  12: '葡萄牙语',
  13: '印尼语',
  14: '土耳其语',
  15: '阿拉伯语'
};

export const translateSupportLang = {
  2: '英语',
  3: '繁中',
  4: '日语',
  6: '西语',
  8: '德语',
  9: '法语',
  11: '意语',
  12: '葡萄牙语',
  15: '阿拉伯语'
};

// 素材格式
export const mediaTypeOption = [
  { label: '视频', value: 1 },
  { label: '图片', value: 2 },
  { label: '音频', value: 3 }
];

// 素材类型
export const materialTypeOption = [
  { label: '纯图片', value: 2 },
  { label: '纯视频', value: 1 },
  { label: '图片+视频', value: 3 }
];

// 任务状态
export const taskStatusOption = [
  { label: '已保存', value: 0 },
  { label: '执行中', value: 1 },
  { label: '已执行', value: 2 },
  { label: '已删除', value: 3 }
];

// 素材状态
export const creativeStatusOption = [
  { label: '已启用', value: 1 },
  { label: '已删除', value: 2 },
  { label: '已禁用', value: 3 }
];

//权重选项
export const weightOption = [
  { label: '0', value: 0 },
  { label: '5', value: 5 },
  { label: '4', value: 4 },
  { label: '3', value: 3 },
  { label: '2', value: 2 },
  { label: '1', value: 1 }
];

// 素材拼接状态
export const mergeStatusOption = [
  { label: '未拼接', value: 0 },
  { label: '已拼接', value: 1 }
];

// 业务模式
export const businessModeOption = [
  { label: 'webob', value: 1 },
  { label: 'inapp', value: 2 }
];

// 拼接类型
export const mergeTypeOption = [
  { label: '条件拼接', value: 1 },
  { label: '自选拼接', value: 2 },
  { label: '成片视频', value: 3 }
];

// 筛选方式
export const filterTypeOption = [
  { label: '条件筛选', value: 1 },
  { label: '手动筛选', value: 2 }
];
export function initTagsOption(arr) {
  const map = new Map();
  let result = [];
  arr.forEach(item => {
    map.set(item.title, {
      label: item.title,
      value: item.title,
      children: []
    });
  });
  arr.forEach(item => {
    if (item.level === 1) {
      // 一级直接放到 result
      result.push(map.get(item.title));
    } else {
      // 处理一级到四级
      // 通过 parent_title 关联到父级
      const parent = map.get(item.parent_title);
      if (parent) {
        if (item.level === 2 || item.level === 3) {
          // 普通方式直接放入children
          parent.children.push(map.get(item.title));
        } else if (item.level === 4) {
          // 四级不需要children
          parent.children.push({
            label: item.title,
            value: item.title
          });
        }
      }
    }
  });
  return result;
}

export function findTagPath(nodes, targetValue, path = []) {
  let result = [];
  for (const node of nodes) {
    const currentPath = [...path, node.value];
    if (node.value === targetValue) {
      result.push(...currentPath);
      return result;
    }
    if (node.children && node.children.length) {
      result.push(...findTagPath(node.children, targetValue, currentPath));
    }
    if (result.length > 0) {
      return result;
    }
  }
  return result;
}

/**
 * 从树状结构中查找指定key值的路径
 * @param {Array} data 树状结构数组
 * @param {String} key 查找的关键字（如：id，name等）
 * @param {String|Number} value 查找的目标值
 * @returns {Array} 从根节点到目标节点的路径数组
 */
export function findPathByKey(data, key, value) {
  // 用来存储路径的数组
  let path = [];
  // 递归查找
  function find(node) {
    // 将当前节点的值添加到路径中
    path.push(node[key]);

    // 如果当前节点的key值与目标值匹配，返回
    if (node[key] === value) {
      return true;
    }

    // 如果有子节点，递归查找
    if (node.children && node.children.length > 0) {
      for (let child of node.children) {
        // 递归调用
        if (find(child)) {
          return true;
        }
      }
    }

    // 如果没有找到目标节点，移除当前节点并返回
    path.pop();
    return false;
  }

  // 遍历树的每个节点
  for (let node of data) {
    if (find(node)) {
      return path;
    }
  }

  // 如果没有找到匹配的节点，返回空数组
  return [];
}

/**
 * 国家选项
 * 遵循 ISO 3166-1 alpha-2 标准
 */
export const countryOption = [
  {
    label: '全球',
    value: 'ALL',
    children: [
      /* ===================== 非洲 ===================== */
      {
        label: '非洲',
        value: 'AFZ',
        children: [
          { label: '阿尔及利亚', value: 'DZ' },
          { label: '安哥拉', value: 'AO' },
          { label: '贝宁', value: 'BJ' },
          { label: '博茨瓦纳', value: 'BW' },
          { label: '布基纳法索', value: 'BF' },
          { label: '布隆迪', value: 'BI' },
          { label: '喀麦隆', value: 'CM' },
          { label: '佛得角', value: 'CV' },
          { label: '中非共和国', value: 'CF' },
          { label: '乍得', value: 'TD' },
          { label: '科摩罗', value: 'KM' },
          { label: '刚果民主共和国', value: 'CD' },
          { label: '刚果共和国', value: 'CG' },
          { label: '科特迪瓦', value: 'CI' },
          { label: '吉布提', value: 'DJ' },
          { label: '埃及', value: 'EG' },
          { label: '赤道几内亚', value: 'GQ' },
          { label: '厄立特里亚', value: 'ER' },
          { label: '埃塞俄比亚', value: 'ET' },
          { label: '加蓬', value: 'GA' },
          { label: '冈比亚', value: 'GM' },
          { label: '加纳', value: 'GH' },
          { label: '几内亚', value: 'GN' },
          { label: '几内亚比绍共和国', value: 'GW' },
          { label: '肯尼亚', value: 'KE' },
          { label: '莱索托', value: 'LS' },
          { label: '利比里亚', value: 'LR' },
          { label: '利比亚', value: 'LY' },
          { label: '马达加斯加', value: 'MG' },
          { label: '马拉维', value: 'MW' },
          { label: '马里', value: 'ML' },
          { label: '毛里塔尼亚', value: 'MR' },
          { label: '毛里求斯', value: 'MU' },
          { label: '摩洛哥', value: 'MA' },
          { label: '莫桑比克', value: 'MZ' },
          { label: '纳米比亚', value: 'NA' },
          { label: '尼日尔', value: 'NE' },
          { label: '尼日利亚', value: 'NG' },
          { label: '卢旺达', value: 'RW' },
          { label: '圣多美和普林西比', value: 'ST' },
          { label: '塞内加尔', value: 'SN' },
          { label: '塞舌尔', value: 'SC' },
          { label: '塞拉利昂', value: 'SL' },
          { label: '索马里', value: 'SO' },
          { label: '南非', value: 'ZA' },
          { label: '南苏丹', value: 'SS' },
          { label: '斯威士兰', value: 'SZ' },
          { label: '坦桑尼亚', value: 'TZ' },
          { label: '多哥', value: 'TG' },
          { label: '突尼斯', value: 'TN' },
          { label: '乌干达', value: 'UG' },
          { label: '马约特', value: 'YT' },
          { label: '圣赫勒拿', value: 'SH' },
          { label: '赞比亚', value: 'ZM' },
          { label: '西撒哈拉', value: 'EH' },
          { label: '留尼汪', value: 'RE' },
          { label: '津巴布韦', value: 'ZW' }
        ]
      },

      /* ===================== 亚洲 ===================== */
      {
        label: '亚洲',
        value: 'ASZ',
        children: [
          { label: '中国', value: 'CN' },
          { label: '日本', value: 'JP' },
          { label: '韩国', value: 'KR' },
          { label: '印度', value: 'IN' },
          { label: '新加坡', value: 'SG' },
          { label: '马来西亚', value: 'MY' },
          { label: '泰国', value: 'TH' },
          { label: '菲律宾', value: 'PH' },
          { label: '印度尼西亚', value: 'ID' },
          { label: '越南', value: 'VN' },
          { label: '中国台湾', value: 'TW' },
          { label: '香港', value: 'HK' },
          { label: '澳门', value: 'MO' },
          { label: '以色列', value: 'IL' },
          { label: '阿联酋', value: 'AE' },
          { label: '沙特阿拉伯', value: 'SA' },
          { label: '土耳其', value: 'TR' },
          { label: '阿富汗', value: 'AF' },
          { label: '孟加拉国', value: 'BD' },
          { label: '不丹', value: 'BT' },
          { label: '文莱', value: 'BN' },
          { label: '柬埔寨', value: 'KH' },
          { label: '老挝', value: 'LA' },
          { label: '蒙古', value: 'MN' },
          { label: '缅甸', value: 'MM' },
          { label: '尼泊尔', value: 'NP' },
          { label: '巴基斯坦', value: 'PK' },
          { label: '斯里兰卡', value: 'LK' },
          { label: '东帝汶', value: 'TL' },
          { label: '乌兹别克斯坦', value: 'UZ' },
          { label: '哈萨克斯坦', value: 'KZ' },
          { label: '吉尔吉斯斯坦', value: 'KG' },
          { label: '塔吉克斯坦', value: 'TJ' },
          { label: '土库曼斯坦', value: 'TM' },
          { label: '格鲁吉亚', value: 'GE' },
          { label: '亚美尼亚', value: 'AM' },
          { label: '阿塞拜疆', value: 'AZ' },
          { label: '巴林', value: 'BH' },
          { label: '伊拉克', value: 'IQ' },
          { label: '约旦', value: 'JO' },
          { label: '科威特', value: 'KW' },
          { label: '黎巴嫩', value: 'LB' },
          { label: '阿曼', value: 'OM' },
          { label: '卡塔尔', value: 'QA' },
          { label: '叙利亚', value: 'SY' },
          { label: '也门', value: 'YE' },
          { label: '马尔代夫', value: 'MV' },
          { label: '巴勒斯坦', value: 'PS' },
          { label: '塞浦路斯', value: 'CY' }
        ]
      },

      /* ===================== 欧洲 ===================== */
      {
        label: '欧洲',
        value: 'EUZ',
        children: [
          { label: '英国', value: 'UK' }, // 实际为 GB ，但由于历史原因，这里仍然使用 UK。
          { label: '德国', value: 'DE' },
          { label: '法国', value: 'FR' },
          { label: '意大利', value: 'IT' },
          { label: '西班牙', value: 'ES' },
          { label: '荷兰', value: 'NL' },
          { label: '瑞士', value: 'CH' },
          { label: '奥地利', value: 'AT' },
          { label: '比利时', value: 'BE' },
          { label: '瑞典', value: 'SE' },
          { label: '挪威', value: 'NO' },
          { label: '丹麦', value: 'DK' },
          { label: '芬兰', value: 'FI' },
          { label: '波兰', value: 'PL' },
          { label: '爱尔兰', value: 'IE' },
          { label: '葡萄牙', value: 'PT' },
          { label: '希腊', value: 'GR' },
          { label: '阿尔巴尼亚', value: 'AL' },
          { label: '安道尔', value: 'AD' },
          { label: '白俄罗斯', value: 'BY' },
          { label: '波斯尼亚和黑塞哥维那', value: 'BA' },
          { label: '保加利亚', value: 'BG' },
          { label: '克罗地亚', value: 'HR' },
          { label: '捷克', value: 'CZ' },
          { label: '爱沙尼亚', value: 'EE' },
          { label: '匈牙利', value: 'HU' },
          { label: '冰岛', value: 'IS' },
          { label: '拉脱维亚', value: 'LV' },
          { label: '列支敦士登', value: 'LI' },
          { label: '立陶宛', value: 'LT' },
          { label: '卢森堡', value: 'LU' },
          { label: '北马其顿', value: 'MK' },
          { label: '马耳他', value: 'MT' },
          { label: '摩尔多瓦', value: 'MD' },
          { label: '摩纳哥', value: 'MC' },
          { label: '黑山共和国', value: 'ME' },
          { label: '罗马尼亚', value: 'RO' },
          { label: '圣马力诺', value: 'SM' },
          { label: '塞尔维亚', value: 'RS' },
          { label: '斯洛伐克', value: 'SK' },
          { label: '斯洛文尼亚', value: 'SI' },
          { label: '乌克兰', value: 'UA' },
          { label: '梵蒂冈', value: 'VA' },
          { label: '泽西岛', value: 'JE' },
          { label: '根西岛', value: 'GG' },
          { label: '马恩岛', value: 'IM' },
          { label: '法罗群岛', value: 'FO' },
          { label: '直布罗陀', value: 'GI' },
          { label: '科索沃', value: 'XK' },
          { label: '斯瓦尔巴群岛和扬马延岛', value: 'SJ' }
        ]
      },

      /* ===================== 中美洲 ===================== */
      {
        label: '中美洲',
        value: 'CAZ',
        children: [
          { label: '巴拿马', value: 'PA' },
          { label: '尼加拉瓜', value: 'NI' },
          { label: '危地马拉', value: 'GT' },
          { label: '伯利兹', value: 'BZ' },
          { label: '洪都拉斯', value: 'HN' },
          { label: '哥斯达黎加', value: 'CR' },
          { label: '萨尔瓦多', value: 'SV' }
        ]
      },

      /* ===================== 加勒比地区 ===================== */
      {
        label: '加勒比地区',
        value: 'CBZ',
        children: [
          { label: '安提瓜和巴布达', value: 'AG' },
          { label: '安提瓜岛', value: 'AI' },
          { label: '马提尼克岛', value: 'MQ' },
          { label: '开曼群岛', value: 'KY' },
          { label: '巴哈马', value: 'BS' },
          { label: '巴巴多斯岛', value: 'BB' },
          { label: '多米尼克', value: 'DM' },
          { label: '格林纳达', value: 'GD' },
          { label: '海地', value: 'HT' },
          { label: '牙买加', value: 'JM' },
          { label: '圣基茨和尼维斯', value: 'KN' },
          { label: '圣卢西亚', value: 'LC' },
          { label: '圣文森特和格林纳丁斯', value: 'VC' },
          { label: '瓜德罗普岛', value: 'GP' },
          { label: '多米尼加共和国', value: 'DO' },
          { label: '库拉索', value: 'CW' },
          { label: '波多黎各', value: 'PR' },
          { label: '特立尼达和多巴哥', value: 'TT' },
          { label: '阿鲁巴', value: 'AW' },
          { label: '美属维尔京群岛', value: 'VI' },
          { label: '英属维尔京群岛', value: 'VG' },
          { label: '蒙塞拉特岛', value: 'MS' },
          { label: '特克斯和凯科斯群岛', value: 'TC' },
          { label: '荷属圣马丁', value: 'SX' },
          { label: '法属圣马丁', value: 'MF' }
        ]
      },

      /* ===================== 北美洲 ===================== */
      {
        label: '北美洲',
        value: 'NAZ',
        children: [
          { label: '美国', value: 'US' },
          { label: '圣皮埃尔和密克隆', value: 'PM' },
          { label: '百慕大', value: 'BM' },
          { label: '格陵兰', value: 'GL' },
          { label: '加拿大', value: 'CA' },
          { label: '墨西哥', value: 'MX' }
        ]
      },

      /* ===================== 南美洲 ===================== */
      {
        label: '南美洲',
        value: 'SAZ',
        children: [
          { label: '巴西', value: 'BR' },
          { label: '阿根廷', value: 'AR' },
          { label: '智利', value: 'CL' },
          { label: '哥伦比亚', value: 'CO' },
          { label: '秘鲁', value: 'PE' },
          { label: '乌拉圭', value: 'UY' },
          { label: '厄瓜多尔', value: 'EC' },
          { label: '玻利维亚', value: 'BO' },
          { label: '巴拉圭', value: 'PY' },
          { label: '圭亚那', value: 'GY' },
          { label: '法属圭亚那', value: 'GF' },
          { label: '苏里南', value: 'SR' },
          { label: '委内瑞拉', value: 'VE' },
          { label: '福克兰群岛', value: 'FK' }
        ]
      },

      /* ===================== 大洋洲 ===================== */
      {
        label: '大洋洲',
        value: 'OCZ',
        children: [
          { label: '澳大利亚', value: 'AU' },
          { label: '新西兰', value: 'NZ' },
          { label: '斐济', value: 'FJ' },
          { label: '巴布亚新几内亚', value: 'PG' },
          { label: '萨摩亚', value: 'WS' },
          { label: '所罗门群岛', value: 'SB' },
          { label: '托克劳', value: 'TK' },
          { label: '汤加', value: 'TO' },
          { label: '库克群岛', value: 'CK' },
          { label: '纽埃', value: 'NU' },
          { label: '图瓦卢', value: 'TV' },
          { label: '瓦努阿图', value: 'VU' },
          { label: '基里巴斯', value: 'KI' },
          { label: '马绍尔群岛', value: 'MH' },
          { label: '瑙鲁', value: 'NR' },
          { label: '帕劳', value: 'PW' },
          { label: '法属波利尼西亚', value: 'PF' },
          { label: '美属萨摩亚', value: 'AS' },
          { label: '诺福克岛', value: 'NF' },
          { label: '北马里亚纳群岛', value: 'MP' },
          { label: '关岛', value: 'GU' },
          { label: '皮特凯恩群岛', value: 'PN' },
          { label: '密克罗尼西亚联邦', value: 'FM' },
          { label: '新喀里多尼亚', value: 'NC' },
          { label: '瓦利斯和富图纳群岛', value: 'WF' },
          { label: '美国本土外小岛屿', value: 'UM' }
        ]
      }
    ]
  }
];

export const ageRangeOption = Array.from({ length: 48 }, (_, i) => i + 18).map(item => {
  if (item < 65) {
    return { label: item, value: item };
  } else {
    return { label: '65+', value: 65 };
  }
});

export const platformOption = [
  { label: '不限', value: 'all' },
  { label: '安卓', value: 'and' },
  { label: 'IOS', value: 'ios' }
];

// 广告目标
export const campaignGoalOption = [
  { label: '销量', value: 1 },
  { label: '应用推广', value: 2 }
];

// 预算类型
export const budgetTypeOption = [
  { label: '广告系列预算CBO', value: 1 },
  { label: '广告组预算ABO', value: 2 }
];

// 应用商店
export const appStoreOption = [
  { label: 'Google Play 商店', value: 1 },
  { label: 'Apple App Store(i0S 13.7 或更早版本)', value: 2 }
];

// 转化事件
export const conversionEventOption = [
  { label: '购物', value: 1 },
  { label: '订阅', value: 2 },
  { label: '捐款', value: 3 }
];

// 行动号召
export const actionOption = [
  { label: '下载', value: 1 },
  { label: '详细了解', value: 2 }
];

// 广告创建类型
export const createTypeOption = [
  { label: '新建系列', value: 1 },
  { label: '新建广告组', value: 2 },
  { label: '复制广告组', value: 3 }
];

// 分配模式
export const allocateModeOption = [
  { label: '随机分配', value: 1 },
  { label: '指定分配', value: 2 }
];

// 投放语言方式
export const languageMethodOption = [
  { label: '全部语言', value: 1 },
  { label: '指定统一语言', value: 2 },
  { label: '指定不同语言', value: 3 }
];

// 投放语言
export const languageOption = [
  '英语',
  '法语（加拿大）',
  '法语（法国）',
  '德语',
  '西班牙语（西语）',
  '西班牙语',
  '简体中文（中国）',
  '繁体中文（香港）',
  '繁体中文（台湾）',
  '葡萄牙语（巴西）',
  '日语',
  '意大利语'
].map(item => ({ label: item, value: item }));

// 欧盟国家
export const euCountry = [
  'AT',
  'BE',
  'BG',
  'CY',
  'CZ',
  'HR',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'RO',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'SK',
  'SI',
  'ES',
  'SE'
];

// 欧盟国家受益方
export const euBeneficiary = 'XIAN LONG NAN MING TECHNOLOGY CO LTD';

// 台湾、新加坡受益方
export const twSgBeneficiary = `Xi'an longnanming Technology Co., Ltd 西安龙南铭科技有限公司`;

export const PROJECT_LOGO = {
  1: 'https://qiniucdn.dailyyoga.com.cn/0a9263576a24d532ac17fa0f74c53680',
  2: 'https://dailyyogaappimage.dailyyoga.com/dd/7a/dd7afef845ed45a272da38720dffd3ea.png',
  3: 'https://dailyyogaappimage.dailyyoga.com/d8/c3/d8c3da8dcd51b89622ff7d7f5822f918.png',
  4: 'https://dailyyogaappimage.dailyyoga.com/ca/49/ca495715ce17c7df295068acbb6718bf.png',
  5: 'https://dailyyogaappimage.dailyyoga.com/96/94/9694fc2442d984b23ef8cef34cebe4f1.png'
};

/** 筛选渠道 */
export const channelOption = [
  { label: 'webob', value: 1 },
  { label: 'inapp-销量（ios）', value: 2 },
  { label: 'inapp-应用推广（and）', value: 3 }
];
