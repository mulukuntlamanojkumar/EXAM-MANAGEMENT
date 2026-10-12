package com.exammanagement.model;

import java.time.Instant;

public class ProctorEvent {

    private String eventType;
    private Instant timestamp;
    private String details;

    public ProctorEvent() {
        this.timestamp = Instant.now();
    }

    public ProctorEvent(String eventType, String details) {
        this.eventType = eventType;
        this.timestamp = Instant.now();
        this.details = details;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}
