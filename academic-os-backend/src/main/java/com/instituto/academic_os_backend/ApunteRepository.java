package com.instituto.academic_os_backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApunteRepository extends JpaRepository<Apunte, Long> {
}