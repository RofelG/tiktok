let lastKnownScrollPosition = 0;
let scrolling = false;
let nextFeed;

function addItem() {
  if (scrolling) {
    console.log('Stop Interval');
    clearInterval(scrollInterval);
    lastKnownScrollPosition++;

    if (lastKnownScrollPosition > 4) {
      lastKnownScrollPosition = 1;
    }

    console.log(lastKnownScrollPosition);

    let containerList = document.querySelector('.container-list');
    let arr = ['one', 'two', 'three', 'four'];
    
    for (let i = 0; i < 4; i++) {
      let section = document.createElement('section');
      let temp = i + 1;
      if (temp > 4) temp = 1;
      section.classList.add('container-list__item', arr[temp - 1]);

      containerList.append(section);
    }

    refreshFeed().then((data) => {
      console.log(data);
    });

    scrolling = false;

    console.log('Start Interval');
    scrollInterval = setInterval(addItem, 1000);
  }
}

async function refreshFeed() {

  var myHeaders = new Headers();
  // myHeaders.append("Authorization", "Bearer " + accessToken);
  myHeaders.append("Authorization", "Client-ID " + clientId);
  myHeaders.append("Accept", "application/json");

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  fetch("https://api.imgur.com/3/feed/hot/viral", requestOptions)
    .then(response => response.text())
    .then(result => {
      console.log(result);
      return result;
    })
    .catch(error => console.log('error', error));
}



let containerFluidList = document.querySelector('.container-fluid--list');

containerFluidList.addEventListener('scroll', (e) => {
  let containerList = document.querySelector('.container-list');

  if (containerList.scrollHeight - containerFluidList.scrollTop <= 2500) scrolling = true;
});

let scrollInterval = setInterval(addItem, 1000);