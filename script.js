// ១. Firebase Config (ប្រើទិន្នន័យរបស់អ្នក)
const firebaseConfig = {
    apiKey: "AIzaSyBVTqgg70M5bE5qMfCAIDhPnBTT7B9sRro",
    authDomain: "learndesignproject.firebaseapp.com",
    projectId: "learndesignproject",
    storageBucket: "learndesignproject.firebasestorage.app",
    messagingSenderId: "701039967719",
    appId: "1:701039967719:web:4b5e12aae9fbec0cb7d142",
    measurementId: "G-84637LF1VZ",
    databaseURL: "https://learndesignproject-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let allData = [];
let currentPostId = null;
let isAdmin = false;

// ២. Admin Login (លេខសម្ងាត់: 123)
function adminLogin() {
    let pw = prompt("Enter Admin Password:");
    if(pw === "123") {
        isAdmin = true;
        document.getElementById('adminBtn').style.display = 'block';
        alert("Admin access granted!");
    } else { alert("Access denied!"); }
}

// ៣. មុខងារទាញយក Link ចេញពី Text
function extractUrl(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = text.match(urlRegex);
    return match ? match[0] : "#";
}

// ៤. បើកមើលលម្អិត និងដាក់ Link ឱ្យរូបភាព
function openDetail(title, desc, img, id) {
    currentPostId = id;
    const foundUrl = extractUrl(desc);
    
    document.getElementById('detailTitle').innerText = title;
    document.getElementById('detailDescription').innerText = desc;
    document.getElementById('detailImage').src = img;
    
    // ដាក់ Link ចូលក្នុងរូបភាព
    const linkWrapper = document.getElementById('imageLinkWrapper');
    linkWrapper.href = foundUrl;
    
    // បើរកមិនឃើញ Link ទេ កុំឱ្យវាបង្ហាញ cursor ចុច
    linkWrapper.style.pointerEvents = (foundUrl === "#") ? "none" : "auto";

    document.getElementById('detailModal').style.display = 'block';
    if(isAdmin) document.getElementById('deleteBtn').style.display = 'inline-block';
}

// ៥. មុខងារលុប (ត្រូវសួរ Password ម្ដងទៀត)
async function deleteItemWithAuth() {
    let confirmPw = prompt("Enter Admin Password to delete:");
    if (confirmPw === "123") {
        if (confirm("Delete this?")) {
            await database.ref('posts/' + currentPostId).remove();
            alert("Deleted!");
            closeDetailModal();
        }
    } else { alert("Wrong password!"); }
}

// ៦. បង្ហាញទិន្នន័យ (Real-time)
database.ref('posts').on('value', (snapshot) => {
    allData = [];
    snapshot.forEach((child) => { allData.push({ id: child.key, ...child.val() }); });
    displayNews(allData);
});

function displayNews(dataArray) {
    const container = document.getElementById('newsContainer');
    container.innerHTML = "";
    [...dataArray].reverse().forEach((item) => {
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

// មុខងារបន្ថែម
async function addNewContent() {
    const title = document.getElementById('titleInput').value;
    const category = document.getElementById('categoryInput').value;
    const desc = document.getElementById('descriptionInput').value;
    const imageUrl = document.getElementById('imageUrlInput').value;
    if (!imageUrl || !title) return alert("Fill all info!");
    await database.ref('posts').push({ title, category, description: desc, image: imageUrl });
    closeModal();
}

function closeModal() { document.getElementById('uploadModal').style.display = 'none'; }
function openModal() { document.getElementById('uploadModal').style.display = 'block'; }
function closeDetailModal() { document.getElementById('detailModal').style.display = 'none'; }
function copyToClipboard() {
    navigator.clipboard.writeText(document.getElementById('detailDescription').innerText).then(() => alert("Copied!"));
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