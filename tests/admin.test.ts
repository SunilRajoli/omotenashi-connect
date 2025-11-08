import { FeatureFlag } from '../src/models';

describe('Admin', () => {
  it('should list feature flags', async () => {
    const flags = await FeatureFlag.findAll();
    expect(flags).toBeDefined();
  });
});

