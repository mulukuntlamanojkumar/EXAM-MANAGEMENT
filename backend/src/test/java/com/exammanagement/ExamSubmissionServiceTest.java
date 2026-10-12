package com.exammanagement;

import com.exammanagement.dto.request.SaveAnswerRequest;
import com.exammanagement.dto.request.SubmitExamRequest;
import com.exammanagement.dto.response.ExamResultResponse;
import com.exammanagement.model.*;
import com.exammanagement.repository.ExamRepository;
import com.exammanagement.repository.ExamSubmissionRepository;
import com.exammanagement.service.impl.ExamSubmissionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ExamSubmissionServiceTest {

    @Mock
    private ExamSubmissionRepository submissionRepository;

    @Mock
    private ExamRepository examRepository;

    @InjectMocks
    private ExamSubmissionServiceImpl submissionService;

    private Exam exam;
    private ExamSubmission submission;

    @BeforeEach
    void setUp() {
        exam = new Exam();
        exam.setId("exam-01");
        exam.setTitle("Test Exam");
        exam.setCode("TEST-101");
        exam.setTotalMarks(10.0);
        exam.setPassingMarks(4.0);
        exam.setStatus(ExamStatus.PUBLISHED);

        QuestionSnapshot q1 = new QuestionSnapshot();
        q1.setId("q-1");
        q1.setType(QuestionType.MCQ_SINGLE);
        q1.setTitle("What is 2 + 2?");
        q1.setOptions(Arrays.asList("3", "4", "5"));
        q1.setCorrectAnswers(List.of("4"));
        q1.setMarks(5.0);
        q1.setNegativeMarks(1.0);

        QuestionSnapshot q2 = new QuestionSnapshot();
        q2.setId("q-2");
        q2.setType(QuestionType.TRUE_FALSE);
        q2.setTitle("Earth is flat");
        q2.setOptions(Arrays.asList("True", "False"));
        q2.setCorrectAnswers(List.of("False"));
        q2.setMarks(5.0);
        q2.setNegativeMarks(1.0);

        exam.setQuestionsSnapshot(Arrays.asList(q1, q2));

        submission = new ExamSubmission();
        submission.setId("sub-01");
        submission.setExamId("exam-01");
        submission.setStudentId("student-01");
        submission.setStatus(SubmissionStatus.IN_PROGRESS);
        submission.setStartTime(Instant.now());
    }

    @Test
    void testSubmitExamFullScorePasses() {
        SubmitExamRequest req = new SubmitExamRequest();
        Map<String, SaveAnswerRequest> ans = new HashMap<>();

        SaveAnswerRequest a1 = new SaveAnswerRequest();
        a1.setQuestionId("q-1");
        a1.setSelectedOptions(List.of("4"));
        ans.put("q-1", a1);

        SaveAnswerRequest a2 = new SaveAnswerRequest();
        a2.setQuestionId("q-2");
        a2.setSelectedOptions(List.of("False"));
        ans.put("q-2", a2);

        req.setAnswers(ans);

        when(submissionRepository.findById("sub-01")).thenReturn(Optional.of(submission));
        when(examRepository.findById("exam-01")).thenReturn(Optional.of(exam));
        when(submissionRepository.save(any(ExamSubmission.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ExamResultResponse result = submissionService.submitExam("sub-01", "student-01", req);

        assertNotNull(result);
        assertEquals(10.0, result.getTotalScore());
        assertEquals(100.0, result.getPercentage());
        assertTrue(result.isPassed());
        assertEquals(SubmissionStatus.EVALUATED, result.getStatus());
    }

    @Test
    void testSubmitExamWithWrongAnswersDeductsNegativeMarks() {
        SubmitExamRequest req = new SubmitExamRequest();
        Map<String, SaveAnswerRequest> ans = new HashMap<>();

        SaveAnswerRequest a1 = new SaveAnswerRequest();
        a1.setQuestionId("q-1");
        a1.setSelectedOptions(List.of("4")); // Correct: +5
        ans.put("q-1", a1);

        SaveAnswerRequest a2 = new SaveAnswerRequest();
        a2.setQuestionId("q-2");
        a2.setSelectedOptions(List.of("True")); // Wrong: -1
        ans.put("q-2", a2);

        req.setAnswers(ans);

        when(submissionRepository.findById("sub-01")).thenReturn(Optional.of(submission));
        when(examRepository.findById("exam-01")).thenReturn(Optional.of(exam));
        when(submissionRepository.save(any(ExamSubmission.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ExamResultResponse result = submissionService.submitExam("sub-01", "student-01", req);

        assertNotNull(result);
        assertEquals(4.0, result.getTotalScore()); // 5 - 1 = 4.0
        assertTrue(result.isPassed()); // >= 4.0 passingMarks
    }
}
