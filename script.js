const firebaseConfig = {
    apiKey: "AIzaSyBVTqgg70M5bE5qMfCAIDhPnBTT7B9sRro",
    authDomain: "learndesignproject.firebaseapp.com",
    projectId: "learndesignproject",
    storageBucket: "learndesignproject.firebasestorage.app",
    messagingSenderId: "701039967719",
    appId: "1:701039967719:web:4b5e12aae9fbec0cb7d142",
    databaseURL: "https://learndesignproject-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let allData = [];
let currentPostId = null;
let isAdmin = false;

function adminLogin() {
    if(prompt("Enter Admin Password:") === "123") {
        isAdmin = true;
        document.getElementById('adminBtn').style.display = 'block';
        alert("Admin Mode ON");
    }
}

function extractUrl(text) {
    const match = text.match(/(https?:\/\/[^\s]+)/g);
    return match ? match[0] : "#";
}

function openDetail(title, desc, img, id) {
    currentPostId = id;
    const foundUrl = extractUrl(desc);
    document.getElementById('detailTitle').innerText = title;
    document.getElementById('detailDescription').innerText = desc;
    document.getElementById('detailImage').src = img;
    
    const wrapper = document.getElementById('imageLinkWrapper');
    wrapper.href = foundUrl;
    wrapper.style.pointerEvents = (foundUrl === "#") ? "none" : "auto";
    
    document.getElementById('detailModal').style.display = 'block';
    if(isAdmin) document.getElementById('deleteBtn').style.display = 'inline-block';
}

function closeDetailModal() { document.getElementById('detailModal').style.display = 'none'; }
function openModal() { document.getElementById('uploadModal').style.display = 'block'; }
function closeModal() { document.getElementById('uploadModal').style.display = 'none'; }

async function addNewContent() {
    const title = document.getElementById('titleInput').value;
    const category = document.getElementById('categoryInput').value;
    const desc = document.getElementById('descriptionInput').value;
    const img = document.getElementById('imageUrlInput').value;
    
    if(!title || !img) return alert("Please fill info!");
    
    await database.ref('posts').push({ title, category, description: desc, image: img });
    alert("Success!");
    closeModal();
}

async function deleteItemWithAuth() {
    if(prompt("Admin Password to delete:") === "123") {
        await database.ref('posts/' + currentPostId).remove();
        closeDetailModal();
    }
}

database.ref('posts').on('value', (snap) => {
    allData = [];
    snap.forEach(c => { allData.push({ id: c.key, ...c.val() }); });
    displayNews(allData);
});

function displayNews(data) {
    const container = document.getElementById('newsContainer');
    container.innerHTML = "";
    [...data].reverse().forEach(item => {
        container.innerHTML += `
            <div class="news-card" onclick="openDetail('${item.title.replace(/'/g, "\\'")}', '${item.description.replace(/'/g, "\\'")}', '${item.image}', '${item.id}')">
                <img src="${item.image}">
                <div class="card-info">
                    <span class="badge">${item.category}</span>
                    <h3>${item.title}</h3>
                </div>
            </div>
        `;
    });
}

function filterNews(cat, el) {
    document.querySelectorAll('.category-menu li').forEach(li => li.classList.remove('active'));
    el.classList.add('active');
    displayNews(cat === 'All' ? allData : allData.filter(i => i.category === cat));
}

function searchNews() {
    const t = document.getElementById('searchInput').value.toLowerCase();
    displayNews(allData.filter(i => i.title.toLowerCase().includes(t)));
}

function copyToClipboard() {
    navigator.clipboard.writeText(document.getElementById('detailDescription').innerText).then(() => alert("Copied!"));
}