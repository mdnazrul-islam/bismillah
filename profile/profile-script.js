// profile javascript

const logoutButton = document.getElementById('logout');
const profileContainer = document.getElementById('profile-container');
const profilePhoto = document.getElementById('profile-photo');
const profileName = document.getElementById('profile-name');
const profileNameInput = document.getElementById('profile-name-input');
const postForm = document.getElementById('post-form');
const postTitle = document.getElementById('post-title');
const postImage = document.getElementById('post-image');
const postVideo = document.getElementById('post-video');
const postAudio = document.getElementById('post-audio');
const postYoutubeUrl = document.getElementById('post-youtube-url');
const postFile = document.getElementById('post-file');
const postFileImage = document.getElementById('post-file-image'); // Add this for the file image
const postsContainer = document.getElementById('posts-container');
const uploadProgress = document.getElementById('uploadProgress');
const progressBar = document.getElementById('progress-bar');
const editProfileButton = document.getElementById('edit-profile');
const editProfileForm = document.getElementById('edit-profile-form');
const profileImageUpload = document.getElementById('profile-image-upload');
const postContentType = document.getElementById('post-content-type');
const postContentInput = document.getElementById('post-content-input');
const alertBox = document.getElementById('alert-box');
const progressBox = document.getElementById('progress-box');
const leftScrollIndicator = document.getElementById('left-scroll-indicator');
const rightScrollIndicator = document.getElementById('right-scroll-indicator');


function showAlert(message, type) {
  const icon = type === 'success' ? 'success' : 'error';
  const title = type === 'success' ? 'Success!' : 'Error!';

  Swal.fire({
    icon: icon,
    title: title,
    text: message
  });
}

logoutButton.addEventListener('click', () => {
  auth.signOut()
    .then(() => {
      window.location.href = "login.html";
    })
    .catch((error) => {
      console.error('Error signing out:', error);
      showAlert('Error signing out. Please try again.', 'error');
    });
});

auth.onAuthStateChanged((user) => {
  if (user) {
    // Load user's profile data from Realtime Database
    loadProfile(user.uid);

    // Load the user's posts
    loadPosts(user.uid);

    // Handle form submission
    postForm.addEventListener('submit', (event) => {
      event.preventDefault();
      createPost();
    });

    // Edit Profile 
    editProfileButton.addEventListener('click', () => {
      editProfileForm.style.display = 'block';
      editProfileButton.style.display = 'block';
    });

    // Handle Edit Profile Form submission
    editProfileForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const newName = profileNameInput.value;
      if (newName.trim() === '') { 
        // Display SweetAlert error message
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Please enter a name!'
        });
      } else {
        // Proceed with profile update (your existing updateProfile function)
        updateProfile(); 
      }
    });

    // Handle content type change
    postContentType.addEventListener('change', () => {
      const selectedType = postContentType.value;
      postContentInput.querySelectorAll('input').forEach(input => input.style.display = 'none');
      if (selectedType === 'image') {
        postImage.style.display = 'block';
      } else if (selectedType === 'video') {
        postVideo.style.display = 'block';
      } else if (selectedType === 'audio') {
        postAudio.style.display = 'block';
      } else if (selectedType === 'youtube') {
        postYoutubeUrl.style.display = 'block';
      } else if (selectedType === 'file') {
        postFile.style.display = 'block';
        postFileImage.style.display = 'block'; // Show the file image input
      }
    });
  } else {
    window.location.href = "login.html";
  }
});

// Load profile data from Realtime Database
function loadProfile(userId) {
  db.ref('users/' + userId).on('value', (snapshot) => {
    const userData = snapshot.val();
    if (userData) {
      profileName.textContent = userData.profileName;
      if (userData.profilePhoto) {
        profilePhoto.src = userData.profilePhoto;
      } else {
        profilePhoto.src = 'placeholder-profile-photo.jpg'; // Default photo
      }
    }
  });
}

