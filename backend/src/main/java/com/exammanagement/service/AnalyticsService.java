package com.exammanagement.service;

import com.exammanagement.dto.response.DashboardStatsResponse;

public interface AnalyticsService {
    DashboardStatsResponse getDashboardStats();
    DashboardStatsResponse getExaminerStats(String examinerId);
    DashboardStatsResponse getStudentStats(String studentId);
}
