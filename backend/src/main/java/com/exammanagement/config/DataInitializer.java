package com.exammanagement.config;

import com.exammanagement.model.*;
import com.exammanagement.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final SubjectRepository subjectRepository;
    private final QuestionRepository questionRepository;
    private final ExamRepository examRepository;
    private final AnnouncementRepository announcementRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed-data:true}")
    private boolean seedData;

    public DataInitializer(UserRepository userRepository,
                           DepartmentRepository departmentRepository,
                           SubjectRepository subjectRepository,
                           QuestionRepository questionRepository,
                           ExamRepository examRepository,
                           AnnouncementRepository announcementRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.subjectRepository = subjectRepository;
        this.questionRepository = questionRepository;
        this.examRepository = examRepository;
        this.announcementRepository = announcementRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!seedData || userRepository.count() > 0) {
            logger.info("Database already contains data or seed-data is disabled. Skipping data seeding.");
            return;
        }

        logger.info("Seeding initial application data...");

        // 1. Create Default Users
        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@examportal.edu");
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        admin.setFullName("System Administrator");
        admin.setRole(Role.ROLE_ADMIN);
        admin.setDepartment("Computer Science");
        admin.setEmployeeId("ADM-001");
        admin.setActive(true);
        User savedAdmin = userRepository.save(admin);

        User examiner = new User();
        examiner.setUsername("examiner");
        examiner.setEmail("examiner@examportal.edu");
        examiner.setPassword(passwordEncoder.encode("Teacher@123"));
        examiner.setFullName("Prof. Alan Turing");
        examiner.setRole(Role.ROLE_EXAMINER);
        examiner.setDepartment("Computer Science");
        examiner.setEmployeeId("FAC-101");
        examiner.setActive(true);
        User savedExaminer = userRepository.save(examiner);

        User student = new User();
        student.setUsername("student");
        student.setEmail("student@examportal.edu");
        student.setPassword(passwordEncoder.encode("Student@123"));
        student.setFullName("Ada Lovelace");
        student.setRole(Role.ROLE_STUDENT);
        student.setDepartment("Computer Science");
        student.setStudentId("STU-2026-001");
        student.setActive(true);
        User savedStudent = userRepository.save(student);

        // 2. Create Departments
        Department csDept = new Department("CSE", "Computer Science and Engineering", "Department of Computer Science & Software Systems");
        csDept = departmentRepository.save(csDept);

        Department itDept = new Department("IT", "Information Technology", "Department of Information Systems and Networks");
        itDept = departmentRepository.save(itDept);

        // 3. Create Subjects
        Subject dsa = new Subject("CS201", "Data Structures and Algorithms", csDept.getId(), csDept.getName(), 4, "Core course on fundamental data structures and algorithmic complexity");
        dsa = subjectRepository.save(dsa);

        Subject dbms = new Subject("CS301", "Database Management Systems", csDept.getId(), csDept.getName(), 3, "Relational databases, indexing, NoSQL, and transactions");
        dbms = subjectRepository.save(dbms);

        // 4. Create Sample Questions for DSA
        List<String> questionIds = new ArrayList<>();
        List<QuestionSnapshot> snapshots = new ArrayList<>();

        // Question 1: MCQ Single
        Question q1 = new Question();
        q1.setSubjectId(dsa.getId());
        q1.setSubjectName(dsa.getName());
        q1.setCreatorId(savedExaminer.getId());
        q1.setCreatorName(savedExaminer.getFullName());
        q1.setType(QuestionType.MCQ_SINGLE);
        q1.setTitle("What is the worst-case time complexity of searching an element in a Balanced Binary Search Tree (AVL tree) with n nodes?");
        q1.setOptions(Arrays.asList("O(1)", "O(log n)", "O(n)", "O(n log n)"));
        q1.setCorrectAnswers(List.of("O(log n)"));
        q1.setExplanation("An AVL tree maintains height balance where height h is bounded by O(log n), so search operation takes O(log n) worst-case time.");
        q1.setMarks(2.0);
        q1.setNegativeMarks(0.5);
        q1.setDifficulty(DifficultyLevel.EASY);
        q1.setTags(Arrays.asList("trees", "complexity"));
        q1 = questionRepository.save(q1);
        questionIds.add(q1.getId());
        snapshots.add(new QuestionSnapshot(q1));

        // Question 2: MCQ Multiple
        Question q2 = new Question();
        q2.setSubjectId(dsa.getId());
        q2.setSubjectName(dsa.getName());
        q2.setCreatorId(savedExaminer.getId());
        q2.setCreatorName(savedExaminer.getFullName());
        q2.setType(QuestionType.MCQ_MULTIPLE);
        q2.setTitle("Which of the following sorting algorithms have an average time complexity of O(n log n)?");
        q2.setOptions(Arrays.asList("Merge Sort", "Quick Sort", "Bubble Sort", "Heap Sort"));
        q2.setCorrectAnswers(Arrays.asList("Merge Sort", "Quick Sort", "Heap Sort"));
        q2.setExplanation("Merge Sort, Quick Sort, and Heap Sort all exhibit O(n log n) average time complexity. Bubble Sort is O(n^2).");
        q2.setMarks(3.0);
        q2.setNegativeMarks(1.0);
        q2.setDifficulty(DifficultyLevel.MEDIUM);
        q2.setTags(Arrays.asList("sorting", "algorithms"));
        q2 = questionRepository.save(q2);
        questionIds.add(q2.getId());
        snapshots.add(new QuestionSnapshot(q2));

        // Question 3: True / False
        Question q3 = new Question();
        q3.setSubjectId(dsa.getId());
        q3.setSubjectName(dsa.getName());
        q3.setCreatorId(savedExaminer.getId());
        q3.setCreatorName(savedExaminer.getFullName());
        q3.setType(QuestionType.TRUE_FALSE);
        q3.setTitle("In a standard Min-Heap, the root element is always the minimum element in the entire tree.");
        q3.setOptions(Arrays.asList("True", "False"));
        q3.setCorrectAnswers(List.of("True"));
        q3.setExplanation("By heap-order property, each parent key is less than or equal to its children's keys in a Min-Heap; therefore, the root contains the minimum element.");
        q3.setMarks(2.0);
        q3.setNegativeMarks(0.5);
        q3.setDifficulty(DifficultyLevel.EASY);
        q3.setTags(Arrays.asList("heaps", "priority-queues"));
        q3 = questionRepository.save(q3);
        questionIds.add(q3.getId());
        snapshots.add(new QuestionSnapshot(q3));

        // Question 4: Short Answer
        Question q4 = new Question();
        q4.setSubjectId(dsa.getId());
        q4.setSubjectName(dsa.getName());
        q4.setCreatorId(savedExaminer.getId());
        q4.setCreatorName(savedExaminer.getFullName());
        q4.setType(QuestionType.SHORT_ANSWER);
        q4.setTitle("Which data structure operates strictly on a LIFO (Last-In, First-Out) order?");
        q4.setOptions(new ArrayList<>());
        q4.setCorrectAnswers(Arrays.asList("Stack", "stack"));
        q4.setExplanation("A stack is a linear LIFO structure where insertions and deletions happen only at top.");
        q4.setMarks(3.0);
        q4.setNegativeMarks(0.0);
        q4.setDifficulty(DifficultyLevel.EASY);
        q4.setTags(Arrays.asList("stack", "data-structures"));
        q4 = questionRepository.save(q4);
        questionIds.add(q4.getId());
        snapshots.add(new QuestionSnapshot(q4));

        // Question 5: Descriptive
        Question q5 = new Question();
        q5.setSubjectId(dsa.getId());
        q5.setSubjectName(dsa.getName());
        q5.setCreatorId(savedExaminer.getId());
        q5.setCreatorName(savedExaminer.getFullName());
        q5.setType(QuestionType.DESCRIPTIVE);
        q5.setTitle("Explain Dijkstra's shortest path algorithm. Under what graph conditions does it fail and why?");
        q5.setOptions(new ArrayList<>());
        q5.setCorrectAnswers(List.of("Key points: greedy strategy, priority queue relaxation, fails on graphs with negative edge cycles or negative weights because greedy choice cannot be undone."));
        q5.setExplanation("Dijkstra greedily visits the vertex with current shortest distance. It fails on negative weight edges because it assumes previously finalized paths cannot be shortened further.");
        q5.setMarks(10.0);
        q5.setNegativeMarks(0.0);
        q5.setDifficulty(DifficultyLevel.HARD);
        q5.setTags(Arrays.asList("graphs", "dijkstra", "shortest-path"));
        q5 = questionRepository.save(q5);
        questionIds.add(q5.getId());
        snapshots.add(new QuestionSnapshot(q5));

        // 5. Create a Live Published Exam
        Exam exam = new Exam();
        exam.setTitle("Midterm Examination: Data Structures & Algorithms");
        exam.setCode("EXAM-CS201-2026");
        exam.setDescription("Comprehensive midterm exam covering asymptotic notation, trees, graphs, sorting, and linear data structures.");
        exam.setInstructions("1. Ensure stable internet connection.\n2. Do not switch browser tabs during exam.\n3. Timer will automatically submit upon completion.");
        exam.setSubjectId(dsa.getId());
        exam.setSubjectName(dsa.getName());
        exam.setDepartment(csDept.getName());
        exam.setCreatedBy(savedAdmin.getId());
        exam.setCreatedByName(savedAdmin.getFullName());
        exam.setAssignedExaminerIds(List.of(savedExaminer.getId()));
        exam.setEnrolledStudentIds(List.of(savedStudent.getId()));
        exam.setDurationMinutes(45);
        exam.setTotalMarks(20.0);
        exam.setPassingMarks(8.0);
        exam.setStartTime(Instant.now().minus(1, ChronoUnit.HOURS));
        exam.setEndTime(Instant.now().plus(7, ChronoUnit.DAYS));
        exam.setStatus(ExamStatus.PUBLISHED);
        exam.setQuestionIds(questionIds);
        exam.setQuestionsSnapshot(snapshots);
        exam.setAllowReview(true);
        exam.setShowResultsImmediately(true);
        exam.setMaxAttempts(2);
        examRepository.save(exam);

        // 6. Create Default Announcements
        Announcement ann1 = new Announcement(
                "Welcome to the Unified Exam Management Portal",
                "The Spring 2026 examination season is now underway. Check your scheduled exams and review the system requirements.",
                "ALL",
                savedAdmin.getFullName(),
                "HIGH"
        );
        ann1.setCreatedAt(Instant.now());
        announcementRepository.save(ann1);

        Announcement ann2 = new Announcement(
                "Proctoring Rules & Anti-Cheating Policy Notice",
                "During examinations, tab switching and browser blur events are actively logged and reported to examiners.",
                "ROLE_STUDENT",
                savedExaminer.getFullName(),
                "MEDIUM"
        );
        ann2.setCreatedAt(Instant.now().minus(2, ChronoUnit.HOURS));
        announcementRepository.save(ann2);

        logger.info("Successfully seeded demo users, courses, question bank, and published exam.");
    }
}
