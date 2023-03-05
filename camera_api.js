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

// Initalize screen with dimensions of video display
function startup() {
    input = document.getElementById('image');
    canvas = document.getElementById('canvas');
    clickButton = document.getElementById('clickButton');

    // request access to user's camera
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

//captures png image
function clearphoto() {
    const context = canvas.getContext("2d");
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);
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
                "requests":[
                  {
                    "image":{
                      "content": data.substring(22)
                    },
                    "features":[
                      {
                        "type":"IMAGE_PROPERTIES",
                        "maxResults":3
                      }
                    ]
                  }
                ]
              }),
          });

          const doo = await response.json();
          console.log(doo.responses[0].imagePropertiesAnnotation.dominantColors.colors[0].color);

          let apiKey = config.OPEN_API_KEY;
          //let apiKey = "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";
          
          const description = await fetch("https://api.openai.com/v1/completions", {
            method: "POST",
            headers: {
              'Authorization': "Bearer ${apiKey}",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "text-davinci-003",
                prompt: `can you describe this hexcode to a blind person #${doo.responses[0].imagePropertiesAnnotation.dominantColors.colors[0].color.blue} in 5 or less words, be as descriptive as possible. please dont mention the hex code.`,
                temperature: 0,
                max_tokens: 7,
              }),
          });
          const color_description = await description.json();
          console.log(color_description);

          let words = color_description.choices[0].text;
          
          var msg = new SpeechSynthesisUtterance();
            var voices = window.speechSynthesis.getVoices();
            msg.voice = voices[10]; 
            msg.volume = 1; // From 0 to 1
            msg.rate = 1; // From 0.1 to 10
            msg.pitch = 0; // From 0 to 2
            msg.text = words;
            msg.lang = 'en';
            speechSynthesis.speak(msg);

    } else {
        clearphoto();
    }
}

window.addEventListener("load", startup, false);






