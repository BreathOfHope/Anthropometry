// Document element fields
let canvas;
let ctx;
let camera;

// Image processing fields
let width = 720;
let height = 540;
let pixelHeight;

var repeat = true;

// Main

async function main() {
  console.log("Loading...");
  camera = await loadCamera();
  canvas = createCanvas();
  ctx = canvas.getContext('2d');

  camera.onloadeddata = async function() {
    await bodyPixMainRealtime(camera);
  }
}
  
main();

async function bodyPixMainRealtime(camera) {
  return new Promise((resolve, reject) => {
    setTimeout(async() => {
      loadModel()
        .then(model =>
          segmentCamera(model, camera)
            .then(segmentation =>
              calculatePixelHeight(segmentation)));
      if (repeat) {
        await bodyPixMainRealtime(camera);
      }
    });
  });
}

async function loadModel() {
  console.log("Loading model...")
  const model = await bodyPix.load();
  return model;
}

async function segmentCamera(model, camera) {
  const segmentation = await model.segmentPerson(camera);
  return segmentation;
}

function calculatePixelHeight(segmentation) {
  console.log(segmentation);
  console.log("Calculating pixel height...");

  var top = -1;
  var bottom = -1;

  for (var i = 0; i < segmentation.data.length; i++) {
    if (segmentation.data[i] !== 0) {
      top = i;
      break;
    }
  }

  for (var j = segmentation.data.length - 1; j >= 0; j--) {
    if (segmentation.data[j] !== 0) {
      bottom = j;
      break;
    }
  }

  var topRow = top / segmentation.width;
  var bottomRow = bottom / segmentation.width;

  pixelHeight = parseInt(bottomRow) - parseInt(topRow);
  console.log('Pixel height: ' + pixelHeight);

  result = document.getElementById('result')
  result.innerHTML = 'Pixel height: ' + pixelHeight;
  result.innerHTML += '<br/>';
  result.innerHTML += 'Picture width: ' + segmentation.width;
  result.innerHTML += '<br/>';
  result.innerHTML += 'Picture height: ' + segmentation.height;
}


// Document elements helper methods

async function loadCamera() {
  console.log("Loading camera...");

  const cameraElement = document.createElement('video');
  cameraElement.width = width;
  cameraElement.height = height;
  cameraElement.setAttribute("style", "display: inline;")
  document.body.appendChild(cameraElement);

  const capture = await navigator.mediaDevices.getUserMedia({ video: true });
  cameraElement.srcObject = capture;
  cameraElement.play();

  return cameraElement;
}

function createCanvas() {
  console.log("Creating canvas...");

  const canvasElement = document.createElement('canvas');
  canvasElement.width = width;
  canvasElement.height = height;
  canvasElement.setAttribute("style", "display: none;");
  document.body.appendChild(canvasElement);
  return canvasElement;
}

function redirectNonRealtime() {
  repeat = false;
  window.location.href = window.location.href.slice(0, -8);
}