import { bookingService } from '../src/services/booking.service';

describe('Booking', () => {
  it('should create a booking', async () => {
    const booking = await bookingService.create({
      businessId: 1,
      serviceId: 1,
      customerId: 1,
      startTime: new Date(),
      endTime: new Date(),
    });
    expect(booking).toBeDefined();
  });
});

