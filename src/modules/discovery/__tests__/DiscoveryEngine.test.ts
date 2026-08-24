import { DiscoveryEngine, DISCOVERY_CATALOG } from '../DiscoveryEngine';

describe('DiscoveryEngine (Mission 04 - Curiosity & Neuroplasticity)', () => {
  it('should return 7 categories', () => {
    const categories = DiscoveryEngine.getCategories();
    expect(categories).toHaveLength(7);
  });

  it('should roll a random discovery from catalog', () => {
    const item = DiscoveryEngine.rollSurprise();
    expect(item).toBeDefined();
    expect(item.title).toBeTruthy();
    expect(item.practicalTip).toBeTruthy();
  });

  it('should filter by specific category when requested', () => {
    const musicItem = DiscoveryEngine.rollSurprise([], 'MUSIC');
    expect(musicItem.category).toBe('MUSIC');

    const readingItem = DiscoveryEngine.rollSurprise([], 'READING');
    expect(readingItem.category).toBe('READING');
  });

  it('should avoid excluded IDs when options exist', () => {
    const firstItem = DISCOVERY_CATALOG[0];
    const rolled = DiscoveryEngine.rollSurprise([firstItem.id]);
    expect(rolled.id).not.toBe(firstItem.id);
  });
});
