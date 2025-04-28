import { Component } from '@angular/core';
import { FormComponent } from '../form/form.component';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tooltip } from 'primeng/tooltip';
import { HttpClient } from '@angular/common/http';
import { ProductInterface } from '../../../components/list/list.component';
import { JsonPipe } from '@angular/common';
import { doc, deleteDoc, Firestore } from '@angular/fire/firestore';
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
  private url = 'https://67ef0ef3c11d5ff4bf7ba62a.mockapi.io/api/v1/products';
  protected products: ProductInterface[] = [];
  protected product!: ProductInterface;
  protected showUpdateForm: boolean = false;

  constructor(
    private httpClient: HttpClient,
    private fireStore: Firestore,
    private cdr: ChangeDetectorRef
  ) {
    this.findAll(); 
  }

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

  async delete(id: string) {
    console.log('Intentando eliminar el producto con ID:', id);

    this.httpClient.delete(`${this.url}/${id}`).subscribe({
      next: () => {
        console.log('Producto eliminado en la API');
        
        const docRef = doc(this.fireStore, 'products', id);
        deleteDoc(docRef).then(() => {
          console.log('Documento eliminado en Firestore');
        }).catch(error => {
          console.error('Error al eliminar en Firestore:', error);
        });

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

  update(id: string) {
    console.log('Intentando actualizar el producto con ID:', id);

    const url = `${this.url}/${id}`;
    console.log('URL para actualizar:', url);

    this.httpClient.get<ProductInterface>(url).subscribe({
      next: (product) => {
        this.product = product;
        console.log('Producto cargado para actualizar:', this.product);
        this.showUpdateForm = true; // Muestra el formulario
      },
      error: (error) => {
        if (error.status === 404) {
          alert('El producto no existe en la API');
        } else {
          alert('Error al cargar el producto');
        }
        console.error('Error al cargar el producto para actualizar:', error);
      }
    });
  }

  saveProduct() {
    console.log('Guardando producto en la API:', this.product);

    const url = `${this.url}/${this.product.id}`;
    this.httpClient.put<ProductInterface>(url, this.product).subscribe({
      next: (updatedProduct) => {
        const index = this.products.findIndex(item => item.id === updatedProduct.id);
        if (index > -1) {
          this.products[index] = updatedProduct;
          console.log('Producto guardado en la API y actualizado en la lista local:', updatedProduct);
        }
        alert('Producto guardado exitosamente');
        this.showUpdateForm = false; 
      },
      error: (error) => {
        console.error('Error al guardar el producto en la API:', error);
        alert('Error al guardar el producto');
      }
    });
  }

  catchData(updatedProduct: ProductInterface) {
    const index = this.products.findIndex(item => item.id === updatedProduct.id);
    if (index > -1) {
      this.products[index] = updatedProduct;
      console.log('Producto actualizado en la lista local:', this.products[index]);
    }
    this.showUpdateForm = false; 
  }
}
