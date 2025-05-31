import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-primary mb-4">RMRP SHOP</h3>
            <p className="text-gray-600 mb-4">
              Надежная торговая площадка для игровых товаров. Покупайте и продавайте автомобили, недвижимость, рыбу и клады безопасно.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <i className="fab fa-telegram text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <i className="fab fa-discord text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <i className="fab fa-vk text-xl"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Категории</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/category/cars"><a className="text-gray-600 hover:text-primary transition-colors">Автомобили</a></Link></li>
              <li><Link href="/category/realestate"><a className="text-gray-600 hover:text-primary transition-colors">Недвижимость</a></Link></li>
              <li><Link href="/category/fish"><a className="text-gray-600 hover:text-primary transition-colors">Рыба</a></Link></li>
              <li><Link href="/category/treasures"><a className="text-gray-600 hover:text-primary transition-colors">Клады</a></Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Поддержка</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Помощь</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Правила</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Безопасность</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Контакты</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-600 text-sm">
            © 2024 RMRP SHOP. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
