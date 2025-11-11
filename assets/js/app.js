
const INR = new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'})
const state={products:[],cart:[],filters:{gender:[],category:[],maxPrice:9999,minRating:0,search:'',sort:'featured'}}
const el=id=>document.getElementById(id)
const grid=el('productGrid')
const searchbar=el('searchbar')
const priceMax=el('priceMax')
const cartEl=el('cart')
const cartCount=el('cartCount')
const cartItems=el('cartItems')

const products=[
 {id:1,name:'Men Puffer Jacket',gender:'men',category:'upper',price:3499,oldPrice:4999,rating:4.6,image:'assets/images/men_jacket.jpg',tags:['puffer','warm']},
 {id:2,name:'Women Wool Coat',gender:'women',category:'upper',price:4299,oldPrice:5899,rating:4.7,image:'assets/images/women_coat.jpg',tags:['coat','premium']},
 {id:3,name:'Unisex Hoodie',gender:'men',category:'upper',price:1499,oldPrice:2199,rating:4.2,image:'assets/images/hoodie.jpg',tags:['hoodie']},
 {id:4,name:'Thermal Top',gender:'men',category:'lower',price:1299,oldPrice:1799,rating:4.3,image:'assets/images/thermal.webp',tags:['thermal']},
 {id:5,name:'Track Pants',gender:'men',category:'lower',price:1399,oldPrice:1999,rating:4.1,image:'assets/images/trackpants.jpg',tags:['pants']},
 {id:6,name:'Beanie',gender:'women',category:'accessories',price:499,oldPrice:699,rating:4.0,image:'assets/images/beanie.jpg',tags:['cap']},
 {id:7,name:'Insulated Gloves',gender:'women',category:'accessories',price:799,oldPrice:999,rating:4.4,image:'assets/images/gloves.jpg',tags:['gloves']},
 {id:8,name:'Wool Scarf',gender:'women',category:'accessories',price:699,oldPrice:899,rating:4.2,image:'assets/images/scarf.jpg',tags:['scarf']},
 {id:9,name:'Kids Puffer',gender:'kids',category:'upper',price:2499,oldPrice:3299,rating:4.8,image:'assets/images/kids_puffer.jpg',tags:['kids']},
 {id:10,name:'Thermal Socks',gender:'men',category:'accessories',price:299,oldPrice:399,rating:3.9,image:'assets/images/socks.webp',tags:['socks']},
 {id:11,name:'Cable Knit Sweater',gender:'women',category:'upper',price:1899,oldPrice:2599,rating:4.5,image:'assets/images/sweater.webp',tags:['sweater']},
 {id:12,name:'Arctic Parka',gender:'men',category:'upper',price:6999,oldPrice:8999,rating:4.9,image:'assets/images/parka.webp',tags:['parka','himalaya']}
]

function save(k,v){localStorage.setItem(k,JSON.stringify(v))}
function load(k,def){try{return JSON.parse(localStorage.getItem(k))??def}catch{return def}}

