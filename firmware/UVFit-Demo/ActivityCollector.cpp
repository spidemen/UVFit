//-------------------------------------------------------------------

#include "ActivityCollector.h"

//-------------------------------------------------------------------



//-------------------------------------------------------------------

ActivityCollector::ActivityCollector(AssetTracker &theTracker, 
                  Adafruit_VEML6070 &theVEML6070,
                  int samples) : 
    gpsSensor(theTracker), uvSensor(theVEML6070), 
    speedSamples(samples), uvSamples(samples) {    
        
    this->samples = samples;
    sampleIndex = 0;
    avgSpeed = 0;
    avgUV = 0;
    collectData = false;
    datapointCollected = false;
    state = S_Wait;
}

//-------------------------------------------------------------------

void ActivityCollector::execute() {
    
    switch (state) {
        case ActivityCollector::S_Wait:
            sampleIndex = 0;
            
            if (collectData) {
                collectData = false;
                state = ActivityCollector::S_Sample;
            }
            else {
                state = ActivityCollector::S_Wait;
            }
            break;

        case ActivityCollector::S_Sample:
            Serial.println("Sampling");
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
            Serial.println("Filtering");
            avgSpeed = 0.0;
            for (int i = 0; i < samples; ++i) {
                avgSpeed += speedSamples.at(i);
                avgUV += static_cast<float>(uvSamples.at(i));
            }
            avgSpeed = avgSpeed / samples;
            avgUV = avgUV / samples;

            datapointCollected = true;
            state = ActivityCollector::S_WaitUntilPublished;
            
            break;

        case ActivityCollector::S_WaitUntilPublished:
            if (datapointCollected) {
                state = ActivityCollector::S_WaitUntilPublished;
            }
            else {
                state = ActivityCollector::S_Wait;
            }
            break;
            
        default:
            Serial.println("Collector State Error!");
            break;
    }
}

//-------------------------------------------------------------------

void ActivityCollector::setCollectData(bool collectData){
    this->collectData = collectData;
}

//-------------------------------------------------------------------

bool ActivityCollector::isCollected(){
    return datapointCollected;
}

//-------------------------------------------------------------------

void ActivityCollector::setPublished(){
    datapointCollected = false;
}

//-------------------------------------------------------------------