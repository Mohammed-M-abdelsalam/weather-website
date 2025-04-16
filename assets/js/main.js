async function getData(location, days){
  return fetch(`https://api.weatherapi.com/v1/forecast.json?key=fc368cc5c6914d61ade80135251504&q=${location}&days=${days}`)
  .then(res => res.json())
  .catch(err => err);
}

function getFormData(){
  const form = document.querySelector('form');
  const data = new FormData(form);
  const location = data.get('location');
  form.reset();
  return location;
}

function getUserLocation(){
  return new Promise((resolve, reject) =>{
    navigator.geolocation.getCurrentPosition(pos =>{
      const {latitude, longitude} = pos.coords;
      return fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=10679f3c4389414088904eac1bc3277b`)
      .then(res => res.json())
      .then(data => {
        resolve(data.results[0].components.country);
      }).catch(err => reject(err));
    });
  });
}

function render(data){
  const error = document.querySelector('.error');
  const currentRoot = document.querySelector('#current-root');
  const forecastRoot = document.querySelector('#forecast-root');
  error.classList.add('d-none');
  currentRoot.innerHTML = `
    <div class="d-flex position-relative">
      <div>
        <p class="fw-thin fs-6">last updated: ${new Date(data.current.last_updated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        <p class="display-1 fw-medium">${data.current.temp_c}<sup>o</sup><span class="fs-2">c, ${data.location.name}</span></p>
        <p class="fw-medium fs-5">It's ${data.current.condition.text}</p>
        <p>wind: <span class="fw-medium">${data.current.wind_kph} kph</span></p>
        <p>humidity: <span class="fw-medium">${data.current.humidity}%</span></p>
      </div>
      <div style="width: 100px;" class="icon position-absolute end-0 top-50 translate-middle">
        <img width="100%" src="${data.current.condition.icon}" alt="${data.current.condition.text}">
      </div>
    </div>
  `
  forecastRoot.innerHTML = ``;
  const fragment = document.createDocumentFragment();
  data.forecast.forecastday.forEach((el) => {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="position-relative shadow rounded" style="min-height: 200px;">
          <div class="position-absolute top-50 start-50 translate-middle text-center">
              <p class="fs-1 fw-bold">${el.day.avgtemp_c} <sup>o</sup>c</p>
              <p class="fs-5 fw-medium">It's ${el.day.condition.text}</p>
              <p class="fw-bold rounded-5 py-2 px-4 bg-primary text-white">${new Date(el.date).toLocaleDateString('en-US', {weekday: 'long'})}</p>
          </div>
      </div>
    `;
    fragment.appendChild(div);
  });
  forecastRoot.appendChild(fragment);
}

function debouncing(func, delay){
  let timer;
  return function(...args){
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  }
}

function main(){
  const form = document.querySelector('form');
  getUserLocation().then(data => {
    const location = getFormData().toLocaleLowerCase() || data.toLocaleLowerCase();
    getData(location, 3).then(data => {
      render(data);
    });
  })
  form.addEventListener('submit', function(e){
    e.preventDefault();
    const location = getFormData().toLocaleLowerCase() || 'cairo';
    getData(location, 3).then(data => {
      if(!data.error){
        render(data);
      }else{
        const error = document.querySelector('.error');
        error.classList.remove('d-none');
        error.textContent = data.error.message;
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelector('.loader').classList.remove('d-none');
  main();
  setTimeout(() => {
    document.querySelector('.loader').classList.add('d-none');
  }, 2500)
});
