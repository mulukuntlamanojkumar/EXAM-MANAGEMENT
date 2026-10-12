package com.exammanagement.model;

import java.util.ArrayList;
import java.util.List;

public class QuestionSnapshot {

    private String id;
    private QuestionType type;
    private String title;
    private List<String> options = new ArrayList<>();
    private List<String> correctAnswers = new ArrayList<>();
    private String explanation;
    private double marks = 1.0;
    private double negativeMarks = 0.0;
    private DifficultyLevel difficulty = DifficultyLevel.MEDIUM;

    public QuestionSnapshot() {
    }

    public QuestionSnapshot(Question q) {
        this.id = q.getId();
        this.type = q.getType();
        this.title = q.getTitle();
        this.options = new ArrayList<>(q.getOptions());
        this.correctAnswers = new ArrayList<>(q.getCorrectAnswers());
        this.explanation = q.getExplanation();
        this.marks = q.getMarks();
        this.negativeMarks = q.getNegativeMarks();
        this.difficulty = q.getDifficulty();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public QuestionType getType() {
        return type;
    }

    public void setType(QuestionType type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options != null ? options : new ArrayList<>();
    }

    public List<String> getCorrectAnswers() {
        return correctAnswers;
    }

    public void setCorrectAnswers(List<String> correctAnswers) {
        this.correctAnswers = correctAnswers != null ? correctAnswers : new ArrayList<>();
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public double getMarks() {
        return marks;
    }

    public void setMarks(double marks) {
        this.marks = marks;
    }

    public double getNegativeMarks() {
        return negativeMarks;
    }

    public void setNegativeMarks(double negativeMarks) {
        this.negativeMarks = negativeMarks;
    }

    public DifficultyLevel getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(DifficultyLevel difficulty) {
        this.difficulty = difficulty;
    }
}
