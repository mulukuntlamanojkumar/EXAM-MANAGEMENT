package com.exammanagement.service.impl;

import com.exammanagement.dto.response.DashboardStatsResponse;
import com.exammanagement.model.Exam;
import com.exammanagement.model.ExamStatus;
import com.exammanagement.model.ExamSubmission;
import com.exammanagement.model.Role;
import com.exammanagement.repository.ExamRepository;
import com.exammanagement.repository.ExamSubmissionRepository;
import com.exammanagement.repository.QuestionRepository;
import com.exammanagement.repository.UserRepository;
import com.exammanagement.service.AnalyticsService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final UserRepository userRepository;
    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final ExamSubmissionRepository submissionRepository;

    public AnalyticsServiceImpl(UserRepository userRepository,
                                ExamRepository examRepository,
                                QuestionRepository questionRepository,
                                ExamSubmissionRepository submissionRepository) {
        this.userRepository = userRepository;
        this.examRepository = examRepository;
        this.questionRepository = questionRepository;
        this.submissionRepository = submissionRepository;
    }

    @Override
    public DashboardStatsResponse getDashboardStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        long students = userRepository.countByRole(Role.ROLE_STUDENT);
        long examiners = userRepository.countByRole(Role.ROLE_EXAMINER);
        long totalExams = examRepository.count();
        long activeExams = examRepository.countByStatus(ExamStatus.PUBLISHED);
        long totalQuestions = questionRepository.count();
        long totalSubmissions = submissionRepository.count();
        long passedCount = submissionRepository.countByPassed(true);

        stats.setTotalStudents(students);
        stats.setTotalExaminers(examiners);
        stats.setTotalExams(totalExams);
        stats.setActiveExams(activeExams);
        stats.setTotalQuestions(totalQuestions);
        stats.setTotalSubmissions(totalSubmissions);

        double passRate = totalSubmissions > 0 ? ((double) passedCount / totalSubmissions) * 100.0 : 0.0;
        stats.setPassPercentage(Math.round(passRate * 10.0) / 10.0);

        List<ExamSubmission> allSubs = submissionRepository.findAll();
        double avgScore = allSubs.stream()
                .filter(s -> s.getMaxScore() > 0)
                .mapToDouble(ExamSubmission::getPercentage)
                .average()
                .orElse(0.0);
        stats.setAverageScore(Math.round(avgScore * 10.0) / 10.0);

        stats.setRecentSubmissions(submissionRepository.findAll(
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent());

        stats.setRecentExams(examRepository.findAll(
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent());

        Map<String, Long> deptStats = new HashMap<>();
        examRepository.findAll().forEach(e -> {
            String dept = e.getDepartment() != null ? e.getDepartment() : "General";
            deptStats.put(dept, deptStats.getOrDefault(dept, 0L) + 1);
        });
        stats.setDepartmentStats(deptStats);

        return stats;
    }

    @Override
    public DashboardStatsResponse getExaminerStats(String examinerId) {
        DashboardStatsResponse stats = new DashboardStatsResponse();
        List<Exam> assignedExams = examRepository.findByAssignedExaminerIdsContaining(examinerId);

        stats.setTotalExams(assignedExams.size());
        stats.setActiveExams(assignedExams.stream().filter(e -> e.getStatus() == ExamStatus.PUBLISHED).count());
        stats.setTotalQuestions(questionRepository.count());

        List<ExamSubmission> relevantSubmissions = assignedExams.stream()
                .flatMap(e -> submissionRepository.findByExamId(e.getId()).stream())
                .toList();

        stats.setTotalSubmissions(relevantSubmissions.size());
        long passed = relevantSubmissions.stream().filter(ExamSubmission::isPassed).count();
        double passRate = !relevantSubmissions.isEmpty() ? ((double) passed / relevantSubmissions.size()) * 100.0 : 0.0;
        stats.setPassPercentage(Math.round(passRate * 10.0) / 10.0);

        stats.setRecentExams(assignedExams.stream().limit(5).toList());
        stats.setRecentSubmissions(relevantSubmissions.stream().limit(5).toList());

        return stats;
    }

    @Override
    public DashboardStatsResponse getStudentStats(String studentId) {
        DashboardStatsResponse stats = new DashboardStatsResponse();
        List<ExamSubmission> mySubmissions = submissionRepository.findByStudentId(studentId);

        stats.setTotalSubmissions(mySubmissions.size());
        long passed = mySubmissions.stream().filter(ExamSubmission::isPassed).count();
        double passRate = !mySubmissions.isEmpty() ? ((double) passed / mySubmissions.size()) * 100.0 : 0.0;
        stats.setPassPercentage(Math.round(passRate * 10.0) / 10.0);

        double avgScore = mySubmissions.stream()
                .filter(s -> s.getMaxScore() > 0)
                .mapToDouble(ExamSubmission::getPercentage)
                .average()
                .orElse(0.0);
        stats.setAverageScore(Math.round(avgScore * 10.0) / 10.0);

        long activeExams = examRepository.countByStatus(ExamStatus.PUBLISHED);
        stats.setActiveExams(activeExams);

        stats.setRecentSubmissions(mySubmissions.stream().limit(5).toList());

        return stats;
    }
}
