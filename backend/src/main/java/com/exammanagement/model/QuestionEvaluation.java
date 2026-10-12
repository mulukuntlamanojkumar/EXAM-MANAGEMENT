package com.exammanagement.model;

public class QuestionEvaluation {

    private String questionId;
    private double awardedMarks;
    private double maxMarks;
    private boolean correct;
    private String examinerComment;
    private boolean autoGraded;

    public QuestionEvaluation() {
    }

    public QuestionEvaluation(String questionId, double awardedMarks, double maxMarks, boolean correct, String examinerComment, boolean autoGraded) {
        this.questionId = questionId;
        this.awardedMarks = awardedMarks;
        this.maxMarks = maxMarks;
        this.correct = correct;
        this.examinerComment = examinerComment;
        this.autoGraded = autoGraded;
    }

    public String getQuestionId() {
        return questionId;
    }

    public void setQuestionId(String questionId) {
        this.questionId = questionId;
    }

    public double getAwardedMarks() {
        return awardedMarks;
    }

    public void setAwardedMarks(double awardedMarks) {
        this.awardedMarks = awardedMarks;
    }

    public double getMaxMarks() {
        return maxMarks;
    }

    public void setMaxMarks(double maxMarks) {
        this.maxMarks = maxMarks;
    }

    public boolean isCorrect() {
        return correct;
    }

    public void setCorrect(boolean correct) {
        this.correct = correct;
    }

    public String getExaminerComment() {
        return examinerComment;
    }

    public void setExaminerComment(String examinerComment) {
        this.examinerComment = examinerComment;
    }

    public boolean isAutoGraded() {
        return autoGraded;
    }

    public void setAutoGraded(boolean autoGraded) {
        this.autoGraded = autoGraded;
    }
}
