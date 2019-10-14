let video;
let poseNet;
let rWristX = 0;
let rWristY = 0;
let lWristX = 0;
let lWristY = 0;

let paintStartLine;
let paintingArea = "right";

let button;
let painting = false;
let paintAreaText;

let socket = null;

function getSocket() {
  return socket;
}

function initSocket() {
  const { events } = window;
  socket = aSocket;
  //socket.on(events.getSentimentScore, sendScore);
}

function preload() {
  socket = io("http://localhost:4000/");
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on("pose", gotPoses);
  // Hide the video element, and just show the canvas
  video.hide();
  textSize(20);

  paintStartLine = width / 2;

  button = createButton("Change painting area");
  button.position(width + 20, 20);
  button.mousePressed(changeArea);

  paintAreaText = createDiv("right side");
  paintAreaText.position(width + 20, 60);

  setInterval(sendPaintOrNot, 100);
}

function sendPaintOrNot() {
  getSocket().emit("getPaintStatus", painting);
}

function changeArea() {
  if (paintingArea === "right") {
    paintingArea = "left";
    paintAreaText.html("left side");
  } else {
    paintingArea = "right";
    paintAreaText.html("right side");
  }
}

function modelReady() {
  console.log("poseNet ready");
}

function gotPoses(poses) {
  if (poses.length > 0) {
    let rWX = poses[0].pose.keypoints[10].position.x;
    let rWY = poses[0].pose.keypoints[10].position.y;
    let lWX = poses[0].pose.keypoints[9].position.x;
    let lWY = poses[0].pose.keypoints[9].position.y;
    rWristX = lerp(rWristX, rWX, 0.5);
    rWristY = lerp(rWristY, rWY, 0.5);
    lWristX = lerp(lWristX, lWX, 0.5);
    lWristY = lerp(lWristY, lWY, 0.5);
  }
}

function draw() {
  image(video, 0, 0);

  //let d = dist(rWristX, rWristY, lWristX, lWristY);
  noFill();
  strokeWeight(2);
  stroke(255, 0, 0);
  ellipse(rWristX, rWristY, 30);
  stroke(0, 0, 255);
  ellipse(lWristX, lWristY, 30);

  noStroke();
  fill(255, 0, 0);
  textAlign(RIGHT);
  text("right wrist", rWristX, rWristY - 30);
  fill(0, 0, 255);
  textAlign(LEFT);
  text("left wrist", lWristX, lWristY - 30);

  stroke(0, 255, 0);
  line(paintStartLine, 0, paintStartLine, height);

  noStroke();
  fill(0, 255, 0);
  textAlign(LEFT);
  if (rWristX > paintStartLine || lWristX > paintStartLine) {
    if (paintingArea === "right") {
      text("Painting", 5, 30);
      painting = true;
    } else {
      text("Rest", 5, 30);
      painting = false;
    }
  } else {
    if (paintingArea === "left") {
      text("Painting", 5, 30);
      painting = true;
    } else {
      text("Rest", 5, 30);
      painting = false;
    }
  }
}

function mouseClicked() {
  if (mouseX < width) paintStartLine = mouseX;
}
