package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostRequestDto {

    @NotNull(message = "Author ID is required.")
    private Long authorId;

    @NotBlank(message = "Post content cannot be blank.")
    @Size(max = 1000, message = "Post content must not exceed 1000 characters.")
    private String content;
}
