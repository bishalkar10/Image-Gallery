const apiKey = "IVAtQ4sw9WyzQarvENGqFQ5rrnkblc2peceUB2cY1BikhZE8zovLWzAl"
const inputBox =document.querySelector("input")
const searchBtn = document.getElementById('search-btn')
const orientationBtn = document.getElementById('orientation-btn') 
const gridContainer = document.getElementById('grid-container') 
const errorBox = document.getElementById('error')

let curOrientation = 'portrait' 
let responseList =[]           // store responses to use at image orientation change
let currentQuery 
let currentPage= 1
let currentProcess = "curatedImages"    //this varible is at scroll handling to decide which function t0 call 
const per_page = 24

// get animation element and add event listener to it
const animatedElement = document.getElementById('animation')

animatedElement.addEventListener('animationend', () => {  
    //get the welcome element and hide it
    const welcome = document.getElementById('welcome') 
    welcome.style.display = 'none'
  
})

function displayImages(response) { 
    // get the urls of the images from the response with current orientation and store them in an array
    const urls = response.photos.map(photo => photo.src[curOrientation])  
    // run a loop to create divs and add the image to it and then append it to the gridContainer
    for (let i = 0; i < per_page; i++) {
        const div = document.createElement("div")
        div.className = `box ${curOrientation}`
        div.innerHTML = `<img class="w-full h-full rounded-xl" src="${urls[i]}" alt="">`
        gridContainer.appendChild(div) 
      }
}

// function to search images asynchrnously
async function searchImages(query, page) {   
    // if the error box is not hidden then hide it
    if (!errorBox.classList.contains('hidden')) {
        errorBox.classList.toggle('grid')
        errorBox.classList.toggle('hidden')
    }
    // use a try catch block to handle errors
    try {
            const data = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=${per_page}&page=${page}`, {
                method: "GET",
                headers: { 
                    Authorization: apiKey,
                }
            })
            // Store the  json 
            const response = await data.json()
            console.log(response)   
            // if response returns an with no photos then throw an error
            if (response.photos.length === 0) {
                throw new Error("Oops! Server didn't return any photos. Try Again :)")
            } 
            // if photos array is not empty then save the responses and call the displayImages() function
            if (response.photos.length !== 0) {
                responseList.push(response)             // store the response in a responseList for later use at orientation button click event
                displayImages(response)   
            }
            currentProcess = 'searchImages' 
            currentPage = page + 1
            // catch the error and display it to the user
        } catch(error) { 
            console.log(error)
            errorBox.classList.add('grid') 
            errorBox.classList.remove('hidden')  
            errorBox.innerHTML = error.message
        }
}
// function to search random images asynchrnously
async function curatedImages() {  
    // get a random page number but it can't exceed 8000/per_page
    maxPage= Math.ceil(8000/per_page)                         
    let page = Math.ceil(Math.random() * maxPage) 
    // if the error box is not hidden then hide it
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
            console.log(response)
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
    
    // toggle the orientation class of the gridContainer 
    // if orientation is portrait then change it to landscape
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
        // if orientation is landscape then change it to portrait
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
        return
    } 
    //empty the innerHTML with every new manual search (scroll searchs aren't manual searchs) and empty the response list array
    gridContainer.innerHTML= ''
    responseList = [] 
    currentPage = 1
    searchImages(query, currentPage) 
    currentQuery = query 
    currentProcess = 'searchImages'
  
})
// add an event listener to the input box to search images when user presses enter
inputBox.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') { 
        event.preventDefault()
        const query = inputBox.value 
        // if the input box is empty then alert the user
        if (query === "") {
            alert("Please Enter some Text")
            return
        } 
        // empty the innerHTML with every new manual search (scroll searchs aren't manual searchs) and empty the response list array
        gridContainer.innerHTML= ''
        responseList = []
        currentPage = 1
        searchImages(query, currentPage) 
        currentQuery = query                       // Save the currentQuery. We will use use this for scrollHandling
        currentProcess = 'searchImages'            // update the currentProcess as searchImages. We will use this for scrollHandling
    }
})
let scrollTimeout

function handleScroll() { 

  clearTimeout(scrollTimeout)
  
  scrollTimeout = setTimeout(function() {
    const scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop 
    const scrollHeight = (document.documentElement && document.documentElement.scrollHeight) || document.body.scrollHeight
    const clientHeight = document.documentElement.clientHeight || window.innerHeight
    const scrolledToBottom = Math.ceil(scrollTop + clientHeight + 100) >= scrollHeight

    if (scrolledToBottom) { 
      if (currentProcess === 'curatedImages') {
        curatedImages()
      } else if (currentProcess === 'searchImages') {
        searchImages(currentQuery, currentPage)
      } else {
        console.log("Exception: unknown currentProcess value")
      }
    } 
  }, 500) 
}
 
// add an event listener to the window to handle the scroll event
window.addEventListener('scroll', handleScroll)
// call the curatedImages() function when the page loads
curatedImages() 
