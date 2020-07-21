
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('h2');
const popup = document.querySelector('.copy-container');
const lockButton = document.querySelectorAll(".lock")
const adjustButton = document.querySelectorAll(".adjust");
const closeAdjustments = document.querySelectorAll(".close-adjustment")
const sliderContainers = document.querySelectorAll(".sliders")
let initialColors;

//Uses Local Storage
let savedPalette = [];



sliders.forEach(slider => {
  slider.addEventListener('input',hslControls)
});

colorDivs.forEach((div,index)=>{
  div.addEventListener('change',()=>{
    updateTextUI(index)
  })
})

currentHexes.forEach(hex=>{
  hex.addEventListener('click',()=>{
    copyToClipBoard(hex);
  })
})

popup.addEventListener("transitionend",()=>{
  const popupBox = popup.children[0];
  popup.classList.remove('active');
  popupBox.classList.remove('active')
  }
);

adjustButton.forEach((button,index)=>{
  button.addEventListener('click',()=>{
    openAdjustmentPanel(index);
  })
})

closeAdjustments.forEach((button,index)=>{
  button.addEventListener('click',()=>{
    closeAdjustmentPanel(index);
  })
})

lockButton.forEach(button => {
  button.addEventListener('click',()=>{
    button.parentElement.parentElement.classList.toggle('locked')

    if(button.parentElement.parentElement.classList.contains('locked')){
      button.children[0].innerHTML = '<i class="fas fa-lock"></i>'
    }
    else{
      button.children[0].innerHTML = '<i class="fas fa-lock-open"></i>'
    }
    
  })
})

//Generate Colors
function generateHex(){
  const hexColor = chroma.random();
  //hexColor is an object
  return hexColor
}

function randomColors(){
  initialColors = [];

  colorDivs.forEach((div,index)=>{
    const hexText = div.children[0];
    const randomColor = generateHex();
    

    if(div.classList.contains('locked')){
      initialColors.push(hexText.innerText)
      return;
    }else{
      initialColors.push(chroma(randomColor).hex())
    }
    

    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor.toString().toUpperCase();

    //Check for contrast on slider & lock btns
    const icons = div.querySelectorAll(".controls button")
    for(icon of icons){
      checkTextContrast(randomColor,icon)
    };
    
    //Check for contrast on hexText
    checkTextContrast(randomColor,hexText)
    

    const color = chroma(randomColor)
    const sliders = div.querySelectorAll('.sliders input');
    const hue = sliders[0];
    const brightness = sliders[1]
    const saturation = sliders[2]

    colorizeSliders(color,hue,brightness,saturation);
    
  });
  //Reset Inputs
  resetInputs();

}




function checkTextContrast(color,text){
  const luminance = chroma(color).luminance();
  if (luminance < 0.5){
    text.style.color = "white";
  }else{
    text.style.color = "black";
  }
}

