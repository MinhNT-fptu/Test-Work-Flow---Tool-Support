package com.swp391.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateClassRequest {
    @NotBlank
    private String classCode;

    @NotNull
    private Long courseId;

    @NotNull
    private Long semesterId;
}
