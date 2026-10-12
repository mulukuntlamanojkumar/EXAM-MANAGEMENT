package com.exammanagement.dto.response;

import com.exammanagement.model.QuestionType;
import com.exammanagement.model.SubmissionStatus;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class ExamResultResponse {

    private String submissionId;
    private String examId;
    private String examTitle;
    private String examCode;
    private String studentId;
    private String studentName;
    private Instant startTime;
    private Instant submitTime;
    private SubmissionStatus status;
    private double totalScore;
    private double maxScore;
    private double passingMarks;
    private double percentage;
    private boolean passed;
    private int proctorWarningsCount;
    private List<QuestionResultDetail> questions = new ArrayList<>();

    public static class QuestionResultDetail {
        private String questionId;
        private QuestionType type;
        private String title;
        private List<String> options;
        private List<String> correctAnswers;
        private List<String> studentSelectedOptions;
        private String studentTextAnswer;
        private double awardedMarks;
        private double maxMarks;
        private boolean correct;
        private String explanation;
        private String examinerComment;

        public QuestionResultDetail() {
        }

        public String getQuestionId() {
            return questionId;
        }

        public void setQuestionId(String questionId) {
            this.questionId = questionId;
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

        public List<String> getCorrectAnswers() {
            return correctAnswers;
        }

        public void setCorrectAnswers(List<String> correctAnswers) {
            this.correctAnswers = correctAnswers;
        }

        public List<String> getStudentSelectedOptions() {
            return studentSelectedOptions;
        }

        public void setStudentSelectedOptions(List<String> studentSelectedOptions) {
            this.studentSelectedOptions = studentSelectedOptions;
        }

        public String getStudentTextAnswer() {
            return studentTextAnswer;
        }

        public void setStudentTextAnswer(String studentTextAnswer) {
            this.studentTextAnswer = studentTextAnswer;
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

        public String getExplanation() {
            return explanation;
        }

        public void setExplanation(String explanation) {
            this.explanation = explanation;
        }

        public String getExaminerComment() {
            return examinerComment;
        }

        public void setExaminerComment(String examinerComment) {
            this.examinerComment = examinerComment;
        }
    }

    public ExamResultResponse() {
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

    public double getPassingMarks() {
        return passingMarks;
    }

    public void setPassingMarks(double passingMarks) {
        this.passingMarks = passingMarks;
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

    public int getProctorWarningsCount() {
        return proctorWarningsCount;
    }

    public void setProctorWarningsCount(int proctorWarningsCount) {
        this.proctorWarningsCount = proctorWarningsCount;
    }

    public List<QuestionResultDetail> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionResultDetail> questions) {
        this.questions = questions;
    }
}
