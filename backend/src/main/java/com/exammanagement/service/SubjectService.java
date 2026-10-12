package com.exammanagement.service;

import com.exammanagement.dto.request.SubjectRequest;
import com.exammanagement.model.Subject;

import java.util.List;

public interface SubjectService {
    List<Subject> getAllSubjects();
    List<Subject> getSubjectsByDepartment(String departmentId);
    Subject getSubjectById(String id);
    Subject createSubject(SubjectRequest request);
    Subject updateSubject(String id, SubjectRequest request);
    void deleteSubject(String id);
}
