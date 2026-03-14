package com.swp391.backend.controller;

import com.swp391.backend.common.ApiResponse;
import com.swp391.backend.dto.request.CreateClassRequest;
import com.swp391.backend.dto.request.UpdateClassRequest;
import com.swp391.backend.dto.response.AcademicClassResponse;
import com.swp391.backend.service.AcademicClassService;
import jakarta.validation.Valid;
import lombok.Data;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/classes")
public class AcademicClassController {

    private final AcademicClassService academicClassService;

    public AcademicClassController(AcademicClassService academicClassService) {
        this.academicClassService = academicClassService;
    }

    /** GET /api/classes */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'STUDENT')")
    public ApiResponse<Page<AcademicClassResponse>> searchClasses(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String courseCode,
            @RequestParam(required = false) String semesterCode,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.success(academicClassService.searchClasses(
                keyword, courseCode, semesterCode, PageRequest.of(page, size)));
    }

    /** POST /api/classes — ADMIN only */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<AcademicClassResponse> createClass(
            @Valid @RequestBody CreateClassRequest request) {
        return ApiResponse.success(academicClassService.createClass(request));
    }

    /** PUT /api/classes/{id} — ADMIN only  (update classCode / course / semester) */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<AcademicClassResponse> updateClass(
            @PathVariable Long id,
            @Valid @RequestBody UpdateClassRequest request) {
        return ApiResponse.success(academicClassService.updateClass(id, request));
    }

    /** PUT /api/classes/{id}/lecturer — ADMIN only  (assign or remove lecturer) */
    @PutMapping("/{id}/lecturer")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<AcademicClassResponse> assignLecturer(
            @PathVariable Long id,
            @RequestBody AssignLecturerRequest request) {
        return ApiResponse.success(academicClassService.assignLecturer(id, request.getLecturerId()));
    }

    /** DELETE /api/classes/{id} — ADMIN only */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteClass(@PathVariable Long id) {
        academicClassService.deleteClass(id);
        return ApiResponse.success(null);
    }

    /* ── Inner DTO ── */
    @Data
    public static class AssignLecturerRequest {
        private Long lecturerId; // null = remove lecturer
    }
}