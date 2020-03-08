// Define UI elements
let ui = {
    timer: document.getElementById('timer'),
    robotState: document.getElementById('robot-state').firstChild,
    targetRange: document.getElementById('in-range'),
    targetDistance: document.getElementById('distance'),
    shooterCharged: document.getElementById('shooter-status'),
    encoderVelocity: document.getElementById('velocity'),
    gyro: {
        container: document.getElementById('gyro'),
        val: 0,
        offset: 0,
        visualVal: 0,
        arm: document.getElementById('gyro-arm'),
        number: document.getElementById('gyro-number')
    },
    roll: {
        container: document.getElementById('gyro-roll'),
        val: 0,
        offset: 0,
        visualVal: 0,
        arm: document.getElementById('roll-arm'),
        number: document.getElementById('roll-number')
    },
    /*robotDiagram: {
        arm: document.getElementById('robot-arm')
    },*/
    example: {
        button: document.getElementById('example-button'),
        readout: document.getElementById('example-readout').firstChild
    },
    autoSelect: document.getElementById('auto-select'),
    armPosition: document.getElementById('arm-position')
};

// Key Listeners

// Gyro rotation
let updateGyro = (key, value) => {
    ui.gyro.val = value;
    ui.gyro.visualVal = Math.floor(ui.gyro.val - ui.gyro.offset);
    ui.gyro.visualVal %= 360;
    if (ui.gyro.visualVal < 0) {
        ui.gyro.visualVal += 360;
    }
    ui.gyro.arm.style.transform = `rotate(${ui.gyro.visualVal}deg)`;
    ui.gyro.number.textContent = ui.gyro.visualVal + 'º';
};
NetworkTables.addKeyListener('/SmartDashboard/NavX - yaw', updateGyro);

let updateRoll = (key, value) => {
    ui.roll.val = value;
    ui.roll.visualVal = Math.floor(ui.roll.val - ui.roll.offset);
    ui.roll.visualVal %= 360;
    if (ui.roll.visualVal < 0) {
        ui.roll.visualVal += 360;
    }
    ui.roll.arm.style.transform = `rotate(${ui.roll.visualVal}deg)`;
    ui.roll.number.textContent = ui.roll.visualVal + 'º';
};
NetworkTables.addKeyListener('/SmartDashboard/NavX - roll', updateRoll);

// The following case is an example, for a robot with an arm at the front.
/*NetworkTables.addKeyListener('/SmartDashboard/arm/encoder', (key, value) => {
    // 0 is all the way back, 1200 is 45 degrees forward. We don't want it going past that.
    if (value > 1140) {
        value = 1140;
    }
    else if (value < 0) {
        value = 0;
    }
    // Calculate visual rotation of arm
    var armAngle = value * 3 / 20 - 45;
    // Rotate the arm in diagram to match real arm
    ui.robotDiagram.arm.style.transform = `rotate(${armAngle}deg)`;
});*/

// This button is just an example of triggering an event on the robot by clicking a button.
NetworkTables.addKeyListener('/SmartDashboard/example_variable', (key, value) => {
    // Set class active if value is true and unset it if it is false
    ui.example.button.classList.toggle('active', value);
    ui.example.readout.data = 'Value is ' + value;
});

//Showing whether the target is in range for shooting
NetworkTables.addKeyListener('/SmartDashboard/Target In Range', (key, value) => {
    if(value == true) {
        ui.targetRange.textContent = "In Range";
        ui.targetRange.style.color = "green";
    } else {
        ui.targetRange.textContent = "Not In Range";
        ui.targetRange.style.color = "red";
    }
});

//Showing whether shooter is charged 
NetworkTables.addKeyListener('/SmartDashboard/Speed Reached', (key, value) => {
    if(value == true) {
        ui.shooterCharged.textContent = "Charged";
        ui.shooterCharged.style.color = "green";
    } else {
        ui.shooterCharged.textContent = "Not Charged";
        ui.shooterCharged.style.color = "red"; 
    }
});

//Showing the horizontal distance from the target
NetworkTables.addKeyListener('/vision/distance', (key, value) => {
    ui.targetDistance.textContent = value.toFixed(2) + " ft";
});

//Showing the velocity of the encoder on the shooter (in rpm)
NetworkTables.addKeyListener('/SmartDashboard/Encoder Velocity', (key, value) => {
    ui.encoderVelocity.textContent = value.toFixed(2) + " u/100ms";
});

NetworkTables.addKeyListener('/SmartDashboard/Match Time', (key, value) => {
    // This is an example of how a dashboard could display the remaining time in a match.
    // We assume here that value is an integer representing the number of seconds left.
    ui.timer.textContent = value < 0 ? '0:00' : Math.floor(value / 60) + ':' + (value % 60 < 10 ? '0' : '') + value % 60;
});

// Load list of prewritten autonomous modes
NetworkTables.addKeyListener('/SmartDashboard/Auto Selector/options', (key, value) => {
    // Clear previous list
    while (ui.autoSelect.firstChild) {
        ui.autoSelect.removeChild(ui.autoSelect.firstChild);
    }
    // Make an option for each autonomous mode and put it in the selector
    for (let i = 0; i < value.length; i++) {
        var option = document.createElement('option');
        option.appendChild(document.createTextNode(value[i]));
        ui.autoSelect.appendChild(option);
    }
    // Set value to the already-selected mode. If there is none, nothing will happen.
    ui.autoSelect.value = NetworkTables.getValue('/SmartDashboard/Auto Selector/active');
});

// Load list of prewritten autonomous modes
NetworkTables.addKeyListener('/SmartDashboard/Auto Selector/active', (key, value) => {
    ui.autoSelect.value = value;
});

// The rest of the doc is listeners for UI elements being clicked on
ui.example.button.onclick = function() {
    // Set NetworkTables values to the opposite of whether button has active class.
    NetworkTables.putValue('/SmartDashboard/example_variable', this.className != 'active');
};
// Reset gyro value to 0 on click
ui.gyro.container.onclick = function() {
    // Store previous gyro val, will now be subtracted from val for callibration
    ui.gyro.offset = ui.gyro.val;
    // Trigger the gyro to recalculate value.
    updateGyro('/SmartDashboard/NavX - yaw', ui.gyro.val);
};

// Update NetworkTables when autonomous selector is changed
ui.autoSelect.onchange = function() {
    NetworkTables.putValue('/SmartDashboard/Auto Selector/selected', this.value);
};

// Get value of arm height slider when it's adjusted
/*ui.armPosition.oninput = function() {
    NetworkTables.putValue('/SmartDashboard/arm/encoder', parseInt(this.value));
};*/

addEventListener('error',(ev)=>{
    ipc.send('windowError',{mesg:ev.message,file:ev.filename,lineNumber:ev.lineno})
})
