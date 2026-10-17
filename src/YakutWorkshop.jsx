import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Heart, ShoppingBag, UserRound, Search, Package, Newspaper, Tag, Settings, MessageSquare, Plus, Minus, Trash2, X, Home, Sparkles, BookOpen, Hammer, Star } from "lucide-react";
import "./yakut-workshop.css";

const NAV = [
  ["Каталог", "/catalog", BookOpen],
  ["Акции", "/promos", Tag],
  ["Новости", "/news", Newspaper],
  ["Избранное", "/favorites", Heart],
  ["Корзина", "/cart", ShoppingBag],
  ["Профиль", "/account", UserRound],
  ["Отзывы", "/reviews", MessageSquare],
  ["Мастерская", "/custom", Hammer],
];
const money = n => (Number(n) || 0).toLocaleString("ru-RU") + " ₽";
const pname = p => p?.name || p?.title || "Изделие мастерской";
const pimage = p => p?.images?.[0] || p?.image || p?.image_url || p?.photo || "";
const pprice = p => Number(p?.price ?? p?.salePrice ?? 0);

export default function YakutWorkshop({ pathname, search, navigate, data }) {
  const [query, setQuery] = useState("");
  const [transitioning, setTransitioning] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState("");
  const { products = [], categories = [], cart = [], favorites = [], promos = [], news = [], currentUser, isAdmin, addToCart, updateCartQty, removeFromCart, toggleFavorite, showToast } = data;
  const path = pathname || "/";
  const go = (to) => {
    setTransitioning(true);
    window.setTimeout(() => {
      navigate(to);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTransitioning(false);
      setActiveHotspot("");
    }, 280);
  };
  useEffect(() => {
    const t = window.setTimeout(() => setTransitioning(false), 400);
    return () => window.clearTimeout(t);
  }, [path]);
  const productMatch = path.match(/^\/product\/([^/]+)/);
  const product = productMatch ? products.find(p => String(p.id) === decodeURIComponent(productMatch[1])) : null;
  const categoryMatch = path.match(/^\/category\/([^/]+)/);
  const categoryId = categoryMatch ? decodeURIComponent(categoryMatch[1]) : "";
  const category = categories.find(c => String(c.id ?? c.slug) === categoryId);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(p => !q || pname(p).toLowerCase().includes(q) || String(p.description || "").toLowerCase().includes(q));
  }, [products, query]);
  const favoriteProducts = products.filter(p => favorites.some(f => String(typeof f === "object" ? (f.product_id ?? f.product?.id ?? f.id) : f) === String(p.id)));
  const currentList = path === "/favorites" ? favoriteProducts : categoryMatch ? filtered.filter(p => String(p.category_id ?? p.categoryId ?? p.category ?? "") === categoryId || (category && String(p.category_name || p.categoryName || "") === (category.name || category.title))) : filtered;
  const cartTotal = cart.reduce((sum, item) => {
    const p = item.product || products.find(x => String(x.id) === String(item.productId ?? item.product_id ?? item.id)) || item;
    return sum + pprice(p) * Number(item.qty ?? item.quantity ?? 1);
  }, 0);
  const isHome = path === "/";
  const isProduct = !!productMatch;
  const isCart = path === "/cart";
  const isFavorites = path === "/favorites";
  const isCatalog = path === "/catalog" || !!categoryMatch;
  const isProfile = path.startsWith("/account") || path === "/auth";
  const isAdminPage = path === "/admin";
  const isCheckout = path === "/checkout";
  const isNews = path === "/news";
  const isPromos = path === "/promos";
  const isReviews = path === "/reviews";
  const isCustom = path === "/custom";
  const scene = isHome ? "home" : isCatalog ? "catalog" : isProduct ? "product" : isCart ? "cart" : isFavorites ? "favorites" : isProfile ? "profile" : isAdminPage ? "admin" : isCheckout ? "checkout" : isNews ? "news" : isPromos ? "promos" : isReviews ? "reviews" : isCustom ? "custom" : "profile";
  const title = isHome ? "Тепло рук. Характер Севера." : isCatalog ? (category?.name || category?.title || "Выставочная комната") : isProduct ? pname(product) : isCart ? "Ящик мастера" : isFavorites ? "Шкатулка избранного" : isProfile ? "Личный уголок" : isAdminPage ? "Рабочее место мастера" : isCheckout ? "Упаковочный стол" : isNews ? "Доска мастерской" : isPromos ? "Особые предложения" : isReviews ? "Книга отзывов" : "Мастерская на заказ";
  const subtitle = isHome ? "Небольшая мастерская 3D-печати на Севере" : isCatalog ? "Выберите полку или изделие, чтобы рассмотреть поближе." : isProduct ? "Рассмотрите изделие, выберите вариант и добавьте в корзину." : isCart ? "Ваши выбранные изделия ждут отправки." : "Каждый предмет в этой комнате открывает нужный раздел.";
  const goCheckout = () => go("/checkout");
  const showProducts = (items, compact = false) => <div className={"yw-product-objects " + (compact ? "is-compact" : "")}>{items.map((p, i) => <button key={p.id} className="yw-product-object" style={{"--object-index": i}} onClick={() => go("/product/" + p.id)} aria-label={pname(p)}><span className="yw-object-image">{pimage(p) ? <img src={pimage(p)} alt={pname(p)} loading="lazy"/> : <span className="yw-object-placeholder">✦</span>}</span><span className="yw-object-caption"><b>{pname(p)}</b><small>{money(pprice(p))}</small></span></button>)}</div>;

  return <div className={"yakut-workshop scene-" + scene + (transitioning ? " is-transitioning" : "")}>
    <div className="yw-room" aria-hidden="true"><div className="yw-window"><span/><i/></div><div className="yw-wall-shelf shelf-one"/><div className="yw-wall-shelf shelf-two"/><div className="yw-floor"/><div className="yw-lamp"/><div className="yw-dust"><i/><i/><i/><i/><i/><i/><i/><i/></div></div>
    <header className="yw-header"><button className="yw-brand" onClick={() => go("/")} aria-label="На главную"><span className="yw-brand-mark">3D</span><span><b>Уус</b><small>МАСТЕРСКАЯ НАРОДА САХА</small></span></button><div className="yw-breadcrumb"><span>МАСТЕРСКАЯ</span><i>·</i><b>{title}</b></div><nav className="yw-header-actions"><button onClick={() => go("/favorites")} aria-label="Избранное"><Heart/><em>{favorites.length}</em></button><button onClick={() => go("/cart")} aria-label="Корзина"><ShoppingBag/><em>{cart.length}</em></button><button onClick={() => go("/account")} aria-label="Профиль"><UserRound/></button></nav></header>
    <main className="yw-scene">
      <div className="yw-scene-copy"><span className="yw-kicker"><Sparkles size={14}/> 3D УУС · МАСТЕРСКАЯ</span><h1 key={title}>{title}</h1><p>{subtitle}</p>{isHome && <div className="yw-home-actions"><button className="yw-primary" onClick={() => go("/catalog")}>Исследовать мастерскую <ArrowRight size={17}/></button><button className="yw-quiet" onClick={() => go("/custom")}>Заказать своё изделие</button></div>}</div>
      {isHome && <><button className="yw-hotspot yw-hotspot-shelf" onClick={() => go("/catalog")} onMouseEnter={() => setActiveHotspot("Каталог")} onMouseLeave={() => setActiveHotspot("")}><span className="yw-prop-sign">Полка изделий</span><span className="yw-hotspot-hint">Каталог мастерской <ArrowRight size={14}/></span></button><button className="yw-hotspot yw-hotspot-table" onClick={() => go("/custom")} onMouseEnter={() => setActiveHotspot("Заказ мастеру")} onMouseLeave={() => setActiveHotspot("")}><span className="yw-prop-sign">Рабочий стол</span><span className="yw-hotspot-hint">Заказать своё изделие <ArrowRight size={14}/></span></button><button className="yw-hotspot yw-hotspot-box" onClick={() => go("/favorites")}><span className="yw-prop-sign">Шкатулка</span><span className="yw-hotspot-hint">Избранное <ArrowRight size={14}/></span></button><button className="yw-hotspot yw-hotspot-board" onClick={() => go("/news")}><span className="yw-prop-sign">Доска новостей</span><span className="yw-hotspot-hint">Новости мастерской <ArrowRight size={14}/></span></button><div className="yw-floating-products">{showProducts(products.slice(0, 3), true)}</div></>}
      {isCatalog && <section className="yw-interactive-zone"><div className="yw-section-tools"><label><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Найти изделие…"/>{query && <button onClick={() => setQuery("")} aria-label="Очистить"><X size={14}/></button>}</label><span>{currentList.length} изделий</span></div><div className="yw-category-shelves">{categories.map((c, i) => <button key={c.id ?? c.slug ?? i} className="yw-category-shelf" style={{"--shelf-index":i}} onClick={() => go("/category/" + (c.id ?? c.slug))}><span className="yw-category-glyph">{["◈","✧","❋","◇","⌂","✦"][i%6]}</span><b>{c.name || c.title || "Коллекция"}</b><small>Открыть полку <ArrowRight size={12}/></small></button>)}</div>{showProducts(currentList)}{!currentList.length && <p className="yw-empty">На этой полке пока нет изделий.</p>}</section>}
      {isProduct && product && <section className="yw-product-stage"><div className="yw-product-hero">{pimage(product) ? <img src={pimage(product)} alt={pname(product)}/> : <div className="yw-large-placeholder">✦<small>3D УУС</small></div>}<span className="yw-object-stamp">ИЗДЕЛИЕ МАСТЕРСКОЙ</span></div><div className="yw-product-notes"><span className="yw-kicker">КАРТОЧКА ИЗДЕЛИЯ</span><h2>{pname(product)}</h2><strong className="yw-price">{money(pprice(product))}</strong><p>{product.description || "Изделие, созданное в мастерской 3D Уус."}</p><p><b>Материал:</b> {product.material || "Пластик, 3D-печать"}</p>{Array.isArray(product.colors) && product.colors.length > 0 && <div className="yw-color-options"><span>Цвета</span>{product.colors.map((c,i)=><button key={i} onClick={e=>{document.querySelectorAll(".yw-color-options button").forEach(x=>x.classList.remove("selected"));e.currentTarget.classList.add("selected");}}>{c}</button>)}</div>}<div className="yw-product-actions"><button className="yw-primary" onClick={() => {addToCart?.(product.id, null, 1);showToast?.("Добавлено в корзину");}}>Добавить в корзину <ShoppingBag size={17}/></button><button className="yw-quiet" onClick={() => toggleFavorite?.(product.id)}><Heart size={17}/> В избранное</button></div></div></section>}
      {isProduct && !product && <div className="yw-empty">Изделие не найдено. <button className="yw-primary" onClick={() => go("/catalog")}>В каталог</button></div>}
      {isFavorites && <section className="yw-interactive-zone"><div className="yw-section-tools"><span>Избранные изделия</span><span>{favoriteProducts.length} сохранено</span></div>{showProducts(favoriteProducts)}{!favoriteProducts.length && <p className="yw-empty">Шкатулка пока пуста. Нажмите на сердечко у понравившегося изделия.</p>}</section>}
      {isCart && <section className="yw-cart-tray"><div className="yw-cart-items">{cart.map((item,i)=>{const p=item.product||products.find(x=>String(x.id)===String(item.productId??item.product_id??item.id))||item;const qty=Number(item.qty??item.quantity??1);return <article className="yw-cart-item" key={p.id||i}><button className="yw-cart-photo" onClick={() => go("/product/"+p.id)}>{pimage(p)?<img src={pimage(p)} alt={pname(p)}/>:<span>✦</span>}</button><div className="yw-cart-info"><b>{pname(p)}</b><small>{money(pprice(p))}</small><div className="yw-qty"><button onClick={() => updateCartQty?.(p.id,item.color,Math.max(1,qty-1))}><Minus size={13}/></button><span>{qty}</span><button onClick={() => updateCartQty?.(p.id,item.color,qty+1)}><Plus size={13}/></button><button onClick={() => removeFromCart?.(p.id,item.color)} aria-label="Удалить"><Trash2 size={13}/></button></div></div></article>})}</div><div className="yw-cart-total"><span>ИТОГО</span><strong>{money(cartTotal)}</strong><button className="yw-primary" onClick={goCheckout}>Оформить заказ <ArrowRight size={16}/></button></div>{!cart.length&&<p className="yw-empty">В ящике пока пусто. <button onClick={() => go("/catalog")}>Посмотреть изделия</button></p>}</section>}
      {isProfile && <section className="yw-desk-panel"><div className="yw-prop-card"><UserRound/><span>Владелец личного уголка</span><b>{currentUser?.name || currentUser?.email || "Гость"}</b><button onClick={() => go("/auth")}>{currentUser ? "Данные профиля" : "Войти в профиль"} <ArrowRight size={14}/></button></div><div className="yw-prop-card"><Package/><span>История заказов</span><b>Мои заказы</b><button onClick={() => go("/account?tab=orders")}>Открыть журнал <ArrowRight size={14}/></button></div><div className="yw-prop-card"><Settings/><span>Личный уголок</span><b>Настройки</b><button onClick={() => go("/account?tab=settings")}>Изменить <ArrowRight size={14}/></button></div></section>}
      {isCheckout && <section className="yw-desk-panel"><div className="yw-prop-card yw-wide-card"><Package/><span>Оформление заказа</span><b>Ваш заказ готов к оформлению</b><p>Заполните контактные данные в форме оформления.</p><button className="yw-primary" onClick={() => navigate("/checkout?native=1")}>Продолжить оформление <ArrowRight size={15}/></button></div></section>}
      {isAdminPage && <section className="yw-desk-panel">{(isAdmin ? [["Товары","/admin?tab=products"],["Заказы","/admin?tab=orders"],["Категории","/admin?tab=categories"],["Новости","/admin?tab=news"],["Акции","/admin?tab=promos"],["Отзывы","/admin?tab=reviews"]] : [["Войти","/auth?redirectTo=/admin"]]).map(([label,to],i)=><button className="yw-prop-card" key={label} onClick={() => go(to)}><Settings/><span>Инструменты мастерской</span><b>{label}</b><small>Открыть раздел <ArrowRight size={13}/></small></button>)}</section>}
      {isNews && <section className="yw-desk-panel">{news.map((n,i)=><article className="yw-prop-card yw-note-card" key={n.id||i}>{n.image && <img src={n.image} alt=""/>}<span>Запись мастерской</span><b>{n.title || "Новости"}</b><p>{n.text || n.content || ""}</p><small>{n.date ? new Date(n.date).toLocaleDateString("ru-RU") : ""}</small></article>)}</section>}
      {isPromos && <section className="yw-desk-panel">{promos.map((p,i)=><article className="yw-prop-card yw-note-card" key={p.id||i}>{p.image && <img src={p.image} alt=""/>}<span>Предложение мастерской</span><b>{p.title || p.name || "Акция"}</b><p>{p.description || p.text || ""}</p>{p.discount && <strong>−{p.discount}%</strong>}</article>)}</section>}
      {isReviews && <section className="yw-desk-panel"><div className="yw-prop-card yw-wide-card"><Star/><span>Книга отзывов</span><b>Мнения покупателей</b><p>Откройте раздел отзывов, чтобы прочитать отзывы и оставить свой.</p><button className="yw-primary" onClick={() => navigate("/reviews?native=1")}>Открыть отзывы <ArrowRight size={15}/></button></div></section>}
      {isCustom && <section className="yw-desk-panel"><div className="yw-prop-card yw-wide-card"><Hammer/><span>Индивидуальный заказ</span><b>Придумаем изделие вместе</b><p>Расскажите, что хотите напечатать, и мастер обсудит детали с вами.</p><button className="yw-primary" onClick={() => navigate("/custom?native=1")}>Открыть форму заказа <ArrowRight size={15}/></button></div></section>}
      {!isHome && !isCatalog && !isProduct && !isCart && !isFavorites && !isProfile && !isAdminPage && !isCheckout && !isNews && !isPromos && !isReviews && !isCustom && <section className="yw-desk-panel">{NAV.map(([label,to,Icon])=><button className="yw-prop-card" key={to} onClick={() => go(to)}><Icon/><b>{label}</b><small>Открыть раздел <ArrowRight size={13}/></small></button>)}</section>}
      {isHome && <section className="yw-home-shelf"><div className="yw-section-title"><span>НА ПОЛКАХ МАСТЕРСКОЙ</span><h2>Изделия, которые можно рассмотреть</h2></div>{showProducts(products.slice(0,4))}</section>}
    </main>
    <footer className="yw-footer"><span>3D УУС · МАСТЕРСКАЯ НАРОДА САХА</span><span>Сделано с вниманием к деталям</span><button onClick={() => go("/")}>На главную <Home size={13}/></button></footer>
    <nav className="yw-mobile-nav" aria-label="Быстрая навигация">{NAV.slice(0,5).map(([label,to,Icon])=><button key={to} onClick={() => go(to)} aria-label={label}><Icon size={18}/><small>{label}</small></button>)}</nav>
    {transitioning && <div className="yw-transition-overlay" aria-hidden="true"><span className="yw-transition-mark">✦</span></div>}
  </div>;
}
