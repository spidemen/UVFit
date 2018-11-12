#ifndef ACTIVITY_COLLECTOR_H
#define ACTIVITY_COLLECTOR_H

//-------------------------------------------------------------------

#include <vector>
#include <AssetTracker.h>
#include <Adafruit_VEML6070.h>

//-------------------------------------------------------------------

using namespace std;

//-------------------------------------------------------------------

class ActivityCollector {
    enum State { S_Wait, S_Sample, S_Filter, S_WaitUntilPublished };
    
public:
    ActivityCollector(AssetTracker &theTracker, Adafruit_VEML6070 &uvSensor, int samples);
    void setCollectData(bool collectData);
    bool isCollected();
    void setPublished();
    void execute();
    
    float getLatDeg() { return gpsSensor.readLatDeg(); }
    float getLonDeg() { return gpsSensor.readLonDeg(); }
    float getAvgSpeed() { return this->avgSpeed; }
    float getAvgUV() { return this->avgUV; }
    
private:
    int samples;

private:
    State state;
    vector<float> speedSamples;
    vector<uint16_t> uvSamples;
    int sampleIndex;
    float avgSpeed;
    float avgUV;
    bool collectData;
    bool datapointCollected;
    AssetTracker& gpsSensor;
    Adafruit_VEML6070& uvSensor;
    
};

//-------------------------------------------------------------------

#endif