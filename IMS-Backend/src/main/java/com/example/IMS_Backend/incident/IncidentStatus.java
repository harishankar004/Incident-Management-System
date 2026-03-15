package com.example.IMS_Backend.incident;

public enum IncidentStatus {
    NEW,          // Created by Reporter (End User)
    LOGGED,       // Validated by Incident Manager
    CATEGORIZED,  // Category & priority set by Incident Manager
    ASSIGNED,     // Assigned to Resolver by Incident Manager
    IN_PROGRESS,  // Being worked on by Resolver
    RESOLVED,     // Resolution submitted by Resolver
    CLOSED,       // Closed by Incident Manager
    REOPENED,     // Reopened by Incident Manager
    ESCALATED     // Escalated by Incident Manager
}
