import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartItem } from 'src/app/models/cart-item';
import { Product } from 'src/app/models/product';
import { Request } from 'src/app/models/request';
import { AuthService } from 'src/app/public/services/auth.service';
import { Util } from 'src/app/public/services/util';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  idProduct: number = -1;
  productSelected: Product | null = null;
  quantity: number = 0;

  constructor(private http: HttpClient, private route: ActivatedRoute) {
    if (this.route.snapshot.paramMap.get('id')) {
      this.idProduct = Number(this.route.snapshot.paramMap.get('id'));
    }
  }

  ngOnInit(): void {
    this.getProduct(this.idProduct);
  }

  getProduct(id: number): void {
    this.http.get<Product>(Util.productServerUrl + "/" + id).subscribe(result => {
      this.productSelected = result;
      console.log(result);
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
