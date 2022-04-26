// Push 2 documentation: https://github.com/Ableton/push-interface/blob/master/doc/AbletonPush2MIDIDisplayInterface.asc
// noinspection JSUnresolvedFunction,JSUnresolvedVariable,SpellCheckingInspection

var PUSH2 = new Controller();

// CONSTANTS
PUSH2.ANIMATIONS = {
  stripe: {
    pitchbend: 224,
    modwheel: 176
  },
  button: {
    static: 176,
    pulse: 186,
    fadein: 180,
    fadein_slow: 181,
    blinking: 185
  },
  pad: {
    static: 144,
    blinking_slow: 154,
    breathing: 138
  }
};

PUSH2.COLORS = {
  gray: 123,
  black: 0,
  white: 120,
  darkwhite: 121,
  red: 2,
  green: 10,
  darkgreen: 12,
  yellow: 8,
  darkyellow: 5,
  orange: 3,
  blue: 125
};

PUSH2.TOUCH_STRIPE = 0x01;
PUSH2.BUTTONS = {
  browse: 0x6f,
  clip: 0x71,
  left: 0x2c,
  right: 0x2d,
  up: 0x2e,
  down: 0x2f,
  record: 0x56,
  metronome: 0x9,
  tapTempo: 0x3,
  octaveUp: 0x37,
  octaveDown: 0x36,
  pageLeft: 0x3e,
  pageRight: 0x3f,
  shift: 0x31
};
PUSH2.DISPLAY_BUTTONS = {
  button1: 0x66,
  button2: 0x67,
  button3: 0x68,
  button4: 0x69,
  button5: 0x6a,
  button6: 0x6b,
  button7: 0x6c,
  button8: 0x6d
};
PUSH2.PADS = {
  pad1: 0x24,
  pad2: 0x25,
  pad3: 0x26,
  pad4: 0x27,
  pad5: 0x28,
  pad6: 0x29,
  pad7: 0x2a,
  pad8: 0x2b,
  pad9: 0x2c,
  pad10: 0x2d,
  pad11: 0x2e,
  pad12: 0x2f,
  pad13: 0x30,
  pad14: 0x31,
  pad15: 0x32,
  pad16: 0x33,
  pad17: 0x34,
  pad18: 0x35,
  pad19: 0x36,
  pad20: 0x37,
  pad21: 0x38,
  pad22: 0x39,
  pad23: 0x3a,
  pad24: 0x3b,
  pad25: 0x3c,
  pad26: 0x3d,
  pad27: 0x3e,
  pad28: 0x3f,
  pad29: 0x40,
  pad30: 0x41,
  pad31: 0x42,
  pad32: 0x43,
  pad33: 0x44,
  pad34: 0x45,
  pad35: 0x46,
  pad36: 0x47,
  pad37: 0x48,
  pad38: 0x49,
  pad39: 0x4a,
  pad40: 0x4b,
  pad41: 0x4c,
  pad42: 0x4d,
  pad43: 0x4e,
  pad44: 0x4f,
  pad45: 0x50,
  pad46: 0x51,
  pad47: 0x52,
  pad48: 0x53,
  pad49: 0x54,
  pad50: 0x55,
  pad51: 0x56,
  pad52: 0x57,
  pad53: 0x58,
  pad54: 0x59,
  pad55: 0x5a,
  pad56: 0x5b,
  pad57: 0x5c,
  pad58: 0x5d,
  pad59: 0x5e,
  pad60: 0x5f,
  pad61: 0x60,
  pad62: 0x61,
  pad63: 0x62,
  pad64: 0x63
};
// CONSTANTS END

// STATE
PUSH2.selectedEffectUnit = 1;
PUSH2.selectedEffectParameter = 4;
PUSH2.currentBrightness = 127;
PUSH2.shiftActive = false;

// STATE END

PUSH2.init = function (id, debugging) {
  PUSH2.clearPads();
  PUSH2.setBrightness(PUSH2.currentBrightness);
  PUSH2.turnOnStaticLights();

  // Touch-Stripe Konfiguration
  var optionsByte = 0x51;
  var touchStripeOptionsMsg = [0xf0, 0x00, 0x21, 0x1d, 0x01, 0x01, 0x17, optionsByte, 0xf7];
  midi.sendSysexMsg(touchStripeOptionsMsg, touchStripeOptionsMsg.length);

  engine
    .makeConnection('[Master]', 'crossfader', function (value, group, control) {
      PUSH2.setTouchstripeLeds(value);
    })
    .trigger();

  var createKillToggleCallback = function (control) {
    return function (value, group, controlName) {
      PUSH2.setToggleButtonLedState(value, group, controlName, control, PUSH2.COLORS.green, PUSH2.COLORS.red, PUSH2.ANIMATIONS.button.blinking);
    };
  };
  var groupLeft = '[EqualizerRack1_[Channel1]_Effect1]';
  engine.makeConnection(groupLeft, 'button_parameter1', createKillToggleCallback(PUSH2.DISPLAY_BUTTONS.button1)).trigger();
  engine.makeConnection(groupLeft, 'button_parameter2', createKillToggleCallback(PUSH2.DISPLAY_BUTTONS.button2)).trigger();
  engine.makeConnection(groupLeft, 'button_parameter3', createKillToggleCallback(PUSH2.DISPLAY_BUTTONS.button3)).trigger();

  var groupRight = '[EqualizerRack1_[Channel2]_Effect1]';
  engine.makeConnection(groupRight, 'button_parameter1', createKillToggleCallback(PUSH2.DISPLAY_BUTTONS.button6)).trigger();
  engine.makeConnection(groupRight, 'button_parameter2', createKillToggleCallback(PUSH2.DISPLAY_BUTTONS.button7)).trigger();
  engine.makeConnection(groupRight, 'button_parameter3', createKillToggleCallback(PUSH2.DISPLAY_BUTTONS.button8)).trigger();

  engine
    .makeConnection('[Channel1]', 'play', function (value, group, controlName) {
      PUSH2.setTogglePadLedState(value, group, controlName, PUSH2.PADS.pad57, PUSH2.COLORS.darkgreen, PUSH2.COLORS.green, PUSH2.ANIMATIONS.pad.blinking_slow);
    })
    .trigger();
  engine
    .makeConnection('[Channel2]', 'play', function (value, group, controlName) {
      PUSH2.setTogglePadLedState(value, group, controlName, PUSH2.PADS.pad64, PUSH2.COLORS.darkgreen, PUSH2.COLORS.green, PUSH2.ANIMATIONS.pad.blinking_slow);
    })
    .trigger();

  engine
    .makeConnection('[Channel1]', 'vinylcontrol_enabled', function (value, group, controlName) {
      PUSH2.setTogglePadLedState(value, group, controlName, PUSH2.PADS.pad1, PUSH2.COLORS.darkyellow, PUSH2.COLORS.yellow);
    })
    .trigger();
  engine
    .makeConnection('[Channel2]', 'vinylcontrol_enabled', function (value, group, controlName) {
      PUSH2.setTogglePadLedState(value, group, controlName, PUSH2.PADS.pad6, PUSH2.COLORS.darkyellow, PUSH2.COLORS.yellow);
    })
    .trigger();

  engine
    .makeConnection('[Channel1]', 'vinylcontrol_mode', function (value, group, controlName) {
      PUSH2.setTogglePadLedState(value, group, controlName, PUSH2.PADS.pad2, PUSH2.COLORS.orange, PUSH2.COLORS.yellow, null, PUSH2.COLORS.darkyellow);
    })
    .trigger();
  engine
    .makeConnection('[Channel2]', 'vinylcontrol_mode', function (value, group, controlName) {
      PUSH2.setTogglePadLedState(value, group, controlName, PUSH2.PADS.pad7, PUSH2.COLORS.orange, PUSH2.COLORS.yellow, null, PUSH2.COLORS.darkyellow);
    })
    .trigger();

  engine
    .makeConnection('[Channel1]', 'passthrough', function (value, group, controlName) {
      PUSH2.setTogglePadLedState(value, group, controlName, PUSH2.PADS.pad3, PUSH2.COLORS.darkyellow, PUSH2.COLORS.yellow);
    })
    .trigger();
  engine
    .makeConnection('[Channel2]', 'passthrough', function (value, group, controlName) {
      PUSH2.setTogglePadLedState(value, group, controlName, PUSH2.PADS.pad8, PUSH2.COLORS.darkyellow, PUSH2.COLORS.yellow);
    })
    .trigger();

  engine
    .makeConnection('[EffectRack1_EffectUnit1_Effect1]', 'enabled', function (value, group, controlName) {
      PUSH2.setTogglePadLedState(value, group, controlName, PUSH2.PADS.pad27, PUSH2.COLORS.darkwhite, PUSH2.COLORS.white);
    })
    .trigger();
  engine
    .makeConnection('[EffectRack1_EffectUnit2_Effect1]', 'enabled', function (value, group, controlName) {
      PUSH2.setTogglePadLedState(value, group, controlName, PUSH2.PADS.pad30, PUSH2.COLORS.darkwhite, PUSH2.COLORS.white);
    })
    .trigger();

  engine
    .makeConnection('[Channel1]', 'volume', function (value, group, controlName) {
      PUSH2.setPadsFaderLeds(value, group, controlName);
    })
    .trigger();
  engine
    .makeConnection('[Channel2]', 'volume', function (value, group, controlName) {
      PUSH2.setPadsFaderLeds(value, group, controlName);
    })
    .trigger();

  engine
    .makeConnection('[Channel1]', 'pfl', function (value, group, controlName) {
      PUSH2.setTogglePadLedState(value, group, controlName, PUSH2.PADS.pad41, PUSH2.COLORS.gray, PUSH2.COLORS.blue);
    })
    .trigger();
  engine
    .makeConnection('[Channel2]', 'pfl', function (value, group, controlName) {
      PUSH2.setTogglePadLedState(value, group, controlName, PUSH2.PADS.pad48, PUSH2.COLORS.gray, PUSH2.COLORS.blue);
    })
    .trigger();
};

PUSH2.shutdown = function () {
  PUSH2.clearButtons();
  PUSH2.clearDisplayButtons();
  PUSH2.clearPads();
  PUSH2.resetTouchstripe();
  PUSH2.drawSpaceInvader();
  PUSH2.wait(500);
  PUSH2.drawSpaceInvader2();
  PUSH2.wait(500);
  PUSH2.drawSpaceInvader();
  PUSH2.wait(500);
  PUSH2.drawSpaceInvader2();
  PUSH2.wait(500);
  PUSH2.drawSpaceInvader();
  PUSH2.setBrightness(20);
};

// CALLBACKS
PUSH2.lineVolume = function (channel, control, value, status, group) {
  if (control === PUSH2.PADS.pad4 || control === PUSH2.PADS.pad5) {
    engine.setValue(group, 'volume', 0);
  } else if (control === PUSH2.PADS.pad12 || control === PUSH2.PADS.pad13) {
    engine.setValue(group, 'volume', 0.14);
  } else if (control === PUSH2.PADS.pad20 || control === PUSH2.PADS.pad21) {
    engine.setValue(group, 'volume', 0.28);
  } else if (control === PUSH2.PADS.pad28 || control === PUSH2.PADS.pad29) {
    engine.setValue(group, 'volume', 0.42);
  } else if (control === PUSH2.PADS.pad36 || control === PUSH2.PADS.pad37) {
    engine.setValue(group, 'volume', 0.56);
  } else if (control === PUSH2.PADS.pad44 || control === PUSH2.PADS.pad45) {
    engine.setValue(group, 'volume', 0.7);
  } else if (control === PUSH2.PADS.pad52 || control === PUSH2.PADS.pad53) {
    engine.setValue(group, 'volume', 0.84);
  } else if (control === PUSH2.PADS.pad60 || control === PUSH2.PADS.pad61) {
    engine.setValue(group, 'volume', 1);
  }
};

PUSH2.changeSelectedEffectUnit = function (channel, control, value, status, group) {
  if (value === 127) {
    if (PUSH2.selectedEffectUnit < 2) {
      PUSH2.selectedEffectUnit += 1;
    } else {
      PUSH2.selectedEffectUnit = 1;
    }
  }
  PUSH2.EffectEncoder.group = '[EffectRack1_EffectUnit' + PUSH2.selectedEffectUnit + '_Effect1]';
};

PUSH2.changeSelectedEffectParameter = function (channel, control, value, status, group) {
  if (value === 127) {
    if (PUSH2.selectedEffectParameter <= 4) {
      PUSH2.selectedEffectParameter += 1;
    } else {
      PUSH2.selectedEffectParameter = 1;
    }
  }
  if (PUSH2.selectedEffectParameter < 4) {
    PUSH2.EffectEncoder.inKey = 'parameter' + PUSH2.selectedEffectParameter;
  } else {
    PUSH2.EffectEncoder.inKey = 'meta';
  }
};

PUSH2.increaseBrightness = function (channel, control, value, status, group) {
  var increase = PUSH2.shiftActive ? 30 : 10;
  var newBrightness = PUSH2.currentBrightness + increase;
  if (newBrightness > 127) {
    newBrightness = 127;
  }
  PUSH2.currentBrightness = newBrightness;

  PUSH2.setBrightness(PUSH2.currentBrightness);
};

PUSH2.decreaseBrightness = function (channel, control, value, status, group) {
  var decrease = PUSH2.shiftActive ? 30 : 10;
  var newBrightness = PUSH2.currentBrightness - decrease;
  if (newBrightness < 0) {
    newBrightness = 0;
  }
  PUSH2.currentBrightness = newBrightness;

  PUSH2.setBrightness(PUSH2.currentBrightness);
};

PUSH2.shift = function (channel, control, value, status, group) {
  if (value === 127) {
    PUSH2.shiftActive = true;
    PUSH2.VolumeEncoder.inKey = 'headGain';
  }
  if (value === 0) {
    PUSH2.shiftActive = false;
    PUSH2.VolumeEncoder.inKey = 'gain';
  }
};

// CALLBACKS END

// COMPONENTS
PUSH2.EffectEncoder = new components.Encoder({
  midi: [0xb0, 0x0f],
  group: '[EffectRack1_EffectUnit1_Effect1]',
  inKey: 'meta',
  input: function (channel, control, value, status, group) {
    PUSH2.handleEncoderInput(this, channel, control, value, status, group);
  }
});

PUSH2.VolumeEncoder = new components.Encoder({
  midi: [0xb0, 0x4f],
  group: '[Master]',
  inKey: 'gain',
  input: function (channel, control, value, status, group) {
    PUSH2.handleEncoderInput(this, channel, control, value, status, group);
  }
});

// COMPONENTS END

PUSH2.setPadsFaderLeds = function (value, group, controlName) {
  var channelOffset = 0;
  if (group === '[Channel2]') {
    channelOffset = 1;
  }

  if (value === 0) {
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad60 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad52 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad44 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad36 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad28 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad20 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad12 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad4 + channelOffset, PUSH2.COLORS.black);
  } else if (value > 0 && value <= 0.14) {
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad60 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad52 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad44 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad36 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad28 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad20 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad12 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad4 + channelOffset, PUSH2.COLORS.white);
  } else if (value > 0.14 && value <= 0.28) {
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad60 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad52 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad44 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad36 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad28 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad20 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad12 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad4 + channelOffset, PUSH2.COLORS.white);
  } else if (value > 0.28 && value <= 0.42) {
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad60 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad52 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad44 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad36 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad28 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad20 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad12 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad4 + channelOffset, PUSH2.COLORS.white);
  } else if (value > 0.42 && value <= 0.56) {
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad60 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad52 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad44 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad36 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad28 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad20 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad12 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad4 + channelOffset, PUSH2.COLORS.white);
  } else if (value > 0.56 && value <= 0.7) {
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad60 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad52 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad44 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad36 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad28 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad20 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad12 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad4 + channelOffset, PUSH2.COLORS.white);
  } else if (value > 0.7 && value <= 0.84) {
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad60 + channelOffset, PUSH2.COLORS.black);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad52 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad44 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad36 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad28 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad20 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad12 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad4 + channelOffset, PUSH2.COLORS.white);
  } else if (value > 0.84 && value < 1) {
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad60 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad52 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad44 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad36 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad28 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad20 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad12 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad4 + channelOffset, PUSH2.COLORS.white);
  } else if (value === 1) {
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad60 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad52 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad44 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad36 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad28 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad20 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad12 + channelOffset, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad4 + channelOffset, PUSH2.COLORS.white);
  }
};

PUSH2.setToggleButtonLedState = function (value, group, controlName, control, color, toggledColor, toggleAnimationChannel) {
  if (value) {
    midi.sendShortMsg(toggleAnimationChannel || PUSH2.ANIMATIONS.button.static, control, toggledColor || PUSH2.COLORS.white);
  } else {
    midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, control, color || PUSH2.COLORS.gray);
  }
};

PUSH2.setTogglePadLedState = function (value, group, controlName, control, color, toggledColor, toggleAnimationChannel, toggledColor2) {
  if (value > 1) {
    midi.sendShortMsg(toggleAnimationChannel || PUSH2.ANIMATIONS.pad.static, control, toggledColor2 || PUSH2.COLORS.white);
  } else if (value > 0) {
    midi.sendShortMsg(toggleAnimationChannel || PUSH2.ANIMATIONS.pad.static, control, toggledColor || PUSH2.COLORS.white);
  } else {
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, control, color || PUSH2.COLORS.gray);
  }
};

PUSH2.setTouchstripeLeds = function (value) {
  if (value >= 1) {
    midi.sendShortMsg(PUSH2.ANIMATIONS.stripe.pitchbend, PUSH2.TOUCH_STRIPE, 127);
  } else if (value >= 0) {
    // TODO: fix missing upper led
    midi.sendShortMsg(PUSH2.ANIMATIONS.stripe.pitchbend, PUSH2.TOUCH_STRIPE, Math.ceil(64 + value * 64));
  } else if (value < -1) {
    // TODO: fix missing upper led
    midi.sendShortMsg(PUSH2.ANIMATIONS.stripe.pitchbend, PUSH2.TOUCH_STRIPE, 0);
  } else {
    midi.sendShortMsg(PUSH2.ANIMATIONS.stripe.pitchbend, PUSH2.TOUCH_STRIPE, Math.floor(64 - value * -64));
  }
};

PUSH2.clearPads = function () {
  for (var key in PUSH2.PADS) {
    if (PUSH2.PADS.hasOwnProperty(key)) {
      midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS[key], 0);
    }
  }
};

PUSH2.clearButtons = function () {
  for (var key in PUSH2.BUTTONS) {
    if (PUSH2.BUTTONS.hasOwnProperty(key)) {
      midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, PUSH2.BUTTONS[key], 0);
    }
  }
};

PUSH2.clearDisplayButtons = function () {
  for (var key in PUSH2.DISPLAY_BUTTONS) {
    if (PUSH2.DISPLAY_BUTTONS.hasOwnProperty(key)) {
      midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, PUSH2.DISPLAY_BUTTONS[key], 0);
    }
  }
};

PUSH2.resetTouchstripe = function () {
  midi.sendShortMsg(PUSH2.ANIMATIONS.stripe.pitchbend, PUSH2.TOUCH_STRIPE, 64);
};

