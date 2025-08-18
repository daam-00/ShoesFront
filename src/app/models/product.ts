export interface Product {
  id: number;
  brand: string;
  model: string;
  color: string;
  size: string;
  releaseDate: Date;
  price: number;
  imageUrl: string;
  stock: number;
  genre: string;
}

export class Product {
  constructor(
    public brand: string,
    public model: string,
    public color: string,
    public size: string,
    public releaseDate: Date,
    public price: number,
    public imageUrl: string,
    public stock: number,
    public genre: string,
    public id: number
  ) {}
}
