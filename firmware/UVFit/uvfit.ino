#include "ActivityCollector.h"
#include "ActivityPublisher.h"

//-------------------------------------------------------------------

using namespace std;

//-------------------------------------------------------------------

#define ONE_DAY_MILLIS (24 * 60 * 60 * 1000)
unsigned long lastSync = millis();

//-------------------------------------------------------------------

bool executeStateMachines = false;
float gpsAccuracy;

//-------------------------------------------------------------------

#define SAMPLES_TO_FILTER 10
#define INIT_THRES 50000

AssetTracker gpsSensor = AssetTracker();
Adafruit_VEML6070 uvSensor = Adafruit_VEML6070();
ActivityCollector activityCollector(gpsSensor, uvSensor, SAMPLES_TO_FILTER, INIT_THRES);
ActivityPublisher activityPublisher(activityCollector);

//-------------------------------------------------------------------

void stateMachineScheduler() {
    executeStateMachines = true;
}

Timer stateMachineTimer(10, stateMachineScheduler);

//-------------------------------------------------------------------

void button_handler(system_event_t event, int duration, void* ) {
    if (!duration) {
        Serial.println("Button Pressed!");
        activityCollector.setButtonPressed(true, duration);
    }
}

//-------------------------------------------------------------------

void datapointsHandler(const char *event, const char *data) {
    // Formatting output
    String output = String::format("POST Response:\n  %s\n  %s\n", event, data);
    // Log to serial console
    Serial.println(output);
    
    String dataStr = String::format("%s",data);
    
    activityPublisher.setPublishStatus(dataStr);
}

//-------------------------------------------------------------------

int updateThresholdHandler(String data) {
    int uvThres = atoi(data.c_str());
    activityCollector.setUVThreshold(uvThres);
    
    Serial.println("Threshold: " + data);
    
    digitalWrite(D7, HIGH);
    delay(200);
    digitalWrite(D7, LOW);
    delay(100);
    digitalWrite(D7, HIGH);
    delay(200);
    digitalWrite(D7, LOW);
    
    return 0;
}

//-------------------------------------------------------------------

//SYSTEM_MODE(SEMI_AUTOMATIC);
SYSTEM_THREAD(ENABLED);

void setup() {
    Serial.begin(9600);
    
    System.on(button_status, button_handler);
    
    pinMode(D7, OUTPUT);

    // Initialize the gps and turn it on    
    gpsSensor.begin();
    gpsSensor.gpsOn();
    
    //Initialize the uv sensor;
    uvSensor.begin(VEML6070_HALF_T);
    
    // Handler for response from POSTing location to server
    Particle.subscribe("hook-response/datapoints", datapointsHandler, MY_DEVICES);
    
    Particle.function("updateThres", updateThresholdHandler);
    
    stateMachineTimer.start();
}

//-------------------------------------------------------------------

void loop() {
    // Request time synchronization from the Particle Cloud once per day
    if (millis() - lastSync > ONE_DAY_MILLIS) {
        Particle.syncTime();
        lastSync = millis();
    }
    
    if (executeStateMachines) {
        gpsSensor.updateGPS();
        activityCollector.execute();
        activityPublisher.execute();
        executeStateMachines = false;
    }
}

//-------------------------------------------------------------------