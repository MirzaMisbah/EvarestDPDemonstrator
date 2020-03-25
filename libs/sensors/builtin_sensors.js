/**
 * Sensor Events
 *  devicelight             ==
 devicemotion            ==
 deviceorientation       ==
 deviceproximity         ==
 orientationchange       ==
 userproximity           ==
 *
 *
 * https://developer.mozilla.org/en-US/docs/Web/Events
 *
 */

/**
 *       {
 eventName: "",
 sensorName: "",
 listener: null
 }
 */
var listeners = [{
    eventName : "devicelight",
    sensorName : "Light",
    listener : listener
}, {
    eventName : "devicemotion",
    sensorName : "Motion",
    listener : motion_listener
}, {
    eventName : "deviceorientation",
    sensorName : "Orientation",
    listener : orientation_listener
}, {
    eventName : "deviceproximity",
    sensorName : "",
    listener : listener
}, {
    eventName : "orientationchange",
    sensorName : "",
    listener : listener
}, {
    eventName : "userproximity",
    sensorName : "",
    listener : listener
}];

function register_listeners() {
    let sensor = new Gyroscope({frequency: 0.1}); // 10 seconds
    sensor.start();
        
    sensor.onreading = () => {
        console.log("Angular velocity around the X-axis " + sensor.x);
        console.log("Angular velocity around the Y-axis " + sensor.y);
        console.log("Angular velocity around the Z-axis " + sensor.z);
        console.log(sensor.timestamp, new Date(sensor.timestamp));
    };
    
    sensor.onerror = event => console.log(event.error.name, event.error.message);  
}

function listener(event) {
    console.log(event);
}

/**
 * The devicemotion event is fired at a regular interval and indicates the amount of physical force of acceleration the device is receiving at that time. 
 * It also provides information about the rate of rotation, if available.
 */
//TODO: how to fix interval
function motion_listener(event) {
     // 
     // event.timeStamp 
    var value = {};
    // The interval, in milliseconds, at which the DeviceMotionEvent is fired. The next event will be fired in approximately this amount of time.
    value.interval                        = event.interval;
    value.timeStamp                       = new Date(event.timeStamp);
    // The acceleration of the device. This value has taken into account the effect of gravity and removed it from the figures.
    // This value may not exist if the hardware doesn't know how to remove gravity from the acceleration data.
    value.acceleration                    = event.acceleration; // x, y, z
    // The acceleration of the device. 
    // This value includes the effect of gravity, and may be the only value available on devices that don't have a gyroscope to allow them to properly remove gravity from the data.
    value.accelerationIncludingGravity    = event.accelerationIncludingGravity; // x, y, z
    // The rates of rotation of the device about all three axes
    value.rotationRate                    = event.rotationRate; // alpha, beta, gamma    
    value.sensor                          = event.type;
    
    console.log("[motion_listener]", value);
}
/**
 * The deviceorientation event is fired when fresh data is available from an orientation sensor about the current orientation of the device as compared to the Earth coordinate frame.
 * This data is gathered from a magnetometer inside the device
 * @source: https://developer.mozilla.org/en-US/docs/Web/Events/deviceorientation
 */
function orientation_listener(event){
    var value = {};
    value.timeStamp                       = new Date(event.timeStamp);
    // The current orientation of the device around the X axis; that is, how far the device is tipped forward or backward
    value.beta                            = event.beta;
    // The current orientation of the device around the Y axis; that is, how far the device is turned left or right.
    value.gamma                           = event.gamma;
    // The current orientation of the device around the Z axis; that is, how far the device is rotated around a line perpendicular to the device.
    value.alpha                           = event.alpha;
    
    value.sensor                          = event.type;
    console.log("[orientation_listener]", value);
    
}
