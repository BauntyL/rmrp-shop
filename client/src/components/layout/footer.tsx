import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1">
            <h3 className="text-xl font-bold text-primary mb-4">RMRP SHOP</h3>
            <p className="text-gray-600 mb-4">
              Надежная торговая площадка для игровых товаров. Покупайте и продавайте автомобили, недвижимость, рыбу и клады безопасно.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Категории</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/category/cars" className="text-gray-600 hover:text-primary transition-colors">Автомобили</Link></li>
              <li><Link href="/category/realestate" className="text-gray-600 hover:text-primary transition-colors">Недвижимость</Link></li>
              <li><Link href="/category/fish" className="text-gray-600 hover:text-primary transition-colors">Рыба</Link></li>
              <li><Link href="/category/treasures" className="text-gray-600 hover:text-primary transition-colors">Клады</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <a 
              href="https://t.me/bauntyprog" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <i className="fab fa-telegram text-xl mr-2 group-hover:animate-pulse"></i>
              <span>Telegram</span>
            </a>
            
            <a 
              href="https://donatty.com/bauntyl" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <i className="fas fa-heart text-xl mr-2 group-hover:animate-bounce"></i>
              <span>Поддержать</span>
            </a>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-600 text-sm">
            © 2025 RMRP SHOP.
          </p>
        </div>
      </div>
    </footer>
  );
}
