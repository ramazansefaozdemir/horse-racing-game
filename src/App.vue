<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { RootState, Horse, RaceRound, RaceResult } from './store'; 
import HorseList from './components/HorseList.vue'; 
import RaceSchedule from './components/RaceSchedule.vue'; 
import RaceResults from './components/RaceResults.vue'; 
import RaceTrack from './components/RaceTrack.vue'; 
import { ElNotification, ElMessageBox } from 'element-plus';

const store = useStore<RootState>();


const horses = computed<Horse[]>(() => store.state.horses);
const raceSchedule = computed<RaceRound[]>(() => store.state.raceSchedule);
const raceResults = computed<RaceResult[]>(() => store.state.raceResults);
const currentRoundDisplay = computed<string>(() => {
  if (store.state.currentRoundNumber > 0 && store.state.currentRoundNumber <= store.state.raceSchedule.length) {
    const round = store.state.raceSchedule[store.state.currentRoundNumber - 1];
    return `Round ${round.roundNumber} - ${round.distance}m`;
  }
  if (store.state.currentRoundNumber > store.state.raceSchedule.length && store.state.raceSchedule.length > 0) {
    return "All rounds finished!";
  }
  return "No race active";
});
const isRaceActive = computed<boolean>(() => store.state.isRaceInProgress);
const canGenerateProgram = computed<boolean>(() => !isRaceActive.value && raceSchedule.value.length === 0);
const canStartRace = computed<boolean>(() => raceSchedule.value.length > 0 && !isRaceActive.value && store.state.currentRoundNumber < raceSchedule.value.length);
const scheduleGenerated = computed<boolean>(() => store.state.raceSchedule.length > 0);
const currentRoundForTrack = computed<RaceRound | undefined>(() => store.getters.getCurrentRound);


const raceDebugInfo = computed<string>(() => {
  return `Rounds: ${store.state.raceSchedule.length}, Current: ${store.state.currentRoundNumber}, Results: ${store.state.raceResults.length}, Active: ${store.state.isRaceInProgress}`;
});

const allRacesCompleted = computed<boolean>(() => {
  const completed = store.state.raceSchedule.length > 0 && 
    store.state.currentRoundNumber >= store.state.raceSchedule.length;
  
  console.log(`Race completion check: ${completed}, currentRound=${store.state.currentRoundNumber}, totalRounds=${store.state.raceSchedule.length}`);
  return completed;
});


const raceFinishedButtonActive = computed<boolean>(() => {
  const active = allRacesCompleted.value && 
    store.state.raceResults.length === store.state.raceSchedule.length &&
    !isRaceActive.value;
  
  console.log(`Race finished button active: ${active}`);
  return active;
});

const activeTabName = ref('program');

watch(
  () => store.state.raceResults.length,
  (newLength, oldLength) => {
    if (newLength > 0 && newLength > oldLength) {
      activeTabName.value = 'results';
      

      const latestResult = store.state.raceResults[newLength - 1];
      ElNotification({
        title: `Round ${latestResult.roundNumber} Completed!`,
        message: `Results are now available. Click to view details.`,
        type: 'success',
        duration: 3000,
      });
    }
  }
);


