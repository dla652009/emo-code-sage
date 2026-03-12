import { countryOption } from '@/utils/const';

export function expandCountryValues(selectedValues) {

  // 将选中的值（包含父节点）展开为所有子节点的值
  const result = [];
  // 一级：全球
  const globalValue = 'ALL';
  // 二级：各大洲
  const continentValues = new Set(['AFZ', 'ASZ', 'EUZ', 'CAZ', 'CBZ', 'NAZ', 'SAZ', 'OCZ']);

  selectedValues.forEach(value => {
    if (value === globalValue) {
      // 如果选中的是"全球"，展开所有国家
      countryOption.forEach(globalNode => {
        if (globalNode.value === globalValue && globalNode.children) {
          globalNode.children.forEach(continent => {
            if (continent.children) {
              continent.children.forEach(country => {
                result.push(country.value);
              });
            }
          });
        }
      });
    } else if (continentValues.has(value)) {
      // 如果选中的是大洲，展开该大洲下所有国家
      countryOption.forEach(globalNode => {
        if (globalNode.children) {
          const continent = globalNode.children.find(item => item.value === value);
          if (continent && continent.children) {
            continent.children.forEach(country => {
              result.push(country.value);
            });
          }
        }
      });
    } else {
      // 如果是国家，直接添加
      result.push(value);
    }
  });

  // 去重
  return [...new Set(result)];
}
