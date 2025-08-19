import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { User } from 'src/app/models/user';
import { HttpClient } from '@angular/common/http';
import { Util } from '../services/util';
import { Genre } from 'src/app/models/genre.enum';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  public token: string | null = null;
  public userId = -1;
  user: User | null = null;

  genres: string[] = [];
  open = false;        // menu mobile
  dropdown = false;    // menu "Genres"

  @ViewChild('genresRef', { read: ElementRef }) genresRef!: ElementRef<HTMLElement>;

  constructor(private http: HttpClient, private host: ElementRef) {}

  ngOnInit(): void {
    this.genres = this.enumValues(Genre);

    this.token = AuthService.getToken('token');
    const id = AuthService.getToken('id');
    if (id) this.userId = Number(id);

    this.checkUser();
    this.updateScrolled();
  }

  /** sticky shadow on scroll */
  @HostListener('window:scroll')
  onScroll() { this.updateScrolled(); }

  private updateScrolled() {
    const el = document.querySelector('.nav');
    if (!el) return;
    if (window.scrollY > 4) el.classList.add('is-scrolled');
    else el.classList.remove('is-scrolled');
  }

  /** click fuori: chiudi dropdown e menu mobile */
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    // se click NON dentro al dropdown, chiudilo
    if (this.dropdown && this.genresRef && !this.genresRef.nativeElement.contains(ev.target as Node)) {
      this.dropdown = false;
    }
    // chiudi anche il mobile se aperto e clic fuori dai link
    if (this.open) {
      const withinNav = this.host.nativeElement.contains(ev.target as Node);
      if (!withinNav) this.open = false;
    }
  }

  /** ESC chiude il dropdown */
  @HostListener('document:keydown.escape')
  onEsc() { this.dropdown = false; }

  toggle() {
    this.open = !this.open;
    if (!this.open) this.dropdown = false;
  }

  toggleDropdown(event?: Event) {
    if (event) event.stopPropagation(); // evita che il document:click lo chiuda subito
    this.dropdown = !this.dropdown;
  }

  close() {
    this.open = false;
    this.dropdown = false;
  }

  checkUser() {
    if (this.token && this.userId > 0) {
      this.http.get<User>(`${Util.userServerUrl}/${this.userId}`)
        .subscribe({
          next: (res) => this.user = res,
          error: () => {}
        });
    }
  }

  enumValues(enumType: any): string[] {
    return Object.keys(enumType).map(key => enumType[key]);
  }
}