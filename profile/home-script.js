


    const postsContainer = document.getElementById('posts-container');
const leftScrollIndicator = document.getElementById('left-scroll-indicator');
const rightScrollIndicator = document.getElementById('right-scroll-indicator');

// Function to handle scrolling and move scroll indicators


// Function to load all posts
function loadPosts() {
  postsContainer.innerHTML = ''; // Clear existing posts

  // Use once('value', ...) to load data once
  db.ref('posts').orderByChild('timestamp').once('value', (snapshot) => {
    const posts = [];
    snapshot.forEach((childSnapshot) => {
      const post = childSnapshot.val();
      posts.push({
        key: childSnapshot.key,
        ...post
      });
    });

    // Reverse the array of posts 
    posts.reverse();

    // Display each post
    posts.forEach((post) => {
      const date = new Date(post.timestamp);
      const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;

      // Check if the post is already viewed in the current session
      if (!sessionStorage.getItem(post.key)) {
        // Increment view count in Firebase only if not viewed in this session
        const postRef = db.ref('posts/' + post.key);
        postRef.child('views').transaction((currentViews) => {
          return (currentViews || 0) + 1;
        });

        // Mark this post as viewed in this session
        sessionStorage.setItem(post.key, true);
      }

      const postElement = document.createElement('div');
      postElement.classList.add('post'); 

      postElement.innerHTML = `
        <div class="post-header">
          <img src="${post.authorPhoto}" alt="${post.authorName}" class="author-photo">
          <div class="post-info">
            <p><strong>${post.authorName}</strong></p>
            <p class="post-date">${formattedDate}</p> 
          </div>
        </div>
        <p class="post-title">${post.title}</p> 
        <div class="post-content">
          ${post.contentType === 'image' ? `<div style=" text-align: center;"><img src="${post.imageUrl}" alt="${post.title}" class="post-image"> </div>` : ''}
          ${post.contentType === 'video' ? `<video controls src="${post.videoUrl}" width="100%"></video>` : ''}
          ${post.contentType === 'audio' ? `<audio controls src="${post.audioUrl}"></audio>` : ''}
          ${post.contentType === 'youtube' ? `
            <div class="video-container">
              <iframe src="${post.youtubeUrl}" title="${post.title}" allowfullscreen></iframe>
            </div>
          ` : ''}
          ${post.contentType === 'file' ? `
            <div style=" text-align: center;"><img src="${post.fileImage}" alt="${post.fileName}" class="file-image" style="max-width: 100%; max-height: 200px;"></div> 
            <br /><br />
            <a class="download-btn" href="${post.fileUrl}" download="${post.fileName}">Download File</a>
          ` : ''}
        </div>
        <p class="post-views"><i class="fa fa-eye"></i> ${post.views || 0}</p> <!-- Display view count -->
      `;

      postsContainer.appendChild(postElement);
    });
  });
}
    function handleScroll() {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

      // Calculate positions for scroll indicators
      const leftPosition = (scrollTop / scrollHeight) * 100;
      const rightPosition = 100 - leftPosition;

      // Update indicator positions
      leftScrollIndicator.style.top = `${leftPosition}%`;
      rightScrollIndicator.style.top = `${rightPosition}%`;
    }
    
    window.addEventListener('scroll', handleScroll);

// Load posts on page load
window.addEventListener('load', loadPosts);


        const toggleMenu = () => {
            const menuBar = document.querySelector('.menu-bar');
            const toggleMenu = document.querySelector('.toggle-menu');
            const menuList = document.querySelector('.menu-list');

            toggleMenu.classList.toggle('close');
            menuList.classList.toggle('show');
        }