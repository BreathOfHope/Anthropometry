// Developed by: Abhishek Babu

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
let width = 680;
let height = 510;
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

var flag = true;

// Main
async function main() {
  camera = await loadCamera();
  canvas = createCanvas();
  ctx = canvas.getContext('2d');
}

var modal = document.getElementById("myModal");

var span = document.getElementById("close");

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

function closeModal() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

var downloadCanvas = function(){
  var link = document.createElement('a');
  link.download = 'alavu-mantra_' + localTime + '.png';
  link.href = canvas.toDataURL()
  link.click();
}

var localTime = new Date().toLocaleString('en-GB', { timeZone: 'UTC' })
main();

// Document elements helper methods
async function loadCamera() {
  const cameraElement = document.createElement('video');
  cameraElement.width = width;
  cameraElement.height = height;
  cameraElement.setAttribute("style", "display: inline;")
  document.getElementById('three').appendChild(cameraElement);

  const capture = await navigator.mediaDevices.getUserMedia({ video: true });
  cameraElement.srcObject = capture;
  cameraElement.play();

  return cameraElement;
}

function createCanvas() {
  const canvasElement = document.createElement('canvas');
  canvasElement.width = width;
  canvasElement.height = height;
  canvasElement.setAttribute("style", "display: none;");
  document.getElementById('three').appendChild(canvasElement);
  return canvasElement;
}


// Button onclick functions
function takePicture() { // this is the onclick of the "Take Picture" button
  document.getElementById('pic-button').disabled = true
  document.getElementById('reset-button').disabled = true
  document.getElementById('upload').disabled = true

  camera.setAttribute("style", "display: none;");
  canvas.setAttribute("style", "display: inline;");

  ctx.drawImage(camera, 0, 0, width, height);

  const img = document.getElementById('image');
  img.width = width;
  img.height = height;
  img.setAttribute("style", "display: none;");
  base64img = canvas.toDataURL('image/jpeg', 0.75);
  base64img = base64img.replace('data:image/jpeg;base64,','')
  img.src = canvas.toDataURL('image/jpeg', 1.0);

  bodyPixMain(img);

  $.ajax({
    url: window.location,
    type: "POST",
    data: {
      base64: base64img
    },
    success: function(result) {
      console.log(result)
      if (parseInt(result) == 0) {
        document.getElementById('modal-message').innerHTML = 'No face has been detected. Please ensure the person\'s face is shown in good lighting for the best results.'
        modal.style.display = "block";
      }
      document.getElementById('processing').innerHTML = '&nbsp;'
      actualWeight = parseFloat(result) * ((actualHeight / 100)**2)
      const res = document.getElementById('result')
      res.innerHTML = '<b><u>Predicted results</u></b>'
      res.innerHTML += '<br/>Estimated Height: ' + actualHeight.toFixed(2) + 'cm';
      res.innerHTML += '<br/>Estimated BMI: ' + parseFloat(result).toFixed(2);
      res.innerHTML += '<br/>Estimated Weight: ' + actualWeight.toFixed(2) + 'kg';
      document.getElementById('reset-button').disabled = false
      ctx.fillStyle = 'red';
      ctx.strokeStyle = 'red';
      ctx.font = '12px sans-serif'
      heightText = 'Height: ' + actualHeight.toFixed(2) + 'cm';
      bmiText = 'BMI: ' + parseFloat(result).toFixed(2)
      weightText = 'Weight: ' + actualWeight.toFixed(2) + 'kg';
      ctx.fillText(heightText, 5, canvas.height - 35);
      ctx.fillText(bmiText, 5, canvas.height - 20);
      ctx.fillText(weightText, 5, canvas.height - 5);
      ctx.fillText('Measured by Alavu Mantra at ' + localTime, 5, canvas.height - 50);
      document.getElementById('download-button').setAttribute("style", "display: inline;");
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus)
      console.log(errorThrown)
      document.getElementById('processing').innerHTML = 'Error encountered. Please try again after some time.'
      document.getElementById('reset-button').disabled = false
    }
  })
}

