let bookContainer = document.querySelector(".search");
let searchBooks = document.getElementById("search-box");
let read_count = 0;
let fav_count = 0;
const getBooks = async (book) => {
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${book}`
  );
  const data = await response.json();
  return data;
};

const extractThumbnail = ({ imageLinks }) => {
  const DEFAULT_THUMBNAIL = "icons/logo.svg";
  if (!imageLinks || !imageLinks.thumbnail) {
    return DEFAULT_THUMBNAIL;
  }
  return imageLinks.thumbnail.replace("http://", "https://");
};


const drawChartBook = async (subject, startIndex = 0) => {
  let cbookContainer = document.querySelector(`.${subject}`);
  cbookContainer.innerHTML = `<div class='prompt'><div class="loader"></div></div>`;
  const cdata = await getBooks(
    `subject:${subject}&startIndex=${startIndex}&maxResults=10`
  );

  console.log('API Response:', cdata);

  if (cdata.error) {
    cbookContainer.innerHTML = `<div class='prompt'>ツ Limit exceeded! Try after some time</div>`;
  } else if (cdata.totalItems == 0) {
    cbookContainer.innerHTML = `<div class='prompt'>ツ No results, try a different term!</div>`;
  } else if (cdata.totalItems == undefined) {
    cbookContainer.innerHTML = `<div class='prompt'>ツ Network problem!</div>`;
  } else if (!cdata.items || cdata.items.length == 0) {
    cbookContainer.innerHTML = `<div class='prompt'>ツ There is no more result!</div>`;
  } else {
    cbookContainer.innerHTML = cdata.items
      .map(({ volumeInfo, id }) => {
        const bookId = encodeURIComponent(id || `${volumeInfo.title}-${volumeInfo.authors.join('-')}`);
        return `<div class='book' data-bookid='${bookId}' style='background: linear-gradient(${getRandomColor()}, rgba(0, 0, 0, 0));'>
          <button class='view-button' onclick='viewBook("${bookId}")'>
            <img class='thumbnail' src='${extractThumbnail(volumeInfo)}' alt='cover'>
          </button>
          <div class='book-info'>
            <h3 class='book-title'>${volumeInfo.title}</h3>
            <div class='book-authors'>${volumeInfo.authors}</div>
            <div class='info' style='background-color: ${getRandomColor()};'>
              ${volumeInfo.categories === undefined ? "Others" : volumeInfo.categories}
            </div>
          </div>
        </div>`;
      })
      .join("");
  }
};

// Replace the viewBook function with the following code
const viewBook = (bookId) => {
  console.log('Viewing book with ID:', bookId);
  window.open(`/book/${bookId}/`, '_blank');
};

// Add this function to handle closing the modal
const closeModal = () => {
  const modal = document.getElementById('bookModal');
  modal.style.display = 'none';
};

// Update the viewBookModal function to use the closeModal function
const viewBookModal = (volumeInfo) => {
  console.log('Viewing book modal:', volumeInfo);

  const modal = document.getElementById('bookModal');
  modal.innerHTML = ''; // Clear the modal content
  const viewerContainer = document.createElement('div');
  viewerContainer.id = 'viewerContainer';
  modal.appendChild(viewerContainer);

  const viewer = new google.books.DefaultViewer(viewerContainer);
  const bookId = encodeURIComponent(volumeInfo.id || "undefined");
  viewer.load(bookId);

  // Show the modal
  modal.style.display = 'block';

  // Add an event listener to close the modal when clicking outside the viewerContainer
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
};


const drawListBook = async () => {
  if (searchBooks.value.trim() !== "") {
    bookContainer.style.display = "flex";
    bookContainer.innerHTML = `<div class='prompt'><div class="loader"></div></div>`;
    const data = await getBooks(`${searchBooks.value}&maxResults=6`);

    if (data.error) {
      bookContainer.innerHTML = `<div class='prompt'>ツ Limit exceeded! Try after some time</div>`;
    } else if (data.totalItems == 0) {
      bookContainer.innerHTML = `<div class='prompt'>ツ No results, try a different term!</div>`;
    } else if (data.totalItems == undefined) {
      bookContainer.innerHTML = `<div class='prompt'>ツ Network problem!</div>`;
    } else {
      bookContainer.innerHTML = data.items
        .map(({ volumeInfo }) => {
          const bookId = encodeURIComponent(volumeInfo.id || "undefined");
          return `<div class='book' data-bookid='${bookId}' style='background: linear-gradient(${getRandomColor()}, rgba(0, 0, 0, 0));'>
            <button class='view-button' onclick='viewBookModal(${JSON.stringify(volumeInfo)})'>
              <img class='thumbnail' src='${extractThumbnail(volumeInfo)}' alt='cover'>
            </button>
            <div class='book-info'>
              <h3 class='book-title'>${volumeInfo.title}</h3>
              <div class='book-authors'>${volumeInfo.authors}</div>
              <div class='info' style='background-color: ${getRandomColor()};'>
                ${volumeInfo.categories === undefined ? "Others" : volumeInfo.categories}
              </div>
            </div>
          </div>`;
        })
        .join("");
    }
  } else {
    bookContainer.style.display = "none";
  }
};


const addToReadlist = async (title, authors, previewLink, thumbnail) => {

  try {
    const response = await fetch(`/add_to_readlist/${title}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authors,
        previewLink,
        thumbnail,
      }),
    });
    read_count += 1
    const data = await response.json();
    alertMessage = window.alert(data.message); // Display a message to the user (you can customize this)
    setTimeout(() => {
      alertMessage.close();
    }, 1000);
  } catch (error) {
    console.error('Error adding to Readlist:', error);
  }
};

