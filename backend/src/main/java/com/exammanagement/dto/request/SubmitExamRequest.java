package com.exammanagement.dto.request;

import java.util.HashMap;
import java.util.Map;

public class SubmitExamRequest {

    private Map<String, SaveAnswerRequest> answers = new HashMap<>();

    public SubmitExamRequest() {
    }

    public Map<String, SaveAnswerRequest> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<String, SaveAnswerRequest> answers) {
        this.answers = answers != null ? answers : new HashMap<>();
    }
}
