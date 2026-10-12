package com.exammanagement.service.impl;

import com.exammanagement.model.AuditLog;
import com.exammanagement.repository.AuditLogRepository;
import com.exammanagement.service.AuditService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditServiceImpl(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public void logAction(String userId, String username, String action, String details, String ipAddress) {
        AuditLog log = new AuditLog(userId, username, action, details, ipAddress);
        auditLogRepository.save(log);
    }

    @Override
    public Page<AuditLog> getLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable);
    }
}
