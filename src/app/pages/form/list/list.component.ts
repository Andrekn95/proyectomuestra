import { Component } from '@angular/core';
import { FormComponent } from '../form/form.component';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tooltip } from 'primeng/tooltip';
import { HttpClient } from '@angular/common/http';
import { ProductInterface } from '../../../components/list/list.component';
import { JsonPipe } from '@angular/common';
import { doc, deleteDoc, Firestore, collection, getDocs } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    FormComponent,
    Button,
    TableModule,
    Tooltip,
    JsonPipe
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent {
  constructor(
    private httpClient: HttpClient,
    private fireStore: Firestore,
    private cdr: ChangeDetectorRef
  ) {
    this.findAll();
  }

  private url = 'https://67ef0ef3c11d5ff4bf7ba62a.mockapi.io/api/v1/products';
  protected products: ProductInterface[] = [];
  protected product!: ProductInterface;
  protected data!: ProductInterface;

  async findAll() {
    this.httpClient.get<ProductInterface[]>(this.url).subscribe({
      next: (response) => {
        this.products = response;
        console.log('Productos obtenidos desde la URL:', this.products);
      },
      error: (error) => {
        console.error('Error al obtener los productos desde la URL:', error);
      }
    });
  }

  findOne(id: number) {
    this.httpClient.get<ProductInterface>(`${this.url}/${id}`).subscribe(response => {
      this.product = response;
    });
  }

  catchData(product: ProductInterface) {
    const index = this.products.findIndex(item => item.id === product.id);
    if (index > -1) {
      this.products[index] = product;
    }
  }

  showEvent(data: boolean) {
    alert(data);
  }

  async delete(id: string) {
    console.log('Intentando eliminar el producto con ID:', id);

    // Eliminar en la API
    this.httpClient.delete(`${this.url}/${id}`).subscribe({
      next: () => {
        console.log('Producto eliminado en la API');
        
        // Eliminar en Firestore
        const docRef = doc(this.fireStore, 'products', id);
        deleteDoc(docRef).then(() => {
          console.log('Documento eliminado en Firestore');
        }).catch(error => {
          console.error('Error al eliminar en Firestore:', error);
        });

        // Actualizar la lista local
        this.products = this.products.filter(product => product.id.toString() !== id);
        console.log('Lista local actualizada:', this.products);
        this.cdr.detectChanges();
        alert('Producto eliminado exitosamente');
      },
      error: (error) => {
        console.error('Error al eliminar el producto en la API:', error);
        alert('Error al eliminar el producto');
      }
    });
  }
}
