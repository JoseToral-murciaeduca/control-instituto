package com.instituto.academic_os_backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/asignaturas")
@CrossOrigin(origins = "*") // Para que no nos dé el error de CORS
public class AsignaturaController {

    @Autowired
    private AsignaturaRepository asignaturaRepository;

    @GetMapping
    public List<Asignatura> obtenerAsignaturas() {
        return asignaturaRepository.findAll();
    }

    @PostMapping
    public Asignatura crearAsignatura(@RequestBody Asignatura asignatura) {
        return asignaturaRepository.save(asignatura);
    }

    // 3. OBTENER UNA POR ID
    @GetMapping("/{id}")
    public ResponseEntity<Asignatura> obtenerAsignaturaPorId(@PathVariable Long id) {
        return asignaturaRepository.findById(id)
                .map(asig -> ResponseEntity.ok().body(asig))
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. ACTUALIZAR ASIGNATURA (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<Asignatura> actualizarAsignatura(@PathVariable Long id, @RequestBody Asignatura detalles) {
        return asignaturaRepository.findById(id)
                .map(asig -> {
                    asig.setNombre(detalles.getNombre());
                    asig.setProfesor(detalles.getProfesor());
                    asig.setProgreso(detalles.getProgreso());
                    asig.setTag1(detalles.getTag1());
                    asig.setTag2(detalles.getTag2());
                    // Guardamos la nueva imagen
                    asig.setUrlImagen(detalles.getUrlImagen());

                    return ResponseEntity.ok().body(asignaturaRepository.save(asig));
                }).orElse(ResponseEntity.notFound().build());
    }
}