import { HabitsCoordinator, IHabitsStorageState } from '../HabitsCoordinator';
import { InMemoryStorageGateway } from '../../storage/InMemoryStorageGateway';

describe('HabitsCoordinator (Mission 03 - Somatic Habits Domain)', () => {
  let storage: InMemoryStorageGateway;
  const todayStr = '2026-08-19';

  beforeEach(() => {
    storage = new InMemoryStorageGateway();
  });

  it('should initialize with default state and reset daily counters for new date', () => {
    const state = HabitsCoordinator.loadState(storage, todayStr);
    expect(state.movement.todayWalkCompleted).toBe(false);
    expect(state.selfCare.waterGlassesCount).toBe(0);
    expect(state.selfCare.fruitVeggieConfirmed).toBe(false);
    expect(state.selfCare.sleepRoutineConfirmed).toBe(false);

    // Complete some habits
    const stateWithWater = HabitsCoordinator.addWaterGlass(storage, state);
    expect(stateWithWater.selfCare.waterGlassesCount).toBe(1);

    // Load next day
    const nextDayState = HabitsCoordinator.loadState(storage, '2026-08-20');
    expect(nextDayState.selfCare.waterGlassesCount).toBe(0);
    expect(nextDayState.selfCare.totalSelfCareActions).toBe(1); // Preserves cumulative total!
  });

  it('should complete movement session and increment total walks', () => {
    let state = HabitsCoordinator.loadState(storage, todayStr);
    state = HabitsCoordinator.completeMovementSession(storage, state, todayStr);

    expect(state.movement.todayWalkCompleted).toBe(true);
    expect(state.movement.totalWalkSessions).toBe(1);
    expect(state.movement.lastWalkDate).toBe(todayStr);
  });

  it('should handle water goal attainment when reaching 4 glasses', () => {
    let state = HabitsCoordinator.loadState(storage, todayStr);
    for (let i = 0; i < 3; i++) {
      state = HabitsCoordinator.addWaterGlass(storage, state);
    }
    expect(state.selfCare.isWaterGoalMet).toBe(false);

    state = HabitsCoordinator.addWaterGlass(storage, state);
    expect(state.selfCare.isWaterGoalMet).toBe(true);
    expect(state.selfCare.waterGlassesCount).toBe(4);
  });

  it('should confirm fruit/vegetal and sleep routine idempotently', () => {
    let state = HabitsCoordinator.loadState(storage, todayStr);
    state = HabitsCoordinator.confirmFruitVeggie(storage, state);
    expect(state.selfCare.fruitVeggieConfirmed).toBe(true);

    const totalBefore = state.selfCare.totalSelfCareActions;
    state = HabitsCoordinator.confirmFruitVeggie(storage, state);
    expect(state.selfCare.totalSelfCareActions).toBe(totalBefore); // Idempotent

    state = HabitsCoordinator.confirmSleepRoutine(storage, state);
    expect(state.selfCare.sleepRoutineConfirmed).toBe(true);
  });
});
