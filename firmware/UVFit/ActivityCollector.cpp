//-------------------------------------------------------------------

#include "ActivityCollector.h"

//-------------------------------------------------------------------



//-------------------------------------------------------------------

ActivityCollector::ActivityCollector(AssetTracker &theTracker, 
                  Adafruit_VEML6070 &theVEML6070,
                  int samples) : 
    gpsSensor(theTracker), uvSensor(theVEML6070), 
    speedSamples(samples), uvSamples(samples),
    collectorStatus(RGB_COLOR_BLUE, LED_PATTERN_BLINK, LED_PRIORITY_NORMAL) {    
        
    this->samples = samples;
    sampleIndex = 0;
    avgSpeed = 0;
    avgUV = 0;
    buttonPressed = false;
    activityCollected = false;
    state = S_Wait;
    tick = 0;
}

//-------------------------------------------------------------------

void ActivityCollector::execute() {
    
    switch (state) {
        case ActivityCollector::S_Wait:
            sampleIndex = 0;
            
            if (buttonPressed) {
                buttonPressed = false;
                state = ActivityCollector::S_Sample;
                Serial.println("Collecting Activity");
                collectorStatus.setActive(true);
            }
            else {
                state = ActivityCollector::S_Wait;
            }
            break;

        case ActivityCollector::S_Sample:
            tick++;
            speedSamples.at(sampleIndex) = gpsSensor.getSpeed();
            uvSamples.at(sampleIndex) = uvSensor.readUV();
            sampleIndex++;
            
            if (sampleIndex == samples) {
                state = ActivityCollector::S_Filter;
            }
            else {
                state = ActivityCollector::S_Sample;
            }
            break;

        case ActivityCollector::S_Filter:
            tick++;
            avgSpeed = 0.0;
            avgUV = 0.0;
            for (int i = 0; i < samples; ++i) {
                avgSpeed += speedSamples.at(i);
                avgUV += static_cast<float>(uvSamples.at(i));
            }
            
            latitudes.push_back(gpsSensor.readLatDeg());
            longitudes.push_back(gpsSensor.readLonDeg());
            speedData.push_back(avgSpeed / samples);
            uvData.push_back(avgUV / samples);
            timestamps.push_back(Time.now());
            
            state = ActivityCollector::S_WaitToSample;
            
            break;
            
        case ActivityCollector::S_WaitToSample:
            tick++;
            sampleIndex = 0;
            if(buttonPressed) {
                buttonPressed = false;
                activityCollected = true;
                state = ActivityCollector::S_WaitUntilPublished;
            }
            else if (tick >= 100) {
                tick = 0;
                state = ActivityCollector::S_Sample;
                
                for (int i=0; i < latitudes.size(); i++) {
                    Serial.print(latitudes.at(i));
                    Serial.print(' ');
                }
                Serial.println();
                for (int i=0; i < longitudes.size(); i++) {
                    Serial.print(longitudes.at(i));
                    Serial.print(' ');
                }
                Serial.println();
                for (int i=0; i < speedData.size(); i++) {
                    Serial.print(speedData.at(i));
                    Serial.print(' ');
                }
                Serial.println();
                for (int i=0; i < uvData.size(); i++) {
                    Serial.print(uvData.at(i));
                    Serial.print(' ');
                }
                Serial.println();
                for (int i=0; i < timestamps.size(); i++) {
                    Serial.print(timestamps.at(i));
                    Serial.print(' ');
                }
                Serial.println();
            }
            else {
                state = ActivityCollector::S_WaitToSample;
            }
            
            break;

        case ActivityCollector::S_WaitUntilPublished:
            if (activityCollected) {
                collectorStatus.setActive(false);
                state = ActivityCollector::S_WaitUntilPublished;
            }
            else {
                Serial.println("Collector Ready");
                state = ActivityCollector::S_Wait;
            }
            break;
            
        default:
            Serial.println("Collector State Error!");
            break;
    }
}

//-------------------------------------------------------------------

void ActivityCollector::setButtonPressed(bool buttonPressed, int duration) {
    this->buttonPressed = buttonPressed;
    this->buttonDuration = duration;
}

//-------------------------------------------------------------------

bool ActivityCollector::isCollected() {
    return activityCollected;
}

//-------------------------------------------------------------------

void ActivityCollector::setPublished() {
    activityCollected = false;
}

//-------------------------------------------------------------------

void ActivityCollector::popDatapoint() {
    this->longitudes.pop_front();
    this->latitudes.pop_front();
    this->speedData.pop_front();
    this->uvData.pop_front();
    this->timestamps.pop_front();
}

//-------------------------------------------------------------------

void ActivityCollector::readdTempData(float tempLon, float tempLat, float tempSpeed, float tempUV, int tempTime) {
    this->longitudes.push_front(tempLon);
    this->latitudes.push_front(tempLat);
    this->speedData.push_front(tempSpeed);
    this->uvData.push_front(tempUV);
    this->timestamps.push_front(tempTime);
}

//-------------------------------------------------------------------