package com.swp391.backend.dto.response;

import java.time.LocalDateTime;

/**
 * Interface-based projection cho thống kê commit cá nhân.
 */
public interface PersonalCommitStatsProjection {
    Long getCommitCount();
    Long getTotalAdditions();
    Long getTotalDeletions();
    Long getTotalFilesChanged();
    LocalDateTime getLatestCommitDate();
}
