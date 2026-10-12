package com.exammanagement.service;

import com.exammanagement.dto.request.DepartmentRequest;
import com.exammanagement.model.Department;

import java.util.List;

public interface DepartmentService {
    List<Department> getAllDepartments();
    Department getDepartmentById(String id);
    Department createDepartment(DepartmentRequest request);
    Department updateDepartment(String id, DepartmentRequest request);
    void deleteDepartment(String id);
}
