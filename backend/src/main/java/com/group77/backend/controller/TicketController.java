package com.group77.backend.controller;

import com.group77.backend.dto.TicketRequestDto;
import com.group77.backend.entity.Ticket;
import com.group77.backend.entity.User;
import com.group77.backend.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public Ticket createTicket(
            @RequestBody TicketRequestDto dto,
            @RequestParam Long userId
    ) {
        return ticketService.createTicket(dto, userId);
    }

    @GetMapping
    public List<Ticket> getAllTickets() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/user")
    public List<Ticket> getTicketsForUser(@RequestParam Long userId) {
        return ticketService.getTicketsForUser(userId);
    }

    @GetMapping("/technician")
    public List<Ticket> getTicketsForTechnician(@RequestParam Long technicianId) {
        return ticketService.getTicketsForTechnician(technicianId);
    }

    @GetMapping("/technicians")
    public List<User> getAllTechnicians() {
        return ticketService.getAllTechnicians();
    }

    @PutMapping("/{ticketId}/assign-technician")
    public Ticket assignTechnician(
            @PathVariable Long ticketId,
            @RequestParam Long technicianId
    ) {
        return ticketService.assignTechnician(ticketId, technicianId);
    }

    @PutMapping("/{ticketId}/accept")
    public Ticket acceptTicket(
            @PathVariable Long ticketId,
            @RequestParam Long technicianId
    ) {
        return ticketService.acceptTicket(ticketId, technicianId);
    }

    @PutMapping("/{ticketId}/reject")
    public Ticket rejectTicket(
            @PathVariable Long ticketId,
            @RequestParam Long technicianId,
            @RequestParam String reason
    ) {
        return ticketService.rejectTicket(ticketId, technicianId, reason);
    }

    @PutMapping("/{ticketId}/resolve")
    public Ticket resolveTicket(
            @PathVariable Long ticketId,
            @RequestParam Long technicianId,
            @RequestParam String resolutionNotes
    ) {
        return ticketService.resolveTicket(ticketId, technicianId, resolutionNotes);
    }

    @PutMapping("/{ticketId}/close")
    public Ticket closeTicket(
            @PathVariable Long ticketId,
            @RequestParam Long userId
    ) {
        return ticketService.closeTicket(ticketId, userId);
    }

    @DeleteMapping("/{ticketId}")
    public String deleteTicket(
            @PathVariable Long ticketId,
            @RequestParam Long userId
    ) {
        ticketService.deleteTicket(ticketId, userId);
        return "Ticket deleted successfully";
    }
}