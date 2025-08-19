import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductGenreComponent } from './pages/product-genre/product-genre.component';
import { ShoppingCartComponent } from './pages/shopping-cart/shopping-cart.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { LoginComponent } from './pages/login/login.component';
import { RegistrationComponent } from './pages/registration/registration.component';
import { ResultSearchComponent } from './pages/resultSearch/resultSearch.component';

const appRoutes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'catalog', redirectTo: 'products', pathMatch: 'full' },  // <— alias
  { path: 'genre/:name', component: ProductGenreComponent },
  { path: 'cart', component: ShoppingCartComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'search/:encodedValue', component: ResultSearchComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },             // <— redirect iniziale
  { path: '**', redirectTo: 'home' }                               // <— fallback
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}