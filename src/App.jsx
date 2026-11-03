import React, { useEffect, useMemo, useRef, useState } from 'react';

const KEY = 'acl-marketplace-v3';
const categories = ['all', 'textbooks', 'electronics', 'furniture', 'clothing', 'other'];
const conditions = ['new', 'like-new', 'used', 'worn'];
const currentUser = {name: 'You', email: 'you@example.com'}; // Demo account; no login backend
const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=82`;
const seed = [
  {id:'m1', title:'Calculus II textbook', category:'textbooks', condition:'used', price:320, description:'Second-year calculus textbook, complete with all chapters. A few highlighted sections and notes in pencil, but no missing or torn pages. Useful for the midterm and final revision sessions. You can inspect it before deciding.', status:'active', owner:'you', seller:'You', sellerEmail:currentUser.email, pickup:'GUC student area, near the main cafeteria', photos:[photo('photo-1544947950-fa07a98d237f'),photo('photo-1494438639946-1ebd1d20bf85')], emoji:'📚'},
  {id:'m2', title:'Student desk lamp', category:'furniture', condition:'like-new', price:240, description:'Compact study lamp with warm light, adjustable position and a USB power cable. Used for one semester only. The cable and light both work. Great for a dorm desk or a small workspace.', status:'active', owner:'other', seller:'Mariam', sellerEmail:'mariam.seller@example.com', pickup:'GUC library entrance, weekdays after 1 PM', photos:[photo('photo-1555475384-a0aefc775412')], emoji:'💡'},
  {id:'m3', title:'Bluetooth headphones', category:'electronics', condition:'used', price:650, description:'Wireless over-ear headphones in good working condition. They connect with Bluetooth and include the original carrying pouch and charging cable. The battery lasts about six hours based on my usage. There are a few cosmetic scratches near one hinge; see the photos. Happy to let you test sound and pairing before buying.', status:'active', owner:'other', seller:'Omar', sellerEmail:'omar.seller@example.com', pickup:'Arrange a meetup at GUC Gate 3', photos:[photo('photo-1599955051125-571f47e04316'),photo('photo-1505740420928-5e560c06d30e'),photo('photo-1546435770-a3e426bf472b')], emoji:'🎧'},
  {id:'m4', title:'Engineering lab coat', category:'clothing', condition:'new', price:200, description:'White engineering lab coat, medium size, bought for a lab but never worn. Still clean and folded. Suitable for laboratory practical sessions. Please check your required size before arranging pickup.', status:'active', owner:'you', seller:'You', sellerEmail:currentUser.email, pickup:'Meet at GUC main entrance, mornings', photos:[photo('photo-1542058186993-286fdce0b580')], emoji:'🥼'},
  {id:'m5', title:'Drawing tablet', category:'electronics', condition:'like-new', price:1450, description:'Small USB drawing tablet with pressure-sensitive pen and protective sleeve. Used for a few class illustrations; fully functional. Works with common creative software after installing the manufacturer driver. You are welcome to try the pen and pressure sensitivity on my laptop before buying.', status:'active', owner:'other', seller:'Nour', sellerEmail:'nour.seller@example.com', pickup:'GUC design building reception', photos:[photo('photo-1671087709820-274fdd9ac67a')], emoji:'✏️'},
  {id:'m6', title:'Used storage shelf', category:'furniture', condition:'worn', price:390, description:'Light wooden storage shelf. Stable and usable, though there are visible scratches from moving rooms. The shelves are best for books, stationery and small storage boxes, not very heavy appliances. Buyer should arrange a way to transport it from near campus.', status:'active', owner:'other', seller:'Youssef', sellerEmail:'youssef.seller@example.com', pickup:'Collect from a public pickup point near GUC, by arrangement', photos:[photo('photo-1692195321701-1a454c79ab02'),photo('photo-1758279746549-d24f3784879d')], emoji:'🗄️'},
  {id:'m7', title:'MATH 201 workbook', category:'textbooks', condition:'used', price:140, description:'Workbook with practice problems, solutions and lecture notes. All pages present and in readable condition. Some exercises have answers written in pencil. Already sold to another student.', status:'sold', owner:'you', seller:'You', sellerEmail:currentUser.email, pickup:'GUC campus (previous listing)', photos:[photo('photo-1544947950-fa07a98d237f')], emoji:'📖'},
  {id:'m8', title:'Sketching kit', category:'other', condition:'like-new', price:180, description:'Charcoal pencils, graphite pencils, blending tools and an A5 sketch pad. Some pencils have been lightly used, but the set still has plenty of material for design practice and drawing assignments.', status:'active', owner:'other', seller:'Salma', sellerEmail:'salma.seller@example.com', pickup:'Meet outside the GUC architecture studios', photos:[photo('photo-1758521232691-613561977b6a'),photo('photo-1771366629879-8b3128ee62ca')], emoji:'🎨'},
];
const emptyForm = {title:'', price:'', category:'', condition:'', description:'', pickup:'', status:'active'};
function saved(){try {const value=JSON.parse(localStorage.getItem(KEY));return Array.isArray(value)?value:seed;}catch{return seed;}}
const cap = s => s==='like-new'?'Like new':(s||'').replace(/\b\w/g,m=>m.toUpperCase());
function findError(form){
 if(!form.title.trim())return 'Please complete the item title.';
 if(form.price.trim()==='' || !Number.isFinite(Number(form.price)) || Number(form.price)<0)return 'Enter a price of zero or more.';
 if(!categories.slice(1).includes(form.category))return 'Choose a category.';
 if(!conditions.includes(form.condition))return 'Choose an item condition.';
 if(!['active','sold'].includes(form.status))return 'Choose a valid status.';
 return '';
}
function ListingImage({src, alt, emoji, className=''}) {
 const [broken, setBroken] = useState(false);
 useEffect(() => setBroken(false), [src]);
 return src && !broken
   ? <img className={className} src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} />
   : <span className="item-emoji" aria-label="Photo unavailable">{emoji || '📦'}</span>;
}
function ListingCard({item, manage=false}) {
 return <article className="product">
  <a className="photo" href={`#/items/${item.id}`} aria-label={`View ${item.title}`}>
   <span className="stamp">{cap(item.condition)}</span>
   <ListingImage src={item.photos?.[0]} alt={item.title} emoji={item.emoji} className="listing-img" />
  </a>
  <div className="prod-details">
   <div className="prod-topline"><span className="muted">{cap(item.category)}</span><span className={item.status==='sold'?'soldstatus':'instock'}>{item.status.toUpperCase()}</span></div>
   <h3><a href={`#/items/${item.id}`}>{item.title}</a></h3><p>{item.description || 'View this listing for more details.'}</p>
   <div className="costline"><strong>EGP {item.price.toLocaleString()}</strong><span>By {item.seller || 'You'}</span></div>
   <div className="card-actions"><a className="details-button" href={`#/items/${item.id}`}>View item <span aria-hidden="true">→</span></a>
   {manage&&<a className="manage-listing" href={`#/items/${item.id}/edit?from=profile`}>Edit listing</a>}</div>
  </div>
 </article>;
}
export default function App(){
 const [items,setItems] = useState(saved);
 const [query,setQuery] = useState('');
 const [category,setCategory] = useState('all');
 const [sort,setSort] = useState('featured');
 const [route,setRoute] = useState(() => window.location.hash.slice(1) || '/');
 const selected = route.match(/^\/items\/([^/]+)$/)?.[1] || null;
 const isEditor = route === '/sell' || /^\/items\/[^/]+\/edit(?:\?from=profile)?$/.test(route);
 const returnToProfile = isEditor && route.endsWith('?from=profile');
 const isBrowse = route === '/';
 const isProfile = route === '/profile';
 const myItems = items.filter(item => item.owner === 'you');
 const activeItems = myItems.filter(item => item.status === 'active');
 const soldItems = myItems.filter(item => item.status === 'sold');
 const pageHeading = useRef(null);
 const [editor,setEditor] = useState(null); // null or {id,form}
 const [error,setError] = useState('');
 const [activePhoto,setActivePhoto] = useState(0);
 const [notice,setNotice] = useState('');
 const editorReady = isEditor && Boolean(editor);
 useEffect(()=>localStorage.setItem(KEY,JSON.stringify(items)),[items]);
 useEffect(()=>setActivePhoto(0),[selected]);
 useEffect(() => {
  const onHashChange = () => setRoute(window.location.hash.slice(1) || '/');
  window.addEventListener('hashchange', onHashChange);
  return () => window.removeEventListener('hashchange', onHashChange);
 }, []);
 useEffect(() => {
  window.scrollTo(0, 0);
  pageHeading.current?.focus({preventScroll:true});
  document.title = isBrowse ? 'Campus Exchange' : isProfile ? 'My profile | Campus Exchange' : route === '/sell' ? 'Sell an item | Campus Exchange' : `${items.find(item => item.id === route.split('/')[2])?.title || 'Listing'} | Campus Exchange`;
 }, [route,editorReady]);
 useEffect(() => {
  setError('');
  if (!isEditor) {setEditor(null);return;}
  const id = route === '/sell' ? null : route.split('/')[2];
  const item = id ? items.find(item => item.id === id && item.owner === 'you') : null;
  if (id && !item) {setEditor(null);return;}
  setEditor({id,form:item?{title:item.title,price:String(item.price),category:item.category,condition:item.condition,description:item.description,pickup:item.pickup || '',status:item.status}:{...emptyForm}});
 }, [route,items]);
 const listing = useMemo(()=>{let a=items.filter(x=>(category==='all'||x.category===category)&&`${x.title} ${x.category} ${x.description}`.toLowerCase().includes(query.toLowerCase()));if(sort==='low')a.sort((a,b)=>a.price-b.price);if(sort==='high')a.sort((a,b)=>b.price-a.price);return a;},[items,category,query,sort]);
 function submit(event){event.preventDefault();const f=editor.form;const err=findError(f);if(err){setError(err);return;}const original=editor.id?items.find(x=>x.id===editor.id):null;const next={...f, title:f.title.trim(),price:Number(f.price),description:f.description.trim(),pickup:f.pickup.trim(),photos:original?.photos || [],emoji:original?.emoji || '📦',owner:'you',seller:currentUser.name,sellerEmail:currentUser.email};
 if(editor.id){setItems(items.map(x=>x.id===editor.id?{...x,...next}:x));setNotice('Changes saved.');}else{setItems([{...next,id:`m-${Date.now()}`,status:'active'},...items]);setNotice('Item listed.');}window.location.hash=returnToProfile?'/profile':'/';}
 function reset(){setItems(seed);window.location.hash='/';setQuery('');setCategory('all');setSort('featured');setNotice('Example items restored.');}
 function updateField(field, value){setEditor(current=>({...current,form:{...current.form,[field]:value}}));}
 return <div className="market-app">
  <div className="utility"><span>From students, for students.</span><span>Campus Exchange · All prices in EGP</span></div>
  <header className="navigation"><a className="brand" href="#/" onClick={()=>setCategory('all')}><span className="brand-icon">✳</span> CAMPUS<span className="brand-alt">exchange</span></a><div className="nav-actions"><a className="profile-link" href="#/profile" aria-label="My profile" aria-current={isProfile?'page':undefined}><span className="usercircle" aria-hidden="true">Y</span><span className="profile-link-label">My profile</span></a><a className="sell-cta" href="#/sell">+ Sell an item</a></div></header>
  <main>
   {isBrowse&&<>
   <section className="promo"><div className="promo-copy"><span className="tag">YOUR CAMPUS MARKETPLACE</span><h1 ref={pageHeading} tabIndex="-1">Everything you need,<br/><i>right around campus.</i></h1><p>Find a good deal, give an item a new home, and connect with students around you.</p><button onClick={()=>document.getElementById('discover')?.scrollIntoView({behavior:'smooth'})}>Explore listings <span aria-hidden="true">→</span></button></div>
    <div className="promo-art" aria-hidden="true">
     <svg className="campus-illustration" viewBox="0 0 360 250" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="189" cy="126" r="105" fill="#e3dbee"/>
      <g stroke="#8a74a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
       <path d="M28 216h304M59 216v16M305 216v16"/>
       <rect x="98" y="91" width="137" height="99" rx="8" fill="#fff"/>
       <rect x="108" y="101" width="117" height="77" rx="3" fill="#f5f2fa" stroke="#d9cde9"/>
       <path d="M89 190h155l10 16H79l10-16Z" fill="#ece5f4"/>
       <path d="M149 190h36l4 7h-44l4-7Z" fill="#fff"/>
       <rect x="32" y="199" width="53" height="16" rx="3" fill="#c7b5dc"/>
       <rect x="39" y="182" width="46" height="16" rx="3" fill="#fff"/>
       <path d="M47 188h29M40 206h36" stroke="#a18bb9"/>
       <path d="M282 206v-83l-25-38M268 207h29"/>
       <path d="M239 80h33l14 34h-61l14-34Z" fill="#fff"/>
       <path d="M246 80v-8h20v8"/>
       <path d="M145 140c0-12 10-22 22-22s22 10 22 22" stroke="#b7a0cf" strokeWidth="3"/>
       <rect x="140" y="139" width="10" height="19" rx="5" fill="#d8cae7" stroke="#b7a0cf"/>
       <rect x="184" y="139" width="10" height="19" rx="5" fill="#d8cae7" stroke="#b7a0cf"/>
      </g>
      <circle cx="66" cy="98" r="5" fill="#b6a0cd"/><circle cx="294" cy="50" r="4" fill="#c5b5d9"/>
     </svg>
    </div>
   </section>
   <section className="discovery" id="discover">
    <div className="discover-top"><h2>Find your next campus essential</h2><p>Explore pre-loved items from students around you.</p></div>
    <div className="browse-tools">
    <div className="listing-controls" role="group" aria-label="Search, filter and sort listings">
     <label className="control-field search-field">
      <span className="control-label">Search listings</span>
      <div className="search-input">
       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>
       <input aria-label="Search listings" placeholder="Search by name or keyword" value={query} onChange={e=>setQuery(e.target.value)}/>
      </div>
     </label>
     <label className="control-field">
      <span className="control-label">Filter by category</span>
      <select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option value={c} key={c}>{c==='all'?'All categories':cap(c)}</option>)}</select>
     </label>
     <label className="control-field">
      <span className="control-label">Sort by</span>
      <select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select>
     </label>
    </div>
    <div className="filter-bar"><p className="results-count" role="status">{listing.length} {listing.length===1?'item':'items'}{category!=='all'?` in ${cap(category)}`:''}</p>{category!=='all'&&<button className="clear-filter" onClick={()=>setCategory('all')}>Clear category filter</button>}</div>
    </div>
    {notice&&<p className="notice" role="status">{notice} <button aria-label="Dismiss notification" onClick={()=>setNotice('')}>×</button></p>}
    <div className="listing-grid">{listing.map(item=><ListingCard item={item} key={item.id}/>)}{listing.length===0&&<div className="noresults"><h3>No items found</h3><p>Try another keyword or clear your filters to see more listings.</p><button className="cancel-button" onClick={()=>{setQuery('');setCategory('all');}}>Clear search and filters</button></div>}</div>
   </section>
   </>}
   {isProfile&&<section className="profile-page" aria-labelledby="profile-title">
    <a className="back-link" href="#/">← Back to listings</a>
    <div className="profile-header">
     <div className="profile-identity"><span className="profile-avatar" aria-hidden="true">Y</span><div><p className="section-kicker">YOUR CAMPUS EXCHANGE</p><h1 id="profile-title" ref={pageHeading} tabIndex="-1">My profile</h1><p className="profile-account">{currentUser.name} · {currentUser.email}</p></div></div>
    </div>
    {notice&&<p className="notice" role="status">{notice} <button aria-label="Dismiss notification" onClick={()=>setNotice('')}>×</button></p>}
    <section className="profile-section" aria-labelledby="active-listings-title">
     <div className="profile-section-head"><h2 id="active-listings-title">Active listings <span className="listing-count">{activeItems.length}</span></h2><p>The items you have listed for sale.</p></div>
     {activeItems.length>0?<div className="listing-grid">{activeItems.map(item=><ListingCard item={item} manage key={item.id}/>)}</div>:<div className="profile-empty"><p>You have no active listings yet.</p></div>}
    </section>
    <section className="profile-section" aria-labelledby="sold-items-title">
     <div className="profile-section-head"><h2 id="sold-items-title">Sold items <span className="listing-count">{soldItems.length}</span></h2><p>A record of the items you have sold.</p></div>
     {soldItems.length>0?<div className="listing-grid">{soldItems.map(item=><ListingCard item={item} manage key={item.id}/>)}</div>:<div className="profile-empty"><p>You have no sold items yet. When you sell an item, edit its listing and set its status to Sold.</p></div>}
    </section>
   </section>}
  {selected&&(()=>{
   const item=items.find(x=>x.id===selected);if(!item)return null;
   const images=item.photos || [];
   const subject=encodeURIComponent(`Campus Exchange: ${item.title}`);
   const body=encodeURIComponent(`Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (EGP ${item.price}). Is it still available?\n\n`);
   return <section className="item-page" aria-label="Item details">
    <a className="back-link" href="#/">← Back to listings</a>
    <div className="detail-panel">
     <div className="detail-gallery">
     <div className="detail-visual">
      <ListingImage src={images[activePhoto] || images[0]} alt={`${item.title} photo ${activePhoto+1}`} emoji={item.emoji} className="detail-img" />
     </div>
     {images.length>1&&<div className="detail-thumbs" aria-label="Item photos">{images.map((src,index)=><button type="button" key={index} className={activePhoto===index?'thumb active':'thumb'} aria-label={`Show photo ${index+1} of ${images.length}`} aria-pressed={activePhoto===index} onClick={()=>setActivePhoto(index)}><ListingImage src={src} alt="" emoji={item.emoji} className="thumb-img" /></button>)}</div>}
     </div>
     <div className="detail-copy">
     <p className="section-kicker">{cap(item.category)} · {cap(item.condition)}</p>
     <h1 ref={pageHeading} tabIndex="-1">{item.title}</h1>
     <h3>EGP {item.price.toLocaleString()}</h3>
     <p className="item-description">{item.description||'No description supplied.'}</p>
     <div className="detail-meta"><p><strong>Pickup</strong><br/>{item.pickup || 'Arrange directly with seller'}</p><p><strong>Seller</strong><br/>{item.seller}</p></div>
     <p className="muted">Status: {item.status}</p>
     {item.owner==='you'
       ? <a className="sell-cta" href={`#/items/${item.id}/edit`}>Edit your listing</a>
       : item.status==='sold'
         ? <p className="fineprint">This item is marked as sold.</p>
         : <a className="sell-cta contact-seller" href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}>✉ Contact seller</a>}
     </div>
    </div>
   </section>;
  })()}
  {isEditor&&editor&&<section className="editor-page">
   <a className="back-link" href={returnToProfile?'#/profile':editor.id?`#/items/${editor.id}`:'#/'}>← {returnToProfile?'Back to profile':editor.id?'Back to item':'Back to listings'}</a>
   <div className="sell-page">
    <div className="page-head"><p className="section-kicker">CAMPUS EXCHANGE</p><h1 ref={pageHeading} tabIndex="-1">{editor.id?'Edit your listing':'Sell an item'}</h1><p>{editor.id?'Keep your item details and availability up to date.':'A few clear details will help your item find its next owner.'}</p><small>Fields marked * are required.</small></div>
    <form onSubmit={submit}>
     <fieldset className="form-section"><legend>Item details</legend><div className="field-grid">
      <label><span>Item title *</span><input value={editor.form.title} onChange={e=>updateField('title',e.target.value)} placeholder="e.g. Calculus II textbook"/></label>
      <label><span>Price (EGP) *</span><input type="number" min="0" step="0.01" value={editor.form.price} onChange={e=>updateField('price',e.target.value)} placeholder="0.00"/></label>
      <label><span>Category *</span><select value={editor.form.category} onChange={e=>updateField('category',e.target.value)}><option value="">Choose a category</option>{categories.slice(1).map(c=><option value={c} key={c}>{cap(c)}</option>)}</select></label>
      <label><span>Condition *</span><select value={editor.form.condition} onChange={e=>updateField('condition',e.target.value)}><option value="">Choose the condition</option>{conditions.map(c=><option value={c} key={c}>{cap(c)}</option>)}</select></label>
      <label className="wide"><span>Description</span><textarea value={editor.form.description} onChange={e=>updateField('description',e.target.value)} placeholder="Include useful details, what is included, and any signs of wear." rows="4"/></label>
      {editor.id&&<label><span>Listing status</span><select value={editor.form.status} onChange={e=>updateField('status',e.target.value)}><option value="active">Active</option><option value="sold">Sold</option></select></label>}
     </div></fieldset>
     <fieldset className="form-section"><legend>Pickup &amp; contact</legend><div className="field-grid">
      <label className="wide"><span>Pickup / meetup location</span><input value={editor.form.pickup} onChange={e=>updateField('pickup',e.target.value)} placeholder="e.g. Library entrance or arrange on campus"/></label>
      <label className="wide"><span>Seller contact email</span><input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input"/><small className="email-helper">Buyers can contact you using the email from your account.</small></label>
     </div></fieldset>
     {error&&<p className="alert" role="alert">{error}</p>}
     <div className="form-actions"><a className="cancel-button" href={returnToProfile?'#/profile':editor.id?`#/items/${editor.id}`:'#/'}>Cancel</a><button className="sell-cta" type="submit">{editor.id?'Save changes':'Publish item'}</button></div>
    </form>
   </div>
  </section>}
  {(!isBrowse&&!isProfile&&!selected&&!isEditor || selected&&!items.some(item=>item.id===selected) || isEditor&&!editor)&&<section className="unavailable-page"><h1 ref={pageHeading} tabIndex="-1">Listing unavailable</h1><p>This listing could not be found or cannot be edited from your account.</p><a className="back-link" href="#/">← Back to listings</a></section>}
  <footer><strong>CAMPUS exchange</strong><span>From students, for students.</span><button onClick={reset}>Reset demo</button></footer>
  </main>
 </div>;
}
