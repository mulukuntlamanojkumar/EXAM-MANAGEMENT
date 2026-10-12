package com.exammanagement.controller;

import com.exammanagement.dto.request.ProctorEventRequest;
import com.exammanagement.dto.request.SaveAnswerRequest;
import com.exammanagement.dto.request.SubmitExamRequest;
import com.exammanagement.dto.response.ApiResponse;
import com.exammanagement.dto.response.DashboardStatsResponse;
import com.exammanagement.dto.response.ExamResultResponse;
import com.exammanagement.dto.response.ExamTakeResponse;
import com.exammanagement.model.Exam;
import com.exammanagement.model.ExamSubmission;
import com.exammanagement.security.UserPrincipal;
import com.exammanagement.service.AnalyticsService;
import com.exammanagement.service.ExamService;
import com.exammanagement.service.ExamSubmissionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/student")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STUDENT')")
public class StudentController {

    private final ExamService examService;
    private final ExamSubmissionService submissionService;
    private final AnalyticsService analyticsService;

    public StudentController(ExamService examService,
                             ExamSubmissionService submissionService,
                             AnalyticsService analyticsService) {
        this.examService = examService;
        this.submissionService = submissionService;
        this.analyticsService = analyticsService;
    }

    @GetMapping("/analytics")
    public ResponseEntity<DashboardStatsResponse> getAnalytics(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(analyticsService.getStudentStats(user.getId()));
    }

    @GetMapping("/exams")
    public ResponseEntity<Page<Exam>> getAvailableExams(
            @AuthenticationPrincipal UserPrincipal user,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(examService.getExamsForStudent(user.getId(), pageable));
    }

    @PostMapping("/exams/{examId}/start")
    public ResponseEntity<ExamTakeResponse> startExam(
            @PathVariable String examId,
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(submissionService.startExam(
                examId,
                user.getId(),
                user.getFullName(),
                user.getEmail()
        ));
    }

    @PostMapping("/submissions/{submissionId}/answer")
    public ResponseEntity<ApiResponse> saveAnswer(
            @PathVariable String submissionId,
            @AuthenticationPrincipal UserPrincipal user,
            @Valid @RequestBody SaveAnswerRequest request) {
        submissionService.saveAnswer(submissionId, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Answer saved successfully"));
    }

    @PostMapping("/submissions/{submissionId}/proctor")
    public ResponseEntity<ApiResponse> logProctorWarning(
            @PathVariable String submissionId,
            @AuthenticationPrincipal UserPrincipal user,
            @Valid @RequestBody ProctorEventRequest request) {
        submissionService.logProctorEvent(submissionId, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Proctor event logged"));
    }

    @PostMapping("/submissions/{submissionId}/submit")
    public ResponseEntity<ExamResultResponse> submitExam(
            @PathVariable String submissionId,
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody SubmitExamRequest request) {
        return ResponseEntity.ok(submissionService.submitExam(submissionId, user.getId(), request));
    }

    @GetMapping("/submissions")
    public ResponseEntity<Page<ExamSubmission>> getMySubmissions(
            @AuthenticationPrincipal UserPrincipal user,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(submissionService.getSubmissionsForStudent(user.getId(), pageable));
    }

    @GetMapping("/submissions/{submissionId}/result")
    public ResponseEntity<ExamResultResponse> getSubmissionResult(
            @PathVariable String submissionId,
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(submissionService.getSubmissionResult(submissionId, user.getId(), false));
    }
}
