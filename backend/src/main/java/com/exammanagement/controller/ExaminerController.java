package com.exammanagement.controller;

import com.exammanagement.dto.request.ManualGradeRequest;
import com.exammanagement.dto.request.QuestionRequest;
import com.exammanagement.dto.response.ApiResponse;
import com.exammanagement.dto.response.DashboardStatsResponse;
import com.exammanagement.dto.response.ExamResultResponse;
import com.exammanagement.model.Exam;
import com.exammanagement.model.ExamSubmission;
import com.exammanagement.model.Question;
import com.exammanagement.security.UserPrincipal;
import com.exammanagement.service.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/examiner")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EXAMINER')")
public class ExaminerController {

    private final ExamService examService;
    private final QuestionService questionService;
    private final ExamSubmissionService submissionService;
    private final AnalyticsService analyticsService;
    private final SubjectService subjectService;

    public ExaminerController(ExamService examService,
                              QuestionService questionService,
                              ExamSubmissionService submissionService,
                              AnalyticsService analyticsService,
                              SubjectService subjectService) {
        this.examService = examService;
        this.questionService = questionService;
        this.submissionService = submissionService;
        this.analyticsService = analyticsService;
        this.subjectService = subjectService;
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<com.exammanagement.model.Subject>> getSubjects() {
        return ResponseEntity.ok(subjectService.getAllSubjects());
    }

    @GetMapping("/analytics")
    public ResponseEntity<DashboardStatsResponse> getAnalytics(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(analyticsService.getExaminerStats(user.getId()));
    }

    @GetMapping("/exams")
    public ResponseEntity<Page<Exam>> getAssignedExams(
            @AuthenticationPrincipal UserPrincipal user,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(examService.getExamsForExaminer(user.getId(), pageable));
    }

    @GetMapping("/exams/{id}")
    public ResponseEntity<Exam> getExamDetails(@PathVariable String id) {
        return ResponseEntity.ok(examService.getExamById(id));
    }

    @GetMapping("/questions")
    public ResponseEntity<Page<Question>> getMyQuestions(
            @AuthenticationPrincipal UserPrincipal user,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(questionService.getQuestionsByCreator(user.getId(), pageable));
    }

    @PostMapping("/questions")
    public ResponseEntity<Question> createQuestion(
            @AuthenticationPrincipal UserPrincipal user,
            @Valid @RequestBody QuestionRequest request) {
        return ResponseEntity.ok(questionService.createQuestion(request, user.getId(), user.getFullName()));
    }

    @PutMapping("/questions/{id}")
    public ResponseEntity<Question> updateQuestion(@PathVariable String id, @Valid @RequestBody QuestionRequest request) {
        return ResponseEntity.ok(questionService.updateQuestion(id, request));
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<ApiResponse> deleteQuestion(@PathVariable String id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.ok(ApiResponse.success("Question deleted successfully"));
    }

    @GetMapping("/exams/{examId}/submissions")
    public ResponseEntity<Page<ExamSubmission>> getExamSubmissions(
            @PathVariable String examId,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(submissionService.getSubmissionsForExam(examId, pageable));
    }

    @GetMapping("/submissions/{id}")
    public ResponseEntity<ExamSubmission> getSubmissionById(@PathVariable String id) {
        return ResponseEntity.ok(submissionService.getSubmissionById(id));
    }

    @GetMapping("/submissions/{id}/result")
    public ResponseEntity<ExamResultResponse> getSubmissionResult(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(submissionService.getSubmissionResult(id, user.getId(), true));
    }

    @PostMapping("/submissions/{id}/grade")
    public ResponseEntity<ExamSubmission> gradeSubmission(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal user,
            @Valid @RequestBody ManualGradeRequest request) {
        return ResponseEntity.ok(submissionService.manualGradeQuestion(id, user.getId(), request));
    }
}
