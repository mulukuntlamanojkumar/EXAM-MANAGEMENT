package com.exammanagement.controller;

import com.exammanagement.dto.request.*;
import com.exammanagement.dto.response.*;
import com.exammanagement.model.*;
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
@RequestMapping("/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final UserService userService;
    private final DepartmentService departmentService;
    private final SubjectService subjectService;
    private final QuestionService questionService;
    private final ExamService examService;
    private final ExamSubmissionService submissionService;
    private final AnalyticsService analyticsService;
    private final AnnouncementService announcementService;
    private final AuditService auditService;

    public AdminController(UserService userService,
                           DepartmentService departmentService,
                           SubjectService subjectService,
                           QuestionService questionService,
                           ExamService examService,
                           ExamSubmissionService submissionService,
                           AnalyticsService analyticsService,
                           AnnouncementService announcementService,
                           AuditService auditService) {
        this.userService = userService;
        this.departmentService = departmentService;
        this.subjectService = subjectService;
        this.questionService = questionService;
        this.examService = examService;
        this.submissionService = submissionService;
        this.analyticsService = analyticsService;
        this.announcementService = announcementService;
        this.auditService = auditService;
    }

    // --- Analytics ---
    @GetMapping("/analytics")
    public ResponseEntity<DashboardStatsResponse> getAnalytics() {
        return ResponseEntity.ok(analyticsService.getDashboardStats());
    }

    // --- Users ---
    @GetMapping("/users")
    public ResponseEntity<Page<UserResponse>> getUsers(
            @RequestParam(required = false) Role role,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        if (role != null) {
            return ResponseEntity.ok(userService.getUsersByRole(role, pageable));
        }
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping("/users")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable String id, @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }

    @PatchMapping("/users/{id}/toggle-status")
    public ResponseEntity<UserResponse> toggleUserStatus(@PathVariable String id) {
        return ResponseEntity.ok(userService.toggleUserStatus(id));
    }

    @GetMapping("/examiners")
    public ResponseEntity<List<UserResponse>> getExaminers() {
        return ResponseEntity.ok(userService.getAllExaminers());
    }

    @GetMapping("/students")
    public ResponseEntity<List<UserResponse>> getStudents() {
        return ResponseEntity.ok(userService.getAllStudents());
    }

    // --- Departments ---
    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @PostMapping("/departments")
    public ResponseEntity<Department> createDepartment(@Valid @RequestBody DepartmentRequest request) {
        return ResponseEntity.ok(departmentService.createDepartment(request));
    }

    @PutMapping("/departments/{id}")
    public ResponseEntity<Department> updateDepartment(@PathVariable String id, @Valid @RequestBody DepartmentRequest request) {
        return ResponseEntity.ok(departmentService.updateDepartment(id, request));
    }

    @DeleteMapping("/departments/{id}")
    public ResponseEntity<ApiResponse> deleteDepartment(@PathVariable String id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.ok(ApiResponse.success("Department deleted successfully"));
    }

    // --- Subjects ---
    @GetMapping("/subjects")
    public ResponseEntity<List<Subject>> getSubjects(@RequestParam(required = false) String departmentId) {
        if (departmentId != null) {
            return ResponseEntity.ok(subjectService.getSubjectsByDepartment(departmentId));
        }
        return ResponseEntity.ok(subjectService.getAllSubjects());
    }

    @PostMapping("/subjects")
    public ResponseEntity<Subject> createSubject(@Valid @RequestBody SubjectRequest request) {
        return ResponseEntity.ok(subjectService.createSubject(request));
    }

    @PutMapping("/subjects/{id}")
    public ResponseEntity<Subject> updateSubject(@PathVariable String id, @Valid @RequestBody SubjectRequest request) {
        return ResponseEntity.ok(subjectService.updateSubject(id, request));
    }

    @DeleteMapping("/subjects/{id}")
    public ResponseEntity<ApiResponse> deleteSubject(@PathVariable String id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.ok(ApiResponse.success("Subject deleted successfully"));
    }

    // --- Questions ---
    @GetMapping("/questions")
    public ResponseEntity<Page<Question>> getQuestions(
            @RequestParam(required = false) String subjectId,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        if (subjectId != null) {
            return ResponseEntity.ok(questionService.getQuestionsBySubject(subjectId, pageable));
        }
        return ResponseEntity.ok(questionService.getAllQuestions(pageable));
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

    // --- Exams ---
    @GetMapping("/exams")
    public ResponseEntity<Page<Exam>> getExams(@PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(examService.getAllExams(pageable));
    }

    @GetMapping("/exams/{id}")
    public ResponseEntity<Exam> getExamById(@PathVariable String id) {
        return ResponseEntity.ok(examService.getExamById(id));
    }

    @PostMapping("/exams")
    public ResponseEntity<Exam> createExam(
            @AuthenticationPrincipal UserPrincipal user,
            @Valid @RequestBody ExamCreateRequest request) {
        return ResponseEntity.ok(examService.createExam(request, user.getId(), user.getFullName()));
    }

    @PutMapping("/exams/{id}")
    public ResponseEntity<Exam> updateExam(@PathVariable String id, @RequestBody ExamUpdateRequest request) {
        return ResponseEntity.ok(examService.updateExam(id, request));
    }

    @DeleteMapping("/exams/{id}")
    public ResponseEntity<ApiResponse> deleteExam(@PathVariable String id) {
        examService.deleteExam(id);
        return ResponseEntity.ok(ApiResponse.success("Exam deleted successfully"));
    }

    @PostMapping("/exams/{id}/publish")
    public ResponseEntity<Exam> publishExam(@PathVariable String id) {
        return ResponseEntity.ok(examService.publishExam(id));
    }

    @PostMapping("/exams/{id}/cancel")
    public ResponseEntity<Exam> cancelExam(@PathVariable String id) {
        return ResponseEntity.ok(examService.cancelExam(id));
    }

    @PostMapping("/exams/{id}/assign-examiners")
    public ResponseEntity<Exam> assignExaminers(@PathVariable String id, @RequestBody List<String> examinerIds) {
        return ResponseEntity.ok(examService.assignExaminers(id, examinerIds));
    }

    @PostMapping("/exams/{id}/enroll-students")
    public ResponseEntity<Exam> enrollStudents(@PathVariable String id, @RequestBody List<String> studentIds) {
        return ResponseEntity.ok(examService.enrollStudents(id, studentIds));
    }

    @PostMapping("/exams/{id}/questions")
    public ResponseEntity<Exam> addQuestionsToExam(@PathVariable String id, @RequestBody List<String> questionIds) {
        return ResponseEntity.ok(examService.addQuestionsToExam(id, questionIds));
    }

    // --- Submissions & Results ---
    @GetMapping("/submissions")
    public ResponseEntity<Page<ExamSubmission>> getAllSubmissions(
            @RequestParam(required = false) String examId,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        if (examId != null) {
            return ResponseEntity.ok(submissionService.getSubmissionsForExam(examId, pageable));
        }
        return ResponseEntity.ok(submissionService.getAllSubmissions(pageable));
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

    // --- Announcements ---
    @GetMapping("/announcements")
    public ResponseEntity<Page<Announcement>> getAnnouncements(@PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(announcementService.getAllAnnouncements(pageable));
    }

    @PostMapping("/announcements")
    public ResponseEntity<Announcement> createAnnouncement(
            @AuthenticationPrincipal UserPrincipal user,
            @Valid @RequestBody AnnouncementRequest request) {
        return ResponseEntity.ok(announcementService.createAnnouncement(request, user.getFullName()));
    }

    @DeleteMapping("/announcements/{id}")
    public ResponseEntity<ApiResponse> deleteAnnouncement(@PathVariable String id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.ok(ApiResponse.success("Announcement deleted successfully"));
    }

    // --- Audit Logs ---
    @GetMapping("/audit-logs")
    public ResponseEntity<Page<AuditLog>> getAuditLogs(@PageableDefault(sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(auditService.getLogs(pageable));
    }
}
