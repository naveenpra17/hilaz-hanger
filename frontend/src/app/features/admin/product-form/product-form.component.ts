import { Component, signal, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { UploadService } from '../../../core/services/upload.service';
import { Product } from '../../../core/models/product.model';

const LABEL_OPTIONS = ['BESTSELLER', 'NEW ARRIVAL', 'TRENDING', 'FLASH SALE'];
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (toast()) {
      <div class="fixed top-20 right-4 z-50 bg-white border shadow-lg rounded-xl px-4 py-3 flex items-center gap-2 text-sm">
        <span class="text-red-500">⚠</span> {{ toast() }}
      </div>
    }

    <form (ngSubmit)="onSubmit()" class="w-full max-w-2xl mx-auto space-y-4 sm:space-y-6">
      <div class="section-card space-y-3">
        <h3 class="font-semibold text-burgundy-800 border-b pb-2">Product Image</h3>
        <div class="flex flex-col sm:flex-row gap-4 items-start">
          <img [src]="previewImage" alt="Preview" class="w-32 h-40 rounded-xl object-cover border" />
          <div class="flex-1 w-full space-y-2">
            <input type="file" accept="image/*" class="text-sm w-full" (change)="onFileSelected($event)" [disabled]="uploading()" />
            @if (uploading()) {
              <p class="text-xs text-burgundy-600">Uploading to Cloudinary...</p>
            }
            <p class="text-xs text-gray-500">Or paste image URL:</p>
            <input class="input-field text-sm" [(ngModel)]="previewImage" name="imageUrl" />
          </div>
        </div>
      </div>

      <div class="section-card space-y-3">
        <h3 class="font-semibold text-burgundy-800 border-b pb-2">Basic Info</h3>
        <input class="input-field" placeholder="Product name" [(ngModel)]="name" name="name" required />
        <textarea class="input-field" rows="3" placeholder="Description" [(ngModel)]="description" name="desc"></textarea>
        <div class="grid grid-cols-2 gap-3">
          <input class="input-field" type="number" placeholder="Price ₹" [(ngModel)]="price" name="price" />
          <input class="input-field" type="number" placeholder="Compare price" [(ngModel)]="compareAtPrice" name="compare" />
        </div>
      </div>

      <div class="section-card space-y-3">
        <h3 class="font-semibold text-burgundy-800 border-b pb-2">Product Sizes</h3>
        <div class="flex flex-wrap gap-2">
          @for (s of selectedSizes; track s) {
            <span class="chip bg-burgundy-400 text-white border-burgundy-400">
              {{ s }}
              <button type="button" (click)="removeSize(s)">×</button>
            </span>
          }
        </div>
        <div class="flex gap-2">
          <input class="input-field flex-1" placeholder="Custom size" [(ngModel)]="newSize" name="newSize" />
          <button type="button" class="bg-burgundy-400 text-white px-4 rounded-xl" (click)="addSize()">Add</button>
        </div>
        <div class="flex flex-wrap gap-2">
          @for (s of sizeOptions; track s) {
            <button type="button" class="chip chip-inactive text-xs" (click)="toggleSize(s)">{{ s }}</button>
          }
        </div>
      </div>

      <div class="section-card space-y-3">
        <h3 class="font-semibold text-burgundy-800 border-b pb-2">Product Labels</h3>
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" [(ngModel)]="active" name="active" /> Active</label>
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" [(ngModel)]="expressShipping" name="express" /> Express Shipping</label>
        <div class="flex flex-wrap gap-2">
          @for (l of labelOptions; track l) {
            <button
              type="button"
              class="chip text-xs"
              [class.bg-green-100]="labels.includes(l)"
              [class.border-green-400]="labels.includes(l)"
              (click)="toggleLabel(l)"
            >{{ l }}</button>
          }
        </div>
        <div class="flex gap-2">
          <input class="input-field flex-1" placeholder="Custom label" [(ngModel)]="customLabel" name="customLabel" />
          <button type="button" class="bg-burgundy-400 text-white px-4 rounded-xl" (click)="addCustomLabel()">Add</button>
        </div>
      </div>

      <div class="section-card">
        <h3 class="font-semibold text-burgundy-800 border-b pb-2 mb-3">Product Preview</h3>
        <div class="flex gap-4">
          <div class="relative w-32 h-40 rounded-xl overflow-hidden shrink-0 bg-gray-100">
            <img [src]="previewImage" alt="Preview" class="w-full h-full object-cover" />
            @if (labels[0]) {
              <span class="absolute top-1 left-1 bg-blue-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">{{ labels[0] }}</span>
            }
          </div>
          <div>
            <h4 class="font-bold text-sm">{{ name || 'Product Name' }}</h4>
            <p class="text-lg font-bold mt-1">₹{{ price || 0 }}</p>
            <span class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full mt-2 inline-block">In Stock</span>
            <p class="text-xs text-gray-500 mt-2">Sizes: {{ selectedSizes.join(', ') || '—' }}</p>
          </div>
        </div>
      </div>

      <button type="submit" class="btn-primary w-full text-lg py-4">
        {{ isEdit ? 'Update Product' : 'Create Product' }}
      </button>
    </form>
  `,
})
export class ProductFormComponent implements OnInit {
  name = 'High-Waist Denim Slit Skirt';
  description = '';
  price = 499;
  compareAtPrice?: number = 799;
  active = true;
  expressShipping = false;
  selectedSizes: string[] = ['S', 'M', 'L', 'XL'];
  labels: string[] = ['NEW ARRIVAL'];
  newSize = '';
  customLabel = '';
  isEdit = false;
  readonly toast = signal('');
  readonly sizeOptions = SIZE_OPTIONS;
  readonly labelOptions = LABEL_OPTIONS;
  previewImage = 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400';
  cloudinaryPublicId = '';
  readonly uploading = signal(false);

  private readonly uploadService = inject(UploadService);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.toast.set('');
    this.uploadService.uploadProductImage(file).subscribe({
      next: (res) => {
        this.previewImage = res.url;
        this.cloudinaryPublicId = res.publicId;
        this.uploading.set(false);
      },
      error: (err) => {
        this.toast.set(
          typeof err?.error === 'string'
            ? err.error
            : err?.error?.message ?? 'Upload failed. Set Cloudinary env vars on the API.'
        );
        this.uploading.set(false);
      },
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.productService.getById(id).subscribe((p) => this.patch(p));
    }
  }

  patch(p: Product): void {
    this.name = p.name;
    this.description = p.description ?? '';
    this.price = p.price;
    this.compareAtPrice = p.compareAtPrice;
    this.selectedSizes = [...p.sizes];
    this.labels = [...p.labels];
    this.previewImage = p.images[0]?.url ?? this.previewImage;
  }

  toggleSize(s: string): void {
    if (this.selectedSizes.includes(s)) this.removeSize(s);
    else this.selectedSizes.push(s);
  }

  addSize(): void {
    if (this.newSize && !this.selectedSizes.includes(this.newSize)) {
      this.selectedSizes.push(this.newSize.toUpperCase());
      this.newSize = '';
    }
  }

  removeSize(s: string): void {
    this.selectedSizes = this.selectedSizes.filter((x) => x !== s);
  }

  toggleLabel(l: string): void {
    if (this.labels.includes(l)) this.labels = this.labels.filter((x) => x !== l);
    else this.labels = [...this.labels, l];
  }

  addCustomLabel(): void {
    if (this.customLabel && !this.labels.includes(this.customLabel)) {
      this.labels.push(this.customLabel.toUpperCase());
      this.customLabel = '';
    }
  }

  onSubmit(): void {
    const payload: Record<string, unknown> = {
      name: this.name,
      description: this.description,
      fabric: '',
      colorInfo: '',
      price: this.price,
      compareAtPrice: this.compareAtPrice,
      sizes: this.selectedSizes,
      labels: this.labels,
      active: this.active,
      expressShipping: this.expressShipping,
      slug: this.name.toLowerCase().replace(/\s+/g, '-'),
      images: [
        {
          url: this.previewImage,
          publicId: this.cloudinaryPublicId || null,
          sortOrder: 0,
          isPrimary: true,
        },
      ],
    };

    const id = this.route.snapshot.paramMap.get('id');
    const req = id
      ? this.productService.update(id, payload)
      : this.productService.create(payload);

    req.subscribe({
      next: () => this.router.navigate(['/admin/products']),
      error: () => this.toast.set('Product creation failed. Please try again.'),
    });
  }
}
