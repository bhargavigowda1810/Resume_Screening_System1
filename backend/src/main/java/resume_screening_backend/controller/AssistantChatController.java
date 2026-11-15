
package resume_screening_backend.assistant;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import resume_screening_backend.dto.ChatRequest;
import resume_screening_backend.dto.ChatResponse;

@RestController
@RequestMapping("/api/assistant")
public class AssistantChatController {

    private final AssistantChatService assistantChatService;

    public AssistantChatController(
            AssistantChatService assistantChatService) {
        this.assistantChatService = assistantChatService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(
            @RequestBody ChatRequest request,
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        if (request.getMessage() == null ||
                request.getMessage().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        ChatResponse response = assistantChatService.chat(
                authentication.getName(),
                request.getMessage()
        );

        return ResponseEntity.ok(response);
    }
}
