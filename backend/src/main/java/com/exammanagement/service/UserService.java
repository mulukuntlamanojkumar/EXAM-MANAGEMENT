package com.exammanagement.service;

import com.exammanagement.dto.request.RegisterRequest;
import com.exammanagement.dto.request.UserUpdateRequest;
import com.exammanagement.dto.response.UserResponse;
import com.exammanagement.model.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    Page<UserResponse> getAllUsers(Pageable pageable);
    Page<UserResponse> getUsersByRole(Role role, Pageable pageable);
    UserResponse getUserById(String id);
    UserResponse createUser(RegisterRequest request);
    UserResponse updateUser(String id, UserUpdateRequest request);
    void deleteUser(String id);
    UserResponse toggleUserStatus(String id);
    List<UserResponse> getAllExaminers();
    List<UserResponse> getAllStudents();
}
