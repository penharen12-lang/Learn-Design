// Firebase Configuration (ប្រើទិន្នន័យរបស់អ្នក)
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

// Admin Login
function adminLogin() {
    if(prompt("Enter Admin Password:") === "ren penha") {
        isAdmin = true;
        document.getElementById('adminBtn').style.display = 'block';
        alert("Welcome Admin!");
    }
}

// ទាញ Link ចេញពី Description
function extractUrl(text) {
    const match = text.match(/(https?:\/\/[^\s]+)/g);
    return match ? match[0] : "#";
}

// បើកមើលលម្អិត
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

// បិទ Modal
function closeDetailModal() { document.getElementById('detailModal').style.display = 'none'; }
function openModal() { document.getElementById('uploadModal').style.display = 'block'; }
function closeModal() { document.getElementById('uploadModal').style.display = 'none'; }

// បង្ហោះថ្មី
async function addNewContent() {
    const title = document.getElementById('titleInput').value;
    const category = document.getElementById('categoryInput').value;
    const desc = document.getElementById('descriptionInput').value;
    const img = document.getElementById('imageUrlInput').value;
    
    if(!title || !img) return alert("Please fill Title and Image Link!");
    
    await database.ref('posts').push({ title, category, description: desc, image: img });
    alert("Post added successfully!");
    closeModal();
}

// លុប (ត្រូវការ Password ម្ដងទៀត)
async function deleteItemWithAuth() {
    if(prompt("Confirm Admin Password to delete:") === "123") {
        await database.ref('posts/' + currentPostId).remove();
        alert("Deleted!");
        closeDetailModal();
    }
}

// ទាញទិន្នន័យពី Firebase
database.ref('posts').on('value', (snap) => {
    allData = [];
    snap.forEach(c => { allData.push({ id: c.key, ...c.val() }); });
    displayNews(allData);
});

// បង្ហាញ Card
function displayNews(data) {
    const container = document.getElementById('newsContainer');
    container.innerHTML = "";
    [...data].reverse().forEach(item => {
        container.innerHTML += `
            <div class="news-card" onclick="openDetail('${item.title.replace(/'/g, "\\'")}', '${item.description.replace(/'/g, "\\'")}', '${item.image}', '${item.id}')">
                <img src="${item.image}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                <div class="card-info">
                    <span class="badge">${item.category}</span>
                    <h3>${item.title}</h3>
                </div>
            </div>
        `;
    });
}

// Filter តាមប្រភេទ
function filterNews(cat, el) {
    document.querySelectorAll('.category-menu li').forEach(li => li.classList.remove('active'));
    el.classList.add('active');
    displayNews(cat === 'All' ? allData : allData.filter(i => i.category === cat));
}

// មុខងារ Search
function searchNews() {
    const t = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allData.filter(i => 
        i.title.toLowerCase().includes(t) || 
        i.category.toLowerCase().includes(t)
    );
    displayNews(filtered);
}

// Copy Text
function copyToClipboard() {
    const text = document.getElementById('detailDescription').innerText;
    navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard!"));
}