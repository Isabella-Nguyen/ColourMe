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

/*
async function onSubmit(event) {
    event.preventDefault();
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ promptInput: promptInput }),
    });
    const data = await response.json();
    setResult(prev => [[promptInput, data.result], ...prev]);
    setPromptInput("");
  }
*/

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
          
         /*
         
          .then(resp => {return resp})
          .then (respp =>{console.log(respp)})
          .catch(error=>console.log(error))

          var b=JSON.stringify({"requests":[{  "image":{"content": data.substring(22)}  ,  "features": [{"type":"LABEL_DETECTION","maxResults":5}]    } ]});
          var e=new XMLHttpRequest;
          
          e.onload=function(){console.log(e.responseText)};
          e.open("POST","https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBgIWhU22594CAQG1GCLzIJ0ePG7Uml-zk",!0);
          e.send(b)\
          */
          const doo = await response.json();
          console.log(doo.responses[0].imagePropertiesAnnotation.dominantColors.colors[0].color);

          let apiKey = "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"
          
          const description = await fetch("https://api.openai.com/v1/completions", {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${apiKey}`,
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

          //return color_description.choices[0].text;
        

    } else {
        clearphoto();
    }
}

window.addEventListener("load", startup, false);