function uploadPicture() {  // this is the onchange of the file selector
  document.getElementById('pic-button').disabled = true
  document.getElementById('reset-button').disabled = true
  document.getElementById('upload').disabled = true
  camera.setAttribute("style", "display: none;");
  canvas.setAttribute("style", "display: inline;");

  var img = document.getElementById('image');

  img.onload = function() {
    if (flag) {
      var MAX_WIDTH = 680;
      var MAX_HEIGHT = 510;
      var width = img.width;
      var height = img.height;
  
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
      if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
      }
  
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      this.src = canvas.toDataURL('image/jpeg', 1.0)

      base64img = canvas.toDataURL('image/jpeg', 0.75);
      base64img = base64img.replace('data:image/jpeg;base64,','')
      bodyPixMain(this);
      $.ajax({
        url: window.location,
        type: "POST",
        data: {
          base64: base64img
        },
        success: function(result) {
          console.log(result)
          if (parseInt(result) == 0) {
            document.getElementById('modal-message').innerHTML = 'No face has been detected. Please ensure the person\'s face is shown in good lighting for the best results.'
            modal.style.display = "block";
          }
          document.getElementById('processing').innerHTML = '&nbsp;'
          actualWeight = parseFloat(result) * ((actualHeight / 100)**2)
          const res = document.getElementById('result')
          res.innerHTML = '<b><u>Predicted results</u></b>'
          res.innerHTML += '<br/>Estimated Height: ' + actualHeight.toFixed(2) + 'cm';
          res.innerHTML += '<br/>Estimated BMI: ' + parseFloat(result).toFixed(2);
          res.innerHTML += '<br/>Estimated Weight: ' + actualWeight.toFixed(2) + 'kg';
          document.getElementById('reset-button').disabled = false
          ctx.fillStyle = 'red';
          ctx.strokeStyle = 'red';
          ctx.font = '12px sans-serif'
          heightText = 'Height: ' + actualHeight.toFixed(2) + 'cm';
          bmiText = 'BMI: ' + parseFloat(result).toFixed(2)
          weightText = 'Weight: ' + actualWeight.toFixed(2) + 'kg';
          ctx.fillText(heightText, 5, canvas.height - 35);
          ctx.fillText(bmiText, 5, canvas.height - 20);
          ctx.fillText(weightText, 5, canvas.height - 5);
          ctx.fillText('Measured by Alavu Mantra at ' + localTime, 5, canvas.height - 50);
          document.getElementById('download-button').setAttribute("style", "display: inline;");
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log(textStatus)
          console.log(errorThrown)
          document.getElementById('processing').innerHTML = 'Error encountered. Please try again after some time.'
          document.getElementById('reset-button').disabled = false
        }
      })
    }
    flag = false
  }

  document.getElementById('uploadLabel').innerHTML = document.getElementById('upload').files[0].name.toString();

  img.src = URL.createObjectURL(document.getElementById('upload').files[0]);
}

function reset() {
  flag = true
  canvas.setAttribute("style", "display: none;");
  document.getElementById('download-button').setAttribute("style", "display: none;");
  camera.setAttribute("style", "display: inline;");
  document.getElementById('processing').innerHTML = '&nbsp;'
  document.getElementById('result').innerHTML = '&nbsp;'
  document.getElementById('pic-button').disabled = false
  document.getElementById('upload').disabled = false
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = 680
  canvas.height = 510
  document.getElementById('upload').value = '';
  document.getElementById('uploadLabel').innerHTML = 'Choose picture'
  document.getElementById('image').remove()
  const img = document.createElement('img')
  img.id = 'image'
  img.setAttribute("style", "display: none;")
  document.body.appendChild(img)
  document.getElementById('modal-message').innerHTML = 'No ArUco marker has been detected. Please use an image with the ArUco marker printout shown in good lighting for the best results. Only BMI is computed now.'
  closeModal()
}

// ArUco helper methods
function arucoMain(imageData) {
  detector = new AR.Detector();
  var markers = detector.detect(imageData);
  if (markers.length < 1 || markers == undefined) {
    modal.style.display = "block";
  }
  drawCorners(markers);
  processCorners(markers);
}

function processCorners(markers) {
  actualHeight = 0;
  actualWidth = 0;

  if (markers.length > 0) {
    /*var xDiff = markers[0].corners[1].x - markers[0].corners[0].x;
    var yDiff = markers[0].corners[2].y - markers[0].corners[1].y;

    var xRatio = arucoDim / xDiff;
    var yRatio = arucoDim / yDiff;

    actualHeight = yRatio * pixelHeight;
    actualWidth = xRatio * pixelWidth;
    */

    var dist1 = distance(markers[0].corners[0], markers[0].corners[1]);
    var dist2 = distance(markers[0].corners[1], markers[0].corners[2]);
    var dist3 = distance(markers[0].corners[2], markers[0].corners[3]);
    var dist4 = distance(markers[0].corners[3], markers[0].corners[0]);
    var avgDist = (dist1 + dist2 + dist3 + dist4) / 4;

    var ratio = arucoDim / avgDist;

    actualHeight = ratio * pixelHeight;
    actualWidth = ratio * pixelWidth;
  }
}

function distance(a, b) {
  var dist = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  return dist;
}


// BodyPix helper methods
function bodyPixMain(img) {
  const processing = document.getElementById('processing')
  processing.innerHTML = '<strong>Processing...</strong>';
  loadModel().then(model =>
    segment(model, img).then(segmentation =>
      calculatePixelHeight(segmentation)));
}

async function loadModel() {
  const model = await bodyPix.load();
  return model;
}

async function segment(model, img) {
  //const segmentation = await model.segmentPerson(img);
  const partSegmentation = await model.segmentPersonParts(img);
  //return [segmentation, partSegmentation];
  return partSegmentation;
}

// Processing methods
function calculatePixelHeight(segmentation) {
  var top = -1;
  var bottom = -1;

  for (var i = 0; i < segmentation.data.length; i++) {
    if (segmentation.data[i] !== -1) {
      top = i;
      break;
    }
  }

  for (var j = segmentation.data.length - 1; j >= 0; j--) {
    if (segmentation.data[j] !== -1) {
      bottom = j;
      break;
    }
  }

  var topRow = top / segmentation.width;
  var bottomRow = bottom / segmentation.width;

  pixelHeight = parseInt(bottomRow) - parseInt(topRow);

  var rightMost = calculatePixelWidth(segmentation);
  drawHeight(pixelHeight, topRow, bottomRow, rightMost);
}

function calculatePixelWidth(segmentation) {

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

  return rightMost;
}

// Drawing methods
function drawHeight(height, yTop, yBottom, rightMost) {
  x = Math.min(parseInt(0.9 * canvas.width), rightMost + 20);

  ctx.fillStyle = 'red';
  ctx.strokeStyle = 'red';

  /*ctx.font = '32px serif'
  yText = parseInt((yTop + yBottom) / 2);
  xText = x + 10;
  maxWidth = parseInt(0.1 * canvas.width) - 10;
  ctx.fillText(height.toString(), xText, yText, maxWidth);*/

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

function showOne() {
  document.getElementById('one').setAttribute("style", "display: block;");
  document.getElementById('two').setAttribute("style", "display: none;");
  document.getElementById('three').setAttribute("style", "display: none;");
  document.getElementById('four').setAttribute("style", "display: none;");
  document.getElementById('five').setAttribute("style", "display: none;");
  if (!document.getElementById("btn1").className.match(/(?:^|\s)active(?!\S)/)) {
    document.getElementById('btn1').className += ' active'
  }
  if (document.getElementById("btn2").className.match(/(?:^|\s)active(?!\S)/)) {
    document.getElementById("btn2").className = document.getElementById("btn2").className.replace( /(?:^|\s)active(?!\S)/g , '' )
  }
  if (document.getElementById("btn3").className.match(/(?:^|\s)active(?!\S)/)) {
    document.getElementById("btn3").className = document.getElementById("btn3").className.replace( /(?:^|\s)active(?!\S)/g , '' )
  }
  if (document.getElementById("btn4").className.match(/(?:^|\s)active(?!\S)/)) {
    document.getElementById("btn4").className = document.getElementById("btn4").className.replace( /(?:^|\s)active(?!\S)/g , '' )
  }
  if (document.getElementById("btn5").className.match(/(?:^|\s)active(?!\S)/)) {
    document.getElementById("btn5").className = document.getElementById("btn5").className.replace( /(?:^|\s)active(?!\S)/g , '' )
  }
}

function showTwo() {
  document.getElementById('two').setAttribute("style", "display: block;");
  document.getElementById('one').setAttribute("style", "display: none;");
  document.getElementById('three').setAttribute("style", "display: none;");
  document.getElementById('four').setAttribute("style", "display: none;");
  document.getElementById('five').setAttribute("style", "display: none;");
  if (!document.getElementById("btn2").className.match(/(?:^|\s)active(?!\S)/)) {
    document.getElementById('btn2').className += ' active'
  }
  if (document.getElementById("btn1").className.match(/(?:^|\s)active(?!\S)/)) {
    document.getElementById("btn1").className = document.getElementById("btn1").className.replace( /(?:^|\s)active(?!\S)/g , '' )
  }
  if (document.getElementById("btn3").className.match(/(?:^|\s)active(?!\S)/)) {
    document.getElementById("btn3").className = document.getElementById("btn3").className.replace( /(?:^|\s)active(?!\S)/g , '' )
  }
  if (document.getElementById("btn4").className.match(/(?:^|\s)active(?!\S)/)) {
    document.getElementById("btn4").className = document.getElementById("btn4").className.replace( /(?:^|\s)active(?!\S)/g , '' )
  }
  if (document.getElementById("btn5").className.match(/(?:^|\s)active(?!\S)/)) {
    document.getElementById("btn5").className = document.getElementById("btn5").className.replace( /(?:^|\s)active(?!\S)/g , '' )
  }
}

function showThree() {
  document.getElementById('three').setAttribute("style", "display: block;");
  document.getElementById('two').setAttribute("style", "display: none;");
  document.getElementById('one').setAttribute("style", "display: none;");
  document.getElementById('four').setAttribute("style", "display: none;");
  document.getElementById('five').setAttribute("style", "display: none;");
  if (!document.getElementById("btn3").className.match(/(?:^|\s)active(?!\S)/)) {
    document.getElementById('btn3').className += ' active'
  }
  if (document.getElementById("btn2").className.match(/(?:^|\s)active(?!\S)/)) {
    document.getElementById("btn2").className = document.getElementById("btn2").className.replace( /(?:^|\s)active(?!\S)/g , '' )
  }
  if (document.getElementById("btn1").className.match(/(?:^|\s)active(?!\S)/)) {
    document.getElementById("btn1").className = document.getElementById("btn1").className.replace( /(?:^|\s)active(?!\S)/g , '' )
  }
  if (document.getElementById("btn4").className.match(/(?:^|\s)active(?!\S)/)) {
    document.getElementById("btn4").className = document.getElementById("btn4").className.replace( /(?:^|\s)active(?!\S)/g , '' )
  }
  if (document.getElementById("btn5").className.match(/(?:^|\s)active(?!\S)/)) {
    document.getElementById("btn5").className = document.getElementById("btn5").className.replace( /(?:^|\s)active(?!\S)/g , '' )
  }
}

function showFour() {
  document.getElementById('four').setAttribute("style", "display: block;");
  document.getElementById('two').setAttribute("style", "display: none;");
  document.getElementById('three').setAttribute("style", "display: none;");
  document.getElementById('one').setAttribute("style", "display: none;");
  document.getElementById('five').setAttribute("style", "display: none;");
  if (!document.getElementById("btn4").className.match(/(?:^|\s)active(?!\S)/)) {
    document.getElementById('btn4').className += ' active'
  }
  if (document.getElementById("btn2").className.match(/(?:^|\s)active(?!\S)/)) {
    document.getElementById("btn2").className = document.getElementById("btn2").className.replace( /(?:^|\s)active(?!\S)/g , '' )
  }
  if (document.getElementById("btn3").className.match(/(?:^|\s)active(?!\S)/)) {
    document.getElementById("btn3").className = document.getElementById("btn3").className.replace( /(?:^|\s)active(?!\S)/g , '' )
  }
  if (document.getElementById("btn1").className.match(/(?:^|\s)active(?!\S)/)) {
    document.getElementById("btn1").className = document.getElementById("btn1").className.replace( /(?:^|\s)active(?!\S)/g , '' )
  }
  if (document.getElementById("btn5").className.match(/(?:^|\s)active(?!\S)/)) {
    document.getElementById("btn5").className = document.getElementById("btn5").className.replace( /(?:^|\s)active(?!\S)/g , '' )
  }
}

function showFive() {
  document.getElementById('five').setAttribute("style", "display: block;");
  document.getElementById('two').setAttribute("style", "display: none;");
  document.getElementById('three').setAttribute("style", "display: none;");
  document.getElementById('four').setAttribute("style", "display: none;");
  document.getElementById('one').setAttribute("style", "display: none;");
  if (!document.getElementById("btn5").className.match(/(?:^|\s)active(?!\S)/)) {
    document.getElementById('btn5').className += ' active'
  }
  if (document.getElementById("btn2").className.match(/(?:^|\s)active(?!\S)/)) {
    document.getElementById("btn2").className = document.getElementById("btn2").className.replace( /(?:^|\s)active(?!\S)/g , '' )
  }
  if (document.getElementById("btn3").className.match(/(?:^|\s)active(?!\S)/)) {
    document.getElementById("btn3").className = document.getElementById("btn3").className.replace( /(?:^|\s)active(?!\S)/g , '' )
  }
  if (document.getElementById("btn4").className.match(/(?:^|\s)active(?!\S)/)) {
    document.getElementById("btn4").className = document.getElementById("btn4").className.replace( /(?:^|\s)active(?!\S)/g , '' )
  }
  if (document.getElementById("btn1").className.match(/(?:^|\s)active(?!\S)/)) {
    document.getElementById("btn1").className = document.getElementById("btn1").className.replace( /(?:^|\s)active(?!\S)/g , '' )
  }
}

// Replace with your view ID.
var VIEW_ID = '235009059';

// Query the API and print the results to the page.
function queryReports() {
  gapi.client.request({
    path: '/v4/reports:batchGet',
    root: 'https://analyticsreporting.googleapis.com/',
    method: 'POST',
    body: {
      reportRequests: [
        {
          viewId: VIEW_ID,
          dateRanges: [
            {
              startDate: '7daysAgo',
              endDate: 'today'
            }
          ],
          metrics: [
            {
              expression: 'ga:sessions'
            }
          ]
        }
      ]
    }
  }).then(displayResults, console.error.bind(console));
}

function displayResults(response) {
  var formattedJson = JSON.stringify(response.result, null, 2);
  document.getElementById('query-output').value = formattedJson;
}
