import React, { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, ShoppingBag, Heart, UserRound, Sparkles, Newspaper, Tag, Package, ArrowLeft, ArrowRight, Plus, Minus, Trash2, Feather, Search, X, Home, ShieldCheck, ScrollText, Menu, Settings, Sun, Moon, Waves, Check } from "lucide-react";

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

function getColorOptionStyle(name, selected) {
  // До выбора все варианты выглядят одинаково — на белой основе.
  if (!selected) {
    return {
      backgroundColor: "#ffffff",
      color: "#292929",
      borderColor: "#d8d4cc",
      boxShadow: "0 1px 2px rgba(0,0,0,.04)",
      fontWeight: 500,
      transform: "translateY(0) scale(1)",
    };
  }

  const value = String(name || "").trim().toLowerCase().replace(/ё/g, "е");
  const palette = [
    [/темно-син|темно син|navy/, "#173a63", "#ffffff"],
    [/бел/, "#ffffff", "#292929"],
    [/черн/, "#252525", "#ffffff"],
    [/красн|бордов|алый|вишнев/, "#d62828", "#ffffff"],
    [/беж|песочн|кремов/, "#e8d5b7", "#33291d"],
    [/коричнев|шоколад|кофе/, "#795548", "#ffffff"],
    [/син|голуб|бирюз|циан/, "#168bd2", "#ffffff"],
    [/зелен|изумруд|мятн|хаки/, "#31845a", "#ffffff"],
    [/желт|золот|лимон/, "#f2cf42", "#332b12"],
    [/оранж|рыж/, "#f28c28", "#30200e"],
    [/розов|малинов|фукси/, "#e66b9a", "#ffffff"],
    [/фиолет|сиренев|лаванд/, "#8956b3", "#ffffff"],
    [/графит|темно-сер/, "#555b61", "#ffffff"],
    [/серебр|серый|серебрист/, "#c5cbd1", "#25282b"],
    [/прозрач|clear/, "rgba(220,235,245,.45)", "#334155"],
  ];
  const match = palette.find(([pattern]) => pattern.test(value));
  return {
    backgroundColor: match ? match[1] : (value || "#ffffff"),
    color: match ? match[2] : "#292929",
    borderColor: match ? match[1] : "#C77B4A",
    boxShadow: "0 5px 12px rgba(0,0,0,.12), 0 0 0 2px rgba(199,123,74,.28)",
    fontWeight: 700,
    transform: "translateY(-3px) scale(1.025)",
  };
}

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

