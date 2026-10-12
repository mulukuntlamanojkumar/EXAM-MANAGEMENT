package com.exammanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ManualGradeRequest {

    @NotBlank(message = "Question ID is required")
    private String questionId;

    @NotNull(message = "Awarded marks is required")
    private Double awardedMarks;

    private String examinerComment;

    public ManualGradeRequest() {
    }

    public String getQuestionId() {
        return questionId;
    }

    public void setQuestionId(String questionId) {
        this.questionId = questionId;
    }

    public Double getAwardedMarks() {
        return awardedMarks;
    }

    public void setAwardedMarks(Double awardedMarks) {
        this.awardedMarks = awardedMarks;
    }

    public String getExaminerComment() {
        return examinerComment;
    }

    public void setExaminerComment(String examinerComment) {
        this.examinerComment = examinerComment;
    }
}
