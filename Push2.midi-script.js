var Push2 = {};

Push2.init = function (id, debugging) {
    var touchStripeOptions = [0xF0, 0x00, 0x21, 0x1D, 0x01, 0x01, 0x17, 0x55, 0xF7];
    midi.sendSysexMsg(touchStripeOptions, touchStripeOptions.length);


    var brightness = 127;
    var ledBrightness = [0xF0, 0x00, 0x21, 0x1D, 0x01, 0x01, 0x06, brightness, 0xF7];
    midi.sendSysexMsg(ledBrightness, ledBrightness.length);


    midi.sendShortMsg(0xB0, 111, 127);
    midi.sendShortMsg(0xB0, 113, 127);
    midi.sendShortMsg(0xB0, 44, 127);
    midi.sendShortMsg(0xB0, 45, 127);
    midi.sendShortMsg(0xB0, 46, 127);
    midi.sendShortMsg(0xB0, 47, 127);

    midi.sendShortMsg(0x90, 36, 125);
    midi.sendShortMsg(0x90, 37, 125);
    midi.sendShortMsg(0x90, 38, 125);
    midi.sendShortMsg(0x90, 41, 125);
    midi.sendShortMsg(0x90, 42, 125);
    midi.sendShortMsg(0x90, 43, 125);

    midi.sendShortMsg(0x90, 92, 126);
    midi.sendShortMsg(0x90, 99, 126);

    midi.sendShortMsg(0x90, 62, 122);
    midi.sendShortMsg(0x90, 63, 122);
    midi.sendShortMsg(0x90, 64, 122);
    midi.sendShortMsg(0x90, 65, 122);

    midi.sendShortMsg(0x90, 70, 123);
    midi.sendShortMsg(0x90, 71, 123);
    midi.sendShortMsg(0x90, 72, 123);
    midi.sendShortMsg(0x90, 73, 123);

    midi.sendShortMsg(0x90, 78, 123);
    midi.sendShortMsg(0x90, 79, 123);
    midi.sendShortMsg(0x90, 80, 123);
    midi.sendShortMsg(0x90, 81, 123);


    var onCrossfaderCallback = function (value, group, control) {
        Push2.setCrossfaderLeds(value)
    };
    engine.makeConnection('[Master]', 'crossfader', onCrossfaderCallback).trigger();


    var createToggleCallback = function (address) {
        return function (value, group, control) {
            Push2.setToggleLed(value, group, control, address)
        }
    }

    var groupLeft = '[EqualizerRack1_[Channel1]_Effect1]';
    engine.makeConnection(groupLeft, 'button_parameter1', createToggleCallback(102)).trigger();
    engine.makeConnection(groupLeft, 'button_parameter2', createToggleCallback(103)).trigger();
    engine.makeConnection(groupLeft, 'button_parameter3', createToggleCallback(104)).trigger();

    var groupRight = '[EqualizerRack1_[Channel2]_Effect1]';
    engine.makeConnection(groupRight, 'button_parameter1', createToggleCallback(109)).trigger();
    engine.makeConnection(groupRight, 'button_parameter2', createToggleCallback(108)).trigger();
    engine.makeConnection(groupRight, 'button_parameter3', createToggleCallback(107)).trigger();


    // turn on all note LEDs
    // for (var i = 1; i <= 64; i++) {
    //     midi.sendShortMsg(0x90, i + 35, 124);
    // }
}

Push2.shutdown = function () {
    // turn off all LEDs
    for (var i = 1; i <= 64; i++) {
        midi.sendShortMsg(0x90, i + 35, 0);
    }
}


Push2.button_parameter1 = function (channel, control, value, status, group) {
    Push2.toggleButton('button_parameter1', channel, control, value, status, group)
}
Push2.button_parameter2 = function (channel, control, value, status, group) {
    Push2.toggleButton('button_parameter2', channel, control, value, status, group)
}
Push2.button_parameter3 = function (channel, control, value, status, group) {
    Push2.toggleButton('button_parameter3', channel, control, value, status, group)
}

Push2.toggleButton = function (buttonName, channel, control, value, status, group) {
    if (value) {
        var toggleState = engine.getParameter(group, buttonName)
        if (toggleState) {
            engine.setValue(group, buttonName, 0);
            midi.sendShortMsg(0xB0, control, 124);
        } else {
            engine.setValue(group, buttonName, 1);
            // midi.sendShortMsg(0xB0, control, 127)
            midi.sendShortMsg(182, control, 127)        }
    }
}

Push2.setCrossfaderLeds = function (value) {
    if (value >= 1) {
        midi.sendShortMsg(0xB0, 0x01, 127)
    } else if (value >= 0) {
        // TODO: fix missing upper led
        midi.sendShortMsg(0xB0, 0x01, Math.ceil(64 + value  * 64))
    } else if (value < -1) {
        // TODO: fix missing upper led
        midi.sendShortMsg(0xB0, 0x01, 0)
    } else {
        midi.sendShortMsg(0xB0, 0x01, Math.floor(64 - value  * -64))
    }
}

Push2.setToggleLed = function (value, group, control, address) {
    if (value) {
        // midi.sendShortMsg(0xB0, address, 127)
        midi.sendShortMsg(184, address, 127)
    } else {
        midi.sendShortMsg(0xB0, address, 124)
    }
}



