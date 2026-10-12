package com.exammanagement.service.impl;

import com.exammanagement.dto.request.ManualGradeRequest;
import com.exammanagement.dto.request.ProctorEventRequest;
import com.exammanagement.dto.request.SaveAnswerRequest;
import com.exammanagement.dto.request.SubmitExamRequest;
import com.exammanagement.dto.response.ExamResultResponse;
import com.exammanagement.dto.response.ExamTakeResponse;
import com.exammanagement.exception.ApiException;
import com.exammanagement.exception.BadRequestException;
import com.exammanagement.exception.ResourceNotFoundException;
import com.exammanagement.model.*;
import com.exammanagement.repository.ExamRepository;
import com.exammanagement.repository.ExamSubmissionRepository;
import com.exammanagement.service.ExamSubmissionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExamSubmissionServiceImpl implements ExamSubmissionService {

    private final ExamSubmissionRepository submissionRepository;
    private final ExamRepository examRepository;

    public ExamSubmissionServiceImpl(ExamSubmissionRepository submissionRepository,
                                    ExamRepository examRepository) {
        this.submissionRepository = submissionRepository;
        this.examRepository = examRepository;
    }

    @Override
    public ExamTakeResponse startExam(String examId, String studentId, String studentName, String studentEmail) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", examId));

        if (exam.getStatus() != ExamStatus.PUBLISHED) {
            throw new BadRequestException("Exam is not active or published");
        }

        Instant now = Instant.now();
        if (exam.getStartTime() != null && now.isBefore(exam.getStartTime())) {
            throw new BadRequestException("Exam has not started yet. Starts at: " + exam.getStartTime());
        }
        if (exam.getEndTime() != null && now.isAfter(exam.getEndTime())) {
            throw new BadRequestException("Exam deadline has already passed");
        }

        // Check if student has an existing IN_PROGRESS submission
        Optional<ExamSubmission> existingInProgress = submissionRepository
                .findFirstByExamIdAndStudentIdAndStatus(examId, studentId, SubmissionStatus.IN_PROGRESS);

        ExamSubmission submission;
        if (existingInProgress.isPresent()) {
            submission = existingInProgress.get();
        } else {
            // Check past attempts count
            List<ExamSubmission> pastAttempts = submissionRepository.findByExamIdAndStudentId(examId, studentId);
            long completedAttempts = pastAttempts.stream()
                    .filter(s -> s.getStatus() != SubmissionStatus.IN_PROGRESS)
                    .count();

            if (completedAttempts >= exam.getMaxAttempts()) {
                throw new BadRequestException("Maximum number of attempts (" + exam.getMaxAttempts() + ") reached for this exam");
            }

            submission = new ExamSubmission();
            submission.setExamId(exam.getId());
            submission.setExamTitle(exam.getTitle());
            submission.setExamCode(exam.getCode());
            submission.setStudentId(studentId);
            submission.setStudentName(studentName);
            submission.setStudentEmail(studentEmail);
            submission.setAttemptNumber((int) completedAttempts + 1);
            submission.setStartTime(now);
            submission.setMaxScore(exam.getTotalMarks());
            submission = submissionRepository.save(submission);
        }

        // Calculate remaining seconds
        Instant expiryTime = submission.getStartTime().plus(Duration.ofMinutes(exam.getDurationMinutes()));
        if (exam.getEndTime() != null && exam.getEndTime().isBefore(expiryTime)) {
            expiryTime = exam.getEndTime();
        }

        long remainingSeconds = Duration.between(now, expiryTime).getSeconds();
        if (remainingSeconds <= 0) {
            // Auto-submit expired session
            submitExam(submission.getId(), studentId, new SubmitExamRequest());
            throw new BadRequestException("Exam time expired");
        }

        // Sanitize questions: strip correct answers and explanations!
        List<ExamTakeResponse.SanitizedQuestion> sanitizedQuestions = exam.getQuestionsSnapshot().stream()
                .map(q -> new ExamTakeResponse.SanitizedQuestion(
                        q.getId(),
                        q.getType(),
                        q.getTitle(),
                        q.getOptions(),
                        q.getMarks(),
                        q.getNegativeMarks(),
                        q.getDifficulty()
                ))
                .collect(Collectors.toList());

        if (exam.isShuffleQuestions()) {
            Collections.shuffle(sanitizedQuestions, new Random(submission.getId().hashCode()));
        }

        ExamTakeResponse response = new ExamTakeResponse();
        response.setSubmissionId(submission.getId());
        response.setExamId(exam.getId());
        response.setExamTitle(exam.getTitle());
        response.setExamCode(exam.getCode());
        response.setInstructions(exam.getInstructions());
        response.setDurationMinutes(exam.getDurationMinutes());
        response.setStartTime(submission.getStartTime());
        response.setExpiryTime(expiryTime);
        response.setRemainingSeconds(remainingSeconds);
        response.setQuestions(sanitizedQuestions);
        response.setSavedAnswers(submission.getAnswers());
        response.setProctorWarningsCount(submission.getProctorWarningsCount());

        return response;
    }

    @Override
    public void saveAnswer(String submissionId, String studentId, SaveAnswerRequest request) {
        ExamSubmission submission = getSubmissionById(submissionId);
        validateSubmissionAccess(submission, studentId);

        if (submission.getStatus() != SubmissionStatus.IN_PROGRESS) {
            throw new BadRequestException("Exam has already been submitted or completed");
        }

        StudentAnswer answer = new StudentAnswer(
                request.getQuestionId(),
                request.getSelectedOptions(),
                request.getTextAnswer(),
                request.isFlagged()
        );

        submission.getAnswers().put(request.getQuestionId(), answer);
        submissionRepository.save(submission);
    }

    @Override
    public void logProctorEvent(String submissionId, String studentId, ProctorEventRequest request) {
        ExamSubmission submission = getSubmissionById(submissionId);
        validateSubmissionAccess(submission, studentId);

        submission.setProctorWarningsCount(submission.getProctorWarningsCount() + 1);
        submission.getProctorLogs().add(new ProctorEvent(request.getEventType(), request.getDetails()));
        submissionRepository.save(submission);
    }

    @Override
    public ExamResultResponse submitExam(String submissionId, String studentId, SubmitExamRequest request) {
        ExamSubmission submission = getSubmissionById(submissionId);
        validateSubmissionAccess(submission, studentId);

        if (submission.getStatus() != SubmissionStatus.IN_PROGRESS) {
            return getSubmissionResult(submissionId, studentId, false);
        }

        Exam exam = examRepository.findById(submission.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", submission.getExamId()));

        if (request.getAnswers() != null && !request.getAnswers().isEmpty()) {
            request.getAnswers().forEach((k, v) -> {
                submission.getAnswers().put(k, new StudentAnswer(
                        v.getQuestionId(),
                        v.getSelectedOptions(),
                        v.getTextAnswer(),
                        v.isFlagged()
                ));
            });
        }

        submission.setSubmitTime(Instant.now());

        // Perform automated grading
        evaluateSubmission(submission, exam);

        ExamSubmission saved = submissionRepository.save(submission);
        return mapToResultResponse(saved, exam);
    }

    private void evaluateSubmission(ExamSubmission submission, Exam exam) {
        Map<String, QuestionEvaluation> evaluations = new HashMap<>();
        double totalAwarded = 0.0;
        double maxScore = 0.0;
        boolean allAutoGraded = true;

        for (QuestionSnapshot q : exam.getQuestionsSnapshot()) {
            maxScore += q.getMarks();
            StudentAnswer ans = submission.getAnswers().get(q.getId());

            QuestionEvaluation eval = new QuestionEvaluation();
            eval.setQuestionId(q.getId());
            eval.setMaxMarks(q.getMarks());

            if (ans == null || (ans.getSelectedOptions().isEmpty() && (ans.getTextAnswer() == null || ans.getTextAnswer().trim().isEmpty()))) {
                eval.setAwardedMarks(0.0);
                eval.setCorrect(false);
                eval.setAutoGraded(true);
                eval.setExaminerComment("Not answered");
            } else if (q.getType() == QuestionType.MCQ_SINGLE || q.getType() == QuestionType.TRUE_FALSE) {
                boolean correct = !ans.getSelectedOptions().isEmpty() &&
                        q.getCorrectAnswers().contains(ans.getSelectedOptions().get(0));
                eval.setCorrect(correct);
                eval.setAutoGraded(true);
                if (correct) {
                    eval.setAwardedMarks(q.getMarks());
                    totalAwarded += q.getMarks();
                } else {
                    double deduction = q.getNegativeMarks();
                    eval.setAwardedMarks(-deduction);
                    totalAwarded -= deduction;
                }
            } else if (q.getType() == QuestionType.MCQ_MULTIPLE) {
                Set<String> studentSet = new HashSet<>(ans.getSelectedOptions());
                Set<String> correctSet = new HashSet<>(q.getCorrectAnswers());
                boolean correct = studentSet.equals(correctSet);
                eval.setCorrect(correct);
                eval.setAutoGraded(true);
                if (correct) {
                    eval.setAwardedMarks(q.getMarks());
                    totalAwarded += q.getMarks();
                } else {
                    double deduction = q.getNegativeMarks();
                    eval.setAwardedMarks(-deduction);
                    totalAwarded -= deduction;
                }
            } else if (q.getType() == QuestionType.SHORT_ANSWER) {
                String studentText = ans.getTextAnswer() != null ? ans.getTextAnswer().trim().toLowerCase() : "";
                boolean correct = q.getCorrectAnswers().stream()
                        .anyMatch(c -> c.trim().equalsIgnoreCase(studentText));
                eval.setCorrect(correct);
                eval.setAutoGraded(true);
                if (correct) {
                    eval.setAwardedMarks(q.getMarks());
                    totalAwarded += q.getMarks();
                } else {
                    eval.setAwardedMarks(0.0);
                }
            } else if (q.getType() == QuestionType.DESCRIPTIVE) {
                eval.setAutoGraded(false);
                eval.setAwardedMarks(0.0);
                eval.setExaminerComment("Pending examiner manual evaluation");
                allAutoGraded = false;
            }

            evaluations.put(q.getId(), eval);
        }

        totalAwarded = Math.max(0.0, totalAwarded);
        submission.setEvaluations(evaluations);
        submission.setTotalScore(totalAwarded);
        submission.setMaxScore(maxScore);
        submission.setPercentage(maxScore > 0 ? (totalAwarded / maxScore) * 100.0 : 0.0);
        submission.setPassed(totalAwarded >= exam.getPassingMarks());

        if (allAutoGraded) {
            submission.setStatus(SubmissionStatus.EVALUATED);
            submission.setGradedBy("SYSTEM_AUTO");
            submission.setGradedAt(Instant.now());
        } else {
            submission.setStatus(SubmissionStatus.SUBMITTED);
        }
    }

    @Override
    public ExamSubmission manualGradeQuestion(String submissionId, String examinerId, ManualGradeRequest request) {
        ExamSubmission submission = getSubmissionById(submissionId);
        Exam exam = examRepository.findById(submission.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", submission.getExamId()));

        QuestionEvaluation eval = submission.getEvaluations().get(request.getQuestionId());
        if (eval == null) {
            eval = new QuestionEvaluation();
            eval.setQuestionId(request.getQuestionId());
        }

        eval.setAwardedMarks(request.getAwardedMarks());
        eval.setExaminerComment(request.getExaminerComment());
        eval.setCorrect(request.getAwardedMarks() > 0);
        eval.setAutoGraded(false);

        submission.getEvaluations().put(request.getQuestionId(), eval);

        // Recalculate total score
        double totalAwarded = submission.getEvaluations().values().stream()
                .mapToDouble(QuestionEvaluation::getAwardedMarks)
                .sum();

        totalAwarded = Math.max(0.0, totalAwarded);
        submission.setTotalScore(totalAwarded);
        submission.setPercentage(submission.getMaxScore() > 0 ? (totalAwarded / submission.getMaxScore()) * 100.0 : 0.0);
        submission.setPassed(totalAwarded >= exam.getPassingMarks());
        submission.setStatus(SubmissionStatus.EVALUATED);
        submission.setGradedBy(examinerId);
        submission.setGradedAt(Instant.now());

        return submissionRepository.save(submission);
    }

    @Override
    public ExamResultResponse getSubmissionResult(String submissionId, String userId, boolean isAdminOrExaminer) {
        ExamSubmission submission = getSubmissionById(submissionId);
        if (!isAdminOrExaminer && !submission.getStudentId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Access denied to submission results");
        }

        Exam exam = examRepository.findById(submission.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", submission.getExamId()));

        return mapToResultResponse(submission, exam);
    }

    @Override
    public Page<ExamSubmission> getSubmissionsForExam(String examId, Pageable pageable) {
        return submissionRepository.findByExamId(examId, pageable);
    }

    @Override
    public Page<ExamSubmission> getSubmissionsForStudent(String studentId, Pageable pageable) {
        return submissionRepository.findByStudentId(studentId, pageable);
    }

    @Override
    public Page<ExamSubmission> getAllSubmissions(Pageable pageable) {
        return submissionRepository.findAll(pageable);
    }

    @Override
    public ExamSubmission getSubmissionById(String submissionId) {
        return submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("ExamSubmission", "id", submissionId));
    }

    private void validateSubmissionAccess(ExamSubmission submission, String studentId) {
        if (!submission.getStudentId().equals(studentId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Access denied to this exam submission");
        }
    }

    private ExamResultResponse mapToResultResponse(ExamSubmission submission, Exam exam) {
        ExamResultResponse response = new ExamResultResponse();
        response.setSubmissionId(submission.getId());
        response.setExamId(exam.getId());
        response.setExamTitle(exam.getTitle());
        response.setExamCode(exam.getCode());
        response.setStudentId(submission.getStudentId());
        response.setStudentName(submission.getStudentName());
        response.setStartTime(submission.getStartTime());
        response.setSubmitTime(submission.getSubmitTime());
        response.setStatus(submission.getStatus());
        response.setTotalScore(submission.getTotalScore());
        response.setMaxScore(submission.getMaxScore());
        response.setPassingMarks(exam.getPassingMarks());
        response.setPercentage(submission.getPercentage());
        response.setPassed(submission.isPassed());
        response.setProctorWarningsCount(submission.getProctorWarningsCount());

        List<ExamResultResponse.QuestionResultDetail> details = new ArrayList<>();
        for (QuestionSnapshot q : exam.getQuestionsSnapshot()) {
            ExamResultResponse.QuestionResultDetail detail = new ExamResultResponse.QuestionResultDetail();
            detail.setQuestionId(q.getId());
            detail.setType(q.getType());
            detail.setTitle(q.getTitle());
            detail.setOptions(q.getOptions());
            detail.setMaxMarks(q.getMarks());

            if (exam.isAllowReview()) {
                detail.setCorrectAnswers(q.getCorrectAnswers());
                detail.setExplanation(q.getExplanation());
            }

            StudentAnswer studentAnswer = submission.getAnswers().get(q.getId());
            if (studentAnswer != null) {
                detail.setStudentSelectedOptions(studentAnswer.getSelectedOptions());
                detail.setStudentTextAnswer(studentAnswer.getTextAnswer());
            }

            QuestionEvaluation eval = submission.getEvaluations().get(q.getId());
            if (eval != null) {
                detail.setAwardedMarks(eval.getAwardedMarks());
                detail.setCorrect(eval.isCorrect());
                detail.setExaminerComment(eval.getExaminerComment());
            }

            details.add(detail);
        }

        response.setQuestions(details);
        return response;
    }
}
