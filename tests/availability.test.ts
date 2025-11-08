import { availabilityService } from '../src/services/availability.service';

describe('Availability', () => {
  it('should check availability', async () => {
    const availability = await availabilityService.check({ businessId: 1 });
    expect(availability).toBeDefined();
  });
});

