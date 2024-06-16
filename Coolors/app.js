//SELCTIONS AND VARIEBLES

const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll(
  ".hue-input, .bright-input, .sat-input"
);
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustBtn = document.querySelectorAll(".adjust");
const closeAdjustments = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".sliders");
const lockBtn = document.querySelectorAll(".lock");
let initialColors;
//FOR LOCAL STARAGE
let savedPalettes = [];

//ADD EVENT LISTENERS
generateBtn.addEventListener("click", randomColors);
sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});
colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});
currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});
popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});
adjustBtn.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustmentPanel(index);
  });
});
closeAdjustments.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeAdjustmentPanel(index);
  });
});
lockBtn.forEach((button, index) => {
  button.addEventListener("click", () => {
    const colorDiv = colorDivs[index];

    // Toggle the "locked" class on the color div
    colorDiv.classList.toggle("locked");

    if (colorDiv.classList.contains("locked")) {
      // If locked, store the current color value
      colorDiv.setAttribute(
        "data-original-color",
        currentHexes[index].innerText
      );
    } else {
      // If unlocked, remove the stored color value
      colorDiv.removeAttribute("data-original-color");
    }
  });
});

lockBtn.forEach((button, index) => {
  let isLocked = false; // Keep track of the lock state

  button.addEventListener("click", () => {
    const colorDiv = colorDivs[index]; // Get the specific color div
    isLocked = !isLocked; // Toggle the lock state

    if (isLocked) {
      button.innerHTML = `<i class="fas fa-lock"></i> `; // Set the closed lock symbol
    } else {
      button.innerHTML = `<i class="fas fa-lock-open"></i>`; // Set the open lock symbol
    }

    colorDiv.classList.toggle("locked", isLocked); // Toggle the "locked" class on that div
  });
});

//FUNCTIONS

//COLOR GENERATOR
function generateHex() {
  const hexColor = chroma.random();

  return hexColor;
}
let randomHex = generateHex();

function randomColors() {
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();
    if (div.classList.contains("locked")) {
      // If locked, use the stored original color value
      initialColors.push(hexText.innerText);
      return;
    } else {
      // If unlocked, generate a new random color
      const randomColor = generateHex();
      initialColors.push(chroma(randomColor).hex());
    }
    //ADDING COLOR  TO BACKGROUND
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;
    //CHECK FOR CONTRAST
    checkTextContrast(randomColor, hexText);
    //INITIALIZE SLIDERS
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });
  resetInputs();
  //CHECK BTN CONTRAST
  adjustBtn.forEach((button, index) => {
    checkTextContrast(initialColors[index], button);
    checkTextContrast(initialColors[index], lockBtn[index]);
  });
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorizeSliders(color, hue, brightness, saturation) {
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);

  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(
    0
  )}, ${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(
    0
  )},${scaleBright(0.5)}, ${scaleBright(1)})`;
  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

function hslControls(e) {
  const index =
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-hue");
  let sliders = e.target.parentElement.querySelectorAll(
    ".hue-input, .bright-input, .sat-input"
  );
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];
  const bgColor = initialColors[index];
  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);
  colorDivs[index].style.backgroundColor = color;
  //COLORIZE SLIDERS
  colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");
  textHex.innerText = color.hex();
  checkTextContrast(color, textHex);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}
function resetInputs() {
  const sliders = document.querySelectorAll(".sliders input");
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-bright")];
      const brightValue = chroma(brightColor).hsl()[2];
      slider.value = Math.floor(brightValue * 100) / 100;
    }
    if (slider.name === "saturation") {
      const satColor = initialColors[slider.getAttribute("data-sat")];
      const satValue = chroma(satColor).hsl()[1];
      slider.value = Math.floor(satValue * 100) / 100;
    }
  });
}
function copyToClipboard(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  const popupBox = popup.children[0];
  popup.classList.add("active");
  popupBox.classList.add("active");
}
function openAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle("active");
}
function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove("active");
}

//SAVE PALETTE AND LOCAL STORGE
const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");
//EVENT LISTENERS
saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);
libraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);

//FUNCTION
function openPalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
}
function closePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
}
function savePalette(e) {
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });
  let paletteNr;
  const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
  if (paletteObjects) {
    paletteNr = paletteObjects.length;
  } else {
    paletteNr = savedPalettes.length;
  }

  const paletteObject = { name, colors, nr: paletteNr };
  savedPalettes.push(paletteObject);
  saveToLocal(paletteObject);
  saveInput.value = "";
  //GENERATE PALETTE FOR LIBRARY
  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObject.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  paletteObject.colors.forEach((smallColor) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = smallColor;
    preview.appendChild(smallDiv);
  });
  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette-btn");
  paletteBtn.classList.add(paletteObject.nr);
  paletteBtn.innerText = "Select";
  const deletaBtn = document.createElement("button");
  deletaBtn.classList.add("delete-palette");
  deletaBtn.classList.add(paletteObject.nr);
  deletaBtn.innerText = "Delete";
  //ATTACH EVENT
  deletaBtn.addEventListener("click", deletePalette);
  paletteBtn.addEventListener("click", (e) => {
    closeLibrary();
    const paletteIndex = e.target.classList[1];
    initialColors = [];
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      const text = colorDivs[index].children[0];
      checkTextContrast(color, text);
      updateTextUI(index);
    });
    resetInputs();
  });

  //APPEND TO LIBRARY
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  palette.appendChild(deletaBtn);
  libraryContainer.children[0].appendChild(palette);
}
function saveToLocal(paletteObject) {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalettes.push(paletteObject);
  localStorage.setItem("palettes", JSON.stringify(localPalettes)); // Corrected key to "palettes"
}
function openLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add("active");
  popup.classList.add("active");
}
function closeLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
  popup.classList.remove("active");
}
function getLocal() {
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));

    savedPalettes = [...paletteObjects];
    paletteObjects.forEach((paletteObject) => {
      //GENERATE PALETTE FOR LIBRARY
      const palette = document.createElement("div");
      palette.classList.add("custom-palette");
      const title = document.createElement("h4");
      title.innerText = paletteObject.name;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");
      paletteObject.colors.forEach((smallColor) => {
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
      });
      const paletteBtn = document.createElement("button");
      paletteBtn.classList.add("pick-palette-btn");
      paletteBtn.classList.add(paletteObject.nr);
      paletteBtn.innerText = "Select";
      const deletaBtn = document.createElement("button");
      deletaBtn.classList.add("delete-palette");
      deletaBtn.classList.add(paletteObject.nr);
      deletaBtn.innerText = "Delete";

      //ATTACH EVENT
      deletaBtn.addEventListener("click", deletePalette);
      paletteBtn.addEventListener("click", (e) => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        paletteObjects[paletteIndex].colors.forEach((color, index) => {
          initialColors.push(color);
          colorDivs[index].style.backgroundColor = color;
          const text = colorDivs[index].children[0];
          checkTextContrast(color, text);
          updateTextUI(index);
        });
        resetInputs();
      });

      //APPEND TO LIBRARY
      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);
      palette.appendChild(deletaBtn);
      libraryContainer.children[0].appendChild(palette);
    });
  }
}
function deletePalette(e) {
  const item = e.target;
  if (item.classList[0] === "delete-palette") {
    const palette = item.parentElement;
    palette.classList.add("fall");
    removeLocalPalette(palette);
    palette.remove();
  }
}
function removeLocalPalette(palette) {
  let localPalettes = JSON.parse(localStorage.getItem("palettes"));
  localPalettes.splice(palette, 1); // Remove the palette at the specified index
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}
getLocal();
randomColors();
