<script setup lang="ts">
import { defineProps, PropType, ref, watch } from 'vue';
import { RaceResult } from '../store';

const props = defineProps({
  results: {
    type: Array as PropType<RaceResult[]>,
    required: true,
  },
  scheduleGenerated: {
    type: Boolean,
    required: true,
  }
});

const activeTab = ref<string>('1');

watch(
  () => props.results.length,
  (newLength) => {
    if (newLength > 0) {
      activeTab.value = props.results[newLength - 1].roundNumber.toString();
    }
  },
  { immediate: true }
);

const rowClassName = ({ rowIndex }: { rowIndex: number }) => {
  if (rowIndex === 0) return 'first-place';
  if (rowIndex === 1) return 'second-place';
  if (rowIndex === 2) return 'third-place';
  return '';
};
</script>

<template>
  <div class="race-results-component">
    <el-empty 
      v-if="!scheduleGenerated" 
      description="Generate program and start races to see results"
      :image-size="80"
    />
    
    <el-empty 
      v-else-if="scheduleGenerated && results.length === 0" 
      description="Races have not started or no results yet"
      :image-size="80"
    />
    
    <el-scrollbar v-else height="400px">
      <el-tabs v-model="activeTab" tab-position="left" type="border-card">
        <el-tab-pane 
          v-for="result in results" 
          :key="result.roundNumber"
          :label="`R${result.roundNumber}`"
          :name="result.roundNumber.toString()"
          :lazy="true"
        >
          <div class="result-header">
            <el-tag type="success" effect="dark" size="large">
              Round {{ result.roundNumber }} - {{ result.distance }}m
            </el-tag>
          </div>
          
          <el-table 
            :data="result.results" 
            style="width: 100%"
            size="small"
            :row-class-name="rowClassName"
          >
            <el-table-column label="Pos" width="50" align="center" type="index" :index="1" />
            
            <el-table-column label="Horse" min-width="120">
              <template #default="scope">
                <div class="horse-item">
                  <div class="position-indicator">{{ scope.$index + 1 }}</div>
                  <div class="color-dot" :style="{ backgroundColor: scope.row.color }"></div>
                  <el-tooltip
                    :content="scope.row.name"
                    placement="top"
                    :show-after="300"
                    effect="light"
                  >
                    <span class="horse-name">{{ scope.row.name }}</span>
                  </el-tooltip>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="Time" width="90" align="right">
              <template #default="scope">
                <span class="time-value">
                  {{ scope.row.finishTime?.toFixed(2) }}s
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-scrollbar>
  </div>
</template>

<style scoped>
.race-results-component {
  padding: 5px;
}

.el-scrollbar {
  table-layout: fixed;
  width: 240px;
}

.result-header {
  margin-bottom: 15px;
  text-align: center;
}

.horse-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.position-indicator {
  display: none; 
}

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.horse-name {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
  display: inline-block;
}

.time-value {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  font-size: 13px;
}


:deep(.first-place) {
  background-color: rgba(103, 194, 58, 0.15) !important;
}

:deep(.first-place td) {
  font-weight: 700;
}

:deep(.second-place) {
  background-color: rgba(144, 147, 153, 0.15) !important;
}

:deep(.third-place) {
  background-color: rgba(230, 162, 60, 0.15) !important;
}

:deep(.el-tabs__content) {
  padding: 10px;
}

:deep(.el-tabs__item) {
  font-weight: bold;
  padding: 0 15px;
}

:deep(.el-tabs__item.is-active) {
  color: #409EFF;
}

:deep(.el-table__body tr:hover > td) {
  background-color: transparent !important;
}
</style> 