function colorizeSliders(color,hue,brightness,saturation){
  //Scale brightness
  const midBright = color.set('hsl.l',0.5);
  const scaleBright = chroma.scale(["black",midBright,"white"]);
  
  //Scale saturation 
  const noSat = color.set('hsl.s',0);
  const fullSat = color.set('hsl.s',1);
  const scaleSat = chroma.scale([noSat,color,fullSat]);

  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(0)},${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(0)},${scaleBright(0.5)},${scaleBright(1)})`


  hue.style.backgroundImage = `linear-gradient(to right,rgb(204, 75, 75),rgb(204, 204, 75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`

}

function hslControls(e){
    const index = e.target.getAttribute("data-bright") ||
                  e.target.getAttribute("data-hue") ||
                  e.target.getAttribute("data-sat")

    let sliders = e.target.parentElement.querySelectorAll("input[type='range']")
    const hue = sliders[0]
    const brightness = sliders[1]
    const saturation =sliders[2]

    const bgColor = initialColors[index];
    

    let color = chroma(bgColor).set("hsl.s",saturation.value).set("hsl.l",brightness.value).set("hsl.h",hue.value)

    colorDivs[index].style.backgroundColor = color;

    //Colorize sliders
    colorizeSliders(color,hue,brightness,saturation)

}

function updateTextUI(index){
  const activeDiv = colorDivs[index]
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector('h2')
  const icons = activeDiv.querySelectorAll('.controls button')
  
  textHex.innerText = color.hex().toString().toUpperCase();

  checkTextContrast(color,textHex);
  for(icon of icons){
    checkTextContrast(color,icon)
  };
}

function resetInputs(){
  const sliders = document.querySelectorAll(".sliders input");

  sliders.forEach(slider=>{
    if(slider.name === 'hue'){
      const hueColor = initialColors[slider.getAttribute('data-hue')];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
    }
    if(slider.name === 'saturation'){
      const satColor = initialColors[slider.getAttribute('data-sat')]
      const satValue = chroma(satColor).hsl()[1];
      slider.value = Math.floor(satValue*100) /100
    }
    if(slider.name === 'brightness'){
      const brightColor = initialColors[slider.getAttribute('data-bright')]
      const brightValue = chroma(brightColor).hsl()[2];
      slider.value = Math.floor(brightValue*100) /100
    }
    
  })
}

function copyToClipBoard(hex){

  //Copies hex to clipboard
  const el = document.createElement('textarea');
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy')
  document.body.removeChild(el);

  //PopUp Animation
  const popupBox = popup.children[0];
  popup.classList.add("active");
  popupBox.classList.add("active");


}

function openAdjustmentPanel(index){
  sliderContainers[index].classList.toggle("active")
}

function closeAdjustmentPanel(index){
  sliderContainers[index].classList.toggle("active");
}

generateBtn.addEventListener('click',randomColors);

//Implement Save to Palette and Local Storage
const saveBtn = document.querySelector('.save');
const submitsave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');
const libraryContainer = document.querySelector('.library-container');
const libraryBtn= document.querySelector('.library');
const closeLibraryBtn = document.querySelector('.close-library');

saveBtn.addEventListener('click',openPalette);
closeSave.addEventListener('click',closePalette);
submitsave.addEventListener('click',savePalette);
libraryBtn.addEventListener('click',openLibrary);
closeLibraryBtn.addEventListener('click',closeLibrary);

function openPalette(){
  const popup = saveContainer.children[0];
  saveContainer.classList.add('active');
  popup.classList.add('active')

}

function closePalette(){
  const popup = saveContainer.children[0];
  saveContainer.classList.remove('active');
  popup.classList.remove('active')

}

function openLibrary(){
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add('active');
  popup.classList.add('active')
}

function closeLibrary(){
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove('active');
  popup.classList.remove('active')
}

function savePalette(){
  saveContainer.classList.remove('active');
  popup.classList.remove('active')

  //Get userInput for Palette's Name
  const name = saveInput.value;
  //Push existing colors into an array
  const colors = [];

  currentHexes.forEach(hex => {
    colors.push(hex.innerText);
  })

  
  let paletteNum = savedPalette.length;
  //Create palette Object
  const paletteObj = {
    name,
    colors,
    num: paletteNum
  }
  //Push Object into savedPalette
  savedPalette.push(paletteObj)
  savetoLocal(paletteObj)
  saveInput.value = '';

  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.name;
  const preview = document.createElement('div');

  preview.classList.add('small-preview')

  paletteObj.colors.forEach(smallcolor =>{
    const smallDiv = document.createElement('div');
    smallDiv.style.backgroundColor = smallcolor;
    preview.appendChild(smallDiv);
  });

  const paletteBtn = document.createElement('button');
  paletteBtn.classList.add('pick-palette-btn');
  paletteBtn.classList.add(paletteObj.num);
  paletteBtn.innerText = "Select";

  //Add eventListener to Btn;
  paletteBtn.addEventListener('click',e=>{
    closeLibrary();
    const paletteIndex = e.target.classList[1];
    initialColors=[];
    savedPalette[paletteIndex].colors.forEach((color,index)=>{
      initialColors.push(color);
      colorDivs[index].style.backgroundColor=color;
      const text = colorDivs[index].children[0];
      text.innerText = color;
  
    })

    resetInputs();


  })
  //Append to Library
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);


  libraryContainer.children[0].appendChild(palette);
}

function savetoLocal(paletteObj){
  let localPalettes;
  if(localStorage.getItem('palettes')===null){
    localPalettes = [];
  }else{
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }

  localPalettes.push(paletteObj);
  localStorage.setItem('palettes',JSON.stringify(localPalettes));
}

function getLocal(){
  if(localStorage.getItem('palettes')===null){
    localStorage = [];
  }else{
    const paletteObjects = JSON.parse(localStorage.getItem('palettes'))
    paletteObjects.forEach(paletteObj => { 
    
    
    const palette = document.createElement("div");
    palette.classList.add("custom-palette");
    const title = document.createElement("h4");
    title.innerText = paletteObj.name;
    const preview = document.createElement('div');
  
    preview.classList.add('small-preview')
  
    paletteObj.colors.forEach(smallcolor =>{
      const smallDiv = document.createElement('div');
      smallDiv.style.backgroundColor = smallcolor;
      preview.appendChild(smallDiv);
    });
  
    const paletteBtn = document.createElement('button');
    paletteBtn.classList.add('pick-palette-btn');
    paletteBtn.classList.add(paletteObj.num);
    paletteBtn.innerText = "Select";
  
    //Add eventListener to Btn;
    paletteBtn.addEventListener('click',e=>{
      closeLibrary();
      const paletteIndex = e.target.classList[1];
      initialColors=[];
      savedPalette[paletteIndex].colors.forEach((color,index)=>{
        initialColors.push(color);
        colorDivs[index].style.backgroundColor=color;
        const text = colorDivs[index].children[0];
        text.innerText = color;
    
      })
  
      resetInputs();
  
  
    })
    //Append to Library
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
  
  
    libraryContainer.children[0].appendChild(palette);

    })
  }

}

//Clear Library
const clearLibraryBtn = document.querySelector('.delete-library');
clearLibraryBtn.addEventListener('click',()=>{
  localStorage.clear();
  closeLibrary();
  location.reload();
})



getLocal();
randomColors();











