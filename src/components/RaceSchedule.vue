<script setup lang="ts">
import { defineProps, PropType, ref } from 'vue';
import { RaceRound } from '../store';

const props = defineProps({
  schedule: {
    type: Array as PropType<RaceRound[]>,
    required: true,
  },
  currentRound: {
    type: Number,
    default: 0,
  },
});

const activeRound = ref([1]);

const getConditionColor = (condition: number): string => {
  if (condition < 30) return '#F56C6C';
  if (condition < 60) return '#E6A23C';
  if (condition < 85) return '#67C23A';
  return '#409EFF';
};
</script>

<template>
  <div class="race-schedule-component">
    <el-empty 
      v-if="schedule.length === 0" 
      description="Generate a program to see the schedule"
      :image-size="80"
    />
    
    <el-scrollbar v-else height="400px">
      <el-collapse v-model="activeRound">
        <el-collapse-item 
          v-for="round in schedule" 
          :key="round.roundNumber"
          :title="`Round ${round.roundNumber} - ${round.distance}m`"
          :name="round.roundNumber"
        >
          <div 
            class="round-info" 
            :class="{ 'active-round': round.roundNumber === currentRound }"
          >
            <el-badge v-if="round.roundNumber === currentRound" value="ACTIVE" type="primary" />
            
            <el-table 
              :data="round.horses" 
              style="width: 100%"
              size="small"
            >
              <el-table-column label="#" width="40">
                <template #default="scope">
                  {{ scope.$index + 1 }}
                </template>
              </el-table-column>
              
              <el-table-column label="Horse" min-width="120">
                <template #default="scope">
                  <div class="horse-item">
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
              
              <el-table-column label="Condition" width="40" align="center">
                <template #default="scope">
                  <span :style="{ color: getConditionColor(scope.row.condition) }">
                    {{ scope.row.condition }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-scrollbar>
  </div>
</template>

<style scoped>
.race-schedule-component {
  padding: 5px;
  overflow: hidden;
}

.round-info {
  margin-bottom: 10px;
  position: relative;
}

.active-round {
  background-color: #ecf5ff;
  padding: 10px;
  border-radius: 4px;
  border-left: 3px solid #409EFF;
}

.horse-item {
  display: flex;
  align-items: center;
  gap: 8px;
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

:deep(.el-collapse-item__header) {
  font-weight: 600;
  font-size: 14px;
}

:deep(.el-collapse-item.is-active .el-collapse-item__header) {
  color: #409EFF;
}

:deep(.el-badge__content--primary) {
  background-color: #409EFF;
}
</style> 