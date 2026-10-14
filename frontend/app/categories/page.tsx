import { CategoryForm } from '@/components/categories/category-form';
import { CategoryList } from '@/components/categories/category-list';

export const metadata = { title: 'Catégories · Finance Tracker' };

export default function CategoriesPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-semibold">Catégories</h1>
            <CategoryForm />
            <CategoryList />
        </div>
    );
}