package com.group77.backend.repository;

import com.group77.backend.entity.User;
import com.group77.backend.enums.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(RoleName role);

    long countByRole(RoleName role);
}