// Load posts from Realtime Database for the current user
function loadPosts(userId) {
  postsContainer.innerHTML = ''; // Clear existing posts

  db.ref('posts').orderByChild('timestamp').on('value', (snapshot) => {
    const posts = [];
    snapshot.forEach((childSnapshot) => {
      const post = childSnapshot.val();
      if (post.authorId === userId) { 
        posts.push({
          key: childSnapshot.key,
          ...post
        });
      }
    });

    // Reverse the array of posts 
    posts.reverse();

    posts.forEach((post) => {
      const date = new Date(post.timestamp);
      const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`; // Formatted date

if (!sessionStorage.getItem(post.key)) {
  // Increment view count in Firebase only if not viewed in this session
  

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
          ${post.contentType === 'image' ? `<div style=" text-align: center;"><img src="${post.imageUrl}" alt="${post.title}" class="post-image"></div>` : ''}
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
        <button class="delete-button" data-post-id="${post.key}"><i class="fa fa-trash"></i></button>
      `;

      postsContainer.appendChild(postElement);
      const deleteButton = postElement.querySelector('.delete-button');
      deleteButton.addEventListener('click', () => {
        deletePost(post.key);
      });
    });
  });
}

// Delete a post
function deletePost(postId) {
  db.ref('posts/' + postId).remove()
    .then(() => {
      showAlert('Post deleted successfully!', 'success');
      loadPosts(auth.currentUser.uid); // Reload posts after deletion
    })
    .catch((error) => {
      alert('Error deleting post: ' + error.message);
      showAlert('Error deleting post. Please try again.', 'error');
    });
}

// Create a new post
function createPost() {
  const title = postTitle.value;
  const contentType = postContentType.value;
  const imageFile = postImage.files[0];
  const videoFile = postVideo.files[0];
  const audioFile = postAudio.files[0];
  const youtubeUrl = postYoutubeUrl.value;
  const otherFile = postFile.files[0];
  const fileImage = postFileImage.files[0]; // Get the file image

  if (title && (imageFile || videoFile || audioFile || youtubeUrl || otherFile)) {
    // Show progress bar
    progressBox.style.display = 'block';

    let uploadTask;
    let fileUrl;
    let fileName;
    let fileImageUrl = ''; // Initialize file image URL

    if (contentType === 'image' || contentType === 'video' || contentType === 'audio' || contentType === 'file') {
      // Upload to the second Firebase project's storage
      const storageRef = secondStorage.ref();
      let fileRef;
      if (contentType === 'image') {
        fileRef = storageRef.child(`posts/${imageFile.name}`);
      } else if (contentType === 'video') {
        fileRef = storageRef.child(`posts/${videoFile.name}`);
      } else if (contentType === 'audio') {
        fileRef = storageRef.child(`posts/${audioFile.name}`);
      } else if (contentType === 'file') {
        fileRef = storageRef.child(`posts/${otherFile.name}`);
      }
      uploadTask = fileRef.put(contentType === 'image' ? imageFile : contentType === 'video' ? videoFile : contentType === 'audio' ? audioFile : otherFile);

      fileUrl = ''; // File URL will be set after upload
      fileName = contentType === 'image' ? imageFile.name : contentType === 'video' ? videoFile.name : contentType === 'audio' ? audioFile.name : otherFile.name;
    } 

    if (uploadTask) {
      // Update progress bar
      uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressBar.style.width = progress + '%';
      }, (error) => {
        alert('Error uploading file: ' + error.message);
        progressBox.style.display = 'none'; // Hide progress bar on error
        showAlert('Error uploading file. Please try again.', 'error');
      }, () => {
        // Get file download URL after upload is complete
        uploadTask.snapshot.ref.getDownloadURL()
          .then((url) => {
            fileUrl = url; // Set the download URL after upload

            // If file image was uploaded, get its download URL
            if (fileImage) {
              const fileImageRef = secondStorage.ref().child(`posts/${fileImage.name}`);
              fileImageRef.getDownloadURL()
                .then((fileImageURL) => {
                  fileImageUrl = fileImageURL; 

                  // Add post to Realtime Database (First Firebase project)
                  addPostToDatabase(fileUrl, fileName, fileImageUrl, title, contentType);
                })
                .catch((error) => {
                  alert('Error getting file image download URL: ' + error.message);
                  progressBox.style.display = 'none';
                  showAlert('Error uploading file image. Please try again.', 'error');
                });
            } else {
              // Add post to Realtime Database (First Firebase project) if no file image
              addPostToDatabase(fileUrl, fileName, '', title, contentType); 
            }
          })
          .catch((error) => {
            alert('Error getting download URL: ' + error.message);
            progressBox.style.display = 'none';
            showAlert('Error getting download URL. Please try again.', 'error');
          });
      });
    } else {
      // Add post to Realtime Database (First Firebase project) for YouTube video
      const newPostRef = db.ref('posts').push();
      const youtubeUrl = postYoutubeUrl.value;
      
      // Extract video ID from YouTube URL
      const videoId = extractVideoId(youtubeUrl);
      
      if (videoId) {
        // Get the current user's info from Realtime Database 
        db.ref('users/' + auth.currentUser.uid).once('value').then(userSnapshot => {
          const userData = userSnapshot.val();

          newPostRef.set({
            title: title,
            youtubeUrl: `https://www.youtube.com/embed/${videoId}`, 
            authorId: auth.currentUser.uid,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            contentType: 'youtube',
            authorName: userData.profileName, // Add the author name
            authorPhoto: userData.profilePhoto // Add the author photo
          })
          .then(() => {
            // Clear form and load updated posts
            postForm.reset();
            progressBox.style.display = 'none'; 
            loadPosts(auth.currentUser.uid); 
            showAlert('Post created successfully!', 'success');
          })
          .catch((error) => {
            alert('Error adding document: ' + error.message);
            progressBox.style.display = 'none'; 
            showAlert('Error creating post. Please try again.', 'error');
          });
        });
      } else {
        showAlert('Invalid YouTube URL', 'error');
      }
    }
  } else {
    showAlert('Please fill all fields.', 'error');
  }
}

