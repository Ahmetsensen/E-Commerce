//! Html'den gelenler
const categoryList = document.querySelector(".categories");
const productList = document.querySelector('.products');
const modal = document.querySelector('.modal-wrapper');
const basketBtn = document.querySelector('#basket-btn');
const closeBtn = document.querySelector('#close-btn');
const basketList = document.querySelector('#list');
const totalInfo = document.querySelector('#total');

//! Olay izleyicileri
//html in yüklneme anini izler:
document.addEventListener('DOMContentLoaded', () => {
  fetchCategories();
  fetchProducts();
});

/*
 *kategori bilgilerini alma
 * 1- api'ye istek at
 * 2- gelen veriyi isle
 * 3 verileri ekrana basacak fonksiyonu calistir
 * 4 hata olusursa kullaniciyi bilgilendir
 */

const baseUrl = `https://fakestoreapi.com`;

function fetchCategories() {
  fetch(`${baseUrl}/products/categories`)
    .then((response) => response.json())
    .then(renderCategories); // then çalıştırıdğı fonksiyon verileri parametre olarak gönderir
  // .catch((err) => alert('Kategorileri alırken bir hata oluştu'));
}

// her bir kategori için ekrana kart oluşturur
function renderCategories(categories) {
  categories.forEach((category) => {
    //1- div oluştur
    const categoryDiv = document.createElement("div");
    //2- dive class ekleme
    categoryDiv.classList.add("category");
    //3- içeriğini belirleme
    const randomNum = Math.round(Math.random() * 1000);
    categoryDiv.innerHTML = `
            <img src="https://picsum.photos/300/300?r=${randomNum}" />
            <h2>${category}</h2>
    `;
    //4- html'e gönderme
    categoryList.appendChild(categoryDiv);
  });
}
//data degiskenini global scope da tnimladik
//bu sayede butun fonksiyonlar budegere erisecek
let data;
//ürünler verisini ceken fonksiyon

async function fetchProducts() {
  try {
    //api ye istek at
    const response = await fetch(`${baseUrl}/products`);
    //gelen cevabi isle
    data = await response.json();

    //ekrana bas
    renderProducts(data);
  } catch (err) {
    //alert("ürünleri alirken bir hata olustu");
  }
}

//ürünleri ekrana bas
function renderProducts(products) {
  //her bir ürün icin ürün karti olusturma
  const cardsHTML = products
    .map(
      (product) => `
  <div class="card">
  <div class="img-wrapper">
  <img src="${product.image} " />
  </div>
  <h4>${product.title} </h4>
  <h4>${product.category} </h4>

  <div class="info">
      <span>${product.price}$ </span>
      <button onclick="addToBasket(${product.id})">in den Einkaufswagen</button>
  </div>
</div>
  `
    )
    .join(' ');

  //hazirladigimiz html i ekrana basma

  productList.innerHTML = cardsHTML;
}

//Sepet Islemleri
let basket = [];
let total = 0;

//modal i acar
basketBtn.addEventListener('click', (e) => {
  modal.classList.add('active');
  renderBasket();
  calculateTotal();
});

//disariya veya x e basinca modali kapatir
document.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("modal-wrapper") ||
    e.target.id === "close-btn"
  ) {
    modal.classList.remove("active");
  }
});

function addToBasket(id) {
  //id sinden yola cikarak objenin degerlerini bulma
  const product = data.find((i) => i.id === id);
  // sepete ürün daha önce eklendiyse bulma
  const found = basket.find((i) => i.id == id);

  if (found) {
    //miktarini arttir
    found.amount++;
  } else {
    //Sepete ürünü ekler
    basket.push({ ...product, amount: 1 });
  }

  //bildirim verme
  Toastify({
    text: "Artikel ist eingetragen",
    duration: 3000,
    close: true,
    gravity: "top", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    },
  }).showToast();
}

//sepete elemanlari lisleleme
function renderBasket() {
  basketList.innerHTML = basket
    .map(
      (item) => `
    <div class="item">
                    <img src="${item.image} ">
                    <h3 class="title">${item.title.slice(0, 20) + "..."} </h3>
                    <h4 class="price">$${item.price} </h4>
                    <p>Menge: ${item.amount} </p>
                    <img onclick="handleDelete(${item.id
                    }) " id="delete-img" src="images/e-trash.png" />
                </div>
    `
    )
    .join(" ");
}

//toplam ürün sayi ve fiyatini hesaplar
function calculateTotal() {
  //reduce diziyi döner ve erlamanlarin belirleridigimiz
  //degerlerini toplar
  const total = basket.reduce((sum, item) => sum + item.price * item.amount, 0);

  //toplam miktar hesaplama
  const amount = basket.reduce((sum, i) => sum + i.amount, 0);

  totalInfo.innerHTML = `
<span id="count">${amount} Artikel</span>
                Summe:
                <span id="price">${total.toFixed(2)} </span>$
`;
}

//elemani siler
function handleDelete(deleteId) {
  //kaldirilacak ürünü diziden cikar
  const newArray = basket.filter((i) => i.id !== deleteId);
  basket = newArray;

  //listeyi günceller
  renderBasket();

  //toplami güncelle
  calculateTotal();
}
