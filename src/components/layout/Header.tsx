import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, ChevronDown, Phone, Facebook, Instagram, Youtube, X as XClose, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/useAuth';
import { CATEGORIES } from '@/data/categories';
import { useSearch } from '@/hooks/useSearch';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import MiniCart from './MiniCart';
import logo from '@/assets/logo.png';

// X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// Threads icon component
const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.17.408-2.131 1.37-2.779.813-.546 1.95-.9 3.282-.958.955-.041 1.801.005 2.564.14a7.49 7.49 0 0 0-.09-1.073c-.181-1.058-.607-1.812-1.266-2.243-.724-.474-1.726-.706-2.977-.689-1.128.015-2.058.306-2.762.865-.602.478-.976 1.124-1.111 1.92l-2.018-.354c.216-1.252.857-2.289 1.906-3.085 1.074-.816 2.443-1.238 4.07-1.257h.082c1.726 0 3.18.424 4.323 1.26 1.318.963 2.103 2.398 2.333 4.267.087.707.115 1.478.082 2.295 1.117.705 1.989 1.632 2.523 2.852.812 1.857.737 4.502-1.392 6.59-1.846 1.81-4.182 2.593-7.367 2.615Zm-.123-7.114c-.901.049-1.605.265-2.095.643-.346.266-.462.544-.449.784.017.304.177.67.594.94.481.311 1.151.478 1.886.44 1.167-.063 2.003-.474 2.558-1.259.41-.579.67-1.377.762-2.352a9.788 9.788 0 0 0-3.256.804Z"/>
  </svg>
);

// WhatsApp icon component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { getCartCount, setIsCartOpen } = useCart();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: searchResults, isLoading: isSearching } = useSearch(searchQuery);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close search on route change
  useEffect(() => {
    setShowSearchResults(false);
    setSearchQuery('');
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Our Story', path: '/our-story' },
    { name: 'Shop', path: '/shop' },
    { name: 'Blogs', path: '/blogs' },
    { name: 'Contact', path: '/contact' },
  ];

  const socialLinks = [
    { name: 'YouTube', icon: Youtube, url: 'https://youtube.com/@bongohridoy' },
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com/bongohridoy' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/bongohridoy' },
    { name: 'X', icon: XIcon, url: 'https://x.com/bongohridoy' },
    { name: 'Threads', icon: ThreadsIcon, url: 'https://threads.net/@bongohridoy' },
  ];

  const cartCount = getCartCount();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchResults(false);
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-tertiary text-tertiary-foreground py-2 text-sm hidden md:block">
        <div className="section-container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" aria-label={social.name}>
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <span className="w-px h-4 bg-tertiary-foreground/30" />
            <a href="tel:+913368263382" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
              <Phone className="w-3.5 h-3.5" />
              +91 33-68263382
            </a>
            <span className="w-px h-4 bg-tertiary-foreground/30" />
            <a href="https://wa.me/919330396636" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
              <WhatsAppIcon className="w-3.5 h-3.5" />
              +91 9330396636
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span>Ordering from abroad?</span>
            <a href="https://wa.me/919330396636" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
              Connect on WhatsApp →
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`sticky top-0 z-50 bg-background transition-all duration-300 ${isScrolled ? 'shadow-md' : 'border-b border-border'}`}>
        <div className="section-container">
          <div className="flex items-center justify-between h-16 md:h-20 gap-4">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="touch-target">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0">
                <div className="p-6 border-b border-border">
                  <Link to="/"><img src={logo} alt="Bongo Hridoy" className="h-10 w-auto" /></Link>
                </div>
                <nav className="p-4">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.path}>
                      <Link to={link.path} className={`block py-3 px-4 rounded-lg text-lg transition-colors ${location.pathname === link.path ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary'}`}>
                        {link.name}
                      </Link>
                    </SheetClose>
                  ))}
                  <div className="border-t border-border mt-4 pt-4">
                    <p className="px-4 py-2 text-sm font-semibold text-muted-foreground">Categories</p>
                    {CATEGORIES.slice(0, 8).map((cat) => (
                      <SheetClose asChild key={cat.slug}>
                        <Link to={`/category/${cat.slug}`} className="block py-2 px-4 text-sm hover:bg-secondary rounded-lg transition-colors">
                          {cat.name}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                  <div className="border-t border-border mt-4 pt-4">
                    <p className="px-4 py-2 text-sm font-semibold text-muted-foreground">Follow Us</p>
                    <div className="flex items-center gap-3 px-4 py-2">
                      {socialLinks.map((social) => (
                        <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors" aria-label={social.name}>
                          <social.icon className="w-5 h-5" />
                        </a>
                      ))}
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img src={logo} alt="Bongo Hridoy - From the Heart of Bengal" className="h-12 md:h-16 w-auto" />
            </Link>

            {/* Search Bar - Desktop with autocomplete */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8" ref={searchRef}>
              <div className="relative w-full">
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    placeholder="Search for products..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchResults(true);
                    }}
                    onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                    className="w-full pl-5 pr-12 py-3 rounded-xl border border-border bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-base"
                  />
                  <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </button>
                </form>

                {/* Search Autocomplete Dropdown */}
                {showSearchResults && searchQuery.length >= 2 && (
                  <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                      </div>
                    ) : searchResults ? (
                      <>
                        {searchResults.products?.length > 0 && (
                          <div className="p-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Products</p>
                            {searchResults.products.slice(0, 5).map((product) => (
                              <Link
                                key={product.id}
                                to={`/product/${product.slug}`}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors"
                                onClick={() => setShowSearchResults(false)}
                              >
                                {product.images?.[0] && (
                                  <img src={product.images[0].url} alt="" className="w-10 h-10 rounded object-cover" loading="lazy" />
                                )}
                                <div>
                                  <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                                  <p className="text-xs text-muted-foreground">₹{product.price}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                        {searchResults.categories?.length > 0 && (
                          <div className="p-3 border-t border-border">
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Categories</p>
                            {searchResults.categories.map((cat) => (
                              <Link
                                key={cat.id}
                                to={`/category/${cat.slug}`}
                                className="block p-2 text-sm rounded-lg hover:bg-secondary transition-colors"
                                onClick={() => setShowSearchResults(false)}
                              >
                                {cat.name}
                              </Link>
                            ))}
                          </div>
                        )}
                        {(!searchResults.products?.length && !searchResults.categories?.length) && (
                          <p className="p-4 text-sm text-muted-foreground text-center">No results found</p>
                        )}
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.slice(0, 3).map((link) => (
                <Link key={link.path} to={link.path} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.path ? 'text-primary' : 'text-foreground/80 hover:text-foreground hover:bg-secondary/50'}`}>
                  {link.name}
                </Link>
              ))}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-secondary/50 transition-colors">
                    Categories
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56">
                  {CATEGORIES.map((cat) => (
                    <DropdownMenuItem key={cat.slug} asChild>
                      <Link to={`/category/${cat.slug}`} className="cursor-pointer">{cat.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {navLinks.slice(3).map((link) => (
                <Link key={link.path} to={link.path} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.path ? 'text-primary' : 'text-foreground/80 hover:text-foreground hover:bg-secondary/50'}`}>
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="md:hidden touch-target">
                <Search className="h-5 w-5" />
              </Button>
              <Link to={isAuthenticated ? '/account' : '/login'}>
                <Button variant="ghost" size="icon" className="touch-target">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="touch-target relative" onClick={() => setIsCartOpen(true)}>
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <MiniCart />
    </>
  );
}
