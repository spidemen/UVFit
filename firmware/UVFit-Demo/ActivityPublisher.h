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
    Failure
} ResponseStatus_t;

//-------------------------------------------------------------------

class ActivityPublisher {
    enum State { S_Wait, S_Publish, S_WaitForResponse, S_Notify };
    
public:
    ActivityPublisher(ActivityCollector &theCollector);
    void execute();
    void setPublishStatus(ResponseStatus status);
    
private:
    int rate;
    
private:
    State state;
    int tick;
    ResponseStatus publishStatus;
    ActivityCollector& activityCollector;

};

//-------------------------------------------------------------------

#endif