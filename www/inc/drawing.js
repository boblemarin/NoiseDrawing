/*

REQUIREMENTS :
  - Brave (kiosk mode)
  - Node.js for server
  - LoopMIDI
  - Ableton Live (or granular synth)

TODO :

- MIDI
  OK - add MIDI.js
  - send start/stop via Note
  - send positions and pressure via CC 

- TAB key toggles setup menu (for admin)
  OK - implement TAB toggle
  OK - midi output selection
  - webcam input
  ? - image load

- create scene in Ableton

- automate Brave launch in Kiosk mode to avoid the FS close button appearing on top of the screen

OK - setup shortcut keys on tablet to have different functions
  OK - (save &) clear
  NON - undo ? (not with new drawing method)
  - max pen size
  OK - color ?

OK - update draw method to avoid a too long stroke list
  OK - draw in temp canvas
  OK - onPointerUp, copy temp canvas into canvas and empty history
  OK - only keep bitmap version of the result

OK - setup server to receive png drawings and save them in folder
  OK - check enfantrisme project for server and send code

OK - COLOR PALETTES ! 
  OK - import palettes from Coolors.co https://coolors.co/
  OK - random palette on start
  OK - use buttons to choose pen color
  OK - add button to fill background

*/

const palettes = [ 
  '4f000b-720026-ce4257-ff7f51-ff9b54',
  '8e9aaf-cbc0d3-efd3d7-feeafa-dee2ff',
  '880d1e-dd2d4a-f26a8d-f49cbb-cbeef3',
  '3d348b-7678ed-f7b801-f18701-f35b04', 
  'cdb4db-ffc8dd-ffafcc-bde0fe-a2d2ff', 
  'dad7cd-a3b18a-588157-3a5a40-344e41', 
  '70d6ff-ff70a6-ff9770-ffd670-e9ff70', 
  'ffd6ff-e7c6ff-c8b6ff-b8c0ff-bbd0ff', 
  'd8e2dc-ffe5d9-ffcad4-f4acb7-9d8189', 
  '6f1d1b-bb9457-432818-99582a-ffe6a7', 
  '8cb369-f4e285-f4a259-5b8e7d-bc4b51', 
  '003049-d62828-f77f00-fcbf49-eae2b7', 
  '335c67-fff3b0-e09f3e-9e2a2b-540b0e', 
  '132a13-31572c-4f772d-90a955-ecf39e', 
  '9b5de5-f15bb5-fee440-00bbf9-00f5d4', 
  '390099-9e0059-ff0054-ff5400-ffbd00',
  '826aed-c879ff-ffb7ff-3bf4fb-caff8a', 
  '001427-708d81-f4d58d-bf0603-8d0801',
  'ff595e-ffca3a-8ac926-1982c4-6a4c93',
  '5fad56-f2c14e-f78154-4d9078-b4436c',
  '7c6a0a-babd8d-ffdac6-fa9500-eb6424',
  '01295f-437f97-849324-ffb30f-fd151b',
  'ee6352-59cd90-3fa7d6-fac05e-f79d84',
  '7bdff2-b2f7ef-eff7f6-f7d6e0-f2b5d4',
  'f7b267-f79d65-f4845f-f27059-f25c54',
  '5fad56-f2c14e-f78154-4d9078-b4436c'
];

let cv = document.getElementById('drawCanvas'),
    ctx = cv.getContext('2d'),
    tcv = document.getElementById('tempCanvas'),
    tctx = tcv.getContext('2d'),
    indicator = document.querySelector('.indicator'),
    isListeningForInput = false,
    currentStroke = [],
    width = window.innerWidth,
    height = window.innerHeight,
    dirty = false,
    tdirty = false,
    i,n,first,
    maxLineWidth = 10,
    saved = false,
    currentPalette,
    currentColor = 0,
    fillIndex = 0;


/* *******************************************************************************

                              SET-UP & LISTENERS 

   ******************************************************************************* */

cv.width = tcv.width = width;
cv.height = tcv.height = height;
chooseRandomPalette();

document.querySelector('.menu').addEventListener('mousedown',onMenuMouseDown);
window.addEventListener('keydown',onKeyDown);
document.addEventListener('contextmenu', function (event) {
  event.preventDefault();
  event.stopImmediatePropagation();
  return false;
}, false);
window.addEventListener('resize', function(e) {
  width = window.innerWidth;
  height = window.innerHeight;
  cv.width = tcv.width = width;
  cv.height = tcv.height = height;
});



document.addEventListener('pointerdown',   onPointerDown);
document.addEventListener('pointermove',   onPointerMove);
document.addEventListener('pointerup',     onPointerUp);
document.addEventListener('pointercancel', onPointerUp);


requestAnimationFrame(draw);



/* *******************************************************************************

                                      INPUTS 

   ******************************************************************************* */

