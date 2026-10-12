package com.exammanagement.service;

import com.exammanagement.dto.request.ChangePasswordRequest;
import com.exammanagement.dto.request.LoginRequest;
import com.exammanagement.dto.request.RegisterRequest;
import com.exammanagement.dto.response.AuthResponse;
import com.exammanagement.dto.response.UserResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
    UserResponse getCurrentUser();
    void changePassword(String userId, ChangePasswordRequest request);
}
