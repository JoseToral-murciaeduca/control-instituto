package com.instituto.academic_os_backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/apuntes")
@CrossOrigin(origins = "*")
public class ApunteController {

    @Autowired
    private ApunteRepository apunteRepository;

    @GetMapping
    public List<Apunte> obtenerApuntes() {
        return apunteRepository.findAll();
    }

    @PostMapping
    public Apunte crearApunte(@RequestBody Apunte apunte) {
        return apunteRepository.save(apunte);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarApunte(@PathVariable Long id) {
        if(apunteRepository.existsById(id)) {
            apunteRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}