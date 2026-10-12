package com.exammanagement.dto.request;

import jakarta.validation.constraints.NotBlank;

public class ProctorEventRequest {

    @NotBlank(message = "Event type is required")
    private String eventType;

    private String details;

    public ProctorEventRequest() {
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}
