# 📊 代码分析报告

> 🕒 生成时间: 2026/3/17 10:53:21

## 📈 概览

- 🔍 总计发现问题: **47** 个
- 🛡️ 涉及规则数量: **5** 个

## 📝 问题详情

### 🟡 规则: `large-function` (WARNING)

> 发现 **2** 处违规

| 📄 文件路径 | 📍 位置 | 💡 描述 |
| :--- | :---: | :--- |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/api/index.js` | 18:1 | 函数 setAxiosOption 过大 (97 行)，建议拆分 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/composables/useTableScroll.js` | 3:1 | 函数 useTableScroll 过大 (121 行)，建议拆分 |

### 🟡 规则: `no-any` (WARNING)

> 发现 **24** 处违规

| 📄 文件路径 | 📍 位置 | 💡 描述 |
| :--- | :---: | :--- |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/SearchBar/index.vue` | 17:28 | 检测到 any 类型，建议使用更具体的类型 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/SearchBar/index.vue` | 21:26 | 检测到 any 类型，建议使用更具体的类型 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/SearchBar/index.vue` | 27:29 | 检测到 any 类型，建议使用更具体的类型 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/SearchBar/index.vue` | 27:37 | 检测到 any 类型，建议使用更具体的类型 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/SearchBar/index.vue` | 55:34 | 检测到 any 类型，建议使用更具体的类型 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/SearchBar/index.vue` | 59:38 | 检测到 any 类型，建议使用更具体的类型 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/SearchBar/index.vue` | 60:37 | 检测到 any 类型，建议使用更具体的类型 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/SearchBar/index.vue` | 82:18 | 检测到 any 类型，建议使用更具体的类型 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/SearchBar/index.vue` | 98:44 | 检测到 any 类型，建议使用更具体的类型 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/SearchBar/index.vue` | 101:55 | 检测到 any 类型，建议使用更具体的类型 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/SearchBar/index.vue` | 179:31 | 检测到 any 类型，建议使用更具体的类型 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/SearchBar/index.vue` | 185:96 | 检测到 any 类型，建议使用更具体的类型 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/SearchBar/index.vue` | 204:36 | 检测到 any 类型，建议使用更具体的类型 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/SearchBar/index.vue` | 231:32 | 检测到 any 类型，建议使用更具体的类型 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/SearchBar/components/NumberRange.vue` | 49:18 | 检测到 any 类型，建议使用更具体的类型 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/SearchBar/utils/transform-presets.ts` | 6:23 | 检测到 any 类型，建议使用更具体的类型 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/SearchBar/utils/transform-presets.ts` | 9:30 | 检测到 any 类型，建议使用更具体的类型 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/SearchBar/utils/transform-presets.ts` | 15:37 | 检测到 any 类型，建议使用更具体的类型 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/SearchBar/utils/transform-presets.ts` | 21:33 | 检测到 any 类型，建议使用更具体的类型 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/SearchBar/utils/transform-presets.ts` | 36:33 | 检测到 any 类型，建议使用更具体的类型 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/SearchBar/utils/transform-presets.ts` | 46:32 | 检测到 any 类型，建议使用更具体的类型 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/SearchBar/utils/transform-presets.ts` | 49:40 | 检测到 any 类型，建议使用更具体的类型 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/SearchBar/utils/transform-presets.ts` | 58:59 | 检测到 any 类型，建议使用更具体的类型 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/SearchBar/utils/transform-presets.ts` | 58:78 | 检测到 any 类型，建议使用更具体的类型 |

### 🟡 规则: `duplicate-import` (WARNING)

> 发现 **2** 处违规

| 📄 文件路径 | 📍 位置 | 💡 描述 |
| :--- | :---: | :--- |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/LoadSelect/index.vue` | 1:1 | 模块 "vue" 被重复 import |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/pages/modules/creative/form.vue` | 2:1 | 模块 "@/utils/const" 被重复 import |

### 🟡 规则: `no-console-log` (WARNING)

> 发现 **7** 处违规

| 📄 文件路径 | 📍 位置 | 💡 描述 |
| :--- | :---: | :--- |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/pages/modules/s3Upload/index.vue` | 41:3 | 发现了 console.log 调用，建议在生产环境中移除 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/pages/modules/s3Upload/index.vue` | 60:9 | 发现了 console.log 调用，建议在生产环境中移除 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/pages/modules/s3Upload/index.vue` | 66:5 | 发现了 console.log 调用，建议在生产环境中移除 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/pages/modules/s3Upload/index.vue` | 76:3 | 发现了 console.log 调用，建议在生产环境中移除 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/pages/modules/Task/form.vue` | 575:9 | 发现了 console.log 调用，建议在生产环境中移除 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/pages/modules/Task/form.vue` | 698:9 | 发现了 console.log 调用，建议在生产环境中移除 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/pages/modules/Task/components/create-task-modal.vue` | 51:5 | 发现了 console.log 调用，建议在生产环境中移除 |

### 🔵 规则: `unmanaged-timeout` (INFO)

> 发现 **12** 处违规

| 📄 文件路径 | 📍 位置 | 💡 描述 |
| :--- | :---: | :--- |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/api/loading-manager.js` | 63:27 | 发现 setTimeout 调用，建议确保组件卸载时清理定时器 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/composables/useScopedLoading.js` | 79:7 | 发现 setTimeout 调用，建议确保组件卸载时清理定时器 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/composables/useTableScroll.js` | 76:24 | 发现 setTimeout 调用，建议确保组件卸载时清理定时器 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/mixins/scopedLoadingMixin.js` | 111:9 | 发现 setTimeout 调用，建议确保组件卸载时清理定时器 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/mixins/tableScrollMixin.js` | 50:31 | 发现 setTimeout 调用，建议确保组件卸载时清理定时器 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/utils/gatekeeper_tools.js` | 41:3 | 发现 setTimeout 调用，建议确保组件卸载时清理定时器 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/utils/gatekeeper_tools.js` | 167:13 | 发现 setTimeout 调用，建议确保组件卸载时清理定时器 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/utils/notice.ts` | 91:7 | 发现 setTimeout 调用，建议确保组件卸载时清理定时器 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/pages/Firework/index.vue` | 21:21 | 发现 setTimeout 调用，建议确保组件卸载时清理定时器 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/components/SearchBar/utils/collapse-animation.ts` | 33:7 | 发现 setTimeout 调用，建议确保组件卸载时清理定时器 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/pages/modules/creative/upload.vue` | 134:27 | 发现 setTimeout 调用，建议确保组件卸载时清理定时器 |
| `E:/my app/emo-code-sage/examples/h2o_volume_surge/src/pages/modules/Task/services/errorService.js` | 23:5 | 发现 setTimeout 调用，建议确保组件卸载时清理定时器 |

