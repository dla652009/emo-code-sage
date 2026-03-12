const tagLevelListCache = new Map();

export function tagLevelListByContentType(tagLevelList, creativeTypeOption, item) {
  const { content_type, creative_type } = item || {};
  if (!content_type || !creative_type) return [];
  const cacheKey = `${content_type}_${creative_type}`;

  if (tagLevelListCache.has(cacheKey)) {
    return tagLevelListCache.get(cacheKey);
  }

  const label = creativeTypeOption.find(it => it.value === creative_type)?.label;
  const levelList = tagLevelList.filter(tag => tag.content_type === content_type);
  const result = levelList?.[0]?.children.filter(tag => tag.name === label);
  const finalResult = result?.[0]?.children || [];

  tagLevelListCache.set(cacheKey, finalResult);

  return finalResult;
}

export function matchTagsForCreativeType(tagLevelList, creativeTypeOption, item) {
  const { tags } = item || {};
  if (!tags || !Array.isArray(tags) || tags.length === 0) return;

  const newTagTree = tagLevelListByContentType(tagLevelList, creativeTypeOption, item);

  if (!newTagTree || newTagTree.length === 0) {
    item.tags = [];
    return;
  }

  const matchedTags = [];
  tags.forEach(tagPath => {
    if (!Array.isArray(tagPath) || tagPath.length === 0) return;

    const tagName = tagPath[tagPath.length - 1];

    const newTagPath = findTagPathByName(newTagTree, tagName);
    if (newTagPath) {
      matchedTags.push(newTagPath);
    }
  });

  item.tags = matchedTags;
}

export function findTagPathByName(tagTree, targetName) {
  const search = (nodes, path = []) => {
    for (const node of nodes) {
      const currentPath = [...path, node.name];

      if (node.name === targetName && node.is_tier !== 1) {
        return currentPath;
      }

      if (node.children && node.children.length > 0) {
        const result = search(node.children, currentPath);
        if (result) return result;
      }
    }
    return null;
  };

  return search(tagTree);
}

export function clearTagLevelListCache() {
  tagLevelListCache.clear();
}
