package com.group77.backend.service;

import com.group77.backend.dto.TicketRequestDto;
import com.group77.backend.entity.Ticket;
import com.group77.backend.entity.User;
import com.group77.backend.enums.RoleName;
import com.group77.backend.enums.TechnicianAssignmentStatus;
import com.group77.backend.enums.TicketStatus;
import com.group77.backend.repository.TicketRepository;
import com.group77.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public Ticket createTicket(TicketRequestDto dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Ticket ticket = Ticket.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .location(dto.getLocation())
                .preferredContactDetails(dto.getPreferredContactDetails())
                .priority(dto.getPriority())
                .status(TicketStatus.OPEN)
                .createdBy(user)
                .technicianAssignmentStatus(TechnicianAssignmentStatus.PENDING)
                .build();

        return ticketRepository.save(ticket);
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

        if (ticket.getStatus() == TicketStatus.REJECTED) {
            ticket.setStatus(TicketStatus.OPEN);
            ticket.setRejectionReason(null);
        }

        return ticketRepository.save(ticket);
    }

    public Ticket acceptTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (ticket.getAssignedTechnician() == null) {
            throw new RuntimeException("No technician assigned to this ticket");
        }

        if (ticket.getTechnicianAssignmentStatus() == TechnicianAssignmentStatus.REJECTED) {
            throw new RuntimeException("Rejected assignment cannot be accepted");
        }

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new RuntimeException("Closed ticket cannot be accepted");
        }

        ticket.setTechnicianAssignmentStatus(TechnicianAssignmentStatus.ACCEPTED);
        ticket.setTechnicianResponseReason(null);
        ticket.setStatus(TicketStatus.IN_PROGRESS);

        return ticketRepository.save(ticket);
    }

    public Ticket rejectTicket(Long ticketId, String reason) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (ticket.getAssignedTechnician() == null) {
            throw new RuntimeException("No technician assigned to this ticket");
        }

        if (ticket.getTechnicianAssignmentStatus() == TechnicianAssignmentStatus.ACCEPTED) {
            throw new RuntimeException("Accepted assignment cannot be rejected");
        }

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new RuntimeException("Closed ticket cannot be rejected");
        }

        ticket.setTechnicianAssignmentStatus(TechnicianAssignmentStatus.REJECTED);
        ticket.setTechnicianResponseReason(reason);
        ticket.setStatus(TicketStatus.OPEN);

        return ticketRepository.save(ticket);
    }

    public Ticket resolveTicket(Long ticketId, String resolutionNotes) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (ticket.getAssignedTechnician() == null) {
            throw new RuntimeException("No technician assigned to this ticket");
        }

        if (ticket.getTechnicianAssignmentStatus() != TechnicianAssignmentStatus.ACCEPTED) {
            throw new RuntimeException("Ticket must be accepted by technician before resolving");
        }

        if (ticket.getStatus() != TicketStatus.IN_PROGRESS) {
            throw new RuntimeException("Only IN_PROGRESS tickets can be resolved");
        }

        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setResolutionNotes(resolutionNotes);

        return ticketRepository.save(ticket);
    }

    // USER closes ticket after checking resolved work
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

    // USER deletes ticket before technician starts work
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

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }
}