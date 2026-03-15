package com.example.IMS_Backend.rbac;

public enum RoleCode {
    ADMIN,        // Governance only — never touches incidents
    REPORTER,     // End User — raise & track own incidents
    RESOLVER,     // Support Engineer (L2/L3) — investigate & resolve
    INC_MANAGER   // Incident Manager — log, categorize, assign, escalate, monitor SLAs
}
