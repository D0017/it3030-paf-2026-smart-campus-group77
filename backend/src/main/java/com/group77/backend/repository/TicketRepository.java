package com.group77.backend.repository;

import com.group77.backend.entity.Ticket;
import com.group77.backend.entity.User;
import com.group77.backend.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByCreatedBy(User user);

    List<Ticket> findByAssignedTechnician(User technician);

    List<Ticket> findByStatus(TicketStatus status);

    List<Ticket> findByCreatedById(Long userId);

    List<Ticket> findByAssignedTechnicianId(Long technicianId);
}