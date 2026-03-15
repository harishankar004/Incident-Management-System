package com.example.IMS_Backend.service;

import com.example.IMS_Backend.dto.SlaRequest;
import com.example.IMS_Backend.dto.SlaResponse;
import com.example.IMS_Backend.exception.AppExceptions.*;
import com.example.IMS_Backend.incident.Incident;
import com.example.IMS_Backend.incident.IncidentStatus;
import com.example.IMS_Backend.notification.Notification;
import com.example.IMS_Backend.repository.*;
import com.example.IMS_Backend.sla.*;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SlaService {

    private final SlaRepository         slaRepo;
    private final IncidentSlaRepository incidentSlaRepo;
    private final IncidentRepository    incidentRepo;
    private final NotificationRepository notifRepo;

    @Transactional(readOnly = true)
    public List<SlaResponse> getAllSlas() {
        return slaRepo.findByIsActiveTrue().stream().map(this::toResponse).toList();
    }

    public SlaResponse createSla(SlaRequest req) {
        Sla sla = Sla.builder()
                .slaName(req.getSlaName()).priority(req.getPriority())
                .responseTimeMinutes(req.getResponseTimeMinutes())
                .resolutionTimeMinutes(req.getResolutionTimeMinutes())
                .isActive(true).build();
        return toResponse(slaRepo.save(sla));
    }

    public SlaResponse updateSla(Long id, SlaRequest req) {
        Sla sla = slaRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SLA not found: " + id));
        sla.setSlaName(req.getSlaName());
        sla.setPriority(req.getPriority());
        sla.setResponseTimeMinutes(req.getResponseTimeMinutes());
        sla.setResolutionTimeMinutes(req.getResolutionTimeMinutes());
        return toResponse(slaRepo.save(sla));
    }

    public void deactivateSla(Long id) {
        Sla sla = slaRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SLA not found: " + id));
        sla.setIsActive(false);
        slaRepo.save(sla);
    }

    @Scheduled(fixedRate = 300_000)
    public void checkSlaBreaches() {
        List<IncidentSla> due = incidentSlaRepo
                .findByResolutionBreachedFalseAndResolutionDueAtBefore(LocalDateTime.now());
        for (IncidentSla isla : due) {
            Incident inc = isla.getIncident();
            if (inc.getStatus() != IncidentStatus.RESOLVED &&
                inc.getStatus() != IncidentStatus.CLOSED) {
                isla.setResolutionBreached(true);
                incidentSlaRepo.save(isla);
                inc.setSlaBreach(true);
                incidentRepo.save(inc);
                if (inc.getOwner() != null) {
                    notifRepo.save(Notification.builder()
                            .user(inc.getOwner()).incident(inc)
                            .type(Notification.NotifType.SLA_BREACH)
                            .title("SLA Breach Alert")
                            .message("Incident #" + inc.getId() + " has breached its SLA")
                            .isRead(false).build());
                }
            }
        }
    }

    private SlaResponse toResponse(Sla s) {
        return SlaResponse.builder()
                .slaId(s.getId()).slaName(s.getSlaName()).priority(s.getPriority())
                .responseTimeMinutes(s.getResponseTimeMinutes())
                .resolutionTimeMinutes(s.getResolutionTimeMinutes())
                .isActive(s.getIsActive()).build();
    }
}
