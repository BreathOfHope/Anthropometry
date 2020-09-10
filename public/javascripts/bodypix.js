// Physical dimensions
let actualHeight;
let actualWidth;

// ArUco fields
let detector;
let arucoDim = 10.16;

// Document element fields
let canvas;
let ctx;
let camera;

// Image processing fields
let width = 720;
let height = 540;
let pixelHeight;
let pixelWidth;

// Body parts dictionary
let parts = {
  0: "left_face",
  1: "right_face",
  2: "left_upper_arm_front",
  3: "left_upper_arm_back",
  4: "right_upper_arm_front",
  5: "right_upper_arm_back",
  6: "left_lower_arm_front",
  7: "left_lower_arm_back",
  8: "right_lower_arm_front",
  9: "right_lower_arm_back",
  10: "left_hand",
  11: "right_hand",
  12: "torso_front",
  13: "torso_back",
  14: "left_upper_leg_front",
  15: "left_upper_leg_back",
  16: "right_upper_leg_front",
  17: "right_upper_leg_back",
  18: "left_lower_leg_front",
  19: "left_lower_leg_back",
  20: "right_lower_leg_front",
  21: "right_lower_leg_back",
  22: "left_foot",
  23: "right_foot"
}


// Main
async function main() {
  console.log("Loading...");
  camera = await loadCamera();
  canvas = createCanvas();
  ctx = canvas.getContext('2d');
}

// Call to main()
main();


// Document elements helper methods
async function loadCamera() {
  console.log("Loading camera...");

  const cameraElement = document.createElement('video');
  cameraElement.width = width;
  cameraElement.height = height;
  cameraElement.setAttribute("style", "display: inline;")
  document.getElementById('center').appendChild(cameraElement);

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
  document.getElementById('center').appendChild(canvasElement);
  return canvasElement;
}


