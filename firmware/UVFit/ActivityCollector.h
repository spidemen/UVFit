#ifndef ACTIVITY_COLLECTOR_H
#define ACTIVITY_COLLECTOR_H

//-------------------------------------------------------------------

#include <AssetTracker.h>
#include <Adafruit_VEML6070.h>
#include <vector>
#include <deque>

//-------------------------------------------------------------------

using namespace std;

//-------------------------------------------------------------------

class ActivityCollector {
    enum State { S_Wait, S_Sample, S_Filter, S_WaitToSample, S_WaitUntilPublished };
    
public:
    ActivityCollector(AssetTracker &theTracker, Adafruit_VEML6070 &uvSensor, int samples, int uvThreshold);
    
    void popDatapoint();
    
    float getFrontLong()  { return this->longitudes.front(); }
    float getFrontLat()   { return this->latitudes.front(); }
    float getFrontSpeed() { return this->speedData.front(); }
    float getFrontUV()    { return this->uvData.front(); }
    int   getFrontTime()  { return this->timestamps.front(); }
    
    void readdTempData(float tempLon, float tempLat, float tempSpeed, float tempUV, int tempTime);
    
    int getSizeDatapoints() { return this->timestamps.size(); }
    
    float evaluateSpeed(float sampSpeed);
    void evaluateAutoPause(float currSpeed);
    
    void setUVThreshold(int uvThreshold);
    void evalUVExposure();
    
    void setButtonPressed(bool buttonPressed, int duration);
    bool isCollected();
    void setPublished();
    void execute();
    
private:
    int samples;

private:
    State state;
    vector<float> speedSamples;
    vector<uint16_t> uvSamples;
    
    float avgSpeed;
    float avgUV;
    float assignedSpeed;
    
    bool paused;
    int uvThreshold;
    
    double uvExposure;
    
    deque<float> longitudes;
    deque<float> latitudes;
    deque<float> speedData;
    deque<float> uvData;
    deque<int>   timestamps;
    int sampleIndex;
    bool buttonPressed;
    int buttonDuration;
    bool activityCollected;
    int tick;
    AssetTracker& gpsSensor;
    Adafruit_VEML6070& uvSensor;
    
    LEDStatus collectorStatus;
};

//-------------------------------------------------------------------

#endif