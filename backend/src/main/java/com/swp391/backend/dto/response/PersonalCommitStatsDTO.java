package com.swp391.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO chứa thông tin thống kê commit cá nhân của một người dùng trong một repo/nhóm.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalCommitStatsDTO {

    /** Tổng số commit. */
    private long commitCount;

    /** Tổng số dòng thêm. */
    private long totalAdditions;

    /** Tổng số dòng xóa. */
    private long totalDeletions;

    /** Tổng số file thay đổi. */
    private long totalFilesChanged;

    /** Ngày commit gần nhất. */
    private LocalDateTime latestCommitDate;

    /**
     * Factory method để chuyển đổi từ Projection sang DTO.
     * Xử lý trường hợp null từ DB thành 0.
     */
    public static PersonalCommitStatsDTO from(PersonalCommitStatsProjection p) {
        if (p == null) {
            return PersonalCommitStatsDTO.builder()
                    .commitCount(0)
                    .totalAdditions(0)
                    .totalDeletions(0)
                    .totalFilesChanged(0)
                    .build();
        }
        return PersonalCommitStatsDTO.builder()
                .commitCount(p.getCommitCount() != null ? p.getCommitCount() : 0)
                .totalAdditions(p.getTotalAdditions() != null ? p.getTotalAdditions() : 0)
                .totalDeletions(p.getTotalDeletions() != null ? p.getTotalDeletions() : 0)
                .totalFilesChanged(p.getTotalFilesChanged() != null ? p.getTotalFilesChanged() : 0)
                .latestCommitDate(p.getLatestCommitDate())
                .build();
    }

    /** Trả về DTO với các giá trị mặc định là 0. */
    public static PersonalCommitStatsDTO empty() {
        return PersonalCommitStatsDTO.builder()
                .commitCount(0)
                .totalAdditions(0)
                .totalDeletions(0)
                .totalFilesChanged(0)
                .build();
    }
}
