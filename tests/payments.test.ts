import { paymentService } from '../src/services/payment.service';

describe('Payments', () => {
  it('should process a payment', async () => {
    const payment = await paymentService.process({
      bookingId: 1,
      amount: 1000,
    });
    expect(payment).toBeDefined();
  });
});

