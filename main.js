const apiKey = "IVAtQ4sw9WyzQarvENGqFQ5rrnkblc2peceUB2cY1BikhZE8zovLWzAl"
const inputBox =document.querySelector("input")
const searchBtn = document.getElementById('search-btn')
const orientationBtn = document.getElementById('orientation-btn') 
const gridContainer = document.getElementById('grid-container') 

let curOrientation = 'portrait' 
 let responseList =[];
 let currentQuery;
 let currentProcess = "curatedImages"
 
document.cookie = "mycookie=value; SameSite=None; Secure";

function displayImages(response) { 

    const urls = response.photos.map(photo => photo.src[curOrientation]);  
    
    const box = `<div class="box ${curOrientation}"><img class="w-full h-full rounded-xl" src="" alt=""></div>`;
   
    for (let i = 0; i < 24; i++) {
        const div = document.createElement("div")
        div.innerHTML = box;
        const img = div.querySelector("img")
        img.src = urls[i]
        gridContainer.appendChild(div) 
  
      }
}

// Function to search Images
async function searchImages(query) { 
   
       
    let page = randomPage()
    console.log("page NO: " +page)
    try {
            const data = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=24&page=${page}`, {
                method: "GET",
                headers: { 
                    Authorization: apiKey,
                }
            })
    
            const response = await data.json()
    
            responseList = []
            responseList.push(response)             // store the response in a responseList for later use at orientation button click event
            displayImages(response)   
            currentProcess = 'searchImages' 
            currentQuery = query

        } catch(error) {
            console.error('Error searching for images:', error)
            // handle the error here, e.g. display an error message to the user
        }
}
    

function randomPage() {  
    // The max results we can get with each api call is 8000 and  we are requesting 24 page for each api call
    maxPage= Math.ceil(8000/24)                         
    let page = Math.ceil(Math.random() * maxPage) 
    return page
}

async function curatedImages() {
    let page = randomPage()
    try {   
            const data = await fetch(`https://api.pexels.com/v1/curated/?page=${page}&per_page=24`, {
                method: "GET",
                headers: { 
                    Authorization: apiKey,
                }
            })

            // Store the json and call the displayImages() function 
            const response = await data.json() 
            
            responseList.push(response)            // store the response in a responseList for later use at orientation button click event
            console.log(response)
            displayImages(response)  
            currentProcess = 'curatedImages'

        }   catch(error) {
            console.error('Error searching for images:', error)
            // handle the error here, e.g. display an error message to the user
        }
}

orientationBtn.addEventListener("click", () => {
    const boxes = document.querySelectorAll('.box')
    
    //toggle the curOrientation variable value and gridContainer class .
    if (curOrientation === 'portrait') { 
        curOrientation = "landscape"
        gridContainer.classList.toggle("portrait") 
        gridContainer.classList.toggle("landscape") 

        console.log(gridContainer.classList) 
        
        // use a 2 second gap to play an animation and display the responses
        
        gridContainer.innerHTML = '' 
        if (responseList.length >= 1) {
            responseList.forEach((response) => {
                displayImages(response) 
              
            } ) 
            console.log('line 91 executed. ')
            console.log(responseList)
        }

    } else { 
        curOrientation = 'portrait'
        gridContainer.classList.toggle("portrait") 
        gridContainer.classList.toggle("landscape")

        console.log(gridContainer.classList)

        // use a 2 second gap to play an animation and display the responses
     
        gridContainer.innerHTML = ''
        if (responseList.length >= 1) {
            responseList.forEach((response) => {
                displayImages(response)
              
            } ) 
            console.log('line 110 executed. ')
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
    gridContainer.innerHTML= ''
    
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