const gotDevices = deviceInfos => {
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    if (deviceInfo.kind == "videoinput") {
      const option1 = document.createElement("option");
      option1.value = `${deviceInfo.deviceId}`;
      option1.innerHTML = `${i} ${deviceInfo.label}`;
      sideCamSelect.appendChild(option1);
      const option2 = document.createElement("option");
      option2.value = `${deviceInfo.deviceId}`;
      option2.innerHTML = `${i} ${deviceInfo.label}`;
      topCamSelect.appendChild(option2);
    }
  }
};

const camSelected = () => {
  console.log(sideCamSelect.value, topCamSelect, "selected");
  localStorage.setItem("sideCam", sideCamSelect.value);
  localStorage.setItem("topCam", topCamSelect.value);
  location.href = "http://localhost:8000/start.html";
};

const sideCamSelect = document.createElement("select");
document.body.appendChild(sideCamSelect);

const topCamSelect = document.createElement("select");
document.body.appendChild(topCamSelect);

const blankOption1 = document.createElement("option");
blankOption1.innerHTML = "-- select side camera --";
sideCamSelect.appendChild(blankOption1);

const blankOption2 = document.createElement("option");
blankOption2.innerHTML = "-- select top camera --";
topCamSelect.appendChild(blankOption2);

const button = document.createElement("button");
button.innerHTML = "Start";
button.addEventListener("click", camSelected);
document.body.appendChild(button);

navigator.mediaDevices.enumerateDevices().then(gotDevices);