function init(){
  state.products=products
  state.cart=load('ff-cart',[])
  render()
  bindUI()
  updateCartUI()
  initCarousel()
  document.getElementById('year').textContent=new Date().getFullYear()
}
function bindUI(){
  document.querySelectorAll('input[name=gender]').forEach(cb=>cb.addEventListener('change',()=>{state.filters.gender=checked('gender');render()}))
  document.querySelectorAll('input[name=category]').forEach(cb=>cb.addEventListener('change',()=>{state.filters.category=checked('category');render()}))
  document.querySelectorAll('input[name=rating]').forEach(r=>r.addEventListener('change',e=>{state.filters.minRating=Number(e.target.value||0);render()}))
  const range=document.getElementById('priceRange')
  range.addEventListener('input',e=>{state.filters.maxPrice=Number(e.target.value);priceMax.textContent=INR.format(state.filters.maxPrice);render()})
  document.getElementById('clearFilters').addEventListener('click',()=>{document.querySelectorAll('.filters input').forEach(x=>x.checked=false);state.filters={gender:[],category:[],maxPrice:9999,minRating:0,search:'',sort:state.filters.sort};document.getElementById('priceRange').value=9999;priceMax.textContent='₹9,999';el('searchInput').value='';render()})
  el('searchToggle').addEventListener('click',()=>searchbar.classList.toggle('show'))
  el('menuToggle').addEventListener('click',()=>document.querySelector('.nav')?.classList.toggle('show'))
  el('cartToggle').addEventListener('click',()=>cartEl.classList.add('open'))
  el('closeCart').addEventListener('click',()=>cartEl.classList.remove('open'))
  el('searchInput').addEventListener('input',e=>{state.filters.search=e.target.value.trim().toLowerCase();render()})
  el('sortSelect').addEventListener('change',e=>{state.filters.sort=e.target.value;render()})
  el('themeToggle').addEventListener('click',()=>document.body.classList.toggle('dark'))
  document.getElementById('newsletterForm').addEventListener('submit',e=>{e.preventDefault();alert('Subscribed')})
  document.getElementById('modalClose').addEventListener('click',closeModal)
}
function checked(name){return [...document.querySelectorAll(`input[name=${name}]:checked`)].map(i=>i.value)}
function render(){
  let items=[...state.products]
  if(state.filters.gender.length) items=items.filter(p=>state.filters.gender.includes(p.gender))
  if(state.filters.category.length) items=items.filter(p=>state.filters.category.includes(p.category))
  if(state.filters.minRating) items=items.filter(p=>p.rating>=state.filters.minRating)
  items=items.filter(p=>p.price<=state.filters.maxPrice)
  if(state.filters.search) items=items.filter(p=>(p.name+' '+p.tags.join(' ')).toLowerCase().includes(state.filters.search))
  if(state.filters.sort==='price-asc') items.sort((a,b)=>a.price-b.price)
  if(state.filters.sort==='price-desc') items.sort((a,b)=>b.price-a.price)
  if(state.filters.sort==='rating-desc') items.sort((a,b)=>b.rating-a.rating)
  grid.innerHTML=items.map(card).join('')
  document.querySelectorAll('.add-btn').forEach(b=>b.addEventListener('click',()=>addToCart(Number(b.dataset.id))))
  document.querySelectorAll('.quick-btn').forEach(b=>b.addEventListener('click',()=>openQuick(Number(b.dataset.id))))
}
function card(p){
  const off=Math.max(0,Math.round((1-p.price/(p.oldPrice||p.price))*100))
  return `<article class="card">
    <div class="media"><img src="${p.image}" alt="${p.name}"></div>
    <div class="info">
      <h3>${p.name}</h3>
      <div class="price"><span>${INR.format(p.price)}</span>${p.oldPrice?`<span class="old">${INR.format(p.oldPrice)}</span>`:''}${off?`<span class="tag">-${off}%</span>`:''}</div>
      <div>⭐ ${p.rating.toFixed(1)}</div>
      <div style="display:flex;gap:8px">
        <button class="btn add-btn" data-id="${p.id}">Add to Cart</button>
        <button class="btn outline quick-btn" data-id="${p.id}">Quick View</button>
      </div>
    </div>
  </article>`
}
function addToCart(id){
  const item=state.cart.find(i=>i.id===id)
  if(item) item.qty+=1
  else{
    const p=state.products.find(x=>x.id===id)
    state.cart.push({id,qty:1,price:p.price,name:p.name,image:p.image})
  }
  save('ff-cart',state.cart);updateCartUI();cartEl.classList.add('open')
}
function updateCartUI(){
  cartCount.textContent=state.cart.reduce((s,i)=>s+i.qty,0)
  cartItems.innerHTML=state.cart.map(ci=>{
    return `<div class="cart-item">
      <img src="${ci.image}" alt="${ci.name}"/>
      <div>
        <div style="font-weight:700">${ci.name}</div>
        <div>${INR.format(ci.price)}</div>
        <div style="display:flex;gap:6px;margin-top:6px">
          <button data-id="${ci.id}" class="qty" data-d="-1">-</button>
          <span>${ci.qty}</span>
          <button data-id="${ci.id}" class="qty" data-d="1">+</button>
          <button data-id="${ci.id}" class="rm">Remove</button>
        </div>
      </div>
      <div style="font-weight:700">${INR.format(ci.price*ci.qty)}</div>
    </div>`
  }).join('')
  document.querySelectorAll('.qty').forEach(b=>b.addEventListener('click',()=>changeQty(Number(b.dataset.id),Number(b.dataset.d))))
  document.querySelectorAll('.rm').forEach(b=>b.addEventListener('click',()=>removeItem(Number(b.dataset.id))))
  const sub=state.cart.reduce((s,i)=>s+i.price*i.qty,0)
  const ship=sub>799?0:59
  el('cartSubtotal').textContent=INR.format(sub)
  el('cartShipping').textContent=INR.format(ship)
  el('cartTotal').textContent=INR.format(sub+ship)
}
function changeQty(id,d){
  const it=state.cart.find(i=>i.id===id); if(!it) return;
  it.qty+=d; if(it.qty<=0) state.cart=state.cart.filter(i=>i.id!==id)
  save('ff-cart',state.cart);updateCartUI()
}
function removeItem(id){state.cart=state.cart.filter(i=>i.id!==id);save('ff-cart',state.cart);updateCartUI()}