const generateProgram = () => {

  if (raceResults.value.length > 0) {
    ElMessageBox.confirm(
      'This action will reset the current race program and results. Do you want to continue?',
      'New Race Program',
      {
        confirmButtonText: 'Yes, Create New Program',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )
      .then(() => {

        createNewProgram();
      })
      .catch(() => {
        ElNotification({
          title: 'Cancelled',
          message: 'Existing race results have been preserved.',
          type: 'info',
          duration: 2000,
        });
      });
  } else {
    createNewProgram();
  }
};

const createNewProgram = () => {
  store.commit('SET_RACE_RESULTS', []);
  store.dispatch('generateHorses').then(() => {
    store.dispatch('generateRaceSchedule');
  });
  activeTabName.value = 'program';
  ElNotification({
    title: 'New Program Created',
    message: 'Horses and race schedule created successfully.',
    type: 'success',
    duration: 3000,
  });
};

const startOrPauseRace = async () => {
  console.log(`Starting/pausing race: isActive=${isRaceActive.value}, currentRound=${store.state.currentRoundNumber}, totalRounds=${store.state.raceSchedule.length}`);
  
  if (isRaceActive.value) {
    console.log("Pausing race...");
    store.commit('SET_RACE_IN_PROGRESS', false);
  } else {
    if (store.state.currentRoundNumber < store.state.raceSchedule.length) {
      console.log("Starting next round...");
      try {
        await store.dispatch('startNextRound');

        store.commit('SET_RACE_IN_PROGRESS', false);
        
        if (store.state.currentRoundNumber >= store.state.raceSchedule.length) {
          console.log("All races have been completed!");
          ElNotification({
            title: 'All Races Completed!',
            message: 'View the final results for all races in the Results tab.',
            type: 'success',
            duration: 5000,
          });
          activeTabName.value = 'results';
        }
      } catch (error) {
        console.error("Failed to start round:", error);
        store.commit('SET_RACE_IN_PROGRESS', false); 
      }
    } else if (store.state.raceSchedule.length > 0) {
      console.log("All rounds have been completed.");
      store.commit('SET_RACE_IN_PROGRESS', false); 
      

      if (raceFinishedButtonActive.value) {
        ElNotification({
          title: 'All Races Completed!',
          message: 'View the final results for all races in the Results tab.',
          type: 'success',
          duration: 4000,
        });
        
        activeTabName.value = 'results';
      }
    } else {
      console.log("Please generate a program first.");
    }
  }
};
</script>

<template>
  <div id="horse-racing-app">
    <el-container direction="vertical">

      <el-header height="auto">
        <el-row :gutter="20" class="header-row" align="middle">
          <el-col :span="12">
            <h1 class="app-title">Horse Racing</h1>
          </el-col>
          <el-col :span="12" class="controls">
            <el-button 
              type="primary" 
              size="large" 
              @click="createNewProgram" 
              :disabled="!canGenerateProgram"
            >
              GENERATE PROGRAM
            </el-button>
            
            <el-button 
              :type="isRaceActive ? 'danger' : (raceFinishedButtonActive ? 'success' : 'primary')" 
              size="large" 
              @click="startOrPauseRace" 
              :disabled="!canStartRace && !isRaceActive && !raceFinishedButtonActive"
            >
              {{ isRaceActive ? 'PAUSE' : (raceFinishedButtonActive ? 'RACE FINISHED' : 'START RACE') }}
            </el-button>
          </el-col>
        </el-row>
        
        <el-row v-if="raceSchedule.length > 0">
          <el-col :span="24">
            <small class="debug-info">{{ raceDebugInfo }}</small>
          </el-col>
        </el-row>
      </el-header>

      <el-main>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="6" :lg="5" :xl="5">
            <el-card class="section-card">
              <template #header>
                <div class="card-header">
                  <h2>Horse List (1-20)</h2>
                </div>
              </template>
              <HorseList :horses="horses" />
            </el-card>
          </el-col>

          <el-col :xs="24" :sm="24" :md="12" :lg="14" :xl="14">
            <el-card class="section-card race-track-card">
              <template #header>
                <div class="card-header">
                  <h2>Race Track</h2>
                  <div class="round-info">{{ currentRoundDisplay }}</div>
                </div>
              </template>
              <RaceTrack :current-round="currentRoundForTrack" :is-active="isRaceActive" />
            </el-card>
          </el-col>

          <el-col :xs="24" :sm="24" :md="6" :lg="5" :xl="5">
            <el-card class="section-card">
              <template #header>
                <div class="card-header">
                  <el-tabs v-model="activeTabName">
                    <el-tab-pane label="Program" name="program">
                      <RaceSchedule :schedule="raceSchedule" :current-round="store.state.currentRoundNumber" />
                    </el-tab-pane>
                    <el-tab-pane label="Results" name="results">
                      <RaceResults :results="raceResults" :schedule-generated="scheduleGenerated" />
                    </el-tab-pane>
                  </el-tabs>
                </div>
              </template>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
#horse-racing-app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  min-height: 100vh;
}

.app-title {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.header-row {
  padding: 20px 0;
  border-bottom: 1px solid #ebeef5;
}

.controls {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.section-card {
  margin-bottom: 20px;
  height: calc(100% - 20px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.round-info {
  font-size: 16px;
  color: #606266;
  font-weight: 500;
}

.race-track-card {
  height: calc(100% - 20px);
}

.footer-text {
  text-align: center;
  color: #909399;
  font-size: 12px;
}

@media (max-width: 768px) {
  .controls {
    margin-top: 10px;
    justify-content: center;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .round-info {
    margin-top: 5px;
  }
}

.debug-info {
  display: block;
  font-size: 10px;
  color: #909399;
  margin-top: 5px;
  text-align: center;
}
</style>
