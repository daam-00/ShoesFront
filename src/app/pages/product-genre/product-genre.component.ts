import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/models/product';
import { Util } from 'src/app/public/services/util';

@Component({
  selector: 'app-product-genre',
  templateUrl: './product-genre.component.html',
  styleUrls: ['./product-genre.component.css']
})
export class ProductGenreComponent implements OnInit {

  products: Product[] = [];
  genreName: string = '';
  filteredProducts: Product[] = [];

  constructor(private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params =>{
      this.getGenre();
      this.getProducts();
    });
  }

  public getProducts(): void{
    this.http.get<Product[]>(Util.productServerUrl).subscribe(result=>{
      this.products=result;
      this.filterByGenre();
    });
  }

  getGenre() {
    const genre: string = this.route.snapshot.paramMap.get('name') || '';
    this.genreName = genre.toString();
  }

  filterByGenre(){
    this.filteredProducts = this.products.filter(product => product.genre === this.genreName);
    this.filteredProducts = this.filteredProducts.sort((a, b) => {
      if (a.brand < b.brand) {
        return -1;
      }
      if (a.brand > b.brand) {
        return 1;
      }
      return 0;
    });
  }
}
