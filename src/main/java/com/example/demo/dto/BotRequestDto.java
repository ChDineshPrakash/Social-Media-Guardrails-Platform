package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BotRequestDto {

    @NotBlank(message = "Bot name cannot be blank.")
    @Size(min = 2, max = 50, message = "Bot name must be between 2 and 50 characters.")
    private String name;

    @NotBlank(message = "Persona description cannot be blank.")
    @Size(max = 500, message = "Persona description must not exceed 500 characters.")
    private String personaDescription;
}
