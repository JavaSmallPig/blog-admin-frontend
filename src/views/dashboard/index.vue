<template>
  <div class="dashboard-container">
    <!-- 数据卡片 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="(item, index) in statistics" :key="item.title">
        <el-card
          shadow="hover"
          :body-style="{ padding: '20px' }"
          class="data-card"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="card-content">
            <div class="icon-wrapper" :class="item.type">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="data-wrapper">
              <count-to
                :start-val="0"
                :end-val="item.value"
                :duration="2000"
                class="card-value"
              />
              <div class="card-title">{{ item.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
              <span>访问趋势</span>
          </template>
          <div ref="lineChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>分类统计</span>
            </div>
          </template>
          <div ref="pieChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 关于项目模块 -->
    <el-row justify="center" class="about-row">
      <el-col :span="24">
        <el-card shadow="never" class="about-card">
          <div class="about-title">关于项目</div>
          <div class="about-desc">
            Diamond博客管理系统 是一款专注于用户体验和视觉设计的后台管理系统<br/>
            使用了 Vue3、TypeScript、Vite、Element Plus 等前沿技术
          </div>
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import {
  CaretTop,
  CaretBottom,
  Document,
  Collection,
  ChatLineRound,
  View
} from '@element-plus/icons-vue'
import CountTo from '@/views/dashboard/components/CountTo.vue'
import { getDashboardDataApi, getBottomDataApi } from '@/api/system'

const icons = {
  Document: markRaw(Document),
  Collection: markRaw(Collection),
  ChatLineRound: markRaw(ChatLineRound),
  View: markRaw(View),
  CaretTop: markRaw(CaretTop),
  CaretBottom: markRaw(CaretBottom)
}

const statistics = ref([
  {
    title: '文章总数',
    value: 0,
    type: 'primary',
    icon: icons.Document
  },
  {
    title: '用户总数',
    value: 0,
    type: 'success',
    icon: icons.Collection
  },
  {
    title: '评论总数',
    value: 0,
    type: 'warning',
    icon: icons.ChatLineRound
  },
  {
    title: '总浏览量',
    value: 0,
    type: 'info',
    icon: icons.View
  }
])

// 图表相关
const lineChartRef = ref<HTMLElement>()
const pieChartRef = ref<HTMLElement>()
const lineChart = shallowRef<echarts.ECharts | null>(null)
const pieChart = shallowRef<echarts.ECharts | null>(null)

// 生成随机数据
const generateRandomData = (min: number, max: number, count: number): number[] => {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return result;
}

// 折线图配置
const getLineChartOption = (): EChartsOption => {
  // 生成随机访问量和浏览量数据
  const visitData = generateRandomData(800, 1500, 7);
  const viewData = generateRandomData(600, 1200, 7);

  return {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '访问量',
        type: 'line',
        smooth: true,
        data: visitData,
        areaStyle: {
          opacity: 0.3
        },
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '浏览量',
        type: 'line',
        smooth: true,
        data: viewData,
        areaStyle: {
          opacity: 0.3
        },
        itemStyle: {
          color: '#67C23A'
        }
      }
    ]
  }
}

// 饼图配置
const getPieChartOption = (): EChartsOption => ({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [{
    name: '分类统计',
    type: 'pie',
    radius: ['40%', '70%'],
    avoidLabelOverlap: false,
    itemStyle: {
      borderRadius: 10,
      borderColor: '#fff',
      borderWidth: 2
    },
    label: {
      show: false,
      position: 'center'
    },
    emphasis: {
      label: {
        show: true,
        fontSize: 20,
        fontWeight: 'bold'
      }
    },
    labelLine: {
      show: false
    },
    data: [] as any[]
  }]
})

// 初始化图表
const initCharts = () => {
  getBottomDataApi().then(res => {
    if (lineChartRef.value) {
      lineChart.value = echarts.init(lineChartRef.value)
      lineChart.value.setOption(getLineChartOption())
    }

    if (pieChartRef.value) {
      pieChart.value = echarts.init(pieChartRef.value)
      const option = getPieChartOption()
      if (option.series && Array.isArray(option.series)) {
        // 确保后端返回的分类数据格式正确
        const categoryData = res.data.data.map((item: any) => ({
          name: item.name,
          value: item.value
        }));
        option.series[0].data = categoryData;
      }
      pieChart.value?.setOption(option)
    }
  })
}

// 处理窗口大小变化
const handleResize = () => {
  lineChart.value?.resize()
  pieChart.value?.resize()
}

onMounted(() => {
  getDashboardDataApi().then(res => {
    // 确保与后端返回的数据结构保持一致
    const data = res.data;
    statistics.value[0].value = data.articleCount || 0;
    statistics.value[1].value = data.userCount || 0;
    statistics.value[2].value = data.commentCount || 0; // 修改为 commentCount
    statistics.value[3].value = data.viewCount || 0;    // 修改为 viewCount
    initCharts()
  })
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  lineChart.value?.dispose()
  pieChart.value?.dispose()
})
</script>

<style scoped>
/* 数据卡片样式 */
.data-card {
  animation: slideUp 0.5s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
}

.icon-wrapper:hover {
  transform: scale(1.1);
}

.icon-wrapper .el-icon {
  font-size: 30px;
  color: #fff;
}

.icon-wrapper.primary {
  background: linear-gradient(135deg, #1890ff, #36a9ff);
}

.icon-wrapper.success {
  background: linear-gradient(135deg, #52c41a, #73d13d);
}

.icon-wrapper.warning {
  background: linear-gradient(135deg, #faad14, #ffc53d);
}

.icon-wrapper.info {
  background: linear-gradient(135deg, #13c2c2, #36cfc9);
}

.data-wrapper {
  flex: 1;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 12px;
}

/* 图表区域样式 */
.chart-row {
  margin-top: 20px;
}

.chart {
  height: 350px;
  width: 100%;
}

.chart-card {
  height: auto;
  margin-bottom: 20px;
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .card-value {
    color: #e6e6e6;
  }

  .chart-placeholder {
    background: #1a1a1a;
    color: #909399;
  }
}

.about-row {
  margin-top: 30px;
}
.about-card {
  text-align: left;
  background: #ffffff;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.03);
}
.about-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}
.about-desc {
  font-size: 15px;
  color: #666;
  line-height: 2;
}
</style> 