package com.exammanagement.service.impl;

import com.exammanagement.dto.request.SubjectRequest;
import com.exammanagement.exception.BadRequestException;
import com.exammanagement.exception.ResourceNotFoundException;
import com.exammanagement.model.Department;
import com.exammanagement.model.Subject;
import com.exammanagement.repository.DepartmentRepository;
import com.exammanagement.repository.SubjectRepository;
import com.exammanagement.service.SubjectService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubjectServiceImpl implements SubjectService {

    private final SubjectRepository subjectRepository;
    private final DepartmentRepository departmentRepository;

    public SubjectServiceImpl(SubjectRepository subjectRepository, DepartmentRepository departmentRepository) {
        this.subjectRepository = subjectRepository;
        this.departmentRepository = departmentRepository;
    }

    @Override
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    @Override
    public List<Subject> getSubjectsByDepartment(String departmentId) {
        return subjectRepository.findByDepartmentId(departmentId);
    }

    @Override
    public Subject getSubjectById(String id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", id));
    }

    @Override
    public Subject createSubject(SubjectRequest request) {
        if (subjectRepository.existsByCode(request.getCode())) {
            throw new BadRequestException("Subject code already exists: " + request.getCode());
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));

        Subject subject = new Subject(
                request.getCode(),
                request.getName(),
                department.getId(),
                department.getName(),
                request.getCredits(),
                request.getDescription()
        );

        return subjectRepository.save(subject);
    }

    @Override
    public Subject updateSubject(String id, SubjectRequest request) {
        Subject subject = getSubjectById(id);

        if (!subject.getCode().equals(request.getCode()) && subjectRepository.existsByCode(request.getCode())) {
            throw new BadRequestException("Subject code already exists: " + request.getCode());
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));

        subject.setCode(request.getCode());
        subject.setName(request.getName());
        subject.setDepartmentId(department.getId());
        subject.setDepartmentName(department.getName());
        subject.setCredits(request.getCredits());
        subject.setDescription(request.getDescription());

        return subjectRepository.save(subject);
    }

    @Override
    public void deleteSubject(String id) {
        if (!subjectRepository.existsById(id)) {
            throw new ResourceNotFoundException("Subject", "id", id);
        }
        subjectRepository.deleteById(id);
    }
}
