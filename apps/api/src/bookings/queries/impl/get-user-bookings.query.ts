export class GetUserBookingsQuery {
  constructor(
    public readonly userId: string,
    public readonly status?: import('@prisma/client').BookingStatus,
    public readonly page = 1,
    public readonly limit = 10,
  ) {}
}
