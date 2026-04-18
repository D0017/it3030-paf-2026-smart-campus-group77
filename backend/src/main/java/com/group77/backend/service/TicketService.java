package com.group77.backend.service;

import com.group77.backend.dto.TicketRequestDto;
import com.group77.backend.entity.Ticket;
import com.group77.backend.entity.User;
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

    // USER creates ticket
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


    // ADMIN assigns technician
    public Ticket assignTechnician(Long ticketId, Long technicianId) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));

        ticket.setAssignedTechnician(technician);
        ticket.setTechnicianAssignmentStatus(TechnicianAssignmentStatus.PENDING);

        return ticketRepository.save(ticket);
    }


    // TECHNICIAN accepts ticket
    public Ticket acceptTicket(Long ticketId) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setTechnicianAssignmentStatus(TechnicianAssignmentStatus.ACCEPTED);
        ticket.setStatus(TicketStatus.IN_PROGRESS);

        return ticketRepository.save(ticket);
    }


    // TECHNICIAN rejects ticket
    public Ticket rejectTicket(Long ticketId, String reason) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setTechnicianAssignmentStatus(TechnicianAssignmentStatus.REJECTED);
        ticket.setTechnicianResponseReason(reason);

        return ticketRepository.save(ticket);
    }


    // TECHNICIAN marks resolved
    public Ticket resolveTicket(Long ticketId, String resolutionNotes) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setResolutionNotes(resolutionNotes);

        return ticketRepository.save(ticket);
    }


    // ADMIN closes ticket
    public Ticket closeTicket(Long ticketId) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus(TicketStatus.CLOSED);

        return ticketRepository.save(ticket);
    }


    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

}