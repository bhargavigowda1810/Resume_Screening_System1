package resume_screening_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import resume_screening_backend.entity.Education;
import resume_screening_backend.entity.Experience;
import resume_screening_backend.entity.Resume;
import resume_screening_backend.entity.ResumeEmbedding;
import resume_screening_backend.entity.Skill;
import resume_screening_backend.repository.ResumeEmbeddingRepository;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AiResumeService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private final ResumeService resumeService;
    private final EducationService educationService;
    private final ExperienceService experienceService;
    private final SkillService skillService;
    private final ResumeSkillService resumeSkillService;
    private final ResumeEmbeddingRepository resumeEmbeddingRepository;

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public AiResumeService(
            ResumeService resumeService,
            EducationService educationService,
            ExperienceService experienceService,
            SkillService skillService,
            ResumeSkillService resumeSkillService,
            ResumeEmbeddingRepository resumeEmbeddingRepository) {

        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();

        this.resumeService = resumeService;
        this.educationService = educationService;
        this.experienceService = experienceService;
        this.skillService = skillService;
        this.resumeSkillService = resumeSkillService;
        this.resumeEmbeddingRepository = resumeEmbeddingRepository;
    }

    @Transactional
    public String parseAndSaveResume(
            MultipartFile file,
            Long applicantId) throws Exception {

        // =========================================================
        // 1. SEND RESUME TO FASTAPI AI SERVICE
        // =========================================================

        String url = aiServiceUrl + "/parse-resume";

        ByteArrayResource fileResource =
                new ByteArrayResource(file.getBytes()) {

                    @Override
                    public String getFilename() {
                        return file.getOriginalFilename();
                    }
                };

        MultiValueMap<String, Object> body =
                new LinkedMultiValueMap<>();

        body.add("file", fileResource);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, Object>> request =
                new HttpEntity<>(body, headers);

        ResponseEntity<String> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.POST,
                        request,
                        String.class
                );

        if (!response.getStatusCode().is2xxSuccessful()) {

            throw new RuntimeException(
                    "AI service returned status: "
                            + response.getStatusCode()
            );
        }

        String aiResponse = response.getBody();

        if (aiResponse == null ||
                aiResponse.isBlank()) {

            throw new RuntimeException(
                    "AI service returned an empty response."
            );
        }

        // =========================================================
        // 2. PARSE AI RESPONSE
        // =========================================================

        JsonNode root =
                objectMapper.readTree(aiResponse);

        JsonNode parsedResume =
                root.path("parsedResume");

        if (parsedResume.isMissingNode() ||
                parsedResume.isNull()) {

            throw new RuntimeException(
                    "AI service response does not contain parsedResume."
            );
        }

        // =========================================================
        // 3. CREATE RESUME ENTITY
        // =========================================================

        Resume resume = new Resume();

        resume.setApplicantId(applicantId);

        resume.setFileName(
                root.path("fileName")
                        .asText(file.getOriginalFilename())
        );

        resume.setFileType(
                root.path("fileType")
                        .asText(file.getContentType())
        );

        resume.setExtractedText(
                root.path("extractedText")
                        .asText(null)
        );

        // =========================================================
        // 4. SAVE RESUME FILE LOCALLY
        // =========================================================

        String originalFilename =
                file.getOriginalFilename();

        if (originalFilename == null ||
                originalFilename.isBlank()) {

            originalFilename = "resume";
        }

        String safeFilename =
                Paths.get(originalFilename)
                        .getFileName()
                        .toString();

        Path uploadDirectory =
                Paths.get("uploads");

        Files.createDirectories(uploadDirectory);

        Path filePath =
                uploadDirectory.resolve(safeFilename);

        Files.write(
                filePath,
                file.getBytes()
        );

        resume.setFilePath(
                filePath.toAbsolutePath().toString()
        );

        resume.setUploadedAt(
                LocalDateTime.now()
        );

        Resume savedResume =
                resumeService.saveResume(resume);

        Long resumeId =
                savedResume.getResumeId();

        // =========================================================
        // 5. SAVE EDUCATION
        // =========================================================

        JsonNode educationArray =
                parsedResume.path("education");

        if (educationArray.isArray()) {

            for (JsonNode educationNode :
                    educationArray) {

                Education education =
                        new Education();

                education.setResumeId(resumeId);

                education.setDegree(
                        getNullableText(
                                educationNode,
                                "degree"
                        )
                );

                education.setInstitution(
                        getNullableText(
                                educationNode,
                                "institution"
                        )
                );

                education.setFieldOfStudy(
                        getNullableText(
                                educationNode,
                                "fieldOfStudy"
                        )
                );

                if (educationNode.has("startYear") &&
                        !educationNode.get("startYear").isNull()) {

                    education.setStartYear(
                            educationNode
                                    .get("startYear")
                                    .asInt()
                    );
                }

                if (educationNode.has("endYear") &&
                        !educationNode.get("endYear").isNull()) {

                    education.setEndYear(
                            educationNode
                                    .get("endYear")
                                    .asInt()
                    );
                }

                education.setGrade(
                        getNullableText(
                                educationNode,
                                "grade"
                        )
                );

                educationService.saveEducation(
                        education
                );
            }
        }

        // =========================================================
        // 6. SAVE EXPERIENCE
        // =========================================================

        JsonNode experienceArray =
                parsedResume.path("experience");

        if (experienceArray.isArray()) {

            for (JsonNode experienceNode :
                    experienceArray) {

                Experience experience =
                        new Experience();

                experience.setResumeId(resumeId);

                experience.setCompany(
                        getNullableText(
                                experienceNode,
                                "company"
                        )
                );

                experience.setJobTitle(
                        getNullableText(
                                experienceNode,
                                "jobTitle"
                        )
                );

                String startDate =
                        getNullableText(
                                experienceNode,
                                "startDate"
                        );

                String endDate =
                        getNullableText(
                                experienceNode,
                                "endDate"
                        );

                if (isValidIsoDate(startDate)) {

                    experience.setStartDate(
                            LocalDate.parse(startDate)
                    );
                }

                if (isValidIsoDate(endDate)) {

                    experience.setEndDate(
                            LocalDate.parse(endDate)
                    );
                }

                experience.setDescription(
                        getNullableText(
                                experienceNode,
                                "description"
                        )
                );

                experienceService.saveExperience(
                        experience
                );
            }
        }

        // =========================================================
        // 7. SAVE SKILLS
        // =========================================================

        JsonNode skillsArray =
                parsedResume.path("skills");

        List<String> savedSkills =
                new ArrayList<>();

        if (skillsArray.isArray()) {

            for (JsonNode skillNode :
                    skillsArray) {

                String skillName =
                        skillNode.asText(null);

                if (skillName == null ||
                        skillName.isBlank()) {

                    continue;
                }

                skillName =
                        skillName.trim();

                Skill skill =
                        skillService.getOrCreateSkill(
                                skillName
                        );

                Long skillId =
                        skill.getSkillId();

                if (!resumeSkillService.exists(
                        resumeId,
                        skillId
                )) {

                    resumeSkillService.addSkillToResume(
                            resumeId,
                            skillId
                    );
                }

                savedSkills.add(skillName);
            }
        }

        // =========================================================
        // 8. SAVE RESUME EMBEDDING
        // =========================================================

        JsonNode embeddingArray =
                root.path("embedding");

        if (!embeddingArray.isArray()) {

            throw new RuntimeException(
                    "AI service response does not contain a valid embedding."
            );
        }

        // ---------------------------------------------------------
        // Validate embedding dimension
        // ---------------------------------------------------------

        if (embeddingArray.size() != 384) {

            throw new RuntimeException(
                    "Invalid embedding size. Expected 384 but received "
                            + embeddingArray.size()
            );
        }

        // ---------------------------------------------------------
        // Convert JSON array -> float[]
        // ---------------------------------------------------------

        float[] embedding =
                new float[embeddingArray.size()];

        for (int i = 0;
             i < embeddingArray.size();
             i++) {

            JsonNode value =
                    embeddingArray.get(i);

            if (!value.isNumber()) {

                throw new RuntimeException(
                        "Invalid embedding value at index "
                                + i
                );
            }

            embedding[i] =
                    (float) value.asDouble();
        }

        // ---------------------------------------------------------
        // Create ResumeEmbedding entity
        // ---------------------------------------------------------

        ResumeEmbedding resumeEmbedding =
                new ResumeEmbedding();

        resumeEmbedding.setResumeId(
                resumeId
        );

        resumeEmbedding.setEmbedding(
                embedding
        );

        resumeEmbedding.setCreatedAt(
                LocalDateTime.now()
        );

        // ---------------------------------------------------------
        // Save embedding
        // ---------------------------------------------------------

        resumeEmbeddingRepository.save(
                resumeEmbedding
        );

        // =========================================================
        // 9. RETURN SUCCESS RESPONSE
        // =========================================================

        return """
                {
                    "message": "Resume parsed and saved successfully",
                    "resumeId": %d,
                    "applicantId": %d,
                    "fileName": "%s",
                    "skillsSaved": %d,
                    "embeddingSize": %d
                }
                """.formatted(
                resumeId,
                applicantId,
                escapeJson(safeFilename),
                savedSkills.size(),
                embedding.length
        );
    }

    // =============================================================
    // HELPER: GET NULLABLE JSON TEXT
    // =============================================================

    private String getNullableText(
            JsonNode node,
            String fieldName) {

        JsonNode value =
                node.get(fieldName);

        if (value == null ||
                value.isNull()) {

            return null;
        }

        String text =
                value.asText();

        if (text == null ||
                text.isBlank()) {

            return null;
        }

        return text.trim();
    }

    // =============================================================
    // HELPER: VALIDATE ISO DATE
    // =============================================================

    private boolean isValidIsoDate(
            String date) {

        if (date == null ||
                date.isBlank()) {

            return false;
        }

        try {

            LocalDate.parse(date);

            return true;

        } catch (Exception e) {

            return false;
        }
    }

    // =============================================================
    // HELPER: ESCAPE JSON STRING
    // =============================================================

    private String escapeJson(
            String value) {

        if (value == null) {
            return "";
        }

        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"");
    }
}

