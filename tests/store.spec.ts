import { describe, it, expect, beforeEach } from 'vitest';
import { storeConfig, type RootState, type Horse, type RaceRound, type RaceResult } from '../src/store'; 
import { createStore, type Store } from 'vuex';
import { cloneDeep } from 'lodash-es';


const createFreshStore = () => {
  const freshConfig = cloneDeep(storeConfig);
  return createStore<RootState>(freshConfig);
};


describe('Vuex Store Test', () => {
  let testStore: Store<RootState>;

  beforeEach(() => {
    testStore = createFreshStore();
  });

  it('başlangıç statei', () => {
    expect(testStore.state.horses).toEqual([]);
    expect(testStore.state.raceSchedule).toEqual([]);
    expect(testStore.state.currentRoundNumber).toBe(0);
    expect(testStore.state.raceResults).toEqual([]);
    expect(testStore.state.isRaceInProgress).toBe(false);
    expect(testStore.state.availableColors).toBeDefined();
    expect(testStore.state.availableColors.length).toBeGreaterThan(0);
  });

  describe('mutation test', () => {
    it('SET_HORSES state içerisindeki atları güncelleme', () => {
      const newHorses: Horse[] = [{ id: '1', name: 'Test Atı', color: 'mavi', condition: 80 }];
      testStore.commit('SET_HORSES', newHorses);
      expect(testStore.state.horses).toEqual(newHorses);
    });

    it('SET_RACE_SCHEDULE yarış takvimi güncelleme', () => {
      const newSchedule: RaceRound[] = [{ roundNumber: 1, distance: 1200, horses: [] }];
      testStore.commit('SET_RACE_SCHEDULE', newSchedule);
      expect(testStore.state.raceSchedule).toEqual(newSchedule);
    });

    it('SET_CURRENT_ROUND_NUMBER mevcut tur numarasını güncelleme', () => {
      testStore.commit('SET_CURRENT_ROUND_NUMBER', 5);
      expect(testStore.state.currentRoundNumber).toBe(5);
    });

    it('ADD_RACE_RESULT raceResults sonuç ekleme', () => {
      const result: RaceResult = { roundNumber: 1, distance: 1000, horses: [], results: [] };
      testStore.commit('ADD_RACE_RESULT', result);
      expect(testStore.state.raceResults).toContainEqual(result);
      expect(testStore.state.raceResults.length).toBe(1);
    });

    it('SET_RACE_IN_PROGRESS isRaceInProgress durumu', () => {
      testStore.commit('SET_RACE_IN_PROGRESS', true);
      expect(testStore.state.isRaceInProgress).toBe(true);
      testStore.commit('SET_RACE_IN_PROGRESS', false);
      expect(testStore.state.isRaceInProgress).toBe(false);
    });

    it('RESET_HORSE_POSITIONS positions to 0', () => {
      const horses: Horse[] = [
        { id: 'h1', name: 'Horse 1', color: 'red', condition: 90, position: 100 },
        { id: 'h2', name: 'Horse 2', color: 'blue', condition: 80, position: 50 },
      ];
      const schedule: RaceRound[] = [
        {
          roundNumber: 1, distance: 1200, horses: [
            { id: 'h1', name: 'Horse 1', color: 'red', condition: 90, position: 100 },
          ]
        },
      ];
      testStore.commit('SET_HORSES', horses);
      testStore.commit('SET_RACE_SCHEDULE', schedule);

      testStore.commit('RESET_HORSE_POSITIONS');

      testStore.state.horses.forEach(horse => {
        expect(horse.position).toBe(0);
      });
      testStore.state.raceSchedule.forEach(round => {
        round.horses.forEach(horse => {
          expect(horse.position).toBe(0);
        });
      });
    });
  });

  describe('action test', () => {
    it('generateHorses SET_HORSES ve RESET_HORSE_POSITIONS ', async () => {
      await testStore.dispatch('generateHorses');
      expect(testStore.state.horses.length).toBe(20); 
      testStore.state.horses.forEach(horse => {
        expect(horse.position).toBe(0);
        expect(horse.condition).toBeGreaterThanOrEqual(50);
        expect(horse.condition).toBeLessThanOrEqual(100);
      });
    });

 
    it('startNextRound yarışı ilerletmeli', async () => {
      await testStore.dispatch('generateHorses');
      await testStore.dispatch('generateRaceSchedule');
      
      expect(testStore.state.currentRoundNumber).toBe(0);
      expect(testStore.state.isRaceInProgress).toBe(false);

      const results = await testStore.dispatch('startNextRound');
      
      expect(testStore.state.isRaceInProgress).toBe(true);
      expect(testStore.state.currentRoundNumber).toBe(1);
      expect(testStore.state.raceResults.length).toBe(1);
      expect(results).toBeDefined();
      if (results) { 
         expect(results.length).toBe(10);
      }
    });

    it('startNextRound tüm turlar tamamlama durumu', async () => {
      await testStore.dispatch('generateHorses');
      await testStore.dispatch('generateRaceSchedule');

      testStore.commit('SET_CURRENT_ROUND_NUMBER', testStore.state.raceSchedule.length);

      const result = await testStore.dispatch('startNextRound');
      expect(result).toBeNull();
      expect(testStore.state.isRaceInProgress).toBe(false);
    });

  });

  describe('getter test', () => {
    it('getRaceSchedule yarış takvimi', () => {
      const schedule: RaceRound[] = [{ roundNumber: 1, distance: 1200, horses: [] }];
      testStore.commit('SET_RACE_SCHEDULE', schedule);
      expect(testStore.getters.getRaceSchedule).toEqual(schedule);
    });

    it('getRaceResults yarış sonuçları', () => {
      const results: RaceResult[] = [{ roundNumber: 1, distance: 1000, horses: [], results: [] }];
      testStore.commit('ADD_RACE_RESULT', results[0]); 
      expect(testStore.getters.getRaceResults).toEqual(results);
    });

    it('getCurrentRound mevcut turun detayları', async () => {
      await testStore.dispatch('generateHorses');
      await testStore.dispatch('generateRaceSchedule');
      testStore.commit('SET_CURRENT_ROUND_NUMBER', 1);
      const currentRound = testStore.getters.getCurrentRound;
      expect(currentRound).toBeDefined();
      expect(currentRound?.roundNumber).toBe(1);
      expect(currentRound?.horses.length).toBe(10);
    });

    it('getCurrentRound mevcut tur yoksa undefined döndürmesi', () => {
      testStore.commit('SET_CURRENT_ROUND_NUMBER', 0);
      expect(testStore.getters.getCurrentRound).toBeUndefined();
      testStore.commit('SET_CURRENT_ROUND_NUMBER', 99); 
      expect(testStore.getters.getCurrentRound).toBeUndefined();
    });

  });
}); 