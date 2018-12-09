//-------------------------------------------------------------------

#include "ActivityCollector.h"

//-------------------------------------------------------------------

#define ZEROTHRESH .75

//-------------------------------------------------------------------

ActivityCollector::ActivityCollector(AssetTracker &theTracker, 
                  Adafruit_VEML6070 &theVEML6070,
                  int samples, int uvThreshold) : 
    gpsSensor(theTracker), uvSensor(theVEML6070), 
    speedSamples(samples), uvSamples(samples),
    collectorStatus(RGB_COLOR_BLUE, LED_PATTERN_BLINK, LED_PRIORITY_CRITICAL) {    
        
    this->samples = samples;
    this->uvThreshold = uvThreshold;
    sampleIndex = 0;
    avgSpeed = 0;
    avgUV = 0;
    assignedSpeed = 0;
    paused = false;
    uvExposure = 0;
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
            uvExposure = 0;
            paused = false;
            collectorStatus.setPattern(LED_PATTERN_BLINK);
            collectorStatus.setSpeed(LED_SPEED_NORMAL);
            digitalWrite(D7, LOW);
            
            if (buttonPressed) {
                Particle.disconnect();
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
            avgSpeed /= samples;
            avgUV /= samples;
            
            assignedSpeed = this->evaluateSpeed(avgSpeed);
            this->evaluateAutoPause(assignedSpeed);
            
            if (!paused) {
                latitudes.push_back(gpsSensor.readLatDeg());
                longitudes.push_back(gpsSensor.readLonDeg());
                speedData.push_back(assignedSpeed);
                uvData.push_back(avgUV);
                timestamps.push_back(Time.now());
                
                uvExposure += avgUV;
            }
            
            evalUVExposure();
            
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
                
                if (paused) {
                    Serial.println("Paused");
                }
                else {
                    Serial.print(latitudes.back());
                    Serial.print(' ');
                    
                    Serial.print(longitudes.back());
                    Serial.print(' ');
                    
                    Serial.print(speedData.back());
                    Serial.print(' ');
                    
                    Serial.print(uvData.back());
                    Serial.print(' ');
                    
                    Serial.print(timestamps.back());
                    Serial.print(' ');
                    
                    Serial.println();
                }
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

float ActivityCollector::evaluateSpeed(float sampSpeed){
    if (sampSpeed < ZEROTHRESH) {
        return 0;
    }
    else {
        return sampSpeed;
    }
}

//-------------------------------------------------------------------

void ActivityCollector::evaluateAutoPause(float currSpeed){
    int numSpeeds = speedData.size();
    
    if (numSpeeds < 2) {
        return;
    }
    
    float prevSpeed = speedData.at(numSpeeds-1);
    float secondPrevSpeed = speedData.at(numSpeeds-2);
    
    if (prevSpeed == 0 && secondPrevSpeed == 0) {
        paused = true;
        collectorStatus.setPattern(LED_PATTERN_FADE);
        collectorStatus.setSpeed(LED_SPEED_SLOW);
    }
    if (currSpeed > 0) {
        paused = false;
        collectorStatus.setPattern(LED_PATTERN_BLINK);
        collectorStatus.setSpeed(LED_SPEED_NORMAL);
    }
}

//-------------------------------------------------------------------

void ActivityCollector::setUVThreshold(int uvThreshold) {
    this->uvThreshold = uvThreshold;
}

//-------------------------------------------------------------------

void ActivityCollector::evalUVExposure() {
    if (this->uvExposure > this->uvThreshold) {
        digitalWrite(D7, HIGH);
    }
}

//-------------------------------------------------------------------