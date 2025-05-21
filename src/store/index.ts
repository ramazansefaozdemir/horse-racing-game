import { createStore } from 'vuex';
import type { Store, ActionContext, StoreOptions } from 'vuex';

export interface Horse {
  id: string;
  name: string;
  color: string;
  condition: number;
  position?: number; 
  finishTime?: number; 
}

export interface RaceRound {
  roundNumber: number;
  distance: number;
  horses: Horse[]; 
}

export interface RaceResult extends RaceRound {
  results: Horse[]; 
}

export interface RootState {
  horses: Horse[];
  raceSchedule: RaceRound[];
  currentRoundNumber: number;
  raceResults: RaceResult[];
  isRaceInProgress: boolean;
  availableColors: string[];
}


export const storeConfig: StoreOptions<RootState> = {
  state: {
    horses: [],
    raceSchedule: [],
    currentRoundNumber: 0,
    raceResults: [],
    isRaceInProgress: false,
    availableColors: [ 
      '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399',
      '#1989FA', '#41B883', '#F16F5C', '#F7BA2A', '#8E44AD',
      '#3498DB', '#2ECC71', '#F39C12', '#E74C3C', '#9B59B6',
      '#34495E', '#16A085', '#27AE60', '#E67E22', '#D35400'
    ],
  } as RootState, 
  mutations: {
    SET_HORSES(state: RootState, horses: Horse[]) {
      state.horses = horses;
    },
    ADD_HORSE(state: RootState, horse: Horse) {
      state.horses.push(horse);
    },
    SET_RACE_SCHEDULE(state: RootState, schedule: RaceRound[]) {
      state.raceSchedule = schedule;
    },
    SET_CURRENT_ROUND_NUMBER(state: RootState, roundNumber: number) {
      state.currentRoundNumber = roundNumber;
    },
    ADD_RACE_RESULT(state: RootState, result: RaceResult) {
      state.raceResults.push(result);
    },
    SET_RACE_RESULTS(state: RootState, results: RaceResult[]) {
      state.raceResults = results;
    },
    SET_RACE_IN_PROGRESS(state: RootState, status: boolean) {
      state.isRaceInProgress = status;
    },
    UPDATE_HORSE_POSITION(state: RootState, { horseId, position }: { horseId: string; position: number }) {
      const currentRound = state.raceSchedule.find(round => round.roundNumber === state.currentRoundNumber);
      if (currentRound) {
        const horse = currentRound.horses.find(h => h.id === horseId);
        if (horse) {
          horse.position = position;
        }
      }
    },
    RESET_HORSE_POSITIONS(state: RootState) {
      state.raceSchedule.forEach(round => {
        round.horses.forEach(horse => {
          horse.position = 0; 
        });
      });
      state.horses.forEach(horse => {
        horse.position = 0;
      });
    }
  },
  actions: {
    generateHorses({ commit, state }: ActionContext<RootState, RootState>) {
      const horseNames = [
        'A BEAUTIFUL MIND', 'ABDÜL', 'ABDÜL HAKEEM', 'AYBAKAN', 'BİG BOSS', 
        'BLONDE ANGEL', 'BRAVE HEART', 'COLT', 'DAY STAR', 'DERBENT', 
        'EL NINO', 'ELUSIVE', 'FAIR HILL', 'GÜMÜŞDERE', 'INVINCIBLE', 
        'KANEKO', 'LIFECHAIN', 'MARGARET HALL', 'MISTY', 'PEGASUS',
        'PHANTOM', 'SECRETARIAT', 'SHADOWFAX', 'SULTAN OF KAYRA', 'THUNDERBOLT',
        'GRACE HOPPER', 'JOAN CLARKE', 'ADA LOVELACE', 'WAR ADMIRAL', 'BLACK BEAUTY'
      ];
      
      const generatedHorses: Horse[] = [];
      const usedColors = new Set<string>();
      const localAvailableColors = [...(state.availableColors || [])];

      for (let i = 0; i < 20; i++) {
        let color = '';
        if (localAvailableColors.length > 0) {
          const colorIndex = Math.floor(Math.random() * localAvailableColors.length);
          color = localAvailableColors.splice(colorIndex, 1)[0];
          usedColors.add(color);
        } else {
 
          color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        }

  
        const nameIndex = Math.floor(Math.random() * horseNames.length);
        const name = horseNames.splice(nameIndex, 1)[0];

        generatedHorses.push({
          id: `horse-${i}-${Date.now()}`,
          name: name,
          color: color,
          condition: Math.floor(Math.random() * 50) + 50, 
          position: 0, 
        });
      }
      commit('SET_HORSES', generatedHorses);
      commit('RESET_HORSE_POSITIONS');
    },
    generateRaceSchedule({ commit, state }: ActionContext<RootState, RootState>) {
      if (!state.horses || state.horses.length === 0) {
        console.warn("Please generate horses first.");
        commit('SET_RACE_SCHEDULE', []);
        return;
      }
      const schedule: RaceRound[] = [];
      const roundDistances = [1200, 1400, 1600, 1800, 2000, 2200];
      const allHorses = [...state.horses];

      for (let i = 0; i < 6; i++) {
        const shuffledHorses = [...allHorses].sort(() => 0.5 - Math.random()); 
        const selectedHorses = shuffledHorses.slice(0, 10).map(horse => ({
          ...horse,
          position: 0,
          finishTime: undefined
        }));

        schedule.push({
          roundNumber: i + 1,
          distance: roundDistances[i],
          horses: selectedHorses,
        });
      }
      commit('SET_RACE_SCHEDULE', schedule);
      commit('SET_CURRENT_ROUND_NUMBER', 0);
      commit('RESET_HORSE_POSITIONS');
    },
    startNextRound({ commit, state }: ActionContext<RootState, RootState>) {

      if (state.currentRoundNumber >= state.raceSchedule.length) {
        commit('SET_RACE_IN_PROGRESS', false);
        console.log("All rounds completed!");
        return Promise.resolve(null); 
      }

      commit('SET_RACE_IN_PROGRESS', true);
      const nextRoundNumber = state.currentRoundNumber + 1;
      commit('SET_CURRENT_ROUND_NUMBER', nextRoundNumber);
      console.log(`Starting round ${nextRoundNumber} of ${state.raceSchedule.length}`);

      const currentRound = state.raceSchedule.find((r: RaceRound) => r.roundNumber === nextRoundNumber);
      if (!currentRound) {
        console.error("Current round not found!");
        commit('SET_RACE_IN_PROGRESS', false);
        return Promise.reject("Current round not found!"); 
      }

      return new Promise<Horse[]>((resolve) => {
        setTimeout(() => {
          const results = [...currentRound.horses]
            .map(horse => ({
              ...horse,
              finishTime: currentRound.distance / (horse.condition * (Math.random() * 0.5 + 0.8))
            }))
            .sort((a, b) => (a.finishTime ?? Infinity) - (b.finishTime ?? Infinity));

          commit('ADD_RACE_RESULT', {
            ...currentRound,
            results: results,
          } as RaceResult); 
          console.log('Round ' + nextRoundNumber + ' finished. Results:', results);
          
          if (nextRoundNumber >= state.raceSchedule.length) {
            console.log("All races have been completed!");
          }

          resolve(results);
        }, 4000); 
      });
    }
  },
  getters: {
    getHorseList: (state: RootState): Horse[] => {
      return state.horses;
    },
    getRaceSchedule: (state: RootState): RaceRound[] => {
      return state.raceSchedule;
    },
    getRaceResults: (state: RootState): RaceResult[] => {
      return state.raceResults;
    },
    getCurrentRound: (state: RootState): RaceRound | undefined => {
      if (state.currentRoundNumber === 0 || state.currentRoundNumber > state.raceSchedule.length) {
        return undefined;
      }
      return state.raceSchedule[state.currentRoundNumber - 1];
    },
    isRaceActive: (state: RootState): boolean => {
      return state.isRaceInProgress;
    },
    getRoundResultByNumber: (state: RootState) => (roundNumber: number): RaceResult | undefined => {
      return state.raceResults.find(result => result.roundNumber === roundNumber);
    }
  },
  modules: {
  },
};

export const store: Store<RootState> = createStore<RootState>(storeConfig);

export default store; 