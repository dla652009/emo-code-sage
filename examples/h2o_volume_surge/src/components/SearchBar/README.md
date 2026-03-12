# SearchBar 搜索栏组件

一个基于 Ant Design Vue 的通用搜索栏组件，支持多种表单控件类型、展开/收起功能、自定义渲染等特性。

## 功能特性

- 🎨 支持多种表单控件类型（输入框、下拉框、日期选择器、级联选择器、日期范围选择器、数字范围选择器）
- 🔄 支持自定义渲染函数或组件
- 📱 响应式布局，支持自定义列宽和间距
- 🎯 展开/收起功能，默认显示指定数量的搜索项
- 🔧 灵活的数据转换机制
- ⚡ 自动对齐按钮组到右侧
- 🎭 支持显示/隐藏标签、搜索按钮、重置按钮

## 安装依赖

```bash
npm install ant-design-vue @ant-design/icons-vue
```

## 基础用法

```vue
<template>
  <SearchBar :schema="searchSchema" @search="handleSearch" @reset="handleReset" />
</template>

<script setup>
import SearchBar from '@/components/SearchBar/index.vue';

const searchSchema = [
  {
    label: '用户名',
    field: 'username',
    type: 'input',
    placeholder: '请输入用户名'
  },
  {
    label: '状态',
    field: 'status',
    type: 'select',
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 }
    ]
  },
  {
    label: '创建时间',
    field: 'createTime',
    type: 'date'
  }
];

const handleSearch = (data) => {
  console.log('搜索数据:', data);
  // 执行搜索逻辑
};

const handleReset = () => {
  console.log('重置搜索');
  // 执行重置逻辑
};
</script>
```

## Props 属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| schema | 搜索项配置数组 | `SchemaItem[]` | - |
| span | 每列的宽度（基于 24 格布局） | `number` | `6` |
| gutter | 表单控件间隙 | `number` | `12` |
| showLabel | 是否显示标签 | `boolean` | `false` |
| showSearch | 是否显示搜索按钮 | `boolean` | `true` |
| showReset | 是否显示重置按钮 | `boolean` | `true` |
| isExpand | 默认是否展开 | `boolean` | `false` |
| defaultVisibleCount | 默认展开时显示的搜索项数量（不包括按钮列） | `number` | `3` |
| labelWidth | 标签宽度（仅在 showLabel 为 true 时有效） | `number \| string` | `70` |
| labelAlign | 标签对齐方式（仅在 showLabel 为 true 时有效） | `'left' \| 'right'` | `'right'` |
| size | 尺寸 | `'small'` | `'middle'` | `'large'`|

## Schema 配置项

### SchemaItem 接口

```typescript
interface SchemaItem {
  /** 标签名 */
  label: string;
  /** 字段名 */
  field: string;
  /** 搜索框类型 */
  type: 'input' | 'select' | 'date' | 'cascader' | 'rangePicker' | 'numberRange' | string;
  /** 自定义渲染函数或组件，用于渲染自定义组件（优先级高于 type） */
  render?: (() => VNode) | Component;
  /** 搜索框选项（用于 select、cascader 等组件） */
  options?: Record<string, any>;
  /** 提示语 */
  placeholder?: string | string[];
  /** 传递给表单项组件的属性 */
  props?: Record<string, any>;
  /** select 模式 */
  mode?: string;
  /** 是否多选 */
  multiple?: boolean;
  /** 输出值转换，支持预设或函数 */
  transform?: string | ((v: any) => any);
}
```

## Events 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| search | 点击搜索按钮时触发 | `(data: Record<string, any>) => void` |
| reset | 点击重置按钮时触发 | `(data: Record<string, any>) => void` |

## 高级用法

### 1. 自定义列宽和间距

```vue
<SearchBar 
  :schema="searchSchema" 
  :span="8" 
  :gutter="16"
  @search="handleSearch" 
/>
```

### 2. 显示标签

```vue
<SearchBar 
  :schema="searchSchema" 
  :show-label="true"
  :label-width="100"
  label-align="right"
  @search="handleSearch" 
/>
```

### 3. 多选下拉框

```vue
const searchSchema = [
  {
    label: '标签',
    field: 'tags',
    type: 'select',
    mode: 'multiple',
    options: [
      { label: '标签1', value: 1 },
      { label: '标签2', value: 2 },
      { label: '标签3', value: 3 }
    ]
  }
];
```

### 4. 日期范围选择器

```vue
const searchSchema = [
  {
    label: '日期范围',
    field: 'dateRange',
    type: 'rangePicker',
    placeholder: ['开始日期', '结束日期']
  }
];
```

### 5. 级联选择器

```vue
const searchSchema = [
  {
    label: '地区',
    field: 'region',
    type: 'cascader',
    options: [
      {
        value: 'beijing',
        label: '北京',
        children: [
          { value: 'chaoyang', label: '朝阳区' },
          { value: 'haidian', label: '海淀区' }
        ]
      }
    ]
  }
];
```

### 6. 数字范围选择器

```vue
const searchSchema = [
  {
    label: '价格范围',
    field: 'priceRange',
    type: 'numberRange',
    transform: 'number-range-to-start-end', // 转换为 { xxx_start, xxx_end }
    props: {
      minPlaceholder: '最低价',
      maxPlaceholder: '最高价',
      step: 100,
      precision: 0
    }
  }
];
```

### 7. 自定义渲染组件

```vue
<script setup>
import CustomComponent from './CustomComponent.vue';

const searchSchema = [
  {
    label: '自定义字段',
    field: 'custom',
    render: () => h(CustomComponent, { /* props */ })
  }
];
</script>
```

### 8. 数据转换 (Transform)

```vue
const searchSchema = [
  {
    label: '日期范围',
    field: 'dateRange',
    type: 'rangePicker',
    transform: 'range-to-start-end' // 预设转换器，将日期范围转换为 startTime 和 endTime
  },
  {
    label: '价格范围',
    field: 'priceRange',
    type: 'numberRange',
    transform: 'number-range-to-start-end' // 预设转换器，将数字范围转换为 xxx_start 和 xxx_end
  },
  {
    label: '价格',
    field: 'price',
    type: 'input',
    transform: (v) => v ? parseFloat(v) : null // 自定义转换函数
  }
];
```

### 9. 选项数组自动转换

组件支持多种格式的选项数组，会自动转换为标准的 `{ label, value }` 格式：

```vue
// 字符串数组
options: ['选项1', '选项2', '选项3']

// 数字数组
options: [1, 2, 3]

// 标准格式
options: [
  { label: '选项1', value: 1 },
  { label: '选项2', value: 2 }
]

// 后台格式（自动识别 id/name、key/title 等）
options: [
  { id: 1, name: '选项1' },
  { id: 2, name: '选项2' }
]
```

### 10. 展开/收起功能

当搜索项数量超过 `defaultVisibleCount` 时，会自动显示展开/收起按钮：

```vue
<SearchBar 
  :schema="searchSchema" 
  :default-visible-count="3"
  :is-expand="false"
  @search="handleSearch" 
/>
```

### 11. 完整示例

```vue
<template>
  <SearchBar 
    :schema="searchSchema"
    :span="6"
    :gutter="16"
    :show-label="false"
    :show-search="true"
    :show-reset="true"
    :is-expand="false"
    :default-visible-count="3"
    @search="handleSearch"
    @reset="handleReset"
  />
</template>

<script setup>
import SearchBar from '@/components/SearchBar/index.vue';

const searchSchema = [
  {
    label: '用户名',
    field: 'username',
    type: 'input'
  },
  {
    label: '邮箱',
    field: 'email',
    type: 'input',
    placeholder: '请输入邮箱地址'
  },
  {
    label: '状态',
    field: 'status',
    type: 'select',
    options: [
      { label: '全部', value: '' },
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 }
    ]
  },
  {
    label: '角色',
    field: 'roles',
    type: 'select',
    mode: 'multiple',
    options: ['管理员', '编辑', '访客']
  },
  {
    label: '创建时间',
    field: 'createTime',
    type: 'rangePicker',
    transform: 'range-to-start-end'
  },
  {
    label: '价格范围',
    field: 'priceRange',
    type: 'numberRange',
    transform: 'number-range-to-start-end'
  }
];

const handleSearch = (data) => {
  console.log('搜索数据:', data);
  // 发起 API 请求
};

const handleReset = () => {
  console.log('重置搜索');
  // 刷新列表
};
</script>
```

## 组件方法

通过 `ref` 可以访问组件的内部数据：

```vue
<template>
  <SearchBar ref="searchBarRef" :schema="searchSchema" />
</template>

<script setup>
const searchBarRef = ref();

// 获取当前搜索数据
const currentData = searchBarRef.value.searchData;
</script>
```

## 注意事项

1. **字段初始化**: 组件会自动根据 `mode` 或 `multiple` 属性初始化字段值（多选为 `[]`，单选为 `null`）
2. **按钮对齐**: 按钮组会自动计算 offset，始终显示在最右边
3. **回车搜索**: 在输入框中按回车键会触发搜索
4. **自动清除**: 所有表单控件默认支持清除功能（`allow-clear`）
5. **展开动画**: 展开/收起时有平滑的高度过渡动画（300ms）

## 内置 Transform 预设

组件提供了一些内置的数据转换预设（位于 `utils/transform-presets.ts`）：

- `range-to-start-end`: 将日期范围转换为 `{ start_time, end_time }` 格式
- `number-range-to-start-end`: 将数字范围转换为 `{ xxx_start, xxx_end }` 格式
- `array-to-string`: 将数组转换为逗号分隔的字符串
- `array-to-number-string`: 将数组转换为逗号分隔的数字字符串（过滤空值）
- `trim`: 去除字符串两端的空格
- `cascader-to-string`: 级联选择器末尾数据转换为字符串
- 更多预设可在 `transform-presets.ts` 中查看和扩展

## 样式定制

组件使用了 Tailwind CSS 和 SCSS，可以通过以下方式定制样式：

1. 修改组件内的 `scoped` 样式
2. 通过全局样式覆盖
3. 使用 Ant Design Vue 的主题定制功能

## License

MIT
