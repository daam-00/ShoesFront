// home.component.ts

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isJordanDropdownVisible = false;
  isNikeDropdownVisible = false;
  isAdidasDropdownVisible = false;

  constructor() { }

  ngOnInit(): void {
  }

  // Funzione per mostrare/nascondere la tendina
  toggleDropdown(category: string) {
    this.isJordanDropdownVisible = category === 'jordan' ? !this.isJordanDropdownVisible : true;
    this.isNikeDropdownVisible = category === 'nike' ? !this.isNikeDropdownVisible : false;
    this.isAdidasDropdownVisible = category === 'adidas' ? !this.isAdidasDropdownVisible : false;
  }
}
