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
    return gradients[color] || "from-slate-500 to-slate-600";
  };

  const getCategoryPath = (name: string) => {
    return `/category/${name}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {categories.map((category) => (
        <Link key={category.id} href={getCategoryPath(category.name)}>
          <Card className="group cursor-pointer transform hover:scale-105 transition-all duration-300 h-48 shadow-lg hover:shadow-xl">
            <CardContent className={`bg-gradient-to-br ${getCategoryGradient(category.color)} p-6 text-white h-full flex flex-col justify-between`}>
              <div className="flex items-center justify-between mb-4">
                <i className={`${category.icon} text-3xl`}></i>
                <span className="text-sm bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                  {category.productCount || 0} объявлений
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">{category.displayName}</h3>
                <p className="text-sm text-white/90 leading-relaxed">
                  {category.name === "cars" && "Стандарт, Спорт, Внедорожники, Купе"}
                  {category.name === "realestate" && "Дома, квартиры, коммерческая"}
                  {category.name === "fish" && "Плотва, Ерш, Форель, Сом, Щука"}
                  {category.name === "treasures" && "Редкие предметы и артефакты"}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
