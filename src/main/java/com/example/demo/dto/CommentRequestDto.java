package com.example.demo.dto;

import com.example.demo.entity.AuthorType;
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
public class CommentRequestDto {

    @NotNull(message = "Author ID is required.")
    private Long authorId;

    @NotNull(message = "Author type is required (USER or BOT).")
    private AuthorType authorType;

    @NotBlank(message = "Comment content cannot be blank.")
    @Size(max = 1000, message = "Comment content must not exceed 1000 characters.")
    private String content;

    private Long parentCommentId; // Optional: null for top-level, non-null for replies
}
