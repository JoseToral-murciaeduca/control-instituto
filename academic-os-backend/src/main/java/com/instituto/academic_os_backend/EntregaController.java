package com.instituto.academic_os_backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/entregas")
@CrossOrigin(origins = "*")
public class EntregaController {

    @Autowired
    private EntregaRepository entregaRepository;

    @GetMapping
    public List<Entrega> obtenerEntregas() {
        return entregaRepository.findAll();
    }

    @PostMapping
    public Entrega crearEntrega(@RequestBody Entrega entrega) {
        return entregaRepository.save(entrega);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEntrega(@PathVariable Long id) {
        if(entregaRepository.existsById(id)) {
            entregaRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}