function openQuick(id){
  const p=state.products.find(x=>x.id===id)
  const body=document.getElementById('modalBody')
  body.innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div style="background:#0f172a;border:1px solid #1f2a40;border-radius:12px;overflow:hidden"><img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover"/></div>
      <div style="display:grid;gap:10px">
        <h2>${p.name}</h2>
        <div>⭐ ${p.rating.toFixed(1)}</div>
        <div style="display:flex;gap:10px;align-items:center">
          <strong>${INR.format(p.price)}</strong>
          ${p.oldPrice?`<span style="color:#94a3b8;text-decoration:line-through">${INR.format(p.oldPrice)}</span>`:''}
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${p.tags.map(t=>`<span class="badge">${t}</span>`).join('')}
        </div>
        <div style="display:flex;gap:10px">
          <button class="btn" id="quickAdd">Add to Cart</button>
          <button class="btn outline" id="quickClose">Close</button>
        </div>
      </div>
    </div>`
  document.getElementById('quickAdd').addEventListener('click',()=>addToCart(id))
  document.getElementById('quickClose').addEventListener('click',closeModal)
  openModal()
}
function openModal(){document.getElementById('modal').classList.add('show')}
function closeModal(){document.getElementById('modal').classList.remove('show')}

function initCarousel(){
  const track=document.querySelector('.slides')
  const slides=[...document.querySelectorAll('.slide')]
  const dots=el('carouselDots')
  let idx=0, timer
  function go(i){idx=(i+slides.length)%slides.length;track.style.transform=`translateX(-${idx*100}%)`;[...dots.children].forEach((d,j)=>d.classList.toggle('active',j===idx))}
  function autoplay(){timer=setInterval(()=>go(idx+1),5000)}
  slides.forEach((_,i)=>{const b=document.createElement('button');if(i===0)b.classList.add('active');b.addEventListener('click',()=>{go(i);reset()});dots.appendChild(b)})
  document.getElementById('prevSlide').addEventListener('click',()=>{go(idx-1);reset()})
  document.getElementById('nextSlide').addEventListener('click',()=>{go(idx+1);reset()})
  function reset(){clearInterval(timer);autoplay()}
  autoplay()
}

window.addEventListener('DOMContentLoaded',init)
