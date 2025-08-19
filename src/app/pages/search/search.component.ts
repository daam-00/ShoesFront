import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { Util } from 'src/app/public/services/util';
import { Product } from 'src/app/models/product';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnDestroy {
  query = '';
  results: Product[] = [];
  loading = false;
  open = false;
  focused = false;

  activeIndex = 0;

  private input$ = new Subject<string>();
  private sub?: Subscription;

  @ViewChild('q') inputRef!: ElementRef<HTMLInputElement>;

  constructor(private http: HttpClient, private router: Router) {
    // stream ricerca con debounce
    this.sub = this.input$
      .pipe(
        debounceTime(180),
        distinctUntilChanged(),
        switchMap(q => this.search(q))
      )
      .subscribe(res => {
        this.results = res || [];
        this.loading = false;
        this.activeIndex = 0;
        this.open = !!this.query; // pannello aperto solo se c'è query
      });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  /* ==== UI ==== */
  onInput(e: Event) {
    this.query = (e.target as HTMLInputElement).value;
    if (!this.query) { this.results = []; this.open = false; return; }
    this.loading = true;
    this.input$.next(this.query.trim());
  }

  onBlur() {
    // aspetta il mousedown sui risultati
    setTimeout(() => { this.focused = false; this.open = false; }, 120);
  }

  clear(el?: HTMLInputElement) {
    this.query = '';
    this.results = [];
    this.open = false;
    (el ?? this.inputRef?.nativeElement)?.focus();
  }

  onSubmit() {
    const q = this.query.trim();
    if (!q) return;
    this.open = false;
    this.router.navigate(['/search', encodeURIComponent(q)]);
  }

  goTo(id: number) {
    this.open = false;
    this.router.navigate(['/product', id]);
  }

  trackById = (_: number, p: Product) => p.id;

  /* tastiera: ↑/↓/Enter/Escape */
  onKey(ev: KeyboardEvent) {
    if (!this.open && (ev.key === 'ArrowDown' || ev.key === 'ArrowUp')) {
      this.open = true;
      return;
    }
    if (!this.results.length) return;

    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      this.activeIndex = (this.activeIndex + 1) % this.results.length;
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      this.activeIndex = (this.activeIndex - 1 + this.results.length) % this.results.length;
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      const sel = this.results[this.activeIndex];
      sel ? this.goTo(sel.id) : this.onSubmit();
    } else if (ev.key === 'Escape') {
      this.open = false;
    }
  }

  /* scorciatoia globale "/" per focus */
  @HostListener('window:keydown', ['$event'])
  onWindowKey(ev: KeyboardEvent) {
    const tag = (ev.target as HTMLElement).tagName;
    if (ev.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
      ev.preventDefault();
      this.inputRef?.nativeElement?.focus();
      this.open = !!this.query;
    }
  }

  /* ==== DATA ==== */
  private search(q: string) {
    if (!q) return of([]);
    const encoded = encodeURIComponent(q);
    // Adatta all'API disponibile:
    // 1) tenta ?q=  2) fallback /search?text=
    const url1 = `${Util.productServerUrl}?q=${encoded}&limit=8`;
    const url2 = `${Util.productServerUrl}/search?text=${encoded}&limit=8`;

    return this.http.get<Product[]>(url1).pipe(
      catchError(() => this.http.get<Product[]>(url2)),
      catchError(() => of([]))
    );
  }

  /* evidenzia match */
  highlight(text: string): string {
    if (!this.query) return text;
    const re = new RegExp(`(${this.escape(this.query)})`, 'ig');
    return text.replace(re, '<mark>$1</mark>');
    }
  private escape(s: string){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
}