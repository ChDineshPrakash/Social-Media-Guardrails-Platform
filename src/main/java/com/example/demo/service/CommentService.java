package com.example.demo.service;

import com.example.demo.entity.Comment;
import com.example.demo.entity.AuthorType;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.BotRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

import com.example.demo.dto.CommentRequestDto;

@Service
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final BotRepository botRepository;

    public CommentService(CommentRepository commentRepository,
                          PostRepository postRepository,
                          UserRepository userRepository,
                          BotRepository botRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.botRepository = botRepository;
    }

    public Comment createComment(Long postId, CommentRequestDto dto) {
        // 1. Validate that the Post exists
        if (!postRepository.existsById(postId)) {
            throw new IllegalArgumentException("Post with ID " + postId + " does not exist.");
        }

        // 2. Validate that the Author exists depending on AuthorType
        if (dto.getAuthorType() == AuthorType.USER) {
            if (!userRepository.existsById(dto.getAuthorId())) {
                throw new IllegalArgumentException("User author with ID " + dto.getAuthorId() + " does not exist.");
            }
        } else if (dto.getAuthorType() == AuthorType.BOT) {
            if (!botRepository.existsById(dto.getAuthorId())) {
                throw new IllegalArgumentException("Bot author with ID " + dto.getAuthorId() + " does not exist.");
            }
        } else {
            throw new IllegalArgumentException("Invalid author type.");
        }

        Comment comment = new Comment();
        comment.setPostId(postId);
        comment.setAuthorId(dto.getAuthorId());
        comment.setAuthorType(dto.getAuthorType());
        comment.setContent(dto.getContent());
        comment.setParentCommentId(dto.getParentCommentId());

        // 3. Handle nesting and depth check
        if (dto.getParentCommentId() == null) {
            // Top-level comment
            comment.setDepthLevel(0);
        } else {
            // Nested reply
            Comment parent = commentRepository.findById(dto.getParentCommentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent comment with ID " + dto.getParentCommentId() + " does not exist."));

            // Check if parent comment belongs to the same post
            if (!parent.getPostId().equals(postId)) {
                throw new IllegalArgumentException("Parent comment does not belong to the same post.");
            }

            // Depth guardrail: Maximum depth is 20
            if (parent.getDepthLevel() >= 20) {
                throw new IllegalArgumentException("Maximum comment depth of 20 reached. Cannot reply further.");
            }

            comment.setDepthLevel(parent.getDepthLevel() + 1);
        }

        comment.setCreatedAt(LocalDateTime.now());
        return commentRepository.save(comment);
    }

    public List<Comment> getAllComments() {
        return commentRepository.findAll();
    }

    public List<Comment> getCommentsByPostId(Long postId) {
        return commentRepository.findByPostId(postId);
    }
}

