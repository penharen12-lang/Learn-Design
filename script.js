// Firebase Configuration
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
    if(prompt("Enter Admin Password:") === "ren penha09082004") {
        isAdmin = true;
        document.getElementById('adminBtn').style.display = 'block';
        alert("Welcome Admin!");
    }
}

function extractUrl(text) {
    const match = text.match(/(https?:\/\/[^\s]+)/g);
    return match ? match[0] : "#";
}

// បើកមើលលម្អិត បូកចំនួន View និងប្តូរ Link ក្នុង Description
function openDetail(title, desc, img, id, currentViews) {
    currentPostId = id;
    const foundUrl = extractUrl(desc);
    
    document.getElementById('detailTitle').innerText = title;
    document.getElementById('detailDescription').innerText = desc;
    document.getElementById('detailImage').src = img;
    
    const wrapper = document.getElementById('imageLinkWrapper');
    wrapper.href = foundUrl;

    // --- ផ្នែកកែសម្រួលថ្មី៖ រាប់ចំនួនមើលតែពេលចុចលើ Link/រូបភាព ប៉ុណ្ណោះ ---
    wrapper.onclick = function() {
        if (foundUrl !== "#") {
            const newViews = (currentViews || 0) + 1;
            // Update ទៅ Firebase តែម្តង
            database.ref('posts/' + id).update({
                views: newViews
            });
        }
    };
    // ----------------------------------------------------------

    if(foundUrl === "#") {
        wrapper.style.pointerEvents = "none";
    } else {
        wrapper.style.pointerEvents = "auto";
    }
    
    document.getElementById('detailModal').style.display = 'flex';
}
function closeDetailModal() { document.getElementById('detailModal').style.display = 'none'; }
function openModal() { document.getElementById('uploadModal').style.display = 'block'; }
function closeModal() { document.getElementById('uploadModal').style.display = 'none'; }

// បង្ហោះថ្មីដោយថែមម៉ោង និងថ្ងៃខែ
async function addNewContent() {
    const title = document.getElementById('titleInput').value;
    const category = document.getElementById('categoryInput').value;
    const desc = document.getElementById('descriptionInput').value;
    const img = document.getElementById('imageUrlInput').value;
    
    if(!title || !img) return alert("Please fill Title and Image Link!");

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const fullDate = `${dateStr} • ${timeStr}`;

    await database.ref('posts').push({ 
        title, 
        category, 
        description: desc, 
        image: img,
        date: fullDate,
        views: 0 
    });

    alert("Post added successfully!");
    closeModal();
    document.getElementById('titleInput').value = "";
    document.getElementById('descriptionInput').value = "";
    document.getElementById('imageUrlInput').value = "";
}

async function deleteItemWithAuth() {
    if(prompt("Confirm Admin Password to delete:") === "ren penha09082004") {
        await database.ref('posts/' + currentPostId).remove();
        alert("Deleted!");
        closeDetailModal();
    }
}

database.ref('posts').on('value', (snap) => {
    allData = [];
    snap.forEach(c => { allData.push({ id: c.key, ...c.val() }); });
    displayNews(allData);
});

// បង្ហាញ Card ជាមួយ Layout ថ្មី និងរូបភ្នែកស្តើងស្អាត
function displayNews(data) {
    const container = document.getElementById('newsContainer');
    container.innerHTML = "";
    [...data].reverse().forEach(item => {
        const safeTitle = item.title.replace(/'/g, "\\'");
        const safeDesc = item.description.replace(/'/g, "\\'");

        container.innerHTML += `
            <div class="news-card" onclick="openDetail('${safeTitle}', '${safeDesc}', '${item.image}', '${item.id}', ${item.views || 0})">
                <img src="${item.image}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                <div class="card-info">
                    <span class="badge">${item.category}</span>
                    <h3>${item.title}</h3>
                    <div class="card-footer-meta">
                        <span class="post-date">${item.date || 'New Post'}</span>
                        <div class="view-count">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="color: #86868b;">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <span class="count-num">${item.views || 0}</span>
                        </div>
                    </div>
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
    const filtered = allData.filter(i => 
        i.title.toLowerCase().includes(t) || 
        i.category.toLowerCase().includes(t)
    );
    displayNews(filtered);
}

function copyToClipboard() {
    const text = document.getElementById('detailDescription').innerText;
    navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard!"));
}