PUSH2.turnOnStaticLights = function () {
  // Navigation Section
  midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, PUSH2.BUTTONS.browse, 127);
  midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, PUSH2.BUTTONS.clip, 127);
  midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, PUSH2.BUTTONS.up, 127);
  midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, PUSH2.BUTTONS.down, 127);
  midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, PUSH2.BUTTONS.left, 127);
  midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, PUSH2.BUTTONS.right, 127);

  // Effects
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, 70, PUSH2.COLORS.gray);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, 0x49, PUSH2.COLORS.gray);

  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, 78, PUSH2.COLORS.gray);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, 0x51, PUSH2.COLORS.gray);

  // Effect-Knob-Selector
  midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, PUSH2.BUTTONS.metronome, 127);
  midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, PUSH2.BUTTONS.tapTempo, 127);

  // Brightness-Selector
  midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, PUSH2.BUTTONS.octaveUp, 127);
  midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, PUSH2.BUTTONS.octaveDown, 127);

  midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, PUSH2.BUTTONS.shift, 127);

  // Record
  midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, PUSH2.BUTTONS.record, 127);
};

PUSH2.setBrightness = function (brightness) {
  var ledBrightnessMsg = [0xf0, 0x00, 0x21, 0x1d, 0x01, 0x01, 0x06, brightness, 0xf7];
  midi.sendSysexMsg(ledBrightnessMsg, ledBrightnessMsg.length);

  // var displayBrightnessMsg = [0xf0, 0x00, 0x21, 0x1d, 0x01, 0x01, 0x08, 0x7f, 0x01, 0xf7];
  // midi.sendSysexMsg(displayBrightnessMsg, displayBrightnessMsg.length);
};

// HELPERS
PUSH2.handleEncoderInput = function (self, channel, control, value, status, group) {
  if (value === 1) {
    self.inSetParameter(self.inGetParameter() + 0.005);
  } else if (value === 127) {
    self.inSetParameter(self.inGetParameter() - 0.005);
  }
};

PUSH2.drawSpaceInvader = function () {
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad1, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad2, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad3, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad4, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad5, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad6, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad7, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad8, 0);

  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad9, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad10, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad11, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad12, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad13, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad14, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad15, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad16, 0);

  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad17, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad18, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad19, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad20, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad21, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad22, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad23, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad24, PUSH2.COLORS.yellow);

  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad25, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad26, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad27, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad28, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad29, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad30, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad31, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad32, 0);

  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad33, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad34, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad35, PUSH2.COLORS.darkgreen);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad36, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad37, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad38, PUSH2.COLORS.darkgreen);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad39, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad40, 0);

  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad41, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad42, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad43, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad44, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad45, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad46, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad47, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad48, PUSH2.COLORS.yellow);

  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad49, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad50, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad51, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad52, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad53, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad54, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad55, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad56, 0);

  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad57, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad58, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad59, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad60, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad61, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad62, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad63, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad64, PUSH2.COLORS.yellow);
};

PUSH2.drawSpaceInvader2 = function () {
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad1, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad2, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad3, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad4, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad5, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad6, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad7, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad8, 0);

  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad9, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad10, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad11, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad12, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad13, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad14, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad15, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad16, 0);

  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad17, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad18, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad19, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad20, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad21, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad22, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad23, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad24, PUSH2.COLORS.yellow);

  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad25, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad26, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad27, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad28, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad29, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad30, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad31, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad32, 0);

  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad33, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad34, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad35, PUSH2.COLORS.darkgreen);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad36, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad37, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad38, PUSH2.COLORS.darkgreen);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad39, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad40, 0);

  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad41, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad42, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad43, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad44, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad45, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad46, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad47, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad48, PUSH2.COLORS.yellow);

  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad49, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad50, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad51, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad52, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad53, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad54, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad55, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad56, 0);

  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad57, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad58, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad59, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad60, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad61, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad62, PUSH2.COLORS.yellow);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad63, 0);
  midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad64, PUSH2.COLORS.yellow);
};

PUSH2.wait = function (ms) {
  var start = Date.now();
  var now = start;
  while (now - start < ms) {
    now = Date.now();
  }
};
