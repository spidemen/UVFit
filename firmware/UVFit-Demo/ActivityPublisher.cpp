//-------------------------------------------------------------------

#include "ActivityPublisher.h"

//-------------------------------------------------------------------



//-------------------------------------------------------------------

ActivityPublisher::ActivityPublisher(ActivityCollector &theCollector) :
    activityCollector(theCollector) {
    
    tick = 0;
    publishStatus = NoResponse;
    state = S_Wait;
}

//-------------------------------------------------------------------

void ActivityPublisher::execute() {

    String postData = String::format("{ \"longitude\": \"%f\", \"latitude\": \"%f\", \"speed\": \"%f\", \"uvIntensity\": \"%f\" }",
                                     activityCollector.getLonDeg(), activityCollector.getLatDeg(), activityCollector.getAvgSpeed(), activityCollector.getAvgUV());
    
    switch (state) {
        case ActivityPublisher::S_Wait:
            tick = 0;
            if (activityCollector.isCollected()){
                state = ActivityPublisher::S_Publish;
            }
            else {
                state = ActivityPublisher::S_Wait;
            }
            break;
            
        case ActivityPublisher::S_Publish:
            Serial.println("Publishing");
            Serial.println(postData);
            Particle.publish("datapoint", postData);
            Serial.println("Published!");
            ++tick;
            
            state = ActivityPublisher::S_Notify;
            break;
            
        case ActivityPublisher::S_WaitForResponse:
            ++tick;
            Serial.print("publishStatus: ");
            Serial.println(publishStatus);
            if (publishStatus == Success ||
                publishStatus == Failure) {
                
                state = ActivityPublisher::S_Notify;
                
            }
            else if (tick > 500) {
                publishStatus = Failure;
                state = ActivityPublisher::S_Notify;
            }
            else {
                state = ActivityPublisher::S_WaitForResponse;
            }
            break;
            
        case ActivityPublisher::S_Notify:
            ++tick;
            if(tick >= 100){
                Serial.println("Notify, tick: " + String::format("%d", tick));
                activityCollector.setPublished();
                state = ActivityPublisher::S_Wait;
            }
            else {
                state = ActivityPublisher::S_Notify;
            }
            break;
            
        default:
            Serial.println("Publisher State Error!");
            break;
    }
}

//-------------------------------------------------------------------

void ActivityPublisher::setPublishStatus(ResponseStatus status) {
    publishStatus = status;
}

//-------------------------------------------------------------------