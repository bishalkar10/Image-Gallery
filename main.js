const apiKey = "IVAtQ4sw9WyzQarvENGqFQ5rrnkblc2peceUB2cY1BikhZE8zovLWzAl"
const inputBox =document.querySelector("input")
const searchBtn = document.getElementById('search-btn')
const orientationBtn = document.getElementById('orientation-btn') 
const gridContainer = document.getElementById('grid-container') 
const errorBox = document.getElementById('error')

let curOrientation = 'portrait' 
let responseList =[];           // store responses to use at image orientation change
let currentQuery;
let currentProcess = "curatedImages"    //this varible is at scroll handling to decide which function t0 call 
const per_page = 24

function displayImages(response) { 
    //grab the urls from the response and the store it in a rray
    const urls = response.photos.map(photo => photo.src[curOrientation]);  
    const box = `<div class="box ${curOrientation}"><img class="w-full h-full rounded-xl" src="" alt=""></div>`;
   // run an loop 24 times to append 24 imagediv in the grid-container
    for (let i = 0; i < per_page; i++) {
        const div = document.createElement("div")
        div.innerHTML = box;
        const img = div.querySelector("img")
        img.src = urls[i]
        gridContainer.appendChild(div) 
      }
}

// Function to search Images
async function searchImages(query) {  
    if (!errorBox.classList.contains('hidden')) {
        errorBox.classList.toggle('grid')
        errorBox.classList.toggle('hidden')
    }
   
    let page = randomPage()
    console.log("page NO: " +page)
    try {
            const data = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=${per_page}&page=${page}`, {
                method: "GET",
                headers: { 
                    Authorization: apiKey,
                }
            })
    
            const response = await data.json()
            console.log(response)  
            if (response.photos.length === 0) {
                throw new Error("Oops! Server didn't return any photos. Try Again :)")
            }
            if (response.photos.length !== 0) {
                responseList.push(response)             // store the response in a responseList for later use at orientation button click event
                displayImages(response)   
            }
            currentProcess = 'searchImages' 

        } catch(error) { 
            console.log(error)
            console.log(error.message) 
            errorBox.classList.add('grid') 
            errorBox.classList.remove('hidden')  
            errorBox.innerHTML = error.message

            // handle the error here, e.g. display an error message to the user
        }
}
    
function randomPage() {  
    // The max results we can get with each api call is 8000 and  we are requesting 24 page for each api call
    maxPage= Math.ceil(8000/per_page)                         
    let page = Math.ceil(Math.random() * maxPage) 
    return page
}

async function curatedImages() {
    let page = randomPage() 
    if (!errorBox.classList.contains('hidden')) {
        errorBox.classList.toggle('grid')
        errorBox.classList.toggle('hidden')
    } 
    try {   
            const data = await fetch(`https://api.pexels.com/v1/curated/?page=${page}&per_page=${per_page}`, {
                method: "GET",
                headers: { 
                    Authorization: apiKey,
                }
            })

            // Store the json and call the displayImages() function 
            const response = await data.json() 
            // if server returns an empty array then the throw an error
            if (response.photos.length === 0) {
                throw new Error("Oops! Server didn't return any photos. Try Again :)")
            } //if photos array is not empty then save the responses
            if (response.photos.length !== 0) {
                responseList.push(response)             // store the response in a responseList for later use at orientation button click event
                displayImages(response)   
            }  
            currentProcess = 'curatedImages'

        }   catch(error) {      // handle the error here, e.g. display an error message to the users
            console.error(error.message) 
            errorBox.classList.add('grid') 
            errorBox.classList.remove('hidden')  
            errorBox.innerHTML = error.message
        }
}

orientationBtn.addEventListener("click", () => {
    
    //toggle the curOrientation variable value and gridContainer class .
    if (curOrientation === 'portrait') { 
        curOrientation = "landscape"
        gridContainer.classList.toggle("portrait") 
        gridContainer.classList.toggle("landscape") 

        console.log(gridContainer.classList) 
        // empty the grid and then show the images with changed orientaion
        gridContainer.innerHTML = '' 
        if (responseList.length >= 1) {
            responseList.forEach((response) => {
                displayImages(response) 
              
            } ) 
            console.log(responseList)
        }

    } else { 
        curOrientation = 'portrait'
        gridContainer.classList.toggle("portrait") 
        gridContainer.classList.toggle("landscape") 
        console.log(gridContainer.classList) 

        // empty the grid and then show the images with changed orientaion
        gridContainer.innerHTML = ''
        if (responseList.length >= 1) {
            responseList.forEach((response) => {
                displayImages(response)          
            } ) 
            console.log(responseList)
        }
    }
})

searchBtn.addEventListener("click", () => {
    const query = inputBox.value
    if (query === "") {
        alert("Please Enter some Text")
        return;
    } 
    //empty the innerHTML with every new manual search (scroll searchs aren't manual searchs)
    gridContainer.innerHTML= ''
    //and empty the response list array
    responseList = []
    searchImages(query) 
    currentQuery = query 
    currentProcess = 'searchImages'
  
})

inputBox.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const query = inputBox.value
        if (query === "") {
            alert("Please Enter some Text")
            return;
        }
        gridContainer.innerHTML= ''
        responseList = []
        searchImages(query); 
        currentQuery = query                       // Save the currentQuery. We will use use this for scrollHandling
        currentProcess = 'searchImages'            // update the currentProcess as searchImages. We will use this for scrollHandling
    }
});

function handleScroll() {
    const scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
    const scrollHeight = (document.documentElement && document.documentElement.scrollHeight) || document.body.scrollHeight;
    const clientHeight = document.documentElement.clientHeight || window.innerHeight;
    const scrolledToBottom = Math.ceil(scrollTop + clientHeight)  >= scrollHeight

    if (scrolledToBottom) {
        if (currentProcess === 'curatedImages') {
            curatedImages()
        } else if (currentProcess === 'searchImages') {
            searchImages(currentQuery)
        } else {
            console.log("Exception: unknown currentProcess value")
        }
    } 
} 
window.addEventListener('scroll', handleScroll);

curatedImages()