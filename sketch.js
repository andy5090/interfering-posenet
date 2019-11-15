let videoSide;
let videoTop;
let poseNet;
let poseNetTop;
let rWristX = 0;
let rWristY = 0;
let lWristX = 0;
let lWristY = 0;
let rWristX_Top = 0;
let rWristY_Top = 0;
let lWristX_Top = 0;
let lWristY_Top = 0;

let sideResetCnt = 0;

let paintLineSide;
let paintLineTop;
const paintingArea = "right";

let button;
let painting = false;
let paintAreaText;

let socket = null;

function preload() {
  socket = io("http://localhost:4000/");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  paintLineSide = (width / 16) * 5;
  paintLineTop = (width / 16) * 5;

  const sideCamId = localStorage.getItem("sideCam");
  const topCamId = localStorage.getItem("topCam");

  const constraints1 = {
    video: {
      deviceId: sideCamId
    }
  };

  const constraints2 = {
    video: {
      deviceId: topCamId
    }
  };

  videoSide = createCapture(constraints1);
  videoSide.size(width / 2, height);

  videoTop = createCapture(constraints2);
  videoTop.size(width / 2, height);

  // Create a new poseNet method with a single detection

  const options = {
    architecture: "ResNet50",
    outputStride: 32,
    inputResolution: { width: 257, height: 200 },
    quantBytes: 2
  };

  poseNet = ml5.poseNet(videoSide, modelReady);
  poseNet.on("pose", gotPoses);

  poseNetTop = ml5.poseNet(videoTop, modelReady);
  poseNetTop.on("pose", gotTopPoses);
  // Hide the video element, and just show the canvas
  videoSide.hide();
  videoTop.hide();
  textSize(20);

  setInterval(sendPaintStatus, 100);
}

function sendPaintStatus() {
  socket.emit("getPaintStatus", painting);
}

function sendWristPosition(hand) {
  if (hand === "right")
    socket.emit("wristPosition", {
      side_X: rWristX,
      side_Y: rWristY,
      top_X: rWristX_Top,
      top_Y: rWristY_Top
    });
  else
    socket.emit("wristPosition", {
      side_X: lWristX,
      side_Y: lWristY,
      top_X: lWristX_Top,
      top_Y: lWristY_Top
    });
}

function modelReady() {
  console.log("poseNet ready");
}

function gotPoses(poses) {
  if (poses.length > 0) {
    sideResetCnt = 0;
    const rWX = poses[0].pose.keypoints[10].position.x;
    const rWY = poses[0].pose.keypoints[10].position.y;
    const lWX = poses[0].pose.keypoints[9].position.x;
    const lWY = poses[0].pose.keypoints[9].position.y;
    rWristX = lerp(rWristX, rWX, 0.5);
    rWristY = lerp(rWristY, rWY, 0.5);
    lWristX = lerp(lWristX, lWX, 0.5);
    lWristY = lerp(lWristY, lWY, 0.5);
  } else {
    sideReset();
  }
}

function gotTopPoses(poses) {
  if (poses.length > 0) {
    const rWX = poses[0].pose.keypoints[10].position.x;
    const rWY = poses[0].pose.keypoints[10].position.y;
    const lWX = poses[0].pose.keypoints[9].position.x;
    const lWY = poses[0].pose.keypoints[9].position.y;
    rWristX_Top = lerp(rWristX_Top, rWX, 0.5);
    rWristY_Top = lerp(rWristY_Top, rWY, 0.5);
    lWristX_Top = lerp(lWristX_Top, lWX, 0.5);
    lWristY_Top = lerp(lWristY_Top, lWY, 0.5);
  }
}

let preRX = 0;
let preRY = 0;
function sideReset() {
  if (preRX === rWristX && preRY === rWristY) sideResetCnt++;
  if (sideResetCnt > 40) {
    rWristX = 0;
    rWristY = 0;
    lWristX = 0;
    lWristY = 0;
    rWristX_Top = 0;
    rWristY_Top = 0;
    lWristX_Top = 0;
    lWristY_Top = 0;
    sideResetCnt = 0;
  }
  preRX = rWristX;
  preRY = rWristY;

  sendPaintStatus();
}

function draw() {
  background(0);

  image(videoSide, 0, 0);
  image(videoTop, videoSide.width, 0);

  loadPixels();
  for (let i = 0; i < videoSide.height; i++) {
    for (let j = paintLineSide; j < videoSide.width; j++) {
      const red = pixels[j * 4 + width * 4 * i];
      const blue = pixels[j * 4 + 1 + width * 4 * i];
      const green = pixels[j * 4 + 2 + width * 4 * i];
      const c = color(255 - red, 255 - blue, 255 - green);
      set(j, i, c);
    }
  }

  for (let i = 0; i < videoTop.height; i++) {
    for (
      let j = videoSide.width + paintLineTop;
      j < videoSide.width + videoTop.width;
      j++
    ) {
      const red = pixels[j * 4 + width * 4 * i];
      const blue = pixels[j * 4 + 1 + width * 4 * i];
      const green = pixels[j * 4 + 2 + width * 4 * i];
      const c = color(255 - red, 255 - blue, 255 - green);
      set(j, i, c);
    }
  }
  updatePixels();

  filter(GRAY);

  const wristColor = color(200, 40, 100, 60);
  fill(wristColor);
  noStroke();

  if (paintingArea === "right") {
    if (rWristX > paintLineSide || lWristX > paintLineSide) {
      painting = true;
      if (rWrisX > lWristX) {
        ellipse(rWristX, rWristY, 40);
        ellipse(videoSide.width + rWristX_Top, rWristY_Top, 40);
        sendWristPosition("right");
      } else {
        ellipse(lWristX, lWristY, 40);
        ellipse(videoSide.width + lWristX_Top, lWristY_Top, 40);
        sendWristPosition("left");
      }
    } else {
      painting = false;
    }
  } else if (paintingArea === "left") {
    if (rWristX < paintLineSide) {
      painting = true;
      if (rWrisX < lWristX) {
        ellipse(rWristX, rWristY, 40);
        ellipse(videoSide.width + rWristX_Top, rWristY_Top, 40);
        sendWristPosition("right");
      } else {
        ellipse(lWristX, lWristY, 40);
        ellipse(videoSide.width + lWristX_Top, lWristY_Top, 40);
        sendWristPosition("left");
      }
    } else {
      painting = false;
    }
  }
}

function mouseClicked() {
  if (mouseX < videoSide.width) paintLineSide = mouseX;
  else paintLineTop = mouseX;
}
