let lastKnownScrollPosition = 0;
let scrolling = false;

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

    scrolling = false;

    console.log('Start Interval');
    scrollInterval = setInterval(addItem, 1000);
  }
}

let containerFluidList = document.querySelector('.container-fluid--list');

containerFluidList.addEventListener('scroll', (e) => {
  let containerList = document.querySelector('.container-list');

  if (containerList.scrollHeight - containerFluidList.scrollTop <= 2000) scrolling = true;
});

let scrollInterval = setInterval(addItem, 1000);