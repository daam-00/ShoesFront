import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from 'src/app/models/product';
import { Util } from 'src/app/public/services/util';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  /** Prodotti in evidenza */
  featuredProducts: Product[] = [];

  /** Slider */
  sliderImages = [
    { src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80', alt: 'Nike Air Max 90' },
    { src: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&q=80', alt: 'Adidas Ultraboost' },
    { src: 'https://images.unsplash.com/photo-1606813902919-ef2ecbb0e7d2?auto=format&fit=crop&q=80', alt: 'Puma RS-X' }
  ];
  currentSlide = 0;
  /** Deve essere pubblico perché lo leggi nel template (es. aria-live) */
  timer: any = null;
  private startX = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadFeatured();
    this.play(); // autoplay slider
  }

  ngOnDestroy(): void {
    this.pause();
  }

  /** API */
  loadFeatured(): void {
    this.http.get<Product[]>(`${Util.productServerUrl}?limit=4`).subscribe({
      next: (res) => (this.featuredProducts = res),
      error: (err) => console.error('Errore nel caricamento prodotti', err),
    });
  }

  /** Slider controls */
  next(): void {
    this.currentSlide = (this.currentSlide + 1) % this.sliderImages.length;
  }
  prev(): void {
    this.currentSlide = (this.currentSlide - 1 + this.sliderImages.length) % this.sliderImages.length;
  }
  goTo(i: number): void {
    this.currentSlide = i;
  }

  play(): void {
    this.pause();
    this.timer = setInterval(() => this.next(), 4200);
  }
  pause(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /** Pausa/riprendi quando la tab cambia visibilità */
  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    document.hidden ? this.pause() : this.play();
  }

  /** Swipe touch */
  onTouchStart(e: TouchEvent): void {
    this.startX = e.touches[0].clientX;
  }
  onTouchEnd(e: TouchEvent): void {
    const dx = e.changedTouches[0].clientX - this.startX;
    if (Math.abs(dx) > 40) (dx < 0) ? this.next() : this.prev();
  }

  /** trackBy per *ngFor delle card */
  trackById(_: number, item: Product): number | string {
    return (item as any).id ?? item.model;
  }
}