var sender; // in control_sensors.js

function init_sensors(){
    // we determine available sensors by checking if we are on the smartphone or the desktop
    var sensorsToActivate =  navigator.userAgent.match(/Android/i)? ["Accelerometer",  "Gyroscope",  "LinearAccelerationSensor"]: ["RandomSensor"];
    
    var frequency = 5;   
    
    sensorsToActivate.forEach(function(sensorName){             
        var sensor = new Sensor(sensorName, frequency, null);          
        sensors.push(sensor);
    }); 
    
}
function activate_sensors(lap){
    sensors.forEach(function(sensor){
        var dataChannel = new DataChannel(lap, [], sensor.name, null, myContactInfo.email, 'streaming');
        myContactInfo.dataChannels.push(dataChannel);        
        sensor.start(dataChannel);    
    });    
}

function deactivate_minion() {
    app.minionManager.killMinion('Hit detection');
}

function activate_minion(lap) {
    var minionToCall = 'Hit detection';
    var inputs = [findDataChannel('Gyroscope*' + lap, myContactInfo), findDataChannel('LinearAccelerationSensor*' + lap)];
    var output = findDataChannel('Hit detection*' + lap);
    if (!output){
        output = new DataChannel(lap, [], minionToCall, null, myContactInfo.email);
    }
    var instanceId = app.minionManager.createNewInstance(minionToCall, myContactInfo.email);
    myContactInfo.dataChannels.push(output);
    app.minionManager.setDataChannelsOfSingleInstance(minionToCall, instanceId, inputs, [output]);

}
function deactivate_sensors(){     
     sensors.forEach(function(sensor){         
        sensor.stop();
     });   
}
function activate_sender(targetPeerEmail, lap, interval){    
    // we send the channels for the given lap only!
    var channelsToSend = myContactInfo.dataChannels.values.filter(function(channel){
        return channel.name === lap;
    });
    sender = new Sender(communicationHelper, channelsToSend);
    sender.start(targetPeerEmail, interval, lap);    
}
function deactivate_sender(){
    if(sender){
        sender.stop();
    }
}
