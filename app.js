function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null,response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
// Init http module
const http = customHttp();

const newsService = (function () {
  const apiKey = '247668c33b0a4c90a334aeb34ca21b80';
  const apiUrl = 'https://newsapi.org/v2';

  return {
    topHeadlines(country = 'ru',theme = '',cb) {
      http.get(`${apiUrl}/top-headlines?country=${country}&category=${theme}&apiKey=${apiKey}`, cb)
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb)
    }
  }
})();

//Elements
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const seachInput = form.elements['search'];
const themeSelect = form.elements['theme']

form.addEventListener('submit', (e) => {
  e.preventDefault();
  loadNews();
})

// Init selects
document.addEventListener('DOMContentLoaded', function () {
  M.AutoInit();
  loadNews();
});

//Load news functin
function loadNews() {
  showLoader();

  const country = countrySelect.value;
  const searchText = seachInput.value;
  const theme = themeSelect.value;


  if (!searchText) {
    newsService.topHeadlines(country,theme,onGetResponse);
  } else {
    newsService.everything(searchText,onGetResponse);
  }



  newsService.topHeadlines('ru', onGetResponse)
};

// Get response from server
function onGetResponse(err, res) {
  removePreloader()

  if (err) {
    showAlert(err, 'error-msg');
    return;
  }
  
  renderNews(res.articles)
}

//Render news
function renderNews(news) {
  const newContainer = document.querySelector('.news-container .row');
  if(newContainer.children.length){
    clearContainer(newContainer)
  }
  let fragment = '';

  news.forEach(newItem => {
    const el = newsTemplaide(newItem)
    fragment += el;
  })

  newContainer.insertAdjacentHTML('afterbegin', fragment)
}

//New item templaid function 
function newsTemplaide({ urlToImage, title, url, description }) {
  return `
   <div class= 'col s12'>
    <div class='card'>
      <div class='card-image'>
       <img src='${urlToImage || 'https://www.fda.gov/files/CDER-whatsnew.png'} '>
       <span class='card-title'>${title || ''}</span>
      </div>
      <div class='card-content'>
       <p>${description || ''}</p>
      </div>
      <div class='card-action'>
       <a href='${url}'>Read more</a>
      </div>
    </div>
   </div>
  `
}

//Alert for mistake
function showAlert(msg, type = 'success') {
  m.toast({ html: msg, classes: type });
}

//Clear container
function clearContainer(container) {
  container.innerHTML = '';
}

//Show loader
function showLoader(){
  document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <div class="progress">
      <div class="indeterminate"></div>
    </div>
    `
  );
}

//Remove loader function 
 function removePreloader(){
  const loader = document.querySelector('.progress')
  if(loader){
    loader.remove();
  }
 }