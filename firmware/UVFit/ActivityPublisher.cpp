//-------------------------------------------------------------------

#include "ActivityPublisher.h"

#include <regex>

//-------------------------------------------------------------------

ActivityPublisher::ActivityPublisher(ActivityCollector &theCollector) :
    activityCollector(theCollector), 
    publisherStatus(RGB_COLOR_ORANGE, LED_PATTERN_BLINK, LED_SPEED_FAST, LED_PRIORITY_IMPORTANT) {
    
    tick = 0;
    postData = "";
    publishStatus = Unknown;
    state = S_Wait;
}

//-------------------------------------------------------------------

void ActivityPublisher::execute() {
    
    switch (state) {
        case ActivityPublisher::S_Wait:
            tick = 0;
            if (activityCollector.isCollected() && Particle.connected() && WiFi.ready()) {
                Serial.println("Publishing");
                publisherStatus.setColor(RGB_COLOR_ORANGE);
                publisherStatus.setPattern(LED_PATTERN_BLINK);
                publisherStatus.setActive(true);
                postData = String("{\"t\":\"begin\"}");
                Particle.publish("datapoints", postData);
                state = ActivityPublisher::S_WaitForResponse;
            }
            else if(activityCollector.isCollected()) {
                Particle.connect();
            }
            else {
                state = ActivityPublisher::S_Wait;
            }
            break;
            
        case ActivityPublisher::S_Publish:
            tick = 0;
            if (publishStatus == Success && Particle.connected() && WiFi.ready()) {
                postData = determinePublishString();
            }
            Serial.println(postData);
            Particle.publish("datapoints", postData);
            publishStatus = Unknown;
            
            state = ActivityPublisher::S_PublishDelay;
            break;
            
        case ActivityPublisher::S_WaitForResponse:
            ++tick;
            
            if (publishStatus == Success ||
                publishStatus == Failure) {
                Serial.print("publishStatus: ");
                Serial.println(publishStatus);
                state = ActivityPublisher::S_PublishDelay;
                
            }
            else if (tick > 500) {
                Serial.println("Publish Time Out");
                publishStatus = NoResponse;
                state = ActivityPublisher::S_PublishDelay;
            }
            else {
                state = ActivityPublisher::S_WaitForResponse;
            }
            break;
            
        case ActivityPublisher::S_PublishDelay:
            ++tick;
            if(activityCollector.getSizeDatapoints() == 0 && publishStatus == Success && tick > 100) {
                tick = 0;
                postData = String("{\"t\":\"end\"}");
                Particle.publish("datapoints", postData);
                
                state = ActivityPublisher::S_Notify;
            }
            else if(tick > 100) {
                tick = 0;
                state = ActivityPublisher::S_Publish;
            }
            else {
                state = ActivityPublisher::S_PublishDelay;
            }
            break;
            
        case ActivityPublisher::S_Notify:
            ++tick;
            publisherStatus.setColor(RGB_COLOR_GREEN);
            publisherStatus.setPattern(LED_PATTERN_SOLID);
            if (tick >= 300) {
                Serial.println("Activity Published!");
                activityCollector.setPublished();
                state = ActivityPublisher::S_Wait;
                publisherStatus.setActive(false);
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

void ActivityPublisher::setPublishStatus(String eventResponse) {
    publishStatus = Success;
}

//-------------------------------------------------------------------

String ActivityPublisher::determinePublishString() {
    String lgStr = "{\"lg\":\"";
    String lgDataStr = String::format("%f", activityCollector.getFrontLong());
    String ltStr = "\",\"lt\":\"";
    String ltDataStr = String::format("%f", activityCollector.getFrontLat());
    String sStr = "\",\"s\":\"";
    String sDataStr = String::format("%f", activityCollector.getFrontSpeed());
    String iStr = "\",\"i\":\"";
    String iDataStr = String::format("%f", activityCollector.getFrontUV());
    String tStr = "\",\"t\":\"";
    String tDataStr = String::format("%d", activityCollector.getFrontTime());
    String endStr = "\"}";
    
    activityCollector.popDatapoint();
    
    String returnStr = lgStr + lgDataStr + ltStr + ltDataStr + sStr + sDataStr + iStr + iDataStr + tStr + tDataStr + endStr;
    
    bool stringComplete = false;
    while(!stringComplete && activityCollector.getSizeDatapoints() > 0) {
        
        String tempLonStr = String::format(",%f", activityCollector.getFrontLong());
        String tempLatStr = String::format(",%f", activityCollector.getFrontLat());
        String tempSpeedStr = String::format(",%f", activityCollector.getFrontSpeed());
        String tempUVStr = String::format(",%f", activityCollector.getFrontUV());
        String tempTimeStr = String::format(",%d", activityCollector.getFrontTime());
        
        String newStr = lgStr + lgDataStr + tempLonStr + 
                        ltStr + ltDataStr + tempLatStr + 
                        sStr + sDataStr + tempSpeedStr +
                        iStr + iDataStr + tempUVStr +
                        tStr + tDataStr + tempTimeStr +
                        endStr;
        
        if (newStr.length() <= 255) {
            returnStr = newStr;
            lgDataStr += tempLonStr;
            ltDataStr += tempLatStr;
            sDataStr += tempSpeedStr;
            iDataStr += tempUVStr;
            tDataStr += tempTimeStr;
            
            activityCollector.popDatapoint();
        }
        else {
            stringComplete = true;
        }
        
    }
    return returnStr;
}

//-------------------------------------------------------------------
