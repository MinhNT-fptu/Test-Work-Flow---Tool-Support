package com.swp391.backend.service.impl;

import com.swp391.backend.entity.SyncLog;
import com.swp391.backend.entity.SyncStatus;
import com.swp391.backend.repository.SyncLogRepository;
import com.swp391.backend.service.SyncLogService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * SyncLog operations luôn chạy trong transaction RIÊNG BIỆT (REQUIRES_NEW)
 * để đảm bảo SyncLog RUNNING / SUCCESS / FAILED được commit độc lập với
 * transaction business data. Dù sync fail giữa chừng, SyncLog vẫn được lưu.
 */
@Service
public class SyncLogServiceImpl implements SyncLogService {

    private final SyncLogRepository syncLogRepository;

    public SyncLogServiceImpl(SyncLogRepository syncLogRepository) {
        this.syncLogRepository = syncLogRepository;
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public SyncLog begin(Long groupId, String source) {
        // Nếu đã có RUNNING → ném 409 ngay, caller sẽ bắt ResponseStatusException
        syncLogRepository.findByGroupIdAndSourceAndStatus(groupId, source, SyncStatus.RUNNING)
                .ifPresent(log -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Sync is running");
                });

        SyncLog syncLog = SyncLog.builder()
                .groupId(groupId)
                .source(source)
                .status(SyncStatus.RUNNING)
                .build();

        return syncLogRepository.save(syncLog);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public SyncLog updateStatus(Long logId, SyncStatus status, String message, Integer insertedCount,
            Integer updatedCount) {
        SyncLog syncLog = syncLogRepository.findById(logId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SyncLog not found"));

        syncLog.setStatus(status);
        syncLog.setDetailMessage(message);
        syncLog.setInsertedCount(insertedCount);
        syncLog.setUpdatedCount(updatedCount);

        if (status != SyncStatus.RUNNING) {
            syncLog.setEndedAt(java.time.LocalDateTime.now());
        }

        return syncLogRepository.save(syncLog);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public SyncLog fail(Long logId, String message) {
        return updateStatus(logId, SyncStatus.FAILED, message, 0, 0);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public SyncLog success(Long logId, String message, Integer insertedCount, Integer updatedCount) {
        return updateStatus(logId, SyncStatus.SUCCESS, message, insertedCount, updatedCount);
    }
}
