const socket = io("/");

const videoGrid = document.getElementById("video-grid");
const btnTheme = document.querySelector("#theme");
const canvas = document.getElementById("canvas");
const photos = document.getElementById("photos");
const phototBtn = document.getElementById("photot-btn");
const clearBtn = document.getElementById("clear-btn");
const photoFilter = document.getElementById("filter");

// Global Vars
let width = 300,
  height = 0,
  filter = "none",
  streaming = false,
  clicked,
  currentFilter,
  myVideoStream;

// creating a custom peer server
const myPeer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3000",
});

const peers = {};
const myVideo = document.createElement("video");

myVideo.muted = true; // mute ourselves

// connect our video
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    // Filter event
    photoFilter.addEventListener("change", function (e) {
      // Set filter to chosen option
      filter = e.target.value;
      currentFilter = filter;
      // Set filter to video
      myVideo.style.filter = filter;
      sendFilter(currentFilter);
      e.preventDefault();
    });

    // for adding others video to my webpage
    myPeer.on("call", (call) => {
      call.answer(stream);
      const Video = document.createElement("video");
      // Video.classList.add('mx-3');

      call.on("stream", (userVideoStream) => {
        console.log("call stream ");
        addVideoStream(Video, userVideoStream);
      });
    });

    // for new user
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

// listening to all our events

// send an event to our server
myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

socket.on("user-connected", (userId) => {
  console.log("user connected :" + userId);
});

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) {
    console.log("user disconnected :" + userId);

    peers[userId].close();
  }
});

// sending our filtered video to the other users
myPeer.on("data", function (data) {
  let decodedData = new TextDecoder("utf-8").decode(data);
  let filerVideo = dcoument.querySelector("#peerVideo");
  console.log(decodedData);
  filerVideo.style.filter = decodedData;
});
// sending filter value to the clinet
function sendFilter(filter) {
  if (peers.peer) {
    peers.peer.send(filter);
  }
}

function connectToNewUser(userId, stream) {
  //  call an user with a certain id and sending them our audio and video stream
  const call = myPeer.call(userId, stream);
  const Video = document.createElement("video");
  Video.id = "peerVideo";
  // Video.classList.add('mx-3');
  // Video.classList.add('my-3');

  call.on("stream", (userVideoStream) => {
    addVideoStream(Video, userVideoStream);
  });
  call.on("close", () => {
    Video.remove();
  });
  peers[userId] = call;
}

// this function tell the video object to use that stream
function addVideoStream(video, stream) {
  // to play our video
  video.srcObject = stream;

  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
  // videoGrid.appendChild(video);
  sendFilter(currentFilter);
}

// ---------------------- filtering and taking photos------------------------

// displaying canvas
myVideo.addEventListener(
  "canplay",
  function (e) {
    if (!streaming) {
      // Set video / canvas height
      height = myVideo.videoHeight / (myVideo.videoWidth / width);

      myVideo.setAttribute("width", width);
      myVideo.setAttribute("height", height);

      canvas.setAttribute("width", width);
      canvas.setAttribute("height", height);
    }
  },
  false
);

// Photo button event
phototBtn.addEventListener(
  "click",
  function (e) {
    takePicture();

    e.preventDefault();
  },
  false
);

//  function takePicture

function takePicture() {
  console.log("pic");
  // create canvas
  const context = canvas.getContext("2d");
  if (width && height) {
    // set canvas props
    canvas.width = width;
    canvas.height = height;
    // Draw an image of the video on the canvas
    context.drawImage(myVideo, 0, 0, width, height);

    // Create image from the canvas
    const imgUrl = canvas.toDataURL("image/png");

    // Create img element
    const img = document.createElement("img");
    img.classList.add("mx-2");
    img.classList.add("my-2");

    // Set img src
    img.setAttribute("src", imgUrl);

    // Set image filter
    img.style.filter = filter;

    // Add image to photos
    photos.appendChild(img);
  }
}

// Clear event
clearBtn.addEventListener("click", function (e) {
  // Clear photos
  photos.innerHTML = "";
  // Change filter back to none
  filter = "none";
  // Set video filter
  myVideo.style.filter = filter;
  // Reset select list
  photoFilter.selectedIndex = 0;
});

//   changing the theme to light to dark
btnTheme.addEventListener("click", () => {
  var element = document.body;
  element.classList.toggle("dark-mode");
  btnTheme.classList.toggle("btn-mode");
});

// -----------------------------adding mute unmute button---------------

// mute or unmute our video
const muteUnmute = () => {
  console.log(myVideoStream);
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

// for muting our video
const setMuteButton = () => {
  const html = `
      <i class="fa fa-microphone"></i>
      <span>Mute</span>
    `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

// for unmuting our video

const setUnmuteButton = () => {
  const html = `
      <i class="unmute fa fa-microphone-slash"></i>
      <span class="unmute">Unmute</span>
    `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

//   -------------------adding pausa and play video------------

const playStop = () => {
  console.log("object");
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setStopVideo = () => {
  const html = `
      <i class="fas fa-video"></i>
      <span >Stop Video</span>
    `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
    <i class="stop fas fa-video-slash"></i>
      <span class="stop">Play Video</span>
    `;
  document.querySelector(".main__video_button").innerHTML = html;
};

//   ending the meeting

// End Call
document.getElementById("leave").addEventListener("click", endCall);

function endCall() {
  window.location.href = "/thankYou";
}
