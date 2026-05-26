import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex justify-between items-center mb-6">
      <p class="text-sm text-gray-600">Shop navigation categories</p>
      <button type="button" class="btn-gold text-sm" (click)="openCreate()">+ New category</button>
    </div>

    @if (showForm()) {
      <form class="section-card mb-6 space-y-3" (ngSubmit)="save()">
        <h3 class="font-semibold text-burgundy-800">{{ editingId() ? 'Edit' : 'Create' }} category</h3>
        <input class="input-field" placeholder="Name" [(ngModel)]="form.name" name="name" required />
        <input class="input-field" placeholder="Slug e.g. dresses" [(ngModel)]="form.slug" name="slug" required />
        <input class="input-field" placeholder="Image URL (optional)" [(ngModel)]="form.imageUrl" name="img" />
        <textarea class="input-field" rows="2" placeholder="Description" [(ngModel)]="form.description" name="desc"></textarea>
        <input class="input-field" type="number" placeholder="Sort order" [(ngModel)]="form.sortOrder" name="sort" />
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" [(ngModel)]="form.active" name="active" /> Active</label>
        <div class="flex gap-2">
          <button type="submit" class="btn-primary flex-1">Save</button>
          <button type="button" class="border px-4 rounded-xl" (click)="cancelForm()">Cancel</button>
        </div>
      </form>
    }

    <div class="space-y-3">
      @for (c of categories(); track c.id) {
        <article class="section-card flex flex-wrap justify-between gap-3 items-center">
          <div>
            <p class="font-semibold text-burgundy-900">{{ c.name }} <span class="text-xs text-gray-500">/{{ c.slug }}</span></p>
            <p class="text-xs text-gray-500">Order {{ c.sortOrder ?? 0 }} · {{ c.active !== false ? 'Active' : 'Hidden' }}</p>
          </div>
          <div class="flex gap-2">
            <button type="button" class="text-xs text-burgundy-700 underline" (click)="edit(c)">Edit</button>
            <button type="button" class="text-xs text-red-700 underline" (click)="remove(c.id)">Delete</button>
          </div>
        </article>
      }
    </div>
  `,
})
export class CategoriesComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);

  readonly categories = signal<Category[]>([]);
  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);

  form = {
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    sortOrder: 0,
    active: true,
  };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.categoryService.listAdmin().subscribe((list) => this.categories.set(list));
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form = { name: '', slug: '', description: '', imageUrl: '', sortOrder: 0, active: true };
    this.showForm.set(true);
  }

  edit(c: Category): void {
    this.editingId.set(c.id);
    this.form = {
      name: c.name,
      slug: c.slug,
      description: c.description ?? '',
      imageUrl: c.imageUrl ?? '',
      sortOrder: c.sortOrder ?? 0,
      active: c.active !== false,
    };
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  save(): void {
    const id = this.editingId();
    const body = { ...this.form };
    const req = id ? this.categoryService.update(id, body) : this.categoryService.create(body);
    req.subscribe({
      next: () => {
        this.cancelForm();
        this.load();
      },
    });
  }

  remove(id: string): void {
    if (!confirm('Delete this category?')) return;
    this.categoryService.delete(id).subscribe(() => this.load());
  }
}
