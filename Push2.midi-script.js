var PUSH2 = new Controller();

PUSH2.ANIMATIONS = {
    button: {
        static: 176,
        pulse: 186,
        fadein: 180,
        fadein_slow: 181,
        blinking: 185
    },
    pad: {
        static: 144,
        breathing: 138
    }
}

PUSH2.COLORS = {gray: 123, white: 120, red: 127, green: 10, blue: 125};

// TODO: full layout
PUSH2.TOUCH_STRIPE = 0x01;
PUSH2.BUTTONS = {browse: 0x6f, clip: 0x71, left: 0x2c, right: 0x2d, up: 0x2e, down: 0x2f, record: 0x56};
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
    pad57: 0x5c,
    pad64: 0x63
};


PUSH2.turnOnStaticLights = function () {
    // Navigation Section
    midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, PUSH2.BUTTONS.browse, 127);
    midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, PUSH2.BUTTONS.clip, 127);
    midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, PUSH2.BUTTONS.up, 127);
    midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, PUSH2.BUTTONS.down, 127);
    midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, PUSH2.BUTTONS.left, 127);
    midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, PUSH2.BUTTONS.right, 127);

    // Vinyl-Control Section
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad1, 8);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad2, 8);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad3, 8);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad6, 8);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad7, 8);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad8, 8);

    // Play Section
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad57, 10);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, PUSH2.PADS.pad64, 10);

// Effects
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, 62, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, 63, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, 64, PUSH2.COLORS.white);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, 65, PUSH2.COLORS.white);

    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, 70, PUSH2.COLORS.gray);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, 71, PUSH2.COLORS.gray);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, 72, PUSH2.COLORS.gray);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, 73, PUSH2.COLORS.gray);

    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, 78, PUSH2.COLORS.gray);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, 79, PUSH2.COLORS.gray);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, 80, PUSH2.COLORS.gray);
    midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, 81, PUSH2.COLORS.gray);

    // Record
    midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, PUSH2.BUTTONS.record, 127);
}

PUSH2.init = function (id, debugging) {
    // Touch-Stripe Konfiguration
    var optionsByte = 0x55;
    var touchStripeOptionsMsg = [0xF0, 0x00, 0x21, 0x1D, 0x01, 0x01, 0x17, optionsByte, 0xF7];
    midi.sendSysexMsg(touchStripeOptionsMsg, touchStripeOptionsMsg.length);

    // LED Helligkeit
    var brightness = 127;
    var ledBrightnessMsg = [0xF0, 0x00, 0x21, 0x1D, 0x01, 0x01, 0x06, brightness, 0xF7];
    midi.sendSysexMsg(ledBrightnessMsg, ledBrightnessMsg.length);

    PUSH2.turnOnStaticLights()

    engine.makeConnection('[Master]', 'crossfader', function (value, group, control) {
        PUSH2.setTouchstripeLeds(value)
    }).trigger();


    var createKillToggleCallback = function (control) {
        return function (value, group, controlName) {
            PUSH2.setToggleButtonLedState(value, group, controlName, control, PUSH2.COLORS.green, PUSH2.COLORS.red, PUSH2.ANIMATIONS.button.blinking)
        }
    }

    var groupLeft = '[EqualizerRack1_[Channel1]_Effect1]';
    engine.makeConnection(groupLeft, 'button_parameter1', createKillToggleCallback(PUSH2.DISPLAY_BUTTONS.button1)).trigger();
    engine.makeConnection(groupLeft, 'button_parameter2', createKillToggleCallback(PUSH2.DISPLAY_BUTTONS.button2)).trigger();
    engine.makeConnection(groupLeft, 'button_parameter3', createKillToggleCallback(PUSH2.DISPLAY_BUTTONS.button3)).trigger();

    var groupRight = '[EqualizerRack1_[Channel2]_Effect1]';
    engine.makeConnection(groupRight, 'button_parameter1', createKillToggleCallback(PUSH2.DISPLAY_BUTTONS.button6)).trigger();
    engine.makeConnection(groupRight, 'button_parameter2', createKillToggleCallback(PUSH2.DISPLAY_BUTTONS.button7)).trigger();
    engine.makeConnection(groupRight, 'button_parameter3', createKillToggleCallback(PUSH2.DISPLAY_BUTTONS.button8)).trigger();


    engine.makeConnection('[Channel1]', 'play', function (value, group, controlName) {
        PUSH2.setTogglePadLedState(value, group, controlName, PUSH2.PADS.pad57, PUSH2.COLORS.green, PUSH2.COLORS.red, PUSH2.ANIMATIONS.pad.breathing)
    }).trigger();

    engine.makeConnection('[Channel2]', 'play', function (value, group, controlName) {
        PUSH2.setTogglePadLedState(value, group, controlName, PUSH2.PADS.pad64, PUSH2.COLORS.green, PUSH2.COLORS.red, PUSH2.ANIMATIONS.pad.breathing)
    }).trigger();


    // turn on all note LEDs
    // for (var i = 1; i <= 64; i++) {
    //     midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, i + 35, 124);
    // }
}

PUSH2.shutdown = function () {
    // turn off all LEDs
    for (var i = 1; i <= 64; i++) {
        midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, i + 35, 0);
    }
}

// CALLBACKS
PUSH2.play = function (channel, control, value, status, group) {
    PUSH2.toggleMixxButton('play', channel, control, value, status, group)
}

PUSH2.button_parameter1 = function (channel, control, value, status, group) {
    PUSH2.toggleMixxButton('button_parameter1', channel, control, value, status, group)
}
PUSH2.button_parameter2 = function (channel, control, value, status, group) {
    PUSH2.toggleMixxButton('button_parameter2', channel, control, value, status, group)
}
PUSH2.button_parameter3 = function (channel, control, value, status, group) {
    PUSH2.toggleMixxButton('button_parameter3', channel, control, value, status, group)
}
// CALLBACKS END

PUSH2.toggleMixxButton = function (controlName, channel, control, value, status, group) {
    if (value) {
        var toggleState = engine.getParameter(group, controlName)
        if (toggleState) {
            engine.setValue(group, controlName, 0);
        } else {
            engine.setValue(group, controlName, 1);
        }
    }
}


PUSH2.setToggleButtonLedState = function (value, group, controlName, control, color, toggledColor, toggleAnimationChannel) {
    if (value) {
        midi.sendShortMsg(toggleAnimationChannel || PUSH2.ANIMATIONS.button.static, control, toggledColor || PUSH2.COLORS.white)
    } else {
        midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, control, color || PUSH2.COLORS.gray)
    }
}


PUSH2.setTogglePadLedState = function (value, group, controlName, control, color, toggledColor, toggleAnimationChannel) {
    if (value) {
        midi.sendShortMsg(toggleAnimationChannel || PUSH2.ANIMATIONS.pad.static, control, toggledColor || PUSH2.COLORS.white)
    } else {
        midi.sendShortMsg(PUSH2.ANIMATIONS.pad.static, control, color || PUSH2.COLORS.gray)
    }
}


PUSH2.setTouchstripeLeds = function (value) {
    if (value >= 1) {
        midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, PUSH2.TOUCH_STRIPE, 127)
    } else if (value >= 0) {
        // TODO: fix missing upper led
        midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, PUSH2.TOUCH_STRIPE, Math.ceil(64 + value * 64))
    } else if (value < -1) {
        // TODO: fix missing upper led
        midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, PUSH2.TOUCH_STRIPE, 0)
    } else {
        midi.sendShortMsg(PUSH2.ANIMATIONS.button.static, PUSH2.TOUCH_STRIPE, Math.floor(64 - value * -64))
    }
}



