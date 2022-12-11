let lastKnownScrollPosition = 0;
let scrolling = false;
let nextFeed;
let mute = true;

function addItem(scroll = false) {
  if (scrolling || scroll) {
    console.log('Stop Interval');
    clearInterval(scrollInterval);
    lastKnownScrollPosition++;

    if (lastKnownScrollPosition > 4) {
      lastKnownScrollPosition = 1;
    }

    console.log(lastKnownScrollPosition);

    // let containerList = document.querySelector('.container-list');
    // let arr = ['one', 'two', 'three', 'four'];
    
    // for (let i = 0; i < 4; i++) {
    //   let section = document.createElement('section');
    //   let temp = i + 1;
    //   if (temp > 4) temp = 1;
    //   section.classList.add('container-list__item', arr[temp - 1]);

    //   containerList.append(section);
    // }

    refreshFeed().then((data) => {
      console.log('FEED DATA', data);
      console.log('Received Data');
      appendItems(data);
    });

    scrolling = false;

    console.log('Start Interval');
    scrollInterval = setInterval(addItem, 1000);
  }
}

function appendItems(data) {
  console.log("DATA", data);
  let containerList = document.querySelector('.container-list');
  
  let feed = data.data;
  let success = data.success;

  if (!success) return;

  for (let i = 0; i < feed.length; i++) {

    let type = feed[i].type ? feed[i].type : feed[i].images[0].type;

    console.log("TYPE", type, "FEED", feed[i]);

    if (!type.includes('video/mp4') && !type.includes('image/gif')) {
      console.log("NOT A VIDEO");
      continue;
    }

    console.log("Added to FEED");

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

    video.append(source);
    section.append(video);

    containerList.append(section);

    observer.observe(section);

  }
}

async function refreshFeed() {

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer " + accessToken);
  // myHeaders.append("Authorization", "Client-ID " + clientId);
  myHeaders.append("Accept", "application/json");

  var requestOptions = {
    method: 'GET',
    headers: myHeaders
  };
  
  const response = await fetch("https://api.imgur.com/3/gallery/random/", requestOptions);
  // const response = await fetch("/static/js/viral.json", requestOptions);

  return response.json();
}

const intersectOptions = {
  rootMargin: '0px',
  threshold: 0.2
}

const intersectCallback = (entries, observer) => {
  entries.forEach(entry => {
    let video = entry.target.querySelector('video');
    if (entry.isIntersecting) {
      video.muted = mute;
      video.play();
    } else {
      video.pause();
    }
  });
};

const observer = new IntersectionObserver(intersectCallback, intersectOptions);

let containerFluidList = document.querySelector('.container-fluid--list');

containerFluidList.addEventListener('scroll', (e) => {
  let containerList = document.querySelector('.container-list');

  if (containerList.scrollHeight - containerFluidList.scrollTop <= 2500) scrolling = true;
});

let scrollInterval = setInterval(addItem, 1000);

addItem(true);

let footer = document.querySelector('footer');

footer.addEventListener('click', (e) => {
  mute = false;
});
