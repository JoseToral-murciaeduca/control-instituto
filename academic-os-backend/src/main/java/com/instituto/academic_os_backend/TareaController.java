package com.instituto.academic_os_backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tareas")
@CrossOrigin(origins = "*") // ¡VITAL! Permite que tu web HTML estática pueda pedirle datos a este servidor
public class TareaController {

    @Autowired
    private TareaRepository tareaRepository;

    // Cuando el frontend pida un GET a /api/tareas, le devolvemos la lista completa
    @GetMapping
    public List<Tarea> obtenerTodas() {
        return tareaRepository.findAll();
    }

    // Cuando el frontend envíe un POST a /api/tareas, guardamos la tarea en MySQL
    @PostMapping
    public Tarea guardarTarea(@RequestBody Tarea nuevaTarea) {
        return tareaRepository.save(nuevaTarea);
    }
}