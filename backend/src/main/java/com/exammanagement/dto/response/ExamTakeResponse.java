package com.exammanagement.dto.response;

import com.exammanagement.model.DifficultyLevel;
import com.exammanagement.model.QuestionType;
import com.exammanagement.model.StudentAnswer;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ExamTakeResponse {

    private String submissionId;
    private String examId;
    private String examTitle;
    private String examCode;
    private String instructions;
    private int durationMinutes;
    private Instant startTime;
    private Instant expiryTime;
    private long remainingSeconds;
    private List<SanitizedQuestion> questions = new ArrayList<>();
    private Map<String, StudentAnswer> savedAnswers = new HashMap<>();
    private int proctorWarningsCount;

    public static class SanitizedQuestion {
        private String id;
        private QuestionType type;
        private String title;
        private List<String> options = new ArrayList<>();
        private double marks;
        private double negativeMarks;
        private DifficultyLevel difficulty;

        public SanitizedQuestion() {
        }

        public SanitizedQuestion(String id, QuestionType type, String title, List<String> options, double marks, double negativeMarks, DifficultyLevel difficulty) {
            this.id = id;
            this.type = type;
            this.title = title;
            this.options = options != null ? options : new ArrayList<>();
            this.marks = marks;
            this.negativeMarks = negativeMarks;
            this.difficulty = difficulty;
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
            this.options = options;
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

    public ExamTakeResponse() {
    }

    public String getSubmissionId() {
        return submissionId;
    }

    public void setSubmissionId(String submissionId) {
        this.submissionId = submissionId;
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

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(int durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getExpiryTime() {
        return expiryTime;
    }

    public void setExpiryTime(Instant expiryTime) {
        this.expiryTime = expiryTime;
    }

    public long getRemainingSeconds() {
        return remainingSeconds;
    }

    public void setRemainingSeconds(long remainingSeconds) {
        this.remainingSeconds = remainingSeconds;
    }

    public List<SanitizedQuestion> getQuestions() {
        return questions;
    }

    public void setQuestions(List<SanitizedQuestion> questions) {
        this.questions = questions;
    }

    public Map<String, StudentAnswer> getSavedAnswers() {
        return savedAnswers;
    }

    public void setSavedAnswers(Map<String, StudentAnswer> savedAnswers) {
        this.savedAnswers = savedAnswers;
    }

    public int getProctorWarningsCount() {
        return proctorWarningsCount;
    }

    public void setProctorWarningsCount(int proctorWarningsCount) {
        this.proctorWarningsCount = proctorWarningsCount;
    }
}
