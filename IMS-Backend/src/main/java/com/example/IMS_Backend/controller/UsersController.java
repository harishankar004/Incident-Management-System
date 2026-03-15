package com.example.IMS_Backend.controller;

import com.example.IMS_Backend.dto.ApiResponse;
import com.example.IMS_Backend.dto.UserResponse;
import com.example.IMS_Backend.rbac.RoleCode;
import com.example.IMS_Backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Shared endpoint accessible to all authenticated users (INC_MANAGER needs this
 * to fetch RESOLVERs for incident assignment — /api/admin/** requires ADMIN role).
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UsersController {

    private final UserService userService;

    /**
     * GET /api/users/by-role/{roleCode}
     * Returns active users with the specified role.
     * Accessible to: all authenticated users (no admin restriction).
     */
    @GetMapping("/by-role/{roleCode}")
    public ResponseEntity<ApiResponse<List<UserResponse>>> usersByRole(
            @PathVariable RoleCode roleCode) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUsersByRole(roleCode)));
    }
}
