var convert = require('color-convert');

var Characteristic, Service;

module.exports = function(homebridge){
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory('homebridge-bonesmart-hlightstrip', 'H-LightStrip', HLightStripAccessory, false);
};

function HLightStripAccessory(log, config, api) {
	this.log = log;
	this.config = config;
	this.name = config.name;
    this.setup = config.setup || 'RGBW';
	this.port = config.port || 5577;
	this.ip = config.ip;
	this.color = {H: 255, S:100, L:50};
	this.brightness = 100;
    this.purewhite = config.purewhite || false;
    this.manufacturer = "Bone Smart Technology";
    this.model = "H-LightStrip";
    this.serialnumber = config.serialnumber || "BSTHLS00000";

	this.getColorFromDevice();

}

HLightStripAccessory.prototype.identify = function(callback) {
	this.log('O sistema identificou um request!');
    callback();
};

HLightStripAccessory.prototype.getServices = function() {
	var informationService = new Service.AccessoryInformation();

    informationService
        .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
        .setCharacteristic(Characteristic.Model, this.model)
        .setCharacteristic(Characteristic.SerialNumber, this.serialnumber);

    var lightbulbService = new Service.Lightbulb(this.name);

    lightbulbService
        .getCharacteristic(Characteristic.On)
        .on('get', this.getPowerState.bind(this))
        .on('set', this.setPowerState.bind(this));

    lightbulbService
        .addCharacteristic(new Characteristic.Hue())
        .on('get', this.getHue.bind(this))
        .on('set', this.setHue.bind(this));

    lightbulbService
        .addCharacteristic(new Characteristic.Saturation())
        .on('get', this.getSaturation.bind(this))
        .on('set', this.setSaturation.bind(this));

	lightbulbService
        .addCharacteristic(new Characteristic.Brightness())
        .on('get', this.getBrightness.bind(this))
        .on('set', this.setBrightness.bind(this));

    return [informationService, lightbulbService];

};

HLightStripAccessory.prototype.sendCommand = function(command, callback) {
	var exec = require('child_process').exec;
	var cmd =  __dirname + '/flux_led.py ' + this.ip + ' ' + command;
	exec(cmd, callback);
};

HLightStripAccessory.prototype.getState = function (callback) {
	this.sendCommand('-i', function(error, stdout) {
		var settings = {
			on: false,
			color: {H: 255, S: 100, L: 50}
		};

		var colors = stdout.match(/\(\d{3}\, \d{3}, \d{3}\)/g);
		var isOn = stdout.match(/\] ON /g);

		if(isOn && isOn.length > 0) settings.on = true;
		if(colors && colors.length > 0) {
			var converted = convert.rgb.hsl(stdout.match(/\d{3}/g));
			settings.color = {
				H: converted[0],
				S: converted[1],
				L: converted[2],
			};
		}

		callback(settings);

	});
};

HLightStripAccessory.prototype.getColorFromDevice = function() {
	this.getState(function(settings) {
		this.color = settings.color;
		this.log("Cor: %s", settings.color.H+','+settings.color.S+','+settings.color.L);
	}.bind(this));
};

HLightStripAccessory.prototype.setToCurrentColor = function() {
	var color = this.color;

    if(color.S == 0 && color.H == 0 && this.purewhite) {
        this.setToWarmWhite();
        return
    }

	var brightness = this.brightness;
	var converted = convert.hsl.rgb([color.H, color.S, color.L]);

    var base = '-x ' + this.setup + ' -c';
	this.sendCommand(base + Math.round((converted[0] / 100) * brightness) + ',' + Math.round((converted[1] / 100) * brightness) + ',' + Math.round((converted[2] / 100) * brightness));
};

HLightStripAccessory.prototype.setToWarmWhite = function() {
    var brightness = this.brightness;
    this.sendCommand('-w ' + brightness);
};

HLightStripAccessory.prototype.getPowerState = function(callback) {
	this.getState(function(settings) {
		callback(null, settings.on);
	});
};

HLightStripAccessory.prototype.setPowerState = function(value, callback) {
	this.sendCommand(value ? '--on' : '--off', function() {
		callback();
	});
};

HLightStripAccessory.prototype.getHue = function(callback) {
	var color = this.color;
	callback(null, color.H);
};

HLightStripAccessory.prototype.setHue = function(value, callback) {
	this.color.H = value;
	this.setToCurrentColor();
	callback();
};

HLightStripAccessory.prototype.getBrightness = function(callback) {
	var brightness = this.brightness;
	callback(null, brightness);
};

HLightStripAccessory.prototype.setBrightness = function(value, callback) {
	this.brightness = value;
	this.setToCurrentColor();
	this.log("Brilho: %s", value);
	callback();
};

HLightStripAccessory.prototype.getSaturation = function(callback) {
	var color = this.color;
	callback(null, color.S);
};

HLightStripAccessory.prototype.setSaturation = function(value, callback) {
	this.color.S = value;
	this.setToCurrentColor();
	callback();
};