// Load videos from localStorage and display them on the portfolio page

document.addEventListener('DOMContentLoaded', function() {
    const videosGrid = document.querySelector('.videos-grid');

    if (!videosGrid) return; // Only run on portfolio page

    // Get videos from localStorage
    function getVideos() {
        const videos = localStorage.getItem('portfolioVideos');
        return videos ? JSON.parse(videos) : [];
    }

    // Load and display videos
    function loadVideos() {
        const videos = getVideos();

        // Hide template videos
        const templates = videosGrid.querySelectorAll('.video-item');
        templates.forEach(template => {
            template.style.display = 'none';
        });

        // If no videos, show a message or keep templates visible
        if (videos.length === 0) {
            templates.forEach(template => {
                template.style.display = 'block';
            });
            return;
        }

        // Add videos from localStorage
        videos.forEach(video => {
            const videoItem = createVideoElement(video);
            videosGrid.insertBefore(videoItem, videosGrid.firstChild);
        });
    }

    // Create video element
    function createVideoElement(video) {
        const videoItem = document.createElement('div');
        videoItem.className = 'video-item';

        videoItem.innerHTML = `
            <div class="holo-panel">
                <div class="panel-glow"></div>
                <div class="video-wrapper">
                    <iframe
                        src="https://www.youtube.com/embed/${video.videoId}"
                        title="${video.title}"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen>
                    </iframe>
                </div>
                <div class="video-info">
                    <h3>${video.title}</h3>
                    <p>${video.description}</p>
                </div>
            </div>
        `;

        return videoItem;
    }

    // Load videos on page load
    loadVideos();
});
