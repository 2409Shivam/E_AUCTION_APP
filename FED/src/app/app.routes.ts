import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuctionComponent } from './auction/auction.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },   // default route
  { path: 'auction', component: AuctionComponent }
];
