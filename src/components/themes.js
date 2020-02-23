// Create an alias for theme-related DOM objects
ui.theme = {
    select: document.getElementById('theme-select'),
    link: document.getElementById('theme-link')
};

//Changes theme to match alliance (for funsies)
NetworkTables.addKeyListener('/FMSInfo/IsRedAlliance', (key, value) => {
 if(value == true) {
    NetworkTables.putValue('/SmartDashboard/theme', 'red');
 } else if(value == false) {
    NetworkTables.putValue('/SmartDashboard/theme', 'blue');
 }
});

// Listen for a theme change
NetworkTables.addKeyListener('/SmartDashboard/theme', (key, value) => {
    ui.theme.select.value = value;
    ui.theme.link.href = 'css/' + value + '.css';
});

// When theme selection is made, turn on that theme
ui.theme.select.onchange = function() {
    NetworkTables.putValue('/SmartDashboard/theme', this.value);
};