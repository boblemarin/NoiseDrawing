
(function() {

  if (!navigator.requestMIDIAccess) {
    console.log("NO MIDI ACCESS");
    window.MIDI = {
      noteOn : function() {},
      noteOff : function() {},
      cc : function() {},
      setDelegateFunction : function() {}
    };
    return;
  }

  var debug = false,
      outputSelect = document.getElementById( 'midi-output-select' ),
      inputSelect = document.getElementById( 'midi-input-select' ),
      outputs = {},
      inputs = {},
      currentInput,
      currentOutput,
      delegateFn,
      midi;

  if ( outputSelect ) {
    outputSelect.addEventListener( 'change' , function( e ) {
      currentOutput = outputs[ outputSelect.value ];
      midiDebug( 'set output to ' + outputSelect.value );
      localStorage['MIDI_lastOutput'] = outputSelect.value;
    });
  }

  if ( inputSelect ) {
    inputSelect.addEventListener( 'change' , function( e ) {
      if ( currentInput ) {
        currentInput.onmidimessage = null;
      }
      var value = inputSelect.value;
      currentInput = inputs[ value ];
      currentInput.onmidimessage = onMidiMessage;
      midiDebug( 'set input to ' + value );
      localStorage['MIDI_lastInput'] = value;
    });
  }


  navigator.requestMIDIAccess().then( function( access ) {
    midi = access;
    midi.onstatechange = onMidiStateChange;
    midiDebug( 'access granted' );
    listOutputs();
    listInputs();
  }, function( error ){
    midiDebug( 'access denied - ' + error );
  });

  function onMidiMessage(e) {
    // TODO: filter midi messates (note on, note off, cc, channel + velo + value)
    midiDebug( 'received : ' + e.data.join( ' : ' ) );
    if ( delegateFn ) {
      delegateFn(e.data);
    }
  }

  function onMidiStateChange(e) {
    midiDebug( 'state changed' );
    listOutputs();
    listInputs();
  }

  function listOutputs() {
    midiDebug( 'scanning outputs' );

    if ( outputSelect ) {
      // get last value from local storage
      var lastOutput = localStorage['MIDI_lastOutput'];

      // clean previous entries
      while ( outputSelect.firstChild ) { outputSelect.removeChild( outputSelect.firstChild ); };
      outputs = {};
      if ( currentOutput && currentOutput.connection == 'closed' ) { currentOutput = null };

      // create placeholder option
      var def = document.createElement( 'option' );
      def.disabled = true;
      def.selected = currentOutput == null;
      def.innerHTML = 'Select output';
      outputSelect.appendChild(def);

      // scan outputs
      midi.outputs.forEach( function( output ) {
        var name = output.name;
        var opt = document.createElement( 'option' );
        opt.innerHTML = name;
        if (name == lastOutput) currentOutput = output;
        opt.selected = output == currentOutput;
        outputSelect.appendChild(opt);
        outputs[ name ] = output;
      });

    }
  }

  function listInputs() {
    midiDebug( 'scanning inputs' );

    if ( inputSelect ) {
      // get last value from local storage
      var lastInput = localStorage['MIDI_lastInput'];

      // clean previous entries
      while ( inputSelect.firstChild ) { inputSelect.removeChild( inputSelect.firstChild ); };
      inputs = {};
      if ( currentInput && currentInput.connection == 'closed' ) { currentInput = null };

      // create placeholder option
      var def = document.createElement( 'option' );
      def.disabled = true;
      def.selected = currentInput == null;
      def.innerHTML = 'Select input';
      inputSelect.appendChild(def);

      // scan outputs
      midi.inputs.forEach( function( input ) {
        var name = input.name;
        var opt = document.createElement( 'option' );
        opt.innerHTML = name;
        if (name == lastInput) {
          currentInput = input;
          currentInput.onmidimessage = onMidiMessage;
        }
        opt.selected = input == currentInput;
        inputSelect.appendChild(opt);
        inputs[ name ] = input;
      });
    }
  }

  function assertRange( value, min, max ) {
    return value >= min && value <= max;
  }

  function assertOutput() {
    return currentOutput != null;
  }

  function midiDebug( msg ) {
    if ( debug ) {
      console.log( 'MIDI: ' + msg );
    }
  }

  function validate( value ) {
    if ( value < 0 ) return 0;
    if ( value > 127 ) return 127;
    return value;
  }

  function validateChannel( value ) {
    if ( value < 1 ) return 1;
    if ( value > 16 ) return 16;
    return value;
  }

  window.MIDI = {
    noteOn : function( channel, note, velocity ) {
      if ( assertOutput() )
        currentOutput.send( [ 0x8F + validateChannel( channel ), validate( note ), validate( velocity ) ] );
    },
    noteOff : function( channel, note ) {
      if ( assertOutput() )
        currentOutput.send( [ 0x7F + validateChannel( channel ), validate( note ), 0 ] );
    },
    cc : function( channel, cc, value ) {
      if ( assertOutput() )
        currentOutput.send( [ 0xAF + validateChannel( channel ), validate( cc ), validate( value ) ] );
    },
    sendBytes : function( bytes ) {
      if ( assertOutput() )
        currentOutput.send( bytes );
    },
    setDelegateFunction : function( del ) {
      delegateFn = del;
    },
    debug : function( enable ) {
      debug = enable || false;
    }
  };


})();
