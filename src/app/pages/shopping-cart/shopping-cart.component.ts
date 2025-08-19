import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CartItem } from 'src/app/models/cart-item';
import { ShoppingCart } from 'src/app/models/shopping-cart';
import { Request } from 'src/app/models/request';
import { Util } from 'src/app/public/services/util';
import { AuthService } from 'src/app/public/services/auth.service';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css']
})
export class ShoppingCartComponent implements OnInit {

  cart: ShoppingCart | null = null;
  items: CartItem[] = [];
  id: number = -1;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const uid = AuthService.getToken('id');
    if (uid) this.id = Number(uid);
    this.getCart();
  }

  /** Totale ordine (price * quantity se amount non presente) */
  get total(): number {
    return (this.items || []).reduce((sum, it) => {
      const line = (it as any).amount ?? (it.product.price * it.quantity);
      return sum + Number(line || 0);
    }, 0);
  }

  /** Carica carrello */
  getCart(): void {
    const body: Request = new Request(this.id, 'empty');
    this.http.post<ShoppingCart>(Util.cartServerUrl, body).subscribe({
      next: (result) => {
        this.cart = result;
        this.items = result?.cartItems ?? [];
      },
      error: (err) => console.error('getCart error', err)
    });
  }

  /** Rimuovi riga dal carrello */
  remove(item: CartItem): void {
    const body: Request = new Request(this.id, item.id);
    this.http.post<ShoppingCart>(`${Util.cartServerUrl}/remove`, body).subscribe({
      next: (result) => {
        // aggiorna stato locale senza ricaricare
        this.items = this.items.filter(i => i.id !== item.id);
        this.cart = result;
      },
      error: (err) => console.error('remove error', err)
    });
  }

  /** Checkout */
  checkout(): void {
    const body: Request = new Request(this.id, 'empty');
    this.http.post<ShoppingCart>(`${Util.cartServerUrl}/checkout`, body).subscribe({
      next: () => { window.location.href = '/profile'; },
      error: (err) => console.error('checkout error', err)
    });
  }

  /** Aggiorna quantità (delta: -1 / +1) con limiti [1, stock] */
  update(item: CartItem, delta: number): void {
    const stock = Number(item.product.stock ?? Infinity);
    const nextQty = Math.max(0, Math.min(stock, item.quantity + delta));

    // se arriva a 0, rimuovi
    if (nextQty === 0) {
      this.remove(item);
      return;
    }

    // ricalcola amount per evitare drift cumulativi
    item.quantity = nextQty;
    (item as any).amount = item.product.price * item.quantity;

    const body: Request = new Request(this.id, item);
    this.http.post<ShoppingCart>(`${Util.cartServerUrl}/update`, body).subscribe({
      next: (result) => { this.cart = result; },
      error: (err) => console.error('update error', err)
    });
  }
}