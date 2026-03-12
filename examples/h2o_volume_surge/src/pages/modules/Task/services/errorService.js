export async function scrollToFirstErrorField() {
  await nextTick();
  const formItems = document.querySelectorAll('.ant-form-item-has-error');
  if (formItems.length > 0) {
    const firstErrorItem = formItems[0];
    const mainContent = document.getElementById('main-content');
    const scrollContainer = mainContent || document.documentElement;
    // 计算元素相对于滚动容器的位置
    const elementRect = firstErrorItem.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();
    const scrollTop = scrollContainer.scrollTop || 0;
    const finalScrollTop = scrollTop + elementRect.top - containerRect.top - 250;
    if (scrollContainer.scrollTo) {
      scrollContainer.scrollTo({
        top: finalScrollTop,
        behavior: 'smooth'
      });
    } else {
      // 兼容性处理
      scrollContainer.scrollTop = finalScrollTop;
    }
    firstErrorItem.classList.add('highlight-error-field');
    setTimeout(() => {
      firstErrorItem.classList.remove('highlight-error-field');
    }, 1000);
  }
}

export function getMaterialAssignError(config, selectedMaterials) {
  if (config.ad_assign_type !== 2) return { hasError: false };

  const count = config.per_campaign_adset_num || 0;
  const assignInfo = config.ad_assign_info || [];
  
  // 检查是否有空行
  for (let i = 0; i < count; i++) {
    if (!assignInfo[i] || assignInfo[i].length === 0) {
      return { hasError: true, errorType: 'empty' };
    }
  }
  
  // 检查是否所有素材都被分配
  const allAssignedIds = new Set();
  assignInfo.forEach(list => {
    if (Array.isArray(list)) {
      list.forEach(id => allAssignedIds.add(String(id)));
    }
  });
  
  const notAssigned = (selectedMaterials || []).some(item => !allAssignedIds.has(String(item.id)));
  if (notAssigned) return { hasError: true, errorType: 'incomplete' };

  return { hasError: false };
}

export function getLangAssignError(config) {
  if (config.adset_locale_type !== 3) return { hasError: false };

  const count = config.per_campaign_adset_num || 0;
  const localeInfo = config.adset_locale_info || [];
  
  for (let i = 0; i < count; i++) {
    if (!localeInfo[i] || localeInfo[i].length === 0) {
      return { hasError: true, errorType: 'empty' };
    }
  }
  
  return { hasError: false };
}
