// Document element fields
let canvas;
let ctx;
let camera;

// Image processing fields
let width = 720;
let height = 540;
let pixelHeight;


// Main

async function main() {
  console.log("Loading...");
  camera = await loadCamera();
  canvas = createCanvas();
  ctx = canvas.getContext('2d');
}

main();


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

function takePicture() {
  console.log("Taking picture");

  camera.setAttribute("style", "display: none;");
  canvas.setAttribute("style", "display: inline;");

  ctx.drawImage(camera, 0, 0, width, height);

  const img = document.getElementById('image');
  img.width = width;
  img.height = height;
  img.setAttribute("style", "display: none;");
  img.src = canvas.toDataURL('image/jpeg', 1.0);

  bodyPixMain(img);
}

function uploadPicture() {
  console.log("Uploading picture");

  camera.setAttribute("style", "display: none;");

  const img = document.getElementById('image');
  img.src = URL.createObjectURL(document.getElementById('upload').files[0]);

  bodyPixMain(img);
}

function examplePicture() {
  console.log("Using example picture...");

  camera.setAttribute("style", "display: none;");

  const img = document.getElementById('image');
  img.src = '/images/forest.jpeg';

  bodyPixMain(img);
}


// BodyPix helper methods

function bodyPixMain(img) {
  loadModel()
    .then(model =>
      segment(model, img)
        .then(segmentation =>
          calculatePixelHeight(segmentation)));
}

async function loadModel() {
  console.log("Loading model...")
  const model = await bodyPix.load();
  return model;
}

async function segment(model, img) {
  console.log("Segmenting image...");
  const segmentation = await model.segmentPerson(img);
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

  const result = document.getElementById('result')
  result.innerHTML = 'Pixel height: ' + pixelHeight;
  result.innerHTML += '<br/>';
  result.innerHTML += 'Picture width: ' + segmentation.width;
  result.innerHTML += '<br/>';
  result.innerHTML += 'Picture height: ' + segmentation.height;
}

function redirectRealtime() {
  window.location.href += "realtime";
}
