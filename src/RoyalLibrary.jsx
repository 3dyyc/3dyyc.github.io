import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, ShoppingBag, Heart, UserRound, Sparkles, Newspaper, Tag, Package, ArrowLeft, ArrowRight, Plus, Minus, Trash2, Feather, Search, X, Home, ShieldCheck, ScrollText } from "lucide-react";

const NAV = [
  ["Каталог", "/catalog", BookOpen], ["Категории", "/catalog", ScrollText],
  ["Акции", "/promos", Tag], ["Новости", "/news", Newspaper],
  ["Избранное", "/favorites", Heart], ["Корзина", "/cart", ShoppingBag],
  ["Профиль", "/account", UserRound], ["Заказы", "/account?tab=orders", Package],
  ["Мастерская", "/custom", Feather], ["Администратор", "/admin", ShieldCheck],
];
const money = n => (Number(n) || 0).toLocaleString("ru-RU") + " ₽";
const productName = p => p?.name || p?.title || "Изделие мастерской";
const productImage = p => p?.image || p?.image_url || p?.images?.[0] || p?.photo || "";
const productPrice = p => p?.price ?? p?.salePrice ?? 0;
const categoryName = c => c?.name || c?.title || "Категория";

function Frame({ children, className="" }) { return <div className={"royal-frame "+className}>{children}</div>; }
function Plaque({ title, children, className="" }) { return <div className={"royal-plaque "+className}><div className="royal-plaque-title">{title}</div><div className="royal-plaque-copy">{children}</div></div>; }
function Book({ title, onClick, small=false }) { return <button type="button" className={"royal-book "+(small?"royal-book-small":"")} onClick={onClick} aria-label={title}><span className="royal-book-spine"/><span className="royal-book-seal">✦</span><span className="royal-book-title">{title}</span></button>; }
function ArtCard({ product, onClick, compact=false }) {
  return <button type="button" className={"royal-art-card "+(compact?"royal-art-card-compact":"")} onClick={onClick}>
    <span className="royal-art-frame"><span className="royal-art-mat">{productImage(product) ? <img src={productImage(product)} alt={productName(product)} loading="lazy"/> : <span className="royal-product-placeholder">✦<small>3D УУС</small></span>}</span></span>
    <span className="royal-art-caption"><strong>{productName(product)}</strong><span>{money(productPrice(product))}</span></span>
  </button>;
}
function RoyalBackdrop() { return <div className="royal-backdrop" aria-hidden="true"><div className="royal-wall-panels"/><div className="royal-floor"/></div>; }

export default function RoyalLibrary({ pathname, search, navigate, data }) {
  const [carousel, setCarousel] = useState(0);
  const [bookFlight, setBookFlight] = useState("");
  const [query, setQuery] = useState("");
  const [coinDust, setCoinDust] = useState(null);
  const { products=[], categories=[], cart=[], favorites=[], promos=[], news=[], currentUser, isAdmin, addToCart, updateCartQty, removeFromCart, toggleFavorite, showToast } = data;
  const path = pathname || "/";
  const go = (to) => {
    const label = NAV.find(n => n[1]===to)?.[0] || to;
    setBookFlight(label);
    window.setTimeout(() => { navigate(to); window.scrollTo({top:0,behavior:"smooth"}); setBookFlight(""); }, 520);
  };
  useEffect(() => {
    if (products.length < 2) return;
    const timer = window.setInterval(() => setCarousel(i => (i+1)%products.length), 4800);
    return () => window.clearInterval(timer);
  }, [products.length]);
  const filtered = useMemo(() => {
    const q=query.trim().toLowerCase();
    return products.filter(p => !q || productName(p).toLowerCase().includes(q) || String(p.description||"").toLowerCase().includes(q));
  }, [products,query]);
  const productMatch = path.match(/^\/product\/([^/]+)/);
  const product = productMatch ? products.find(p => String(p.id)===decodeURIComponent(productMatch[1])) : null;
  const isCategory = path.startsWith("/category/");
  const categoryId = isCategory ? decodeURIComponent(path.split("/").pop()) : "";
  const category = categories.find(c => String(c.id)===categoryId || String(c.slug)===categoryId);
  const categoryProducts = isCategory ? filtered.filter(p => String(p.category_id ?? p.categoryId ?? p.category ?? "")===categoryId || (category && String(p.category_name||p.categoryName||"")===categoryName(category))) : filtered;
  const cartItems = cart || [];
  const cartTotal = cartItems.reduce((sum,item)=>{const p=item.product||products.find(x=>String(x.id)===String(item.productId??item.product_id??item.id));return sum+(Number(item.price??productPrice(p))*Number(item.qty??item.quantity??1));},0);
  const removeCoin = (item,index) => {
    setCoinDust(index);
    window.setTimeout(()=>{removeFromCart?.(item.productId ?? item.product_id ?? item.product?.id ?? item.id, item.color);setCoinDust(null);},650);
  };
  const isProduct = !!productMatch;
  const isCart = path==="/cart";
  const isFavorites = path==="/favorites";
  const isCatalog = path==="/catalog" || isCategory;
  const isAccount = path.startsWith("/account") || path==="/auth";
  const isAdminPage = path==="/admin";
  const isPromos = path==="/promos";
  const isNews = path==="/news";
  const isCustom = path==="/custom";
  const isHome = path==="/";
  const favoriteProducts = products.filter(p=>favorites.some(f=>String(typeof f==="object"?(f.product_id??f.product?.id??f.id):f)===String(p.id)));
  const currentList = isFavorites ? favoriteProducts : isCategory ? categoryProducts : filtered;
  const title = isFavorites ? "Зал избранных сокровищ" : isCategory ? categoryName(category||{name:"Коллекция"}) : "Галерея мастерской";

  return <div className="royal-library">
    <RoyalBackdrop/>
    <header className="royal-header"><button className="royal-brand" onClick={()=>go("/")}><span className="royal-brand-mark">✦</span><span><b>3D УУС</b><small>БИБЛИОТЕКА МАСТЕРСКОЙ</small></span></button><div className="royal-header-rule"/><div className="royal-header-actions"><button onClick={()=>go("/favorites")} aria-label="Избранное"><Heart size={19}/></button><button onClick={()=>go("/cart")} aria-label="Корзина"><ShoppingBag size={19}/><i>{cartItems.length}</i></button><button onClick={()=>go("/account")} aria-label="Профиль"><UserRound size={19}/></button></div></header>
    <main className="royal-stage">
      {isHome && <><section className="royal-home-hero"><div className="royal-home-carousel"><div className="royal-eyebrow">ИЗ СОКРОВИЩНИЦЫ МАСТЕРСКОЙ</div><div className="royal-carousel-track">{products.slice(0,Math.min(5,products.length)).map((p,i)=><div key={p.id} className={"royal-carousel-item "+(i===carousel%Math.max(1,Math.min(5,products.length))?"is-active":"")} style={{"--shift":`${(i-carousel%Math.max(1,Math.min(5,products.length)))*118}px`}}><ArtCard product={p} onClick={()=>go("/product/"+p.id)}/></div>)}</div><div className="royal-carousel-controls"><button onClick={()=>setCarousel(i=>(i-1+Math.max(1,products.length))%Math.max(1,products.length))} aria-label="Предыдущий товар"><ArrowLeft/></button><span>КОЛЛЕКЦИЯ • {products.length} СОКРОВИЩ</span><button onClick={()=>setCarousel(i=>(i+1)%Math.max(1,products.length))} aria-label="Следующий товар"><ArrowRight/></button></div></div>
      <div className="royal-hero-gallery"><button className="royal-landscape" onClick={()=>go("/catalog")}><span className="royal-landscape-inner"><span>✦</span><b>ГАЛЕРЕЯ</b><small>КАТАЛОГ ИЗДЕЛИЙ</small></span></button><div className="royal-mini-paintings"><button onClick={()=>go("/promos")}><span>♜</span><b>АКЦИИ</b></button><button onClick={()=>go("/news")}><span>✧</span><b>НОВОСТИ</b></button></div><p>Каждое изделие — маленькая история, созданная мастером.</p></div></section>
      <section className="royal-shelf-section"><div className="royal-section-heading"><span>АРХИВ МАСТЕРСКОЙ</span><h2>Выберите книгу</h2><p>Коснитесь корешка — книга выйдет с полки и откроет нужный зал.</p></div><div className="royal-shelf"><div className="royal-books-row">{NAV.filter(n=>n[0]!=="Администратор"||isAdmin).map(([label,to],i)=><Book key={label} title={label} onClick={()=>go(to)} small={label.length>8}/>)}</div></div></section>
      <section className="royal-featured"><div className="royal-section-heading"><span>ИЗБРАННЫЕ ЭКСПОНАТЫ</span><h2>Сокровища на полотне</h2></div><div className="royal-featured-grid">{products.slice(0,4).map(p=><ArtCard key={p.id} product={p} onClick={()=>go("/product/"+p.id)}/>)}</div></section></>}

      {isCatalog && <><div className="royal-page-heading"><span>ЗАЛ КОЛЛЕКЦИИ</span><h1>{title}</h1><p>Изделия мастерской в рамах, как произведения искусства.</p></div><div className="royal-search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Найти сокровище…"/><button onClick={()=>setQuery("")} aria-label="Очистить поиск"><X size={16}/></button></div><div className="royal-category-books">{categories.map(c=><Book key={c.id} title={categoryName(c)} onClick={()=>go("/category/"+(c.id??c.slug))} small/>)}</div><div className="royal-gallery-curtain"><div className="royal-product-carousel">{currentList.map((p,i)=><div key={p.id} className="royal-gallery-item" style={{"--delay":(i%7)*-0.7+"s"}}><ArtCard product={p} onClick={()=>go("/product/"+p.id)}/></div>)}</div></div>{currentList.length===0&&<p className="royal-empty">Пока в этой галерее нет экспонатов.</p>}</>}

      {isProduct && (product ? <div className="royal-product-detail"><button className="royal-back-link" onClick={()=>go("/catalog")}><ArrowLeft size={17}/> Вернуться в галерею</button><div className="royal-product-layout"><Frame className="royal-product-large"><div className="royal-product-photo">{productImage(product)?<img src={productImage(product)} alt={productName(product)}/>:<div className="royal-product-placeholder">✦<small>3D УУС</small></div>}</div></Frame><div className="royal-product-info"><div className="royal-eyebrow">ЭКСПОНАТ МАСТЕРСКОЙ</div><h1>{productName(product)}</h1><Plaque title={productName(product)}><b>{money(productPrice(product))}</b><p>{product.description||"Изделие, созданное в мастерской 3D Уус."}</p><p>Материал: {product.material||"пластик, 3D-печать"}</p><p>Артикул: {product.id}</p></Plaque><div className="royal-product-actions"><button className="royal-gold-button" onClick={()=>{addToCart?.(product.id, null, 1);showToast?.("Добавлено в корзину");}}>Добавить в корзину</button><button className="royal-outline-button" onClick={()=>toggleFavorite?.(product.id)}><Heart size={18}/> В избранное</button></div></div></div></div> : <p className="royal-empty">Экспонат не найден. <button onClick={()=>go("/catalog")}>Вернуться в каталог</button></p>)}

      {isFavorites && <><div className="royal-page-heading"><span>У КАМИНА</span><h1>Зал избранных сокровищ</h1><p>Ваши любимые экспонаты на доске почёта.</p></div><div className="royal-fireplace"><div className="royal-fire"><span>✦</span><span>♨</span><span>✦</span></div></div><div className="royal-favorite-grid">{favoriteProducts.map(p=><ArtCard key={p.id} product={p} onClick={()=>go("/product/"+p.id)} compact/> )}</div>{!favoriteProducts.length&&<p className="royal-empty">Здесь пока нет избранных сокровищ. Откройте картину товара и нажмите «В избранное».</p>}</>}

      {isCart && <><div className="royal-page-heading"><span>КОЖАНЫЙ КОШЕЛЬ</span><h1>Корзина сокровищ</h1><p>Каждый выбранный товар — монета в вашем мешочке.</p></div><div className="royal-purse"><div className="royal-purse-mouth"/><div className="royal-coins">{cartItems.map((item,i)=>{const p=item.product||products.find(x=>String(x.id)===String(item.productId??item.product_id??item.id))||item;return <div key={p.id||i} className={"royal-coin "+(coinDust===i?"is-dusting":"")}><button className="royal-coin-image" onClick={()=>go("/product/"+p.id)}>{productImage(p)?<img src={productImage(p)} alt={productName(p)}/>:<span>✦</span>}</button><b>{productName(p)}</b><span>{money(p.price??productPrice(p))}</span><div className="royal-coin-qty"><button onClick={()=>updateCartQty?.(p.id,item.color,Math.max(1,Number(item.qty??item.quantity??1)-1))}><Minus size={13}/></button><span>{item.qty??item.quantity??1}</span><button onClick={()=>updateCartQty?.(p.id,item.color,Number(item.qty??item.quantity??1)+1)}><Plus size={13}/></button><button onClick={()=>removeCoin(item,i)} aria-label="Удалить товар"><Trash2 size={13}/></button></div></div>})}</div><div className="royal-purse-total"><span>ИТОГО</span><strong>{money(cartTotal)}</strong><button className="royal-gold-button" onClick={()=>go("/checkout")}>Оформить заказ <ArrowRight size={17}/></button></div></div>{!cartItems.length&&<p className="royal-empty">Кошель пока пуст. Загляните в галерею мастерской.</p>}</>}

      {isAccount && <div className="royal-room"><div className="royal-page-heading"><span>ЛИЧНЫЕ ПОКОИ</span><h1>Кабинет мастера</h1><p>Комната, где хранятся ваши сведения и история заказов.</p></div><div className="royal-room-gallery"><div className="royal-window-picture">✧<small>ОКНО В САД</small></div><div className="royal-desk"><Plaque title="Имя пользователя">{currentUser?.name||"Гость"} <button onClick={()=>go("/auth")}>✒ Изменить / войти</button></Plaque><Plaque title="Логин">{currentUser?.username||"Не указан"}</Plaque><Plaque title="Электронная почта">{currentUser?.email||"Войдите, чтобы увидеть данные"}</Plaque></div></div><div className="royal-shelf"><div className="royal-books-row">{[["Заказы","/account?tab=orders"],["Настройки","/account?tab=settings"],["Войти","/auth"]].map(([t,to])=><Book key={t} title={t} onClick={()=>go(to)}/>)}</div></div></div>}

      {isAdminPage && <><div className="royal-page-heading"><span>ЗАКРЫТЫЙ АРХИВ</span><h1>Управление мастерской</h1><p>Выберите книгу инструмента. Управление товарами и заказами остаётся прежним.</p></div><div className="royal-admin-books">{[["Товары","/admin?tab=products"],["Заказы","/admin?tab=orders"],["Категории","/admin?tab=categories"],["Новости","/admin?tab=news"],["Акции","/admin?tab=promos"],["Отзывы","/admin?tab=reviews"]].map(([t,to])=><Book key={t} title={t} onClick={()=>go(to)}/>)}</div><div className="royal-admin-open"><button className="royal-gold-button" onClick={()=>document.dispatchEvent(new CustomEvent("royal:open-admin"))}>Открыть инструменты управления</button><p>В этой первой версии книги навигации оформлены; существующую панель управления открываем без потери функций.</p></div></>}

      {isPromos && <><div className="royal-page-heading"><span>ОСОБЫЕ ПРЕДЛОЖЕНИЯ</span><h1>Книга акций</h1></div><div className="royal-featured-grid">{promos.map((p,i)=><Frame key={p.id||i}><div className="royal-promo-card"><Tag/><h2>{p.title||p.name||"Предложение мастерской"}</h2><p>{p.description||p.text||""}</p></div></Frame>)}</div></>}
      {isNews && <><div className="royal-page-heading"><span>ЛЕТОПИСЬ МАСТЕРСКОЙ</span><h1>Новости</h1></div><div className="royal-news-list">{news.map((n,i)=><Plaque key={n.id||i} title={n.title||"Запись летописи"}>{n.content||n.text||n.description||""}</Plaque>)}</div></>}
      {isCustom && <div className="royal-page-heading"><span>РУКОПИСЬ ЗАКАЗА</span><h1>Создать своё изделие</h1><p>Откройте форму индивидуального заказа ниже.</p><button className="royal-gold-button" onClick={()=>go("/catalog")}>Посмотреть каталог</button></div>}
      {!isHome&&!isCatalog&&!isProduct&&!isCart&&!isFavorites&&!isAccount&&!isAdminPage&&!isPromos&&!isNews&&!isCustom && <div className="royal-page-heading"><span>БИБЛИОТЕКА</span><h1>Страница мастерской</h1><p>Выберите книгу на полке, чтобы продолжить путешествие.</p><button className="royal-gold-button" onClick={()=>go("/")}>На главную</button></div>}
    </main>
    <footer className="royal-footer"><span>✦ 3D УУС • МАСТЕРСКАЯ СОКРОВИЩ</span><span>СОЗДАНО С ВНИМАНИЕМ К ДЕТАЛЯМ</span></footer>
    {bookFlight&&<div className="royal-book-flight" role="status"><div className="royal-flight-book">✦<span>{bookFlight}</span></div></div>}
  </div>;
}
