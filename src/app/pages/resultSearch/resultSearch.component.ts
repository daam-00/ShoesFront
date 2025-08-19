import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CartItem } from 'src/app/models/cart-item';
import { Product } from 'src/app/models/product';
import { Request } from 'src/app/models/request';
import { AuthService } from 'src/app/public/services/auth.service';
import { Util } from 'src/app/public/services/util';

@Component({
  selector: 'app-resultSearch',
  templateUrl: './resultSearch.component.html',
  styleUrls: ['./resultSearch.component.css']
})
export class ResultSearchComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  query = '';
  loading = false;

  private sub?: Subscription;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    // ascolta cambi del parametro di rotta
    this.sub = this.route.params.subscribe(params => {
      const encodedValue = params['encodedValue'] ?? '';
      this.query = decodeURIComponent(encodedValue || '').trim();
      this.fetch(this.query);
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  /** Carica risultati: prova ?q=…; fallback al tuo endpoint /search/model/{q} */
  private fetch(q: string) {
    this.loading = true;
    this.products = [];

    if (!q) { this.loading = false; return; }

    const url1 = `${Util.productServerUrl}?q=${encodeURIComponent(q)}&limit=48`;
    const url2 = `${Util.productServerUrl}/search/model/${encodeURIComponent(q)}`;

    this.http.get<Product[]>(url1).pipe(
      catchError(() => this.http.post<Product[]>(url2, {})),
      catchError(() => of([]))
    ).subscribe(res => {
      this.products = (res || []).sort((a, b) => a.brand.localeCompare(b.brand));
      this.loading = false;
    });
  }

  addToCart(product: Product) {
    const idToken = AuthService.getToken('id');
    if (!idToken) { return; }

    const userId = Number(idToken);
    const item = new CartItem(product, 1, product.price);
    const body: Request = new Request(userId, item);

    this.http.post(Util.cartServerUrl + '/add', body).subscribe(() => {
      window.location.href = '/cart';
    });
  }

  trackById = (_: number, p: Product) => p.id;
}