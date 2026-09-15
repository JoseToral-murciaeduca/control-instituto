package com.instituto.academic_os_backend;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "apuntes")
public class Apunte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String asignatura;
    private LocalDate fecha;
    private String color; // El color del puntito (blue, red, yellow, green, gray)

    public Apunte() {}

    // --- GETTERS Y SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getAsignatura() { return asignatura; }
    public void setAsignatura(String asignatura) { this.asignatura = asignatura; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}