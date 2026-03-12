export function imgToBase64(file) {
  return new Promise((resolve, reject) => {
    /*转换base64*/
    let imgFile = new FileReader();
    imgFile.readAsDataURL(file);

    imgFile.onload = function () {
      let imgData = this.result; //base64数据
      resolve({
        file_name: file.name,
        img_data: imgData
      });
    };
  });
}

export function currencyFormatter(value = '') {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function parserCurrency(value = '') {
  return value.replace(/\$\s?|(,*)/g, '');
}

export function mapTree(list, tree = {}) {
  list.map(i => {
    tree[i.cate_id] = i;
    if (i.sub_cate_list && i.sub_cate_list.length) mapTree(i.sub_cate_list, tree);
  });

  return tree;
}

export function queryStringParams(obj) {
  let str = '';
  for (let key in obj) {
    if (obj[key]) {
      str += `&${key}=${obj[key]}`;
    }
  }
  return str.slice(1);
}

export function loadJS(url, callback) {
  let script = document.createElement('script'),
    fn = callback || function () {};
  script.type = 'text/javascript';
  //IE
  if (script.readyState) {
    script.onreadystatechange = function () {
      if (script.readyState == 'loaded' || script.readyState == 'complete') {
        script.onreadystatechange = null;
        fn();
      }
    };
  } else {
    //其他浏览器
    script.onload = function () {
      fn();
    };
  }
  script.src = url;
  document.getElementsByTagName('head')[0].appendChild(script);
}

export function loadCSS(url) {
  let link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = url;
  document.getElementsByTagName('head')[0].appendChild(link);
}

// 初始化层级关系
export function initLevel(data, level = 1) {
  data.forEach(item => {
    item.level = level;
    if (item.children) {
      initLevel(item.children, level + 1);
    }
  });
}

/**
 * 提取字符串中的数字部分，用于智能数字排序
 * @param {string} str - 输入字符串
 * @returns {Array} - 包含文本和数字的数组
 */
function extractNumbers(str) {
  const parts = [];
  const regex = /(\d+)|([^\d]+)/g;
  let match;
  while ((match = regex.exec(str)) !== null) {
    if (match[1]) {
      // 数字部分
      parts.push({ type: 'number', value: parseInt(match[1], 10), text: match[1] });
    } else if (match[2]) {
      // 文本部分
      parts.push({ type: 'text', value: match[2], text: match[2] });
    }
  }
  return parts;
}

/**
 * 素材文件名智能排序比较函数
 * 支持：英文开头、汉字开头、数字开头的文件名排序
 * 同时处理文件名中包含的数字进行智能排序
 * @param {string} a - 第一个文件名
 * @param {string} b - 第二个文件名
 * @returns {number} - 排序结果 (-1, 0, 1)
 */
export function compareCreativeName(a, b) {
  if (!a || !b) return 0;

  const nameA = a.toString().toLowerCase();
  const nameB = b.toString().toLowerCase();

  // 提取数字和文本部分
  const partsA = extractNumbers(nameA);
  const partsB = extractNumbers(nameB);

  // 逐部分比较
  const maxLen = Math.max(partsA.length, partsB.length);

  for (let i = 0; i < maxLen; i++) {
    const partA = partsA[i];
    const partB = partsB[i];

    // 如果其中一个已经没有部分了
    if (!partA) return -1;
    if (!partB) return 1;

    // 如果都是数字，按数值比较
    if (partA.type === 'number' && partB.type === 'number') {
      if (partA.value !== partB.value) {
        return partA.value - partB.value;
      }
    }
    // 如果都是文本，使用 localeCompare（支持中文拼音排序）
    else if (partA.type === 'text' && partB.type === 'text') {
      const comparison = partA.value.localeCompare(partB.value, 'zh-CN', {
        sensitivity: 'base',
        numeric: true
      });
      if (comparison !== 0) {
        return comparison;
      }
    }
    // 类型不同，数字优先
    else {
      return partA.type === 'number' ? -1 : 1;
    }
  }

  return 0;
}
