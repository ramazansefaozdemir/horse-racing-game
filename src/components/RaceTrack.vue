<script setup lang="ts">
import { defineProps, PropType, computed, watch, ref } from 'vue';
import { RaceRound, Horse } from '../store'; 

const props = defineProps({
  currentRound: {
    type: Object as PropType<RaceRound | undefined>,
    default: undefined,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

interface AnimatedHorse extends Horse {
  translateX: number; 
  lane: number; 
}

const animatedHorses = ref<AnimatedHorse[]>([]);
const trackWidth = ref(800); 
const horseIconWidth = 40; 

const setupHorsesForAnimation = () => {
  if (props.currentRound) {
    animatedHorses.value = props.currentRound.horses.map((horse, index) => ({
      ...horse,
      translateX: 0,
      lane: index + 1, 
    }));
  } else {
    animatedHorses.value = [];
  }
};

watch(() => props.currentRound, 
  (newRound, oldRound) => {
    if (newRound && newRound.roundNumber !== oldRound?.roundNumber) {
      console.log("New round for track:", newRound.roundNumber);
      setupHorsesForAnimation();
    }
    if (!newRound) { 
        animatedHorses.value = [];
    }
  },
  { immediate: true, deep: true }
);

watch(() => props.isActive, 
  (newIsActive) => {
    if (newIsActive && props.currentRound) {
      console.log("Race started on track for round:", props.currentRound.roundNumber);

      animatedHorses.value.forEach(horse => {
        const animationDuration = (350 / (horse.condition || 50)); 
        
    
        setTimeout(() => { 
            horse.translateX = trackWidth.value - horseIconWidth; 
        }, Math.random() * 200); 

        console.log(`Horse ${horse.name} (${horse.condition}) animation duration: ${animationDuration.toFixed(2)}s, targetX: ${trackWidth.value - horseIconWidth}`);
      });

    } else if (!newIsActive) {
      console.log("Race paused or ended on track.");
    }
  }
);

const horseLaneHeight = computed(() => {
    if (animatedHorses.value.length === 0) return 50; 
    return Math.max(30, 300 / Math.max(1, animatedHorses.value.length)); 
});

</script>

<template>
  <div class="race-track-component">
    <div v-if="!currentRound && animatedHorses.length === 0" class="empty-state">
      Generate a program and start a race to see the track.
    </div>
    <div v-else-if="!currentRound && animatedHorses.length > 0" class="empty-state">
        Waiting for next round...
    </div>
    <div v-else-if="currentRound" class="track-area" :style="{ width: trackWidth + 'px', height: (horseLaneHeight * currentRound.horses.length) + 'px' }">
      <div v-for="horse in animatedHorses" 
           :key="horse.id" 
           class="horse-lane" 
           :style="{ height: horseLaneHeight + 'px' }">
        <div class="horse-icon" 
             :style="{
               backgroundColor: horse.color,
               transform: `translateX(${horse.translateX}px)`,
               transition: `transform ${(350 / (horse.condition || 50))}s ease-in-out` 
             }">
          <span class="horse-name">{{ horse.name.substring(0,3) }}</span>
        </div>
      </div>
      <div class="finish-line" :style="{ height: (horseLaneHeight * currentRound.horses.length) + 'px' }"></div>
    </div>
  </div>
</template>

<style scoped>
.race-track-component {
  padding: 10px;
  background-color: #e8f5e9; 
  border-radius: 8px;
  overflow: hidden;
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: #555;
  font-size: 1.1em;
}

.track-area {
  position: relative;
  border: 2px solid #a5d6a7;
  background-image: repeating-linear-gradient(
    -45deg,
    #c8e6c9,
    #c8e6c9 10px,
    #dcedc8 10px,
    #dcedc8 20px
  ); 
  padding: 10px 0; 
}

.horse-lane {
  position: relative;
  border-bottom: 1px dashed #81c784; 
  box-sizing: border-box;
}
.horse-lane:last-child {
  border-bottom: none;
}

.horse-icon {
  position: absolute;
  left: 0;
  width: 40px;
  height: 80%; 
  margin-top: 5%; 
  border-radius: 5px;
  background-color: grey; 
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7em;
  font-weight: bold;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
}

.horse-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.finish-line {
  position: absolute;
  top: 0;
  right: 0px; 
  width: 10px;
  background-image: repeating-linear-gradient(white 0px, white 10px, black 10px, black 20px);
  border-left: 2px solid black;
}
</style> 