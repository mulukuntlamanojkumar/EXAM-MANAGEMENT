package com.exammanagement.service;

import com.exammanagement.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuditService {
    void logAction(String userId, String username, String action, String details, String ipAddress);
    Page<AuditLog> getLogs(Pageable pageable);
}
