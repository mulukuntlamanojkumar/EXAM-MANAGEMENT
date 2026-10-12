package com.exammanagement.service;

import com.exammanagement.dto.request.AnnouncementRequest;
import com.exammanagement.model.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AnnouncementService {
    List<Announcement> getAnnouncementsForRole(String role);
    Page<Announcement> getAllAnnouncements(Pageable pageable);
    Announcement createAnnouncement(AnnouncementRequest request, String authorName);
    void deleteAnnouncement(String id);
}
