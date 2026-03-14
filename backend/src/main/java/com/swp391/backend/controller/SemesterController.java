package com.swp391.backend.controller;

import com.swp391.backend.common.ApiResponse;
import com.swp391.backend.entity.Semester;
import com.swp391.backend.repository.SemesterRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/semesters")
public class SemesterController {

    private final SemesterRepository semesterRepository;

    public SemesterController(SemesterRepository semesterRepository) {
        this.semesterRepository = semesterRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'STUDENT')")
    public ApiResponse<List<Semester>> getAllSemesters() {
        return ApiResponse.success(semesterRepository.findAll());
    }
}
