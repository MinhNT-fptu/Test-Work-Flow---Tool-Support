package com.swp391.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateClassRequest {
    @NotBlank
    private String classCode;
    // courseId và semesterId có thể null nếu không muốn thay đổi
    private Long courseId;
    private Long semesterId;
}
