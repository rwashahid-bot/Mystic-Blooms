import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingBag, FiUser, FiMenu, FiX } from 'react-icons/fi';
import Logo from '../Logo/Logo';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import './Navbar.css';

const Navbar = () => {
  const { count } = useCart();
  const { user, isAdmin } = useAuth();
  const { categories } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const onSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    setQuery('');
  };

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <button className="navbar__toggle" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={menuOpen}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <Logo />

        <nav className={`navbar__links ${menuOpen ? 'is-open' : ''}`} aria-label="Main">
          <NavLink to="/" end>Home</NavLink>
          <div className="navbar__dropdown">
            <NavLink to="/shop">Shop</NavLink>
            <div className="navbar__dropdown-menu">
              <Link to="/shop">All Products</Link>
              {categories.map((c) => (
                <Link key={c._id} to={`/category/${c.slug}`}>{c.name}</Link>
              ))}
            </div>
          </div>
          <NavLink to="/custom-order">Custom Order</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <NavLink to="/track-order" className="navbar__mobile-only">Track Order</NavLink>
        </nav>

        <div className="navbar__actions">
          <button className="navbar__icon" onClick={() => setSearchOpen((o) => !o)} aria-label="Search">
            <FiSearch />
          </button>
          <Link to={user ? (isAdmin ? '/admin' : '/account') : '/login'} className="navbar__icon" aria-label="Account">
            <FiUser />
          </Link>
          <Link to="/cart" className="navbar__icon navbar__cart" aria-label={`Cart, ${count} items`}>
            <FiShoppingBag />
            {count > 0 && <span className="navbar__badge">{count}</span>}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <form className="navbar__search container" onSubmit={onSearch} role="search">
          <label htmlFor="site-search" className="sr-only">Search products</label>
          <input
            id="site-search"
            className="input"
            autoFocus
            placeholder="Search bouquets, roses, baskets..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">Search</button>
        </form>
      )}
    </header>
  );
};

export default Navbar;
