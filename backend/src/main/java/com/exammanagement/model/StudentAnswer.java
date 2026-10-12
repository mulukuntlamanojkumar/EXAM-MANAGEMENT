package com.exammanagement.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class StudentAnswer {

    private String questionId;
    private List<String> selectedOptions = new ArrayList<>();
    private String textAnswer;
    private boolean flagged;
    private Instant answeredAt;

    public StudentAnswer() {
        this.answeredAt = Instant.now();
    }

    public StudentAnswer(String questionId, List<String> selectedOptions, String textAnswer, boolean flagged) {
        this.questionId = questionId;
        this.selectedOptions = selectedOptions != null ? selectedOptions : new ArrayList<>();
        this.textAnswer = textAnswer;
        this.flagged = flagged;
        this.answeredAt = Instant.now();
    }

    public String getQuestionId() {
        return questionId;
    }

    public void setQuestionId(String questionId) {
        this.questionId = questionId;
    }

    public List<String> getSelectedOptions() {
        return selectedOptions;
    }

    public void setSelectedOptions(List<String> selectedOptions) {
        this.selectedOptions = selectedOptions != null ? selectedOptions : new ArrayList<>();
    }

    public String getTextAnswer() {
        return textAnswer;
    }

    public void setTextAnswer(String textAnswer) {
        this.textAnswer = textAnswer;
    }

    public boolean isFlagged() {
        return flagged;
    }

    public void setFlagged(boolean flagged) {
        this.flagged = flagged;
    }

    public Instant getAnsweredAt() {
        return answeredAt;
    }

    public void setAnsweredAt(Instant answeredAt) {
        this.answeredAt = answeredAt;
    }
}
