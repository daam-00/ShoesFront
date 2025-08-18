import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product';  // Sostituisci con la tua implementazione specifica di Product
import { AuthService } from 'src/app/public/services/auth.service';  // Sostituisci con la tua implementazione specifica di AuthService
import { Util } from 'src/app/public/services/util';
import { CartItem } from 'src/app/models/cart-item';
import { Request } from 'src/app/models/request';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  public products: Product[] = [];

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.getProducts();
  }

  public getProducts(): void {
    // Effettua la chiamata HTTP per ottenere tutti i prodotti dal tuo server
    this.http.get<Product[]>(Util.productServerUrl).subscribe(result => {
      console.log(result);
      this.products = result;
    });
  }

  addToCart(p: Product): void {
    console.log(AuthService.getToken("id"))
    if (AuthService.getToken("id")) {
      var userId: number = Number(AuthService.getToken("id"))
      var item: CartItem = new CartItem(p, 1, p.price);
      var body: Request = new Request(userId, item);

      this.http.post(Util.cartServerUrl + "/add", body).subscribe(result => {
        console.log(result)
        window.location.href = '/cart';
      });
    } else {
      window.location.href = '/login';
    }
  }
}
