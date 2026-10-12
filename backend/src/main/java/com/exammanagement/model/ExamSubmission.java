package com.exammanagement.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Document(collection = "exam_submissions")
public class ExamSubmission {

    @Id
    private String id;

    private String examId;
    private String examTitle;
    private String examCode;
    private String studentId;
    private String studentName;
    private String studentEmail;
    private int attemptNumber = 1;

    private Instant startTime;
    private Instant submitTime;
    private SubmissionStatus status = SubmissionStatus.IN_PROGRESS;

    private Map<String, StudentAnswer> answers = new HashMap<>();
    private Map<String, QuestionEvaluation> evaluations = new HashMap<>();

    private double totalScore = 0.0;
    private double maxScore = 0.0;
    private double percentage = 0.0;
    private boolean passed = false;

    private String gradedBy;
    private Instant gradedAt;

    private int proctorWarningsCount = 0;
    private List<ProctorEvent> proctorLogs = new ArrayList<>();

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public ExamSubmission() {
        this.startTime = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getExamId() {
        return examId;
    }

    public void setExamId(String examId) {
        this.examId = examId;
    }

    public String getExamTitle() {
        return examTitle;
    }

    public void setExamTitle(String examTitle) {
        this.examTitle = examTitle;
    }

    public String getExamCode() {
        return examCode;
    }

    public void setExamCode(String examCode) {
        this.examCode = examCode;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public int getAttemptNumber() {
        return attemptNumber;
    }

    public void setAttemptNumber(int attemptNumber) {
        this.attemptNumber = attemptNumber;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getSubmitTime() {
        return submitTime;
    }

    public void setSubmitTime(Instant submitTime) {
        this.submitTime = submitTime;
    }

    public SubmissionStatus getStatus() {
        return status;
    }

    public void setStatus(SubmissionStatus status) {
        this.status = status;
    }

    public Map<String, StudentAnswer> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<String, StudentAnswer> answers) {
        this.answers = answers != null ? answers : new HashMap<>();
    }

    public Map<String, QuestionEvaluation> getEvaluations() {
        return evaluations;
    }

    public void setEvaluations(Map<String, QuestionEvaluation> evaluations) {
        this.evaluations = evaluations != null ? evaluations : new HashMap<>();
    }

    public double getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(double totalScore) {
        this.totalScore = totalScore;
    }

    public double getMaxScore() {
        return maxScore;
    }

    public void setMaxScore(double maxScore) {
        this.maxScore = maxScore;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }

    public boolean isPassed() {
        return passed;
    }

    public void setPassed(boolean passed) {
        this.passed = passed;
    }

    public String getGradedBy() {
        return gradedBy;
    }

    public void setGradedBy(String gradedBy) {
        this.gradedBy = gradedBy;
    }

    public Instant getGradedAt() {
        return gradedAt;
    }

    public void setGradedAt(Instant gradedAt) {
        this.gradedAt = gradedAt;
    }

    public int getProctorWarningsCount() {
        return proctorWarningsCount;
    }

    public void setProctorWarningsCount(int proctorWarningsCount) {
        this.proctorWarningsCount = proctorWarningsCount;
    }

    public List<ProctorEvent> getProctorLogs() {
        return proctorLogs;
    }

    public void setProctorLogs(List<ProctorEvent> proctorLogs) {
        this.proctorLogs = proctorLogs != null ? proctorLogs : new ArrayList<>();
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
