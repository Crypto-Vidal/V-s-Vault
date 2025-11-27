// ==========================================
// AUTHENTICATION & VIDEO MANAGEMENT SYSTEM
// ==========================================

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const loginClose = document.querySelector('.login-close');
const googleSignInBtn = document.getElementById('googleSignInBtn');
const loginError = document.getElementById('loginError');
const editControls = document.getElementById('editControls');
const editUserInfo = document.querySelector('.edit-user-info');
const logoutBtn = document.getElementById('logoutBtn');
const addVideoBtn = document.getElementById('addVideoBtn');
const addVideoModal = document.getElementById('addVideoModal');
const videoClose = document.querySelector('.video-close');
const addVideoForm = document.getElementById('addVideoForm');
const videosGrid = document.querySelector('.videos-grid');

// Current user
let currentUser = null;

// ==========================================
// AUTHENTICATION
// ==========================================

// Check authentication state on page load
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        showEditMode(user);
        loginModal.style.display = 'none';
    } else {
        currentUser = null;
        hideEditMode();
    }
});

// Open login modal
loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
});

// Close login modal
loginClose.addEventListener('click', () => {
    loginModal.style.display = 'none';
    loginError.textContent = '';
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
        loginError.textContent = '';
    }
    if (e.target === addVideoModal) {
        addVideoModal.style.display = 'none';
    }
});

// Google Sign In
googleSignInBtn.addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();

    try {
        const result = await auth.signInWithPopup(provider);
        currentUser = result.user;
        loginModal.style.display = 'none';
        loginError.textContent = '';
        showEditMode(result.user);
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = `Error: ${error.message}`;
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
        hideEditMode();
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// Show edit mode
function showEditMode(user) {
    loginBtn.style.display = 'none';
    editControls.style.display = 'block';
    editUserInfo.textContent = `${user.displayName || user.email}`;

    // Add delete buttons to existing videos
    addDeleteButtons();
}

// Hide edit mode
function hideEditMode() {
    loginBtn.style.display = 'flex';
    editControls.style.display = 'none';

    // Remove delete buttons
    removeDeleteButtons();
}

// ==========================================
// VIDEO MANAGEMENT
// ==========================================

// Open add video modal
addVideoBtn.addEventListener('click', () => {
    addVideoModal.style.display = 'block';
});

// Close add video modal
videoClose.addEventListener('click', () => {
    addVideoModal.style.display = 'none';
    addVideoForm.reset();
});

// Add video form submission
addVideoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser) {
        alert('Please log in first');
        return;
    }

    const videoId = document.getElementById('videoId').value.trim();
    const videoTitle = document.getElementById('videoTitle').value.trim();
    const videoDesc = document.getElementById('videoDesc').value.trim();

    try {
        // Save to Firestore
        await db.collection('videos').add({
            videoId: videoId,
            title: videoTitle,
            description: videoDesc,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: currentUser.uid
        });

        // Add video to DOM
        addVideoToDOM(videoId, videoTitle, videoDesc, null);

        // Close modal and reset form
        addVideoModal.style.display = 'none';
        addVideoForm.reset();

        alert('Video added successfully!');
    } catch (error) {
        console.error('Error adding video:', error);
        alert('Error adding video: ' + error.message);
    }
});

// Load videos from Firestore
async function loadVideos() {
    try {
        const snapshot = await db.collection('videos')
            .orderBy('createdAt', 'desc')
            .get();

        // Clear existing videos (except template examples)
        const existingVideos = videosGrid.querySelectorAll('.video-item:not([data-template])');
        existingVideos.forEach(video => video.remove());

        // Add videos from database
        snapshot.forEach((doc) => {
            const data = doc.data();
            addVideoToDOM(data.videoId, data.title, data.description, doc.id);
        });

        // Hide template videos if there are real videos
        if (!snapshot.empty) {
            const templates = videosGrid.querySelectorAll('.video-item[data-template]');
            templates.forEach(template => template.style.display = 'none');
        }
    } catch (error) {
        console.error('Error loading videos:', error);
    }
}

// Add video to DOM
function addVideoToDOM(videoId, title, description, docId) {
    const videoItem = document.createElement('div');
    videoItem.className = 'video-item';
    if (docId) {
        videoItem.dataset.videoId = docId;
    }

    videoItem.innerHTML = `
        <div class="holo-panel">
            <div class="panel-glow"></div>
            <div class="video-wrapper">
                <iframe
                    src="https://www.youtube.com/embed/${videoId}"
                    title="${title}"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
                </iframe>
            </div>
            <div class="video-info">
                <h3>${title}</h3>
                <p>${description}</p>
            </div>
        </div>
    `;

    videosGrid.insertBefore(videoItem, videosGrid.firstChild);

    // Add delete button if user is logged in
    if (currentUser) {
        addDeleteButtonToVideo(videoItem);
    }
}

// Add delete buttons to videos
function addDeleteButtons() {
    const videoItems = videosGrid.querySelectorAll('.video-item[data-video-id]');
    videoItems.forEach(addDeleteButtonToVideo);
}

// Add delete button to single video
function addDeleteButtonToVideo(videoItem) {
    // Don't add if already exists
    if (videoItem.querySelector('.delete-video-btn')) return;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-video-btn';
    deleteBtn.innerHTML = '🗑️ Delete';
    deleteBtn.onclick = () => deleteVideo(videoItem);

    const panel = videoItem.querySelector('.holo-panel');
    panel.style.position = 'relative';
    panel.appendChild(deleteBtn);
}

// Remove delete buttons
function removeDeleteButtons() {
    const deleteBtns = document.querySelectorAll('.delete-video-btn');
    deleteBtns.forEach(btn => btn.remove());
}

// Delete video
async function deleteVideo(videoItem) {
    if (!confirm('Are you sure you want to delete this video?')) {
        return;
    }

    const docId = videoItem.dataset.videoId;

    try {
        await db.collection('videos').doc(docId).delete();
        videoItem.remove();
        alert('Video deleted successfully!');
    } catch (error) {
        console.error('Error deleting video:', error);
        alert('Error deleting video: ' + error.message);
    }
}

// Mark template videos
document.addEventListener('DOMContentLoaded', () => {
    // Mark existing hardcoded videos as templates
    const existingVideos = videosGrid.querySelectorAll('.video-item');
    existingVideos.forEach(video => {
        video.dataset.template = 'true';
    });

    // Load videos from database
    loadVideos();
});