function onPointerDown(event) {
  if (isListeningForInput && currentStroke.length > 1) {
    currentStroke = [];
    dirty = true;
    tdirty = true;
  }
  isListeningForInput = true;
  currentStroke = [[event.pageX, event.pageY, event.pressure]];
  startNoteAt(event.pageX, event.pageY, event.pressure);
  let s = 1 - event.pressure * 0.5;
  indicator.style.transform = 'translate3d('+event.pageX+'px,'+event.pageY+'px,0) scale3d('+s+','+s+',1)';
  indicator.style.display = 'block';
}

function onPointerMove(event) {
  if (isListeningForInput) {
    currentStroke.push([event.pageX, event.pageY, event.pressure]);
    keepNoteAt(event.pageX, event.pageY, event.pressure);
    tdirty = true;
    let s = 1 - event.pressure * 0.5;
    indicator.style.transform = 'translate3d('+event.pageX+'px,'+event.pageY+'px,0) scale3d('+s+','+s+',1)';
  }
}

function onPointerUp(event) {
  if (isListeningForInput) {
    isListeningForInput = false;
    killNoteAt(event.pageX, event.pageY);
    if (currentStroke.length > 1) {
      currentStroke = [];
      dirty = true;
      tdirty = true;
    }
    indicator.style.display = 'none';
  }
}

function onKeyDown(event) {
  switch(event.keyCode) {
    case 8: // backspace, undo/redo
      if (event.shiftKey) redo();
      else undo();
      break;

    case 9: // tab, toggle menu
      document.body.classList.toggle('show-menu');
      event.preventDefault();
      event.stopImmediatePropagation();
      break;

    case 49:
      menuClear();
      break;

    case 50:
      menuFill();
      break;

    //TODO: add features here
    case 51:
      
      break;
    case 52:
      
      break;
    case 53:
      
      break;

    case 54:
      menuChooseColor(4);
      break;

    case 55:
      menuChooseColor(3);
      break;

    case 56:
      menuChooseColor(2);
      break;

    case 57:
      menuChooseColor(1);
      break;

    case 48:
      menuChooseColor(0);
      break;

/*    default: 
      console.log(event.keyCode);
      break;*/
  };
}



/* *******************************************************************************

                                        DRAWING 

   ******************************************************************************* */

function draw() {
  if (dirty) {
    ctx.drawImage(tcv, 0, 0);
    dirty = false;
  }

  if (tdirty) {
    tcv.width = width;
    tcv.height = height;
    tctx.strokeStyle = currentPalette[currentColor];
    tctx.lineCap = "round";
    n = currentStroke.length;
    for(i = 1; i < n; ++i) {
      tctx.beginPath();
      tctx.lineWidth = maxLineWidth * currentStroke[i-1][2];
      tctx.moveTo(currentStroke[i-1][0], currentStroke[i-1][1]);
      tctx.lineTo(currentStroke[i][0]  , currentStroke[i][1]  );
      tctx.stroke();
    }
    tdirty = false;
  }

  requestAnimationFrame(draw);
}



/* *******************************************************************************

                                        MIDI 

   ******************************************************************************* */

function startNoteAt(x,y,pressure) {
  MIDI.noteOn( 1, 48, 100 )
}

function keepNoteAt(x,y,pressure) {

}

function killNoteAt(x,y) {
  MIDI.noteOff( 1, 48 )
}






/* *******************************************************************************

                                        MENU 

   ******************************************************************************* */

function menuClear() {
  saveImage();

  // clear screen
  currentStroke.length = 0;
  cv.width = tcv.width = width;
  cv.height = tcv.height = height;

  // init
  chooseRandomPalette();
  currentColor = 0;
  fillIndex = 0;
}

function menuFill() {
  if (--fillIndex < 0) fillIndex = currentPalette.length - 1;
  ctx.fillStyle = currentPalette[fillIndex];
  ctx.fillRect(0,0,width,height);
}

function menuChooseColor(col) {
  document.querySelector('.palette-color-'+currentColor).classList.remove('current');
  currentColor = col;
  document.querySelector('.palette-color-'+currentColor).classList.add('current');
}

function onMenuMouseDown(event) {
  event.stopImmediatePropagation();
}



/* *******************************************************************************

                                      UTILITIES 
                                        
   ******************************************************************************* */

function debugEvent(event) {
  let info = [event.type, event.pointerType, event.pageX, event.pageY, event.tiltX, event.tiltY, event.pressure, event.twist];
  debug.innerText = info.join(" - ");
}

function saveImage() {
  let image_data_url = cv.toDataURL('image/png').substring(22);

  console.log("saving image");
  fetch('http://localhost:3000', {
    method: 'POST',
    headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageData: image_data_url
        })
  })
  .then(response => response.json())
  .then(response => {
    console.log("image saved : ", response);
  });
}

function chooseRandomPalette() {
  parsePalette(palettes[Math.random() * palettes.length >> 0]);
}

function parsePalette(paletteString) {
  currentPalette = paletteString.split('-').map(i => '#' + i);
  for (i in currentPalette) {
    let s = document.querySelector('.palette-color-'+i);
    s.style.backgroundColor = currentPalette[i];
    if (i == 0) s.classList.add('current');
    else s.classList.remove('current');
  }
}