// Button onclick functions
function takePicture() { // this is the onclick of the "Take Picture" button
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

function uploadPicture() {  // this is the onchange of the file selector
  console.log("Uploading picture");

  camera.setAttribute("style", "display: none;");
  canvas.setAttribute("style", "display: inline;");

  const img = document.getElementById('image');

  img.onload = function() {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  }

  img.src = URL.createObjectURL(document.getElementById('upload').files[0]);

  document.getElementById('uploadLabel').innerHTML = document.getElementById('upload').files[0].name.toString();

  bodyPixMain(img);
}

/*function examplePicture() {
  console.log("Using example picture...");

  camera.setAttribute("style", "display: none;");
  canvas.setAttribute("style", "display: inline;");

  const img = document.getElementById('image');

  img.onload = function() {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  }

  img.src = '/images/forest.jpeg';

  bodyPixMain(img);
}*/

// ArUco helper methods
function arucoMain(imageData) {
  console.log("Detecting ArUco markers...")
  console.log(imageData)
  detector = new AR.Detector();
  console.log(detector)
  var markers = detector.detect(imageData);
  console.log(markers)
  drawCorners(markers);
  processCorners(markers);
}

function processCorners(markers) {
  actualHeight = 0;
  actualWidth = 0;

  if (markers.length > 0) {
    var xDiff = markers[0].corners[1].x - markers[0].corners[0].x;
    var yDiff = markers[0].corners[2].y - markers[0].corners[1].y;

    var xRatio = arucoDim / xDiff;
    var yRatio = arucoDim / yDiff;

    actualHeight = yRatio * pixelHeight;
    actualWidth = xRatio * pixelWidth;
  }

  const result = document.getElementById('result')
  result.innerHTML += '&emsp;';
  result.innerHTML += 'Height: ' + actualHeight;
  result.innerHTML += '&emsp;';
  result.innerHTML += 'Width: ' + actualWidth;
}


// BodyPix helper methods
function bodyPixMain(img) {
  const result = document.getElementById('result')
  result.innerHTML = 'Processing...';
  loadModel().then(model =>
    segment(model, img).then(segmentations =>
      calculatePixelHeight(segmentations)));
}

async function loadModel() {
  console.log("Loading model...")
  const model = await bodyPix.load();
  return model;
}

async function segment(model, img) {
  console.log("Segmenting image...");
  const segmentation = await model.segmentPerson(img);
  const partSegmentation = await model.segmentPersonParts(img);
  return [segmentation, partSegmentation];
}

// Processing methods
function calculatePixelHeight(segmentations) {
  console.log(segmentations[0]);
  console.log(segmentations[1]);
  console.log("Calculating pixel height...");

  var top = -1;
  var bottom = -1;

  for (var i = 0; i < segmentations[0].data.length; i++) {
    if (segmentations[0].data[i] !== 0) {
      top = i;
      break;
    }
  }

  for (var j = segmentations[0].data.length - 1; j >= 0; j--) {
    if (segmentations[0].data[j] !== 0) {
      bottom = j;
      break;
    }
  }

  var topRow = top / segmentations[0].width;
  var bottomRow = bottom / segmentations[0].width;

  pixelHeight = parseInt(bottomRow) - parseInt(topRow);
  console.log('Pixel height: ' + pixelHeight);

  const result = document.getElementById('result')
  result.innerHTML = 'Picture width: ' + segmentations[0].width;
  result.innerHTML += '&emsp;';
  result.innerHTML += 'Picture height: ' + segmentations[0].height;

  var rightMost = calculatePixelWidth(segmentations[1]);
  drawHeight(pixelHeight, topRow, bottomRow, rightMost);
}

function calculatePixelWidth(segmentation) {
  console.log("Calculating pixel width");

  var left = Number.POSITIVE_INFINITY;
  var right = -1;

  var rightMost = -1;

  for (var i = 0; i < segmentation.data.length; i++) {
    if (parts[segmentation.data[i]] === "torso_front") {
      var xCoordinate = i % segmentation.width;
      left = Math.min(left, xCoordinate);
      right = Math.max(right, xCoordinate);
    }
    if (segmentation.data[i] !== -1) {
      var xCoordinate = i % segmentation.width;
      rightMost = Math.max(rightMost, xCoordinate);
    }
  }

  pixelWidth = parseInt(right) - parseInt(left);
  console.log('Pixel width: ' + pixelWidth);

  drawWidth(pixelWidth, left, right);

  return rightMost;
}

// Drawing methods
function drawHeight(height, yTop, yBottom, rightMost) {
  x = Math.min(parseInt(0.9 * canvas.width), rightMost + 20);

  ctx.fillStyle = 'red';
  ctx.strokeStyle = 'red';

  ctx.font = '32px serif'
  yText = parseInt((yTop + yBottom) / 2);
  xText = x + 10;
  maxWidth = parseInt(0.1 * canvas.width) - 10;
  ctx.fillText(height.toString(), xText, yText, maxWidth);

  ctx.beginPath();
  ctx.moveTo(x, yTop);
  ctx.lineTo(x, yBottom);
  ctx.lineWidth = 5;
  ctx.stroke();

  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  arucoMain(imageData);
}

function drawWidth(width, xLeft, xRight) {
  y = parseInt(0.9 * canvas.height);

  ctx.fillStyle = 'red';
  ctx.strokeStyle = 'red';

  ctx.font = '32px serif';
  xText = parseInt((xLeft + xRight) / 2) - 15;
  if (width >= 100) {
    xText -= 15;
  }
  yText = y + 40;
  ctx.fillText(width.toString(), xText, yText);

  ctx.beginPath();
  ctx.moveTo(xLeft, y);
  ctx.lineTo(xRight, y);
  ctx.lineWidth = 5;
  ctx.stroke();
}

function drawCorners(markers) {
  var corners, corner, i, j;

  ctx.lineWidth = 3;

  for (i = 0; i !== markers.length; ++ i) {
    corners = markers[i].corners;
        
    ctx.strokeStyle = "red";
    ctx.beginPath();

    for (j = 0; j !== corners.length; ++ j) {
      corner = corners[j];
      ctx.moveTo(corner.x, corner.y);
      corner = corners[(j + 1) % corners.length];
      ctx.lineTo(corner.x, corner.y);
    }

    ctx.stroke();
    ctx.closePath();

    ctx.strokeStyle = "green";
    ctx.strokeRect(corners[0].x - 2, corners[0].y - 2, 4, 4);
  }
}

/*function redirectRealtime() {
  window.location.href += "realtime";
}*/