const addToFavourites = async (title, authors, previewLink, thumbnail) => {

  try {
    const response = await fetch(`/add_to_favourites/${title}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authors,
        previewLink,
        thumbnail,
      }),
    });
    fav_count += 1
    const data = await response.json();
    alert(data.message); // Display a message to the user (you can customize this)
  } catch (error) {
    console.error('Error adding to Favourites:', error);
  }
};

// ... (existing code)

// Example usage in your existing code where you handle button clicks
const handleReadlistButtonClick = (title, authors, previewLink, thumbnail) => {
  addToReadlist(title, authors, previewLink, thumbnail);
};

const handleFavouritesButtonClick = (title, authors, previewLink, thumbnail) => {
  addToFavourites(title, authors, previewLink, thumbnail);
};






const updateFilter = ({ innerHTML }, f) => {
  document.getElementById("main").scrollIntoView({
    behavior: "smooth",
  });
  let m;
  switch (f) {
    case "author":
      m = "inauthor:";
      break;
    case "subject":
      m = "subject:";
      break;
  }
  searchBooks.value = m + innerHTML;
  debounce(drawListBook, 1000);
};
const debounce = (fn, time, to = 0) => {
  to ? clearTimeout(to) : (to = setTimeout(drawListBook, time));
};
searchBooks.addEventListener("input", () => debounce(drawListBook, 1000));
document.addEventListener("DOMContentLoaded", () => {
  drawChartBook("inspirational");
  drawChartBook("authors");
  drawChartBook("fiction");
  drawChartBook("poetry");
  drawChartBook("fantasy");
  drawChartBook("business");
  drawChartBook("engineering");

});
let mainNavLinks = document.querySelectorAll(".scrolltoview");
window.addEventListener("scroll", (event) => {
  let fromTop = window.scrollY + 64;
  mainNavLinks.forEach(({ hash, classList }) => {
    let section = document.querySelector(hash);
    if (
      section.offsetTop <= fromTop &&
      section.offsetTop + section.offsetHeight > fromTop
    ) {
      classList.add("current");
    } else {
      classList.remove("current");
    }
  });
});
const getRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}40`;
const toggleSwitch = document.querySelector(
  '.theme-switch input[type="checkbox"]'
);
if (localStorage.getItem("marcdownTheme") == "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
  document
    .querySelector("meta[name=theme-color]")
    .setAttribute("content", "#090b28");
  toggleSwitch.checked = true;
  localStorage.setItem("marcdownTheme", "dark");
} else {
  document.documentElement.setAttribute("data-theme", "light");
  document
    .querySelector("meta[name=theme-color]")
    .setAttribute("content", "#ffffff");
  toggleSwitch.checked = false;
  localStorage.setItem("marcdownTheme", "light");
}
const switchTheme = ({ target }) => {
  if (target.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
    document
      .querySelector("meta[name=theme-color]")
      .setAttribute("content", "#090b28");
    localStorage.setItem("marcdownTheme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    document
      .querySelector("meta[name=theme-color]")
      .setAttribute("content", "#ffffff");
    localStorage.setItem("marcdownTheme", "light");
  }
};
toggleSwitch.addEventListener("change", switchTheme, false);
let startIndex = 0;
const next = (subject) => {
  startIndex += 6;
  if (startIndex >= 0) {
    document.getElementById(`${subject}-prev`).style.display = "inline-flex";
    drawChartBook(subject, startIndex);
  } else {
    document.getElementById(`${subject}-prev`).style.display = "none";
  }
};
const prev = (subject) => {
  startIndex -= 6;
  if (startIndex <= 0) {
    startIndex = 0;
    drawChartBook(subject, startIndex);
    document.getElementById(`${subject}-prev`).style.display = "none";
  } else {
    document.getElementById(`${subject}-prev`).style.display = "inline-flex";
    drawChartBook(subject, startIndex);
  }
};


const modal = document.querySelector(".modal");
const trigger = document.querySelector(".trigger");
const closeButton = document.querySelector(".close-button");
const toggleModal = () => modal.classList.toggle("show-modal");
const windowOnClick = ({ target }) => {
  if (target === modal) {
    toggleModal();
  }
};
trigger.addEventListener("click", toggleModal);
closeButton.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);
let pwaInstalled = localStorage.getItem("pwaInstalled") == "yes";
if (window.matchMedia("(display-mode: standalone)").matches) {
  localStorage.setItem("pwaInstalled", "yes");
  pwaInstalled = true;
}
if (window.navigator.standalone === true) {
  localStorage.setItem("pwaInstalled", "yes");
  pwaInstalled = true;
}
if (pwaInstalled) {
  document.getElementById("installPWA").style.display = "none";
} else {
  document.getElementById("installPWA").style.display = "inline-flex";
}
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  deferredPrompt = e;
});
async function installPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(({ outcome }) => {
      if (outcome === "accepted") {
        console.log("Your PWA has been installed");
      } else {
        console.log("User chose to not install your PWA");
      }
      deferredPrompt = null;
    });
  }
}
window.addEventListener("appinstalled", (evt) => {
  localStorage.setItem("pwaInstalled", "yes");
  pwaInstalled = true;
  document.getElementById("installPWA").style.display = "none";
});

function previewProfilePicture() {
  var input = document.getElementById('profilePictureInput');
  var img = document.querySelector('.upload img');
  var file = input.files[0];

  if (file) {
      var reader = new FileReader();

      reader.onload = function (e) {
          img.src = e.target.result;
      };

      reader.readAsDataURL(file);
  }
}

// Attach the event listener to trigger the preview function when the camera icon is clicked
document.querySelector('.upload .round i').addEventListener('click', function () {
  document.getElementById('profilePictureInput').click();
});


document.addEventListener('DOMContentLoaded', function () {
  var backIcon = document.getElementById('backIcon');
  if (backIcon) {
      backIcon.addEventListener('click', redirectToIndex);
  }

  function redirectToIndex() {
      console.log('Icon clicked!');
      window.location.href = "{% url 'registerApp:index' %}";
  }
});


