let lastKnownScrollPosition = 0;
let scrolling = false;
let nextFeed;
let mute = true;

// Function to refresh feed on scroll
function addItem(scroll = false) {
  // Check if user is scrolling
  if (scrolling || scroll) {
    clearInterval(scrollInterval);
    lastKnownScrollPosition++;

    // Check if lastKnownScrollPosition is greater than 4
    if (lastKnownScrollPosition > 4) {
      lastKnownScrollPosition = 1;
    }

    // Get next feed from feed array and append to feed container 
    refreshFeed().then((data) => {
      // Append items to feed
      appendItems(data);
    });

    scrolling = false;
    scrollInterval = setInterval(addItem, 1000);
  }
}

// Function to append items to feed
function appendItems(data) {
  let containerList = document.querySelector('.container-list');
  
  let feed = data.data;
  let success = data.success;

  // Check if success is true
  if (!success) return;

  // Loop through feed
  for (let i = 0; i < feed.length; i++) {

    // save feed type to variable
    let type = feed[i].type ? feed[i].type : feed[i].images[0].type;

    // Check if type is not video or gif
    if (!type.includes('video/mp4') && !type.includes('image/gif')) {
      continue;
    }

    // Create elements
    let section = document.createElement('section');
    section.classList.add('container-list__item');
    section.setAttribute('data-id', feed[i].id);

    let video = document.createElement('video');
    video.classList.add('container-list__item--video');
    video.setAttribute('loop', 'loop');
    video.setAttribute('playsinline', 'playsinline');
    video.setAttribute('poster', (feed[i].gifv ? feed[i].mp4 : feed[i].images[0].gifv));

    let source = document.createElement('source');
    source.setAttribute('type', 'video/mp4');

    source.setAttribute('src', (feed[i].mp4 ? feed[i].mp4 : feed[i].images[0].mp4));

    // Append elements to DOM
    video.append(source);
    section.append(video);

    containerList.append(section);

    // Create observer
    observer.observe(section);
  }
}

// Function to refresh feed from API and return JSON data as promise
async function refreshFeed() {

  // Create headers
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer " + accessToken);
  myHeaders.append("Accept", "application/json");

  var requestOptions = {
    method: 'GET',
    headers: myHeaders
  };
  
  // Fetch data from API
  const response = await fetch("https://api.imgur.com/3/gallery/random/", requestOptions);

  //check if status is 200 else fetch from local json file
  if (response.status !== 200) {
    response = await fetch("/static/js/viral.json", requestOptions);
  }

  return response.json();
}

// Create observer options
const intersectOptions = {
  rootMargin: '0px',
  threshold: 0.2
}

// Create observer callback
const intersectCallback = (entries, observer) => {
  entries.forEach(entry => {
    let video = entry.target.querySelector('video');

    // Check if element is intersecting and play video
    if (entry.isIntersecting) {
      video.muted = mute;
      video.play();
    } else { 
      video.pause();
    }
  });
};

// Create observer instance and pass options and callback
const observer = new IntersectionObserver(intersectCallback, intersectOptions);

// Add event listener to container-fluid--list
let containerFluidList = document.querySelector('.container-fluid--list');

containerFluidList.addEventListener('scroll', (e) => {
  let containerList = document.querySelector('.container-list');

  // Check if scroll position is greater than 2500 and set scrolling to true
  if (containerList.scrollHeight - containerFluidList.scrollTop <= 2500) scrolling = true;
});

// create interval to add items to feed
let scrollInterval = setInterval(addItem, 1000);
addItem(true);

// Add event listener to footer
let footer = document.querySelector('footer');

footer.addEventListener('click', (e) => {
  mute = false;
});
