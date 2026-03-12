<template>
  <a-modal :footer="null" v-model:open="visible" title="权重修改历史" @cancel="handleCancel" width="70%">
    <div>素材编号：{{ config.creative_unique_id }}</div>
    <div class="mb-2">素材文件名称：{{ config.creative_name }}</div>
    <ApexChart type="line" height="200" :options="chartOptions" :series="series" />
    <a-table :columns="columns" :data-source="dataList" :pagination="false" size="small" :scroll="{ y: 200 }">
      <template #bodyCell="{ column, text }">
        <template v-if="column.dataIndex === 'data_type'">
          <UserOutlined v-if="text === 1" />
          <SettingOutlined v-else />
          {{ text === 1 ? '手动修改' : '系统修改' }}
        </template>
      </template>
    </a-table>
    <div class="flex justify-center mt-4">
      <a-button type="primary" @click="handleCancel">关闭</a-button>
    </div>
  </a-modal>
</template>
<script>
import ApexChart from 'vue3-apexcharts';
import * as Api from '../api';
import { UserOutlined, SettingOutlined } from '@ant-design/icons-vue';
export default {
  components: { ApexChart, UserOutlined, SettingOutlined },
  name: 'WeightHistoryModal',
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      visible: false,
      columns: [
        {
          title: '序号',
          dataIndex: 'id',
          width: 80
        },
        {
          title: '修改方式',
          dataIndex: 'data_type'
        },
        {
          title: '素材权重',
          dataIndex: 'weight'
        },
        {
          title: '修改日期',
          dataIndex: 'create_time'
        }
      ],
      dataList: [],
      series: [],
      chartOptions: {
        chart: {
          height: 200,
          type: 'line',
          zoom: {
            enabled: false
          },
          toolbar: {
            show: false
          }
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '12px',
            fontWeight: 500,
            colors: [
              function ({ seriesIndex, dataPointIndex, w }) {
                const point = w.config.series[seriesIndex].data[dataPointIndex];
                return point?.dataType === 1 ? '#1677ff' : '#00b96b';
              }
            ]
          }
        },
        stroke: {
          curve: 'straight'
        },
        markers: {
          size: 6,
          strokeColors: '#fff',
          strokeWidth: 2,
          hover: {
            size: 8
          }
        },
        tooltip: {
          custom: function ({ series, seriesIndex, dataPointIndex, w }) {
            const point = w.config.series[seriesIndex].data[dataPointIndex];
            const modifyType = point.dataType === 1 ? '手动修改' : '系统修改';
            return `<div class="apexcharts-tooltip-custom" style="padding: 8px;">
              <div><strong>日期：</strong>${point.x}</div>
              <div><strong>权重：</strong>${point.y}</div>
              <div><strong>修改方式：</strong><span style="color: ${point.dataType === 1 ? '#1677ff' : '#00b96b'}">${modifyType}</span></div>
            </div>`;
          }
        },
        colors: ['#1890ff'],
        grid: {
          row: {
            colors: ['#f3f3f3', 'transparent'],
            opacity: 0.5
          }
        },
        xaxis: {
          type: 'category',
          categories: []
        }
      }
    };
  },
  methods: {
    handleQuery(id) {
      Api.getUpdateWeightLog({ id: id }).then(({ data }) => {
        if (data.error_code) return this.$message.error(data.error_desc);
        // 表格显示所有数据
        this.dataList = data.result;

        // 图表：按日期分组，同一日期下取最后一条（不管手动还是系统）
        const groupByDate = {};
        data.result.forEach(item => {
          const date = item.create_time;
          // 取id最小的作为最后一条（列表倒序，id最小的是最后更新）
          if (!groupByDate[date] || item.id < groupByDate[date].id) {
            groupByDate[date] = item;
          }
        });

        // 转换为数组并按日期排序（从小到大）
        const chartData = Object.keys(groupByDate).sort((a, b) => {
          return a.localeCompare(b);
        });

        // 合并为一条线，保留修改方式信息用于tooltip显示
        const weightData = [];
        const categories = [];

        chartData.forEach(date => {
          categories.push(date);
          const item = groupByDate[date];
          weightData.push({
            x: date,
            y: item.weight,
            dataType: item.data_type // 1: 手动修改, 2: 系统修改
          });
        });

        this.series = [
          {
            name: '权重',
            data: weightData
          }
        ];

        // 更新图表配置（重新赋值以触发响应式更新）
        this.chartOptions = {
          ...this.chartOptions,
          yaxis: {
            min: 0,
            max: 5
          },
          xaxis: {
            type: 'category',
            categories: categories
          }
        };
      });
    },
    handleCancel() {
      this.visible = false;
      this.series = [];
    }
  }
};
</script>
