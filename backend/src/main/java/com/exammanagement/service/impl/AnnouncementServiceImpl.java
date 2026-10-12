package com.exammanagement.service.impl;

import com.exammanagement.dto.request.AnnouncementRequest;
import com.exammanagement.exception.ResourceNotFoundException;
import com.exammanagement.model.Announcement;
import com.exammanagement.repository.AnnouncementRepository;
import com.exammanagement.service.AnnouncementService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

@Service
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementServiceImpl(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    @Override
    public List<Announcement> getAnnouncementsForRole(String role) {
        return announcementRepository.findByTargetRoleInOrderByCreatedAtDesc(Arrays.asList("ALL", role));
    }

    @Override
    public Page<Announcement> getAllAnnouncements(Pageable pageable) {
        return announcementRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Override
    public Announcement createAnnouncement(AnnouncementRequest request, String authorName) {
        Announcement announcement = new Announcement(
                request.getTitle(),
                request.getContent(),
                request.getTargetRole() != null ? request.getTargetRole() : "ALL",
                authorName,
                request.getPriority() != null ? request.getPriority() : "MEDIUM"
        );
        announcement.setCreatedAt(Instant.now());
        return announcementRepository.save(announcement);
    }

    @Override
    public void deleteAnnouncement(String id) {
        if (!announcementRepository.existsById(id)) {
            throw new ResourceNotFoundException("Announcement", "id", id);
        }
        announcementRepository.deleteById(id);
    }
}
