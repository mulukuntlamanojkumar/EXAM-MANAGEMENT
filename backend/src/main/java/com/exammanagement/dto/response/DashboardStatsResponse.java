package com.exammanagement.dto.response;

import com.exammanagement.model.Exam;
import com.exammanagement.model.ExamSubmission;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DashboardStatsResponse {

    private long totalStudents;
    private long totalExaminers;
    private long totalExams;
    private long activeExams;
    private long totalQuestions;
    private long totalSubmissions;
    private double passPercentage;
    private double averageScore;
    private List<ExamSubmission> recentSubmissions = new ArrayList<>();
    private List<Exam> recentExams = new ArrayList<>();
    private Map<String, Long> departmentStats = new HashMap<>();

    public DashboardStatsResponse() {
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalExaminers() {
        return totalExaminers;
    }

    public void setTotalExaminers(long totalExaminers) {
        this.totalExaminers = totalExaminers;
    }

    public long getTotalExams() {
        return totalExams;
    }

    public void setTotalExams(long totalExams) {
        this.totalExams = totalExams;
    }

    public long getActiveExams() {
        return activeExams;
    }

    public void setActiveExams(long activeExams) {
        this.activeExams = activeExams;
    }

    public long getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(long totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public long getTotalSubmissions() {
        return totalSubmissions;
    }

    public void setTotalSubmissions(long totalSubmissions) {
        this.totalSubmissions = totalSubmissions;
    }

    public double getPassPercentage() {
        return passPercentage;
    }

    public void setPassPercentage(double passPercentage) {
        this.passPercentage = passPercentage;
    }

    public double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(double averageScore) {
        this.averageScore = averageScore;
    }

    public List<ExamSubmission> getRecentSubmissions() {
        return recentSubmissions;
    }

    public void setRecentSubmissions(List<ExamSubmission> recentSubmissions) {
        this.recentSubmissions = recentSubmissions;
    }

    public List<Exam> getRecentExams() {
        return recentExams;
    }

    public void setRecentExams(List<Exam> recentExams) {
        this.recentExams = recentExams;
    }

    public Map<String, Long> getDepartmentStats() {
        return departmentStats;
    }

    public void setDepartmentStats(Map<String, Long> departmentStats) {
        this.departmentStats = departmentStats;
    }
}
