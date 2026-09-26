import { Module } from '@nestjs/common';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { TableReservationsService } from './table-reservations.service';
import { ProRestaurantsController } from './pro-restaurants.controller';
import { RestaurantMenuController } from './restaurant-menu.controller';
import { CommissionsModule } from '../commissions/commissions.module';

@Module({
  imports: [CommissionsModule],
  controllers: [RestaurantsController, ProRestaurantsController, RestaurantMenuController],
  providers: [RestaurantsService, TableReservationsService],
  exports: [RestaurantsService, TableReservationsService],
})
export class RestaurantsModule {}
