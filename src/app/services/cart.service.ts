import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CartItem } from '../models/cart-item.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = 'http://localhost:3000';
  private cartCount$ = new BehaviorSubject<number>(0);

  cartCount = this.cartCount$.asObservable();

  constructor(private http: HttpClient) {}

  setCartCount(count: number): void {
    this.cartCount$.next(count);
  }

  getCartItems(userId: number): Observable<CartItem[]> {
    return this.http
      .get<CartItem[]>(`${this.apiUrl}/cart?userId=${userId}`)
      .pipe(tap((items) => this.cartCount$.next(items.length)));
  }

  addToCart(item: Omit<CartItem, 'id'>): Observable<CartItem> {
    return this.http.post<CartItem>(`${this.apiUrl}/cart`, item).pipe(
      tap(() => this.cartCount$.next(this.cartCount$.value + 1))
    );
  }

  updateQuantity(id: number, quantity: number): Observable<CartItem> {
    return this.http.patch<CartItem>(`${this.apiUrl}/cart/${id}`, {
      quantity,
    });
  }

  removeFromCart(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cart/${id}`).pipe(
      tap(() =>
        this.cartCount$.next(Math.max(0, this.cartCount$.value - 1))
      )
    );
  }

  clearCart(userId: number): Observable<CartItem[]> {
    return this.getCartItems(userId);
  }
}