export default function RoyalLibrary({ pathname, search, navigate, data, theme = {} }) {
  const [carousel, setCarousel] = useState(0);
  const carouselTouch = useRef(null);
  const carouselMoved = useRef(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { dark = false, smoke = false, royalShimmer = false, toggleTheme, toggleSmoke, toggleRoyalShimmer, toggleRoyal } = theme;
  const [bookFlight, setBookFlight] = useState("");
  const [query, setQuery] = useState("");
  const [coinDust, setCoinDust] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [customForm, setCustomForm] = useState({ name: "", phone: "", description: "", size: "", color: "", qty: 1, budget: "", comment: "" });
  const [customSent, setCustomSent] = useState(false);
  const [customSending, setCustomSending] = useState(false);
  const { products=[], categories=[], cart=[], favorites=[], promos=[], news=[], currentUser, isAdmin, addToCart, updateCartQty, removeFromCart, toggleFavorite, submitCustomRequest, showToast } = data;
  const setCustomField = (key) => (event) => setCustomForm(form => ({ ...form, [key]: event.target.value }));
  const submitCustomOrder = async (event) => {
    event.preventDefault();
    if (!customForm.name.trim() || !customForm.phone.trim() || !customForm.description.trim()) {
      showToast?.("Заполните имя, телефон и описание идеи");
      return;
    }
    if (customSending) return;
    setCustomSending(true);
    try {
      const result = await submitCustomRequest?.({ ...customForm, qty: Math.max(1, Number(customForm.qty) || 1) });
      if (result === false) return;
      setCustomSent(true);
    } catch (error) {
      showToast?.("Не удалось отправить заявку. Попробуйте ещё раз.");
    } finally {
      setCustomSending(false);
    }
  };
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
  useEffect(() => { setSelectedColor(null); }, [product?.id]);
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
    {sidebarOpen && <div className="royal-sidebar-backdrop" onClick={()=>setSidebarOpen(false)}><aside className="royal-sidebar" onClick={e=>e.stopPropagation()} aria-label="Боковая панель королевской библиотеки">
      <div className="royal-sidebar-head"><div><b>✦ КОРОЛЕВСКАЯ БИБЛИОТЕКА</b><small>НАСТРОЙКИ И РАЗДЕЛЫ</small></div><button onClick={()=>setSidebarOpen(false)} aria-label="Закрыть"><X size={19}/></button></div>
      <div className="royal-sidebar-content"><div className="royal-sidebar-label">Разделы библиотеки</div>{NAV.filter(n=>n[0]!=="Администратор"||isAdmin).map(([label,to,Icon])=><button className="royal-sidebar-link" key={label} onClick={()=>{setSidebarOpen(false);go(to)}}><Icon size={17}/><span>{label}</span><ArrowRight size={14}/></button>)}
      <div className="royal-sidebar-label">Оформление</div>
      <button className="royal-sidebar-link" onClick={toggleTheme}><span className="royal-sidebar-symbol">{dark?<Sun size={17}/>:<Moon size={17}/>}</span><span>{dark?"Светлая тема":"Тёмная тема"}</span><small>{dark?"Вкл.":"Выкл."}</small></button>
      <button className="royal-sidebar-link" onClick={toggleSmoke} disabled={true}><Waves size={17}/><span>Переливающийся фон</span><small>Недоступен в королевском стиле</small></button>
      <button className="royal-sidebar-link" onClick={toggleRoyalShimmer}><Sparkles size={17}/><span>Мягкие блики</span><small>{royalShimmer?"Вкл.":"Выкл."}</small></button>
      <div className="royal-sidebar-label">Оформление сайта</div><button className="royal-sidebar-link royal-style-toggle" onClick={()=>{toggleRoyal?.();setSidebarOpen(false)}} aria-pressed={true}><Sparkles size={17}/><span>Королевский стиль</span><small>Вкл.</small></button></div>
      <div className="royal-sidebar-foot">3D УУС · МАСТЕРСКАЯ</div>
    </aside></div>}
    <RoyalBackdrop/>
    <header className="royal-header"><button className="royal-sidebar-trigger" onClick={()=>setSidebarOpen(true)} aria-label="Открыть боковую панель"><Menu size={20}/></button><button className="royal-brand" onClick={()=>go("/")}><span className="royal-brand-mark">✦</span><span><b>3D УУС</b><small>БИБЛИОТЕКА МАСТЕРСКОЙ</small></span></button><div className="royal-header-rule"/><div className="royal-header-actions"><button onClick={()=>go("/favorites")} aria-label="Избранное"><Heart size={19}/></button><button onClick={()=>go("/cart")} aria-label="Корзина"><ShoppingBag size={19}/><i>{cartItems.length}</i></button><button onClick={()=>go("/account")} aria-label="Профиль"><UserRound size={19}/></button></div></header>
    <main className="royal-stage">
      {isHome && <><section className="royal-home-hero"><div className="royal-home-carousel" onTouchStart={e=>{carouselTouch.current={x:e.touches[0].clientX,y:e.touches[0].clientY};carouselMoved.current=false;}} onTouchMove={e=>{if(!carouselTouch.current)return;const dx=e.touches[0].clientX-carouselTouch.current.x;const dy=e.touches[0].clientY-carouselTouch.current.y;if(Math.abs(dx)>12&&Math.abs(dx)>Math.abs(dy)){carouselMoved.current=true;e.preventDefault();}}} onTouchEnd={e=>{if(!carouselTouch.current)return;const dx=e.changedTouches[0].clientX-carouselTouch.current.x;const dy=e.changedTouches[0].clientY-carouselTouch.current.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)){const count=Math.max(1,Math.min(5,products.length));setCarousel(i=>(i+(dx<0?1:-1)+count)%count);}carouselTouch.current=null;}}><div className="royal-eyebrow">ИЗ СОКРОВИЩНИЦЫ МАСТЕРСКОЙ</div><div className="royal-carousel-track">{products.slice(0,Math.min(5,products.length)).map((p,i)=><div key={p.id} className={"royal-carousel-item "+(i===carousel%Math.max(1,Math.min(5,products.length))?"is-active":"")} style={{"--shift":`${(i-carousel%Math.max(1,Math.min(5,products.length)))*118}px`}}><ArtCard product={p} onClick={()=>{if(!carouselMoved.current)go("/product/"+p.id);}}/></div>)}</div><div className="royal-carousel-controls"><button onClick={()=>setCarousel(i=>(i-1+Math.max(1,products.length))%Math.max(1,products.length))} aria-label="Предыдущий товар"><ArrowLeft/></button><span>КОЛЛЕКЦИЯ • {products.length} СОКРОВИЩ</span><button onClick={()=>setCarousel(i=>(i+1)%Math.max(1,products.length))} aria-label="Следующий товар"><ArrowRight/></button></div></div>
      <div className="royal-hero-gallery"><button className="royal-landscape" onClick={()=>go("/catalog")}><span className="royal-landscape-inner"><span>✦</span><b>ГАЛЕРЕЯ</b><small>КАТАЛОГ ИЗДЕЛИЙ</small></span></button><div className="royal-mini-paintings"><button onClick={()=>go("/promos")}><span>♜</span><b>АКЦИИ</b></button><button onClick={()=>go("/news")}><span>✧</span><b>НОВОСТИ</b></button></div><p>Каждое изделие — маленькая история, созданная мастером.</p></div></section>
      <section className="royal-shelf-section"><div className="royal-section-heading"><span>АРХИВ МАСТЕРСКОЙ</span><h2>Выберите книгу</h2><p>Коснитесь корешка — книга выйдет с полки и откроет нужный зал.</p></div><div className="royal-shelf"><div className="royal-books-row">{NAV.filter(n=>n[0]!=="Администратор"||isAdmin).map(([label,to],i)=><Book key={label} title={label} onClick={()=>go(to)} small={label.length>8}/>)}</div></div></section>
      <section className="royal-featured"><div className="royal-section-heading"><span>ИЗБРАННЫЕ ЭКСПОНАТЫ</span><h2>Сокровища на полотне</h2></div><div className="royal-featured-grid">{products.slice(0,4).map(p=><ArtCard key={p.id} product={p} onClick={()=>go("/product/"+p.id)}/>)}</div></section></>}

      {isCatalog && <><div className="royal-page-heading"><span>ЗАЛ КОЛЛЕКЦИИ</span><h1>{title}</h1><p>Изделия мастерской в рамах, как произведения искусства.</p></div><div className="royal-search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Найти сокровище…"/><button onClick={()=>setQuery("")} aria-label="Очистить поиск"><X size={16}/></button></div><div className="royal-category-books">{categories.map(c=><Book key={c.id} title={categoryName(c)} onClick={()=>go("/category/"+(c.id??c.slug))} small/>)}</div><div className="royal-gallery-curtain"><div className="royal-product-carousel">{currentList.map((p,i)=><div key={p.id} className="royal-gallery-item" style={{"--delay":(i%7)*-0.7+"s"}}><ArtCard product={p} onClick={()=>go("/product/"+p.id)}/></div>)}</div></div>{currentList.length===0&&<p className="royal-empty">Пока в этой галерее нет экспонатов.</p>}</>}

      {isProduct && (product ? <div className="royal-product-detail"><button className="royal-back-link" onClick={()=>go("/catalog")}><ArrowLeft size={17}/> Вернуться в галерею</button><div className="royal-product-layout"><Frame className="royal-product-large"><div className="royal-product-photo">{productImage(product)?<img src={productImage(product)} alt={productName(product)}/>:<div className="royal-product-placeholder">✦<small>3D УУС</small></div>}</div></Frame><div className="royal-product-info"><div className="royal-eyebrow">ЭКСПОНАТ МАСТЕРСКОЙ</div><h1>{productName(product)}</h1><Plaque title={productName(product)}><b>{money(productPrice(product))}</b><p>{product.description||"Изделие, созданное в мастерской 3D Уус."}</p><p>Материал: {product.material||"пластик, 3D-печать"}</p><p>Артикул: {product.id}</p></Plaque>{Array.isArray(product.colors) && product.colors.length > 0 && <div className="royal-color-options"><span className="royal-color-label">Выберите цвет</span><div className="royal-color-list">{product.colors.map((c,i)=><button type="button" key={c+"-"+i} className={"royal-color-option "+(selectedColor===c?"is-selected":"")} aria-pressed={selectedColor===c} onClick={()=>setSelectedColor(c)} style={getColorOptionStyle(c, selectedColor===c)}>{c}{selectedColor===c&&<Check size={14}/>}</button>)}</div>{selectedColor&&<small className="royal-color-selected">Выбран цвет: {selectedColor}</small>}</div>}<div className="royal-product-actions"><button className="royal-gold-button" onClick={()=>{if(Array.isArray(product.colors)&&product.colors.length&&!selectedColor){showToast?.("Сначала выберите цвет товара");return;}addToCart?.(product.id, selectedColor || product.colors?.[0] || null, 1);showToast?.("Добавлено в корзину");}}>Добавить в корзину</button><button className="royal-outline-button" onClick={()=>toggleFavorite?.(product.id)}><Heart size={18}/> В избранное</button></div></div></div></div> : <p className="royal-empty">Экспонат не найден. <button onClick={()=>go("/catalog")}>Вернуться в каталог</button></p>)}

      {isFavorites && <><div className="royal-page-heading"><span>У КАМИНА</span><h1>Зал избранных сокровищ</h1><p>Ваши любимые экспонаты на доске почёта.</p></div><div className="royal-fireplace"><div className="royal-fire"><span>✦</span><span>♨</span><span>✦</span></div></div><div className="royal-favorite-grid">{favoriteProducts.map(p=><ArtCard key={p.id} product={p} onClick={()=>go("/product/"+p.id)} compact/> )}</div>{!favoriteProducts.length&&<p className="royal-empty">Здесь пока нет избранных сокровищ. Откройте картину товара и нажмите «В избранное».</p>}</>}

      {isCart && <><div className="royal-page-heading"><span>КОЖАНЫЙ КОШЕЛЬ</span><h1>Корзина сокровищ</h1><p>Каждый выбранный товар — монета в вашем мешочке.</p></div><div className="royal-purse"><div className="royal-purse-mouth"/><div className="royal-coins">{cartItems.map((item,i)=>{const p=item.product||products.find(x=>String(x.id)===String(item.productId??item.product_id??item.id))||item;return <div key={p.id||i} className={"royal-coin "+(coinDust===i?"is-dusting":"")}><button className="royal-coin-image" onClick={()=>go("/product/"+p.id)}>{productImage(p)?<img src={productImage(p)} alt={productName(p)}/>:<span>✦</span>}</button><b>{productName(p)}</b><span>{money(p.price??productPrice(p))}</span><div className="royal-coin-qty"><button onClick={()=>updateCartQty?.(p.id,item.color,Math.max(1,Number(item.qty??item.quantity??1)-1))}><Minus size={13}/></button><span>{item.qty??item.quantity??1}</span><button onClick={()=>updateCartQty?.(p.id,item.color,Number(item.qty??item.quantity??1)+1)}><Plus size={13}/></button><button onClick={()=>removeCoin(item,i)} aria-label="Удалить товар"><Trash2 size={13}/></button></div></div>})}</div><div className="royal-purse-total"><span>ИТОГО</span><strong>{money(cartTotal)}</strong><button className="royal-gold-button" onClick={()=>go("/checkout")}>Оформить заказ <ArrowRight size={17}/></button></div></div>{!cartItems.length&&<p className="royal-empty">Кошель пока пуст. Загляните в галерею мастерской.</p>}</>}

      {isAccount && <div className="royal-room"><div className="royal-page-heading"><span>ЛИЧНЫЕ ПОКОИ</span><h1>Кабинет мастера</h1><p>Комната, где хранятся ваши сведения и история заказов.</p></div><div className="royal-room-gallery"><div className="royal-window-picture">✧<small>ОКНО В САД</small></div><div className="royal-desk"><Plaque title="Имя пользователя">{currentUser?.name||"Гость"} <button onClick={()=>go("/auth")}>✒ Изменить / войти</button></Plaque><Plaque title="Логин">{currentUser?.username||"Не указан"}</Plaque><Plaque title="Электронная почта">{currentUser?.email||"Войдите, чтобы увидеть данные"}</Plaque></div></div><div className="royal-shelf"><div className="royal-books-row">{[["Заказы","/account?tab=orders"],["Настройки","/account?tab=settings"],["Войти","/auth"]].map(([t,to])=><Book key={t} title={t} onClick={()=>go(to)}/>)}</div></div></div>}

      {isAdminPage && <><div className="royal-page-heading"><span>ЗАКРЫТЫЙ АРХИВ</span><h1>Управление мастерской</h1><p>Выберите книгу инструмента. Управление товарами и заказами остаётся прежним.</p></div><div className="royal-admin-books">{[["Товары","/admin?tab=products"],["Заказы","/admin?tab=orders"],["Категории","/admin?tab=categories"],["Новости","/admin?tab=news"],["Акции","/admin?tab=promos"],["Отзывы","/admin?tab=reviews"]].map(([t,to])=><Book key={t} title={t} onClick={()=>go(to)}/>)}</div><div className="royal-admin-open"><button className="royal-gold-button" onClick={()=>go("/admin?tab=products")}>Открыть инструменты управления</button><p>В этой первой версии книги навигации оформлены; существующую панель управления открываем без потери функций.</p></div></>}

      {isPromos && <><div className="royal-page-heading"><span>ОСОБЫЕ ПРЕДЛОЖЕНИЯ</span><h1>Книга акций</h1></div><div className="royal-featured-grid">{promos.map((p,i)=><Frame key={p.id||i}><div className="royal-promo-card"><Tag/><h2>{p.title||p.name||"Предложение мастерской"}</h2><p>{p.description||p.text||""}</p></div></Frame>)}</div></>}
      {isNews && <><div className="royal-page-heading"><span>ЛЕТОПИСЬ МАСТЕРСКОЙ</span><h1>Новости</h1></div><div className="royal-news-list">{news.map((n,i)=><Plaque key={n.id||i} title={n.title||"Запись летописи"}>{n.content||n.text||n.description||""}</Plaque>)}</div></>}
      {isCustom && <section className="royal-custom-page">
        <div className="royal-page-heading"><span>РУКОПИСЬ ЗАКАЗА</span><h1>Создать своё изделие</h1><p>Ваша идея — на пергаменте. Расскажите мастеру, какое сокровище вам хочется создать.</p><button className="royal-outline-button" onClick={()=>go("/catalog")}><BookOpen size={16}/> Сначала посмотреть каталог</button></div>
        {customSent ? <div className="royal-parchment royal-parchment-success"><div className="royal-parchment-seal">✦</div><h2>Послание отправлено!</h2><p>Ваша идея передана в мастерскую. Мастер свяжется с вами, чтобы обсудить детали и возможность изготовления.</p><button className="royal-gold-button" onClick={()=>{setCustomSent(false);setCustomForm({name:"",phone:"",description:"",size:"",color:"",qty:1,budget:"",comment:""});}}>Написать ещё одно послание</button></div> :
        <form className="royal-parchment" onSubmit={submitCustomOrder}>
          <div className="royal-parchment-top"><span className="royal-parchment-ornament">❦</span><div><small>КОРОЛЕВСКАЯ БИБЛИОТЕКА • МАСТЕРСКАЯ 3D УУС</small><h2>Лист индивидуального заказа</h2><p>Заполните поля пером — даже если идея пока только в мыслях.</p></div><Feather className="royal-parchment-feather" size={40}/></div>
          <div className="royal-parchment-fields">
            <label className="royal-ink-field"><span>Ваше имя <b>*</b></span><input required value={customForm.name} onChange={setCustomField("name")} placeholder="Как к вам обращаться?"/></label>
            <label className="royal-ink-field"><span>Номер телефона <b>*</b></span><input required type="tel" value={customForm.phone} onChange={setCustomField("phone")} placeholder="+7 …"/></label>
            <label className="royal-ink-field royal-ink-field-wide"><span>Что вы хотите изготовить? <b>*</b></span><textarea required rows={5} value={customForm.description} onChange={setCustomField("description")} placeholder="Можно простыми словами: что это за вещь, для чего она нужна, на что похожа? Не обязательно знать точные названия и размеры — опишите как умеете."/></label>
            <div className="royal-ink-hint royal-ink-field-wide"><Sparkles size={17}/><span><b>Не получается описать идею?</b> Напишите, для чего нужна вещь, какие предметы или формы она напоминает, и что обязательно должно быть. Можно начать с фразы: «Я хочу вещь, которая…».</span></div>
            <label className="royal-ink-field"><span>Желаемый размер</span><input value={customForm.size} onChange={setCustomField("size")} placeholder="Например, с ладонь"/></label>
            <label className="royal-ink-field"><span>Желаемый цвет</span><input value={customForm.color} onChange={setCustomField("color")} placeholder="Например, чёрный и золотой"/></label>
            <label className="royal-ink-field"><span>Количество</span><input type="number" min="1" max="1000" value={customForm.qty} onChange={setCustomField("qty")}/></label>
            <label className="royal-ink-field"><span>Бюджет (необязательно)</span><input value={customForm.budget} onChange={setCustomField("budget")} placeholder="Примерная сумма"/></label>
            <label className="royal-ink-field royal-ink-field-wide"><span>Дополнительные пожелания</span><textarea rows={3} value={customForm.comment} onChange={setCustomField("comment")} placeholder="Где будет использоваться, нужна ли надпись, узор, подвижные детали и любые другие мысли…"/></label>
          </div>
          <div className="royal-parchment-bottom"><span>✦ Каждая великая вещь начинается с идеи ✦</span><button className="royal-gold-button" type="submit" disabled={customSending}>{customSending ? "Отправляем послание…" : <><Feather size={17}/> Отправить мастеру</>}</button></div>
        </form>}
      </section>}
      {!isHome&&!isCatalog&&!isProduct&&!isCart&&!isFavorites&&!isAccount&&!isAdminPage&&!isPromos&&!isNews&&!isCustom && <div className="royal-page-heading"><span>БИБЛИОТЕКА</span><h1>Страница мастерской</h1><p>Выберите книгу на полке, чтобы продолжить путешествие.</p><button className="royal-gold-button" onClick={()=>go("/")}>На главную</button></div>}
    </main>
    <footer className="royal-footer"><span>✦ 3D УУС • МАСТЕРСКАЯ СОКРОВИЩ</span><span>СОЗДАНО С ВНИМАНИЕМ К ДЕТАЛЯМ</span></footer>
    {bookFlight&&<div className="royal-book-flight" role="status"><div className="royal-flight-book">✦<span>{bookFlight}</span></div></div>}
  </div>;
}
