import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import type { CategoryWithProducts } from "@/lib/types";

interface CategoryGridProps {
  categories: CategoryWithProducts[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const getCategoryGradient = (color: string) => {
    const gradients: Record<string, string> = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600", 
      cyan: "from-cyan-500 to-cyan-600",
      purple: "from-purple-500 to-purple-600",
    };
    return gradients[color] || "from-gray-500 to-gray-600";
  };

  const getCategoryPath = (name: string) => {
    return `/category/${name}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {categories.map((category) => (
        <Link key={category.id} href={getCategoryPath(category.name)}>
          <Card className="group cursor-pointer transform hover:scale-105 transition-transform duration-200">
            <CardContent className={`bg-gradient-to-br ${getCategoryGradient(category.color)} p-6 text-white`}>
              <div className="flex items-center justify-between mb-4">
                <i className={`${category.icon} text-3xl`}></i>
                <span className="text-sm opacity-75">
                  {category.productCount || 0} объявлений
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{category.displayName}</h3>
              <p className="text-sm opacity-90">
                {category.name === "cars" && "Стандарт, Спорт, Внедорожники, Купе"}
                {category.name === "realestate" && "Дома, квартиры, коммерческая"}
                {category.name === "fish" && "Плотва, Ерш, Форель, Сом, Щука"}
                {category.name === "treasures" && "Редкие предметы и артефакты"}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
