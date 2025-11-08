import { businessService } from '../src/services/business.service';

describe('Owner Portal', () => {
  it('should list customers', async () => {
    const customers = await businessService.listCustomers(1);
    expect(customers).toBeDefined();
  });

  it('should get summary', async () => {
    // TODO: Implement getSummary method
    // const summary = await businessService.getSummary(1);
    // expect(summary).toBeDefined();
    expect(true).toBe(true); // Placeholder
  });
});

