package com.exammanagement.dto.request;

import com.exammanagement.model.ExamStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class ExamCreateRequest {

    @NotBlank(message = "Exam title is required")
    private String title;

    @NotBlank(message = "Exam code is required")
    private String code;

    private String description;
    private String instructions;

    @NotBlank(message = "Subject ID is required")
    private String subjectId;

    private String department;
    private List<String> assignedExaminerIds = new ArrayList<>();
    private List<String> enrolledStudentIds = new ArrayList<>();

    @Positive(message = "Duration must be greater than 0")
    private int durationMinutes = 60;

    private double totalMarks = 100.0;
    private double passingMarks = 40.0;
    private Instant startTime;
    private Instant endTime;
    private ExamStatus status = ExamStatus.DRAFT;

    private List<String> questionIds = new ArrayList<>();
    private boolean shuffleQuestions = false;
    private boolean shuffleOptions = false;
    private boolean showResultsImmediately = true;
    private boolean allowReview = true;
    private int maxAttempts = 1;

    public ExamCreateRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public String getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(String subjectId) {
        this.subjectId = subjectId;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public List<String> getAssignedExaminerIds() {
        return assignedExaminerIds;
    }

    public void setAssignedExaminerIds(List<String> assignedExaminerIds) {
        this.assignedExaminerIds = assignedExaminerIds != null ? assignedExaminerIds : new ArrayList<>();
    }

    public List<String> getEnrolledStudentIds() {
        return enrolledStudentIds;
    }

    public void setEnrolledStudentIds(List<String> enrolledStudentIds) {
        this.enrolledStudentIds = enrolledStudentIds != null ? enrolledStudentIds : new ArrayList<>();
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(int durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public double getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(double totalMarks) {
        this.totalMarks = totalMarks;
    }

    public double getPassingMarks() {
        return passingMarks;
    }

    public void setPassingMarks(double passingMarks) {
        this.passingMarks = passingMarks;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }

    public ExamStatus getStatus() {
        return status;
    }

    public void setStatus(ExamStatus status) {
        this.status = status;
    }

    public List<String> getQuestionIds() {
        return questionIds;
    }

    public void setQuestionIds(List<String> questionIds) {
        this.questionIds = questionIds != null ? questionIds : new ArrayList<>();
    }

    public boolean isShuffleQuestions() {
        return shuffleQuestions;
    }

    public void setShuffleQuestions(boolean shuffleQuestions) {
        this.shuffleQuestions = shuffleQuestions;
    }

    public boolean isShuffleOptions() {
        return shuffleOptions;
    }

    public void setShuffleOptions(boolean shuffleOptions) {
        this.shuffleOptions = shuffleOptions;
    }

    public boolean isShowResultsImmediately() {
        return showResultsImmediately;
    }

    public void setShowResultsImmediately(boolean showResultsImmediately) {
        this.showResultsImmediately = showResultsImmediately;
    }

    public boolean isAllowReview() {
        return allowReview;
    }

    public void setAllowReview(boolean allowReview) {
        this.allowReview = allowReview;
    }

    public int getMaxAttempts() {
        return maxAttempts;
    }

    public void setMaxAttempts(int maxAttempts) {
        this.maxAttempts = maxAttempts;
    }
}
