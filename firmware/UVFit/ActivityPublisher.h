#ifndef ACTIVITY_PUBLISHER_H
#define ACTIVITY_PUBLISHER_H

//-------------------------------------------------------------------

#include "ActivityCollector.h"

//-------------------------------------------------------------------

using namespace std;

//-------------------------------------------------------------------

typedef enum ResponseStatus {
    NoResponse,
    Success,
    Failure,
    Unknown
} ResponseStatus_t;

//-------------------------------------------------------------------

class ActivityPublisher {
    enum State { S_Wait, S_Publish, S_WaitForResponse, S_PublishDelay, S_Notify };
    
public:
    ActivityPublisher(ActivityCollector &theCollector);
    void execute();
    String determinePublishString();
    void setPublishStatus(String eventResponse);
    
private:
    int rate;
    
private:
    State state;
    int tick;
    String postData;
    ResponseStatus publishStatus;
    ActivityCollector& activityCollector;

    LEDStatus publisherStatus;
};

//-------------------------------------------------------------------

#endif