package com.swp391.backend.service;

import com.swp391.backend.dto.response.SyncResultResponse;

/**
 * Service xử lý đồng bộ thủ công từ Jira về DB nội bộ (1 chiều, read-only
 * pull).
 * Mapping: Epic → Requirement, Story → Task, Sub-task → child Task.
 */
public interface JiraManualSyncService {

    /**
     * Trigger đồng bộ Jira → DB cho group.
     *
     * @param groupId           ID của group cần sync
     * @param triggeredByUserId ID của user đang trigger sync (dùng làm createdBy
     *                          cho Requirement mới)
     * @return SyncResultResponse với insertedCount, updatedCount, message
     */
    SyncResultResponse syncNow(Long groupId, Long triggeredByUserId);
}
