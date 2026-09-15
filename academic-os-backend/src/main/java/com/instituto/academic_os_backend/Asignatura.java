package com.instituto.academic_os_backend;

import jakarta.persistence.*;

@Entity
@Table(name = "asignaturas")
public class Asignatura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String profesor;
    private int progreso; // De 0 a 100
    private String tag1;
    private String tag2;
    private String urlImagen; // Campo para modificar la portada

    public Asignatura() {}

    // --- GETTERS Y SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getProfesor() { return profesor; }
    public void setProfesor(String profesor) { this.profesor = profesor; }

    public int getProgreso() { return progreso; }
    public void setProgreso(int progreso) { this.progreso = progreso; }

    public String getTag1() { return tag1; }
    public void setTag1(String tag1) { this.tag1 = tag1; }

    public String getTag2() { return tag2; }
    public void setTag2(String tag2) { this.tag2 = tag2; }

    public String getUrlImagen() { return urlImagen; }
    public void setUrlImagen(String urlImagen) { this.urlImagen = urlImagen; }
}