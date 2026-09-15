package com.instituto.academic_os_backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity; // <-- Importación arreglada
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tareas")
@CrossOrigin(origins = "*")
public class TareaController {

    @Autowired
    private TareaRepository tareaRepository;

    // --- 1. OBTENER TODAS LAS TAREAS (GET) ---
    @GetMapping
    public List<Tarea> obtenerTodasLasTareas() {
        return tareaRepository.findAll();
    }

    // --- 2. CREAR UNA TAREA (POST) ---
    @PostMapping
    public Tarea crearTarea(@RequestBody Tarea tarea) {
        return tareaRepository.save(tarea);
    }

    // --- 3. OBTENER UNA TAREA POR ID (GET) ---
    @GetMapping("/{id}")
    public ResponseEntity<Tarea> obtenerTareaPorId(@PathVariable Long id) {
        return tareaRepository.findById(id)
                .map(tarea -> ResponseEntity.ok().body(tarea))
                .orElse(ResponseEntity.notFound().build());
    }

    // --- 4. ACTUALIZAR UNA TAREA (PUT) ---
    @PutMapping("/{id}")
    public ResponseEntity<Tarea> actualizarTarea(@PathVariable Long id, @RequestBody Tarea detallesTarea) {
        return tareaRepository.findById(id)
                .map(tarea -> {
                    tarea.setEstado(detallesTarea.getEstado());
                    // Puedes añadir aquí otras cosas a actualizar en el futuro (título, fecha, etc.)
                    Tarea tareaActualizada = tareaRepository.save(tarea);
                    return ResponseEntity.ok().body(tareaActualizada);
                }).orElse(ResponseEntity.notFound().build());
    }

    // --- 5. ELIMINAR UNA TAREA (DELETE) ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarTarea(@PathVariable Long id) {
        return tareaRepository.findById(id)
                .map(tarea -> {
                    tareaRepository.delete(tarea);
                    return ResponseEntity.ok().<Void>build();
                }).orElse(ResponseEntity.notFound().build());
    }
}