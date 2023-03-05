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
      ideal: 1280,
    },
    height: {
      ideal: 720
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

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

async function takepicture() {

  const context = canvas.getContext("2d");
  if (width && height) {
    context.drawImage(input, 0, 0, width, height);

    const data = canvas.toDataURL("image/png"); //The actual image is here

    const response = await fetch("https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBgIWhU22594CAQG1GCLzIJ0ePG7Uml-zk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "requests": [
          {
            "image": {
              "content": data.substring(22)
            },
            "features": [
              {
                "type": "IMAGE_PROPERTIES",
                "maxResults": 3
              }
            ]
          }
        ]
      }),
    });

    const doo = await response.json();
    colors = doo.responses[0].imagePropertiesAnnotation.dominantColors.colors[0].color;

    let red = colors.red;
    let green = colors.green;
    let blue = colors.blue;

    console.log(red);
    console.log(green);
    console.log(blue);

    let rgb = rgbToHex(red, green, blue);

    let apiKey = "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";

    const description = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: `can you describe this hexcode to a blind person ${rgb} in 3 to 10 words, be as descriptive as possible. please dont mention the hex code. please include the name of the hue.`,
        temperature: 0,
        max_tokens: 7,
      }),
    });
    const color_description = await description.json();
    let words = color_description.choices[0].text;

    var msg = new SpeechSynthesisUtterance();
    msg.text = words;
    window.speechSynthesis.speak(msg);
  } else {
    clearphoto();
  }
}

window.addEventListener("load", startup, false);






