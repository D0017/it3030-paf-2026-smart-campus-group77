package com.group77.backend.controller;

import com.group77.backend.dto.TicketRequestDto;
import com.group77.backend.entity.Ticket;
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


    // create ticket
    @PostMapping
    public Ticket createTicket(
            @RequestBody TicketRequestDto dto,
            @RequestParam Long userId
    ) {
        return ticketService.createTicket(dto, userId);
    }


    // get all tickets
    @GetMapping
    public List<Ticket> getAllTickets() {
        return ticketService.getAllTickets();
    }


    // admin assigns technician
    @PutMapping("/{ticketId}/assign-technician")
    public Ticket assignTechnician(
            @PathVariable Long ticketId,
            @RequestParam Long technicianId
    ) {
        return ticketService.assignTechnician(ticketId, technicianId);
    }


    // technician accepts ticket
    @PutMapping("/{ticketId}/accept")
    public Ticket acceptTicket(@PathVariable Long ticketId) {
        return ticketService.acceptTicket(ticketId);
    }


    // technician rejects ticket
    @PutMapping("/{ticketId}/reject")
    public Ticket rejectTicket(
            @PathVariable Long ticketId,
            @RequestParam String reason
    ) {
        return ticketService.rejectTicket(ticketId, reason);
    }


    // technician marks resolved
    @PutMapping("/{ticketId}/resolve")
    public Ticket resolveTicket(
            @PathVariable Long ticketId,
            @RequestParam String resolutionNotes
    ) {
        return ticketService.resolveTicket(ticketId, resolutionNotes);
    }


    // admin closes ticket
    @PutMapping("/{ticketId}/close")
    public Ticket closeTicket(@PathVariable Long ticketId) {
        return ticketService.closeTicket(ticketId);
    }

}