package com.instituto.academic_os_backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TareaRepository extends JpaRepository<Tarea, Long> {
    // Solo con esta línea, ya tenemos todos los métodos de base de datos creados por arte de magia
}