import { Component, signal, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { UploadService } from '../../../core/services/upload.service';
import { Product } from '../../../core/models/product.model';

const LABEL_OPTIONS = ['BESTSELLER', 'NEW ARRIVAL', 'TRENDING', 'FLASH SALE'];
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

interface GalleryImage {
  url: string;
  publicId: string;
  isPrimary: boolean;
  sortOrder: number;
}

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
        <h3 class="font-semibold text-burgundy-800 border-b pb-2">Product gallery</h3>
        <div class="flex flex-wrap gap-3">
          @for (img of galleryImages; track $index) {
            <div class="relative w-24 h-32 rounded-xl overflow-hidden border-2" [class.border-gold]="img.isPrimary" [class.border-gray-200]="!img.isPrimary">
              <img [src]="img.url" alt="" class="w-full h-full object-cover" />
              @if (img.isPrimary) {
                <span class="absolute top-0 left-0 bg-gold text-burgundy-900 text-[8px] font-bold px-1">PRIMARY</span>
              }
              <div class="absolute bottom-0 inset-x-0 flex bg-black/50">
                <button type="button" class="flex-1 text-white text-[10px] py-1" (click)="setPrimary($index)">★</button>
                <button type="button" class="flex-1 text-white text-[10px] py-1" (click)="removeImage($index)">×</button>
              </div>
            </div>
          }
        </div>
        <input type="file" accept="image/*" class="text-sm w-full" (change)="onFileSelected($event)" [disabled]="uploading()" />
        @if (uploading()) {
          <p class="text-xs text-burgundy-600">Uploading to Cloudinary...</p>
        }
        <div class="flex gap-2">
          <input class="input-field text-sm flex-1" placeholder="Paste image URL" [(ngModel)]="newImageUrl" name="newUrl" />
          <button type="button" class="btn-secondary text-sm shrink-0" (click)="addImageUrl()">Add URL</button>
        </div>
      </div>

      <div class="section-card space-y-3">
        <h3 class="font-semibold text-burgundy-800 border-b pb-2">Basic Info</h3>
        <input class="input-field" placeholder="Product name" [(ngModel)]="name" name="name" required />
        <textarea class="input-field" rows="3" placeholder="Description" [(ngModel)]="description" name="desc"></textarea>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-gray-500">Selling price ₹</label>
            <input class="input-field" type="number" [(ngModel)]="price" name="price" required />
          </div>
          <div>
            <label class="text-xs text-gray-500">Original price ₹ (sale / strikethrough)</label>
            <input class="input-field" type="number" [(ngModel)]="compareAtPrice" name="compare" placeholder="Optional" />
          </div>
        </div>
        @if (compareAtPrice && compareAtPrice > price) {
          <p class="text-xs text-green-700">
            Sale: {{ salePercent() }}% off — customers see ₹{{ compareAtPrice }} crossed out
          </p>
        }
      </div>

      <div class="section-card space-y-3">
        <h3 class="font-semibold text-burgundy-800 border-b pb-2">Sizes &amp; stock</h3>
        <label class="text-xs text-gray-600">Default stock per size (for checkout)</label>
        <input class="input-field w-32" type="number" min="0" [(ngModel)]="defaultStockPerSize" name="stock" />
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

      <div class="section-card space-y-3">
        <h3 class="font-semibold text-burgundy-800 border-b pb-2">SEO (Google)</h3>
        <input class="input-field" placeholder="Meta title (optional)" [(ngModel)]="metaTitle" name="mtitle" />
        <textarea class="input-field" rows="2" placeholder="Meta description (optional, ~160 chars)" [(ngModel)]="metaDescription" name="mdesc"></textarea>
      </div>

      <div class="section-card">
        <h3 class="font-semibold text-burgundy-800 border-b pb-2 mb-3">Product Preview</h3>
        <div class="flex gap-4">
          <div class="relative w-32 h-40 rounded-xl overflow-hidden shrink-0 bg-gray-100">
            <img [src]="primaryPreviewUrl()" alt="Preview" class="w-full h-full object-cover" />
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
  name = '';
  description = '';
  metaTitle = '';
  metaDescription = '';
  price = 999;
  compareAtPrice?: number;
  defaultStockPerSize = 10;
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
  galleryImages: GalleryImage[] = [
    {
      url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400',
      publicId: '',
      isPrimary: true,
      sortOrder: 0,
    },
  ];
  newImageUrl = '';
  readonly uploading = signal(false);

  private readonly uploadService = inject(UploadService);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  primaryPreviewUrl(): string {
    return this.galleryImages.find((i) => i.isPrimary)?.url ?? this.galleryImages[0]?.url ?? '';
  }

  setPrimary(index: number): void {
    this.galleryImages = this.galleryImages.map((img, i) => ({ ...img, isPrimary: i === index }));
  }

  removeImage(index: number): void {
    if (this.galleryImages.length <= 1) {
      this.toast.set('At least one image is required.');
      return;
    }
    const wasPrimary = this.galleryImages[index].isPrimary;
    this.galleryImages = this.galleryImages.filter((_, i) => i !== index);
    if (wasPrimary) this.galleryImages[0].isPrimary = true;
    this.reindexGallery();
  }

  addImageUrl(): void {
    const url = this.newImageUrl.trim();
    if (!url) return;
    this.galleryImages = [
      ...this.galleryImages,
      { url, publicId: '', isPrimary: this.galleryImages.length === 0, sortOrder: this.galleryImages.length },
    ];
    this.newImageUrl = '';
    this.reindexGallery();
  }

  reindexGallery(): void {
    this.galleryImages = this.galleryImages.map((img, i) => ({ ...img, sortOrder: i }));
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.toast.set('');
    this.uploadService.uploadProductImage(file).subscribe({
      next: (res) => {
        const isFirst = this.galleryImages.length === 0;
        this.galleryImages = [
          ...this.galleryImages,
          {
            url: res.url,
            publicId: res.publicId,
            isPrimary: isFirst,
            sortOrder: this.galleryImages.length,
          },
        ];
        this.reindexGallery();
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
    this.metaTitle = p.metaTitle ?? '';
    this.metaDescription = p.metaDescription ?? '';
    this.price = p.price;
    this.compareAtPrice = p.compareAtPrice;
    this.selectedSizes = p.sizes?.length ? [...p.sizes] : [...new Set((p.variants ?? []).map((v) => v.size))];
    this.labels = [...(p.labels ?? [])];
    if (p.images?.length) {
      this.galleryImages = p.images.map((img, i) => ({
        url: img.url,
        publicId: '',
        isPrimary: img.isPrimary ?? i === 0,
        sortOrder: img.sortOrder ?? i,
      }));
    }
    const stocks = (p.variants ?? []).map((v) => v.stockQuantity);
    if (stocks.length) {
      this.defaultStockPerSize = Math.round(stocks.reduce((a, b) => a + b, 0) / stocks.length);
    }
  }

  salePercent(): number {
    if (!this.compareAtPrice || this.compareAtPrice <= this.price) return 0;
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
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
    if (!this.name.trim() || this.selectedSizes.length === 0) {
      this.toast.set('Name and at least one size are required.');
      return;
    }
    const variants = this.selectedSizes.map((size) => ({
      colorName: 'Default',
      colorHex: '#8B2942',
      size,
      stockQuantity: this.defaultStockPerSize,
    }));
    const payload: Record<string, unknown> = {
      name: this.name.trim(),
      description: this.description,
      fabric: '',
      colorInfo: '',
      price: this.price,
      compareAtPrice: this.compareAtPrice && this.compareAtPrice > this.price ? this.compareAtPrice : null,
      sizes: this.selectedSizes,
      labels: this.labels,
      active: this.active,
      expressShipping: this.expressShipping,
      slug: this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      defaultStockPerSize: this.defaultStockPerSize,
      metaTitle: this.metaTitle || null,
      metaDescription: this.metaDescription || null,
      variants,
      images: this.galleryImages.map((img) => ({
        url: img.url,
        publicId: img.publicId || null,
        sortOrder: img.sortOrder,
        isPrimary: img.isPrimary,
      })),
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
