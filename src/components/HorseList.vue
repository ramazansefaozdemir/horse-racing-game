<script setup lang="ts">
import { defineProps, PropType } from 'vue';
import { Horse } from '../store'; 

defineProps({
  horses: {
    type: Array as PropType<Horse[]>,
    required: true,
  },
});

const rowClassName = ({ row, rowIndex }: { row: Horse, rowIndex: number }) => {
  return rowIndex % 2 === 0 ? 'even-row' : 'odd-row';
};

const getConditionColor = (condition: number) => {
  if (condition < 30) return '#F56C6C'; 
  if (condition < 60) return '#E6A23C'; 
  if (condition < 85) return '#67C23A'; 
  return '#409EFF'; 
};
</script>

<template>
  <div class="horse-list-component">
    <el-empty 
      v-if="horses.length === 0" 
      description="No horses generated yet" 
      :image-size="100"
    />
    
    <el-scrollbar v-else height="400px">
      <el-table 
        :data="horses" 
        style="width: 100%"
        size="small"
        :row-class-name="rowClassName"
      >
        <el-table-column label="Horse" min-width="140">
          <template #default="scope">
            <div class="horse-item">
              <div class="color-indicator" :style="{ backgroundColor: scope.row.color }"></div>
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
        
        <el-table-column prop="condition" label="Condition" width="100">
          <template #default="scope">
            <el-progress 
              :percentage="scope.row.condition" 
              :color="getConditionColor(scope.row.condition)" 
              :stroke-width="10"
              :show-text="true"
              :text-inside="true"
              style="width: 100px"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-scrollbar>
  </div>
</template>

<style scoped>
.horse-list-component {
  padding: 5px;
}

.horse-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.horse-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
  display: inline-block;
}

:deep(.even-row) {
  background-color: #f5f7fa;
}

:deep(.odd-row) {
  background-color: #ffffff;
}

:deep(.el-table) {
  --el-table-border-color: #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

:deep(.el-table__header-wrapper th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-table__row:hover) {
  background-color: #ecf5ff !important;
}
</style> 