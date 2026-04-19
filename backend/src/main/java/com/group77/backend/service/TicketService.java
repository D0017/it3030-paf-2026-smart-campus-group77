package com.group77.backend.service;

import com.group77.backend.dto.TicketAttachmentResponseDto;
import com.group77.backend.dto.TicketRequestDto;
import com.group77.backend.entity.Ticket;
import com.group77.backend.entity.TicketAttachment;
import com.group77.backend.entity.User;
import com.group77.backend.enums.RoleName;
import com.group77.backend.enums.TechnicianAssignmentStatus;
import com.group77.backend.enums.TicketStatus;
import com.group77.backend.repository.TicketAttachmentRepository;
import com.group77.backend.repository.TicketRepository;
import com.group77.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketAttachmentRepository ticketAttachmentRepository;

    public Ticket createTicket(TicketRequestDto dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Ticket ticket = Ticket.builder()
                .studentName(dto.getStudentName())
                .studentEmail(dto.getStudentEmail())
                .contactNumber(dto.getContactNumber())
                .subject(dto.getSubject())
                .message(dto.getMessage())

                .title(dto.getSubject())
                .description(dto.getMessage())
                .category("GENERAL")
                .location("Not specified")
                .preferredContactDetails(dto.getContactNumber())

                .priority(dto.getPriority())
                .status(TicketStatus.OPEN)
                .createdBy(user)
                .technicianAssignmentStatus(TechnicianAssignmentStatus.PENDING)
                .build();

        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<Ticket> getTicketsForUser(Long userId) {
        return ticketRepository.findByCreatedById(userId);
    }

    public List<Ticket> getTicketsForTechnician(Long technicianId) {
        return ticketRepository.findByAssignedTechnicianId(technicianId);
    }

    public List<User> getAllTechnicians() {
        return userRepository.findByRole(RoleName.TECHNICIAN);
    }

    public Ticket assignTechnician(Long ticketId, Long technicianId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));

        if (technician.getRole() != RoleName.TECHNICIAN) {
            throw new RuntimeException("Assigned user must have TECHNICIAN role");
        }

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new RuntimeException("Cannot assign technician to a closed ticket");
        }

        ticket.setAssignedTechnician(technician);
        ticket.setTechnicianAssignmentStatus(TechnicianAssignmentStatus.PENDING);
        ticket.setTechnicianResponseReason(null);
        ticket.setRejectionReason(null);

        if (ticket.getStatus() == TicketStatus.REJECTED) {
            ticket.setStatus(TicketStatus.OPEN);
            ticket.setRejectionReason(null);
        }

        return ticketRepository.save(ticket);
    }

    public Ticket acceptTicket(Long ticketId, Long technicianId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (ticket.getAssignedTechnician() == null) {
            throw new RuntimeException("No technician assigned to this ticket");
        }

        if (!ticket.getAssignedTechnician().getId().equals(technicianId)) {
            throw new RuntimeException("You can only accept tickets assigned to you");
        }

        if (ticket.getTechnicianAssignmentStatus() == TechnicianAssignmentStatus.REJECTED) {
            throw new RuntimeException("Rejected assignment cannot be accepted");
        }

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new RuntimeException("Closed ticket cannot be accepted");
        }

        ticket.setTechnicianAssignmentStatus(TechnicianAssignmentStatus.ACCEPTED);
        ticket.setTechnicianResponseReason(null);
        ticket.setRejectionReason(null);
        ticket.setStatus(TicketStatus.IN_PROGRESS);

        return ticketRepository.save(ticket);
    }

    public Ticket rejectTicket(Long ticketId, Long technicianId, String reason) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (ticket.getAssignedTechnician() == null) {
            throw new RuntimeException("No technician assigned to this ticket");
        }

        if (!ticket.getAssignedTechnician().getId().equals(technicianId)) {
            throw new RuntimeException("You can only reject tickets assigned to you");
        }

        if (ticket.getTechnicianAssignmentStatus() == TechnicianAssignmentStatus.ACCEPTED) {
            throw new RuntimeException("Accepted assignment cannot be rejected");
        }

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new RuntimeException("Closed ticket cannot be rejected");
        }

        ticket.setTechnicianAssignmentStatus(TechnicianAssignmentStatus.REJECTED);
        ticket.setTechnicianResponseReason(reason);
        ticket.setRejectionReason(reason);
        ticket.setStatus(TicketStatus.OPEN);

        return ticketRepository.save(ticket);
    }

    public Ticket resolveTicket(Long ticketId, Long technicianId, String resolutionNotes) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (ticket.getAssignedTechnician() == null) {
            throw new RuntimeException("No technician assigned to this ticket");
        }

        if (!ticket.getAssignedTechnician().getId().equals(technicianId)) {
            throw new RuntimeException("You can only resolve tickets assigned to you");
        }

        if (ticket.getTechnicianAssignmentStatus() != TechnicianAssignmentStatus.ACCEPTED) {
            throw new RuntimeException("Ticket must be accepted before resolving");
        }

        if (ticket.getStatus() != TicketStatus.IN_PROGRESS) {
            throw new RuntimeException("Only IN_PROGRESS tickets can be resolved");
        }

        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setResolutionNotes(resolutionNotes);
        ticket.setRejectionReason(null);

        return ticketRepository.save(ticket);
    }

    public Ticket closeTicket(Long ticketId, Long userId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!ticket.getCreatedBy().getId().equals(userId)) {
            throw new RuntimeException("Only the ticket owner can close this ticket");
        }

        if (ticket.getStatus() != TicketStatus.RESOLVED) {
            throw new RuntimeException("Only RESOLVED tickets can be closed");
        }

        ticket.setStatus(TicketStatus.CLOSED);

        return ticketRepository.save(ticket);
    }

    public void deleteTicket(Long ticketId, Long userId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!ticket.getCreatedBy().getId().equals(userId)) {
            throw new RuntimeException("Only the ticket owner can delete this ticket");
        }

        if (ticket.getStatus() != TicketStatus.OPEN) {
            throw new RuntimeException("Only OPEN tickets can be deleted");
        }

        if (ticket.getTechnicianAssignmentStatus() == TechnicianAssignmentStatus.ACCEPTED) {
            throw new RuntimeException("Accepted tickets cannot be deleted");
        }

        ticketRepository.delete(ticket);
    }

    public TicketAttachmentResponseDto uploadAttachment(Long ticketId, Long userId, MultipartFile file) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isOwner = ticket.getCreatedBy().getId().equals(userId);
        boolean isAdmin = user.getRole() == RoleName.ADMIN;
        boolean isAssignedTechnician =
                ticket.getAssignedTechnician() != null &&
                ticket.getAssignedTechnician().getId().equals(userId);

        if (!isOwner && !isAdmin && !isAssignedTechnician) {
            throw new RuntimeException("You do not have permission to upload attachments for this ticket");
        }

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please select an image file");
        }

        if (ticketAttachmentRepository.countByTicketId(ticketId) >= 3) {
            throw new RuntimeException("Maximum 3 attachments are allowed per ticket");
        }

        if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            throw new RuntimeException("Only image attachments are allowed");
        }

        try {
            TicketAttachment attachment = TicketAttachment.builder()
                    .fileName(file.getOriginalFilename())
                    .fileType(file.getContentType())
                    .data(file.getBytes())
                    .ticket(ticket)
                    .build();

            TicketAttachment saved = ticketAttachmentRepository.save(attachment);

            return mapAttachment(saved);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload attachment");
        }
    }

    public List<TicketAttachmentResponseDto> getAttachmentsByTicket(Long ticketId) {
        return ticketAttachmentRepository.findByTicketId(ticketId)
                .stream()
                .map(this::mapAttachment)
                .toList();
    }

    public TicketAttachment getAttachmentById(Long attachmentId) {
        return ticketAttachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
    }

    private TicketAttachmentResponseDto mapAttachment(TicketAttachment attachment) {
        return TicketAttachmentResponseDto.builder()
                .id(attachment.getId())
                .fileName(attachment.getFileName())
                .fileType(attachment.getFileType())
                .uploadedAt(attachment.getUploadedAt())
                .build();
    }
}