// Helper function to add a post to the database
function addPostToDatabase(fileUrl, fileName, fileImageUrl, title, contentType) {
  const newPostRef = db.ref('posts').push();

  // Get the current user's info from Realtime Database 
  db.ref('users/' + auth.currentUser.uid).once('value').then(userSnapshot => {
    const userData = userSnapshot.val();

    const postData = {
      title: title,
      authorId: auth.currentUser.uid,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      contentType: contentType,
      authorName: userData.profileName, // Add the author name
      authorPhoto: userData.profilePhoto // Add the author photo
    };

    if (contentType === 'image') {
      postData.imageUrl = fileUrl;
      
    } else if (contentType === 'video') {
      postData.videoUrl = fileUrl;
      
    } else if (contentType === 'audio') {
      postData.audioUrl = fileUrl;
      
    } else if (contentType === 'file') {
      postData.fileUrl = fileUrl;
      
      postData.fileImage = fileImageUrl; // Store the file image URL
    } else if (contentType === 'youtube') {
      postData.youtubeUrl = youtubeUrl; // Store the YouTube video URL
    }

    newPostRef.set(postData)
      .then(() => {
        // Clear form and load updated posts
        postForm.reset();
        progressBox.style.display = 'none'; // Hide progress bar on success
        loadPosts(auth.currentUser.uid); 
        showAlert('Post created successfully!', 'success');
      })
      .catch((error) => {
        alert('Error adding document: ' + error.message);
        progressBox.style.display = 'none'; // Hide progress bar on error
        showAlert('Error creating post. Please try again.', 'error');
      });
  });
}

// Update user profile in Realtime Database (First Firebase project)
function updateProfile() {
  const newName = profileNameInput.value;
  const imageFile = profileImageUpload.files[0];

  const user = auth.currentUser;
  const userId = user.uid;

  // Show progress bar
  progressBox.style.display = 'block';
  progressBar.style.width = '0%';

  // Upload new profile photo if available
  if (imageFile) {
    const storageRef = storage.ref();
    const imageRef = storageRef.child(`profile-images/${userId}/${imageFile.name}`);
    const uploadTask = imageRef.put(imageFile);

    uploadTask.on('state_changed', (snapshot) => {
      // Update progress bar
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      progressBar.style.width = progress + '%';
    }, (error) => {
      alert('Error uploading profile image: ' + error.message);
      progressBox.style.display = 'none'; // Hide progress bar on error
      showAlert('Error uploading profile image. Please try again.', 'error');
    }, () => {
      // Get image download URL after upload is complete
      uploadTask.snapshot.ref.getDownloadURL()
        .then((imageUrl) => {
          // Update profile data in Realtime Database (First Firebase project)
          db.ref('users/' + userId).update({
            profileName: newName,
            profilePhoto: imageUrl
          })
          .then(() => {
            // Update profile display in UI
            profileName.textContent = newName;
            profilePhoto.src = imageUrl;

            // Hide edit form and show edit button
            editProfileForm.style.display = 'none';
            editProfileButton.style.display = 'block';
            progressBox.style.display = 'none'; // Hide progress bar on success
            showAlert('Profile updated successfully!', 'success');

            // Update the profile photo and name in all the user's posts
            updateProfileInfoInPosts(userId, newName, imageUrl); 
          })
          .catch((error) => {
            alert('Error updating profile: ' + error.message);
            progressBox.style.display = 'none'; // Hide progress bar on error
            showAlert('Error updating profile. Please try again.', 'error');
          });
        })
        .catch((error) => {
          alert('Error getting download URL: ' + error.message);
          progressBox.style.display = 'none'; // Hide progress bar on error
          showAlert('Error getting download URL. Please try again.', 'error');
        });
    });
  } else {
    // Update profile data in Realtime Database (First Firebase project) without changing photo
    db.ref('users/' + userId).update({
      profileName: newName,
    })
    .then(() => {
      // Update profile display in UI
      profileName.textContent = newName;

      // Hide edit form and show edit button
      editProfileForm.style.display = 'none';
      editProfileButton.style.display = 'block';
      showAlert('Profile updated successfully!', 'success');

      // Update the name in all the user's posts
      updateProfileInfoInPosts(userId, newName); 
    })
    .catch((error) => {
      alert('Error updating profile: ' + error.message);
      showAlert('Error updating profile. Please try again.', 'error');
    });
  }
}

// Update the profile photo and name in all the user's posts
function updateProfileInfoInPosts(userId, newName, newProfilePhoto) {
  db.ref('posts').orderByChild('authorId').equalTo(userId).on('value', (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const postId = childSnapshot.key;
      db.ref('posts/' + postId).update({
        authorName: newName, // Update the authorName field
        authorPhoto: newProfilePhoto // Update the authorPhoto field
      })
      .then(() => {
        console.log('Profile photo and name updated in post:', postId);
      })
      .catch((error) => {
        console.error('Error updating profile photo and name in post:', error);
      });
    });
  });
}

// Function to handle scrolling and move scroll indicators
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

// Add event listener for scroll
window.addEventListener('scroll', handleScroll);

// Function to extract YouTube video ID
function extractVideoId(url) {
  // Regular expression to extract the video ID from various YouTube URL formats,
  // handling query parameters
  const videoIdRegex = /(?:v=|embed\/|watch\?v=|youtu.be\/)([^&?]+)/; 
  const match = videoIdRegex.exec(url);
  if (match) {
    return match[1];
  } else {
    return null;
  }
}

            const toggleMenu = () => {
            const menuBar = document.querySelector('.menu-bar');
            const toggleMenu = document.querySelector('.toggle-menu');
            const menuList = document.querySelector('.menu-list');

            toggleMenu.classList.toggle('close');
            menuList.classList.toggle('show');
        }