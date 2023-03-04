import colors from "./google_cloud_vision_api";


let videoOn = false;

let image = null;
let canvas = null;
let photo = null;
let clickButton = null;

let width = 600;
let height = 600;

let constraints = {
    video: {
        width: {
            ideal: 600 //Change these values later
        },
        height: {
            ideal: 600
        }
    }
};

function startup() {
    input = document.getElementById('image');
    canvas = document.getElementById('canvas');
    //photo = document.getElementById('photo');
    clickButton = document.getElementById('clickButton');

    navigator.permissions.query({ name: 'camera' })
        .then((permissionObj) => {
            console.log(permissionObj.state);
        })
        .catch((error) => {
            console.log('Got error :', error);
        });

    navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
            input.srcObject = stream;
            input.play();
        })
        .catch((err) => {
            console.log(err);
        });

    input.addEventListener(
        "canplay",
        (ev) => {
            if (!videoOn) {
                //height = (image.videoHeight / image.videoWidth) * width;

                input.setAttribute("width", width);
                input.setAttribute("height", height);
                canvas.setAttribute("width", width);
                canvas.setAttribute("height", height);

                videoOn = true;
            }
        },
        false
    );

    clickButton.addEventListener(
        "click",
        (ev) => {
            takepicture();
            ev.preventDefault();
        },
        false
    );

    clearphoto();
}

function clearphoto() {
    const context = canvas.getContext("2d");
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const data = canvas.toDataURL("image/png");
    //photo.setAttribute("src", data);
}

function takepicture() {

    const context = canvas.getContext("2d");
    if (width && height) {
        //canvas.width = width;
        //canvas.height = height;
        context.drawImage(input, 0, 0, width, height);

        const data = canvas.toDataURL("image/png"); //The actual image is here
        //colors(data)
        //console.log(data);
        //photo.setAttribute("src", data);
    } else {
        clearphoto();
    }
}

window.addEventListener("load", startup, false);






