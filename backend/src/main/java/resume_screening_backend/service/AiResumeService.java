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
import resume_screening_backend.entity.ResumeProfile;

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
private final ResumeProfileService resumeProfileService;
private final SkillService skillService;
    private final ResumeSkillService resumeSkillService;
    private final ResumeEmbeddingRepository resumeEmbeddingRepository;
    private final ResumeTextSectionExtractor resumeTextSectionExtractor;

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public AiResumeService(
        ResumeService resumeService,
        EducationService educationService,
        ExperienceService experienceService,
        ResumeProfileService resumeProfileService,
        SkillService skillService,
        ResumeSkillService resumeSkillService,
        ResumeEmbeddingRepository resumeEmbeddingRepository,
        ResumeTextSectionExtractor resumeTextSectionExtractor) {

        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();

        this.resumeService = resumeService;
this.educationService = educationService;
this.experienceService = experienceService;
this.resumeProfileService = resumeProfileService;
this.skillService = skillService;
        this.resumeSkillService = resumeSkillService;
        this.resumeEmbeddingRepository = resumeEmbeddingRepository;
        this.resumeTextSectionExtractor = resumeTextSectionExtractor;
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
        System.out.println("========== AI RESUME RESPONSE ==========");
System.out.println(aiResponse);
System.out.println("========================================");



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

               System.out.println("=== RESUME EXTRACTION DEBUG ===");
System.out.println("Parsed resume: " + parsedResume.toPrettyString());
System.out.println("Extracted text: " + root.path("extractedText").asText(""));
System.out.println("Projects: " + parsedResume.path("projects"));
System.out.println("Certifications: " + parsedResume.path("certifications"));
System.out.println("Achievements: " + parsedResume.path("achievements"));
System.out.println("Education: " + parsedResume.path("education"));
System.out.println("Experience: " + parsedResume.path("experience"));
System.out.println("================================");

System.out.println("========== PARSED RESUME SECTIONS ==========");
System.out.println("PROJECTS: " + parsedResume.path("projects").toPrettyString());
System.out.println("CERTIFICATIONS: " + parsedResume.path("certifications").toPrettyString());
System.out.println("ACHIEVEMENTS: " + parsedResume.path("achievements").toPrettyString());
System.out.println("EXPERIENCE: " + parsedResume.path("experience").toPrettyString());
System.out.println("EDUCATION: " + parsedResume.path("education").toPrettyString());
System.out.println("=============================================");


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
        // SAVE EDUCATION
        // =========================================================

        JsonNode educationArray = parsedResume.path("education");

        if (!educationArray.isArray() || educationArray.isEmpty()) {
            educationArray = resumeTextSectionExtractor.extractEducation(
                    root.path("extractedText").asText("")
            );
        }

        if (educationArray.isArray()) {
            for (JsonNode educationNode : educationArray) {

                Education education = new Education();
                education.setResumeId(resumeId);

                education.setDegree(
                        getNullableText(educationNode, "degree")
                );

                education.setInstitution(
                        getNullableText(educationNode, "institution")
                );

                education.setFieldOfStudy(
                        getNullableText(educationNode, "fieldOfStudy")
                );

                if (educationNode.hasNonNull("startYear")
                        && educationNode.path("startYear").canConvertToInt()) {
                    education.setStartYear(
                            educationNode.path("startYear").asInt()
                    );
                }

                if (educationNode.hasNonNull("endYear")
                        && educationNode.path("endYear").canConvertToInt()) {
                    education.setEndYear(
                            educationNode.path("endYear").asInt()
                    );
                }

                education.setGrade(
                        getNullableText(educationNode, "grade")
                );

                // Avoid storing completely empty education entries.
                if (education.getDegree() == null
                        && education.getInstitution() == null
                        && education.getFieldOfStudy() == null) {
                    continue;
                }

                educationService.saveEducation(education);
            }
        }

        // =========================================================
        // CREATE RESUME PROFILE FROM THE UPLOADED RESUME
        // =========================================================

        ResumeProfile resumeProfile = new ResumeProfile();
        resumeProfile.setResumeId(resumeId);

       
String extractedText = root.path("extractedText").asText("");
System.out.println("=== RESUME CONTACT TEXT DEBUG ===");
System.out.println(extractedText.substring(
        0, Math.min(extractedText.length(), 1200)
));
System.out.println("=================================");

String phone = getNullableText(parsedResume, "phone");
if (phone == null) {
    phone = resumeTextSectionExtractor.extractPhone(extractedText);
}
resumeProfile.setPhone(phone);

String linkedin = getNullableText(parsedResume, "linkedin");
if (linkedin == null) {
    linkedin = resumeTextSectionExtractor.extractLinkedin(extractedText);
}
resumeProfile.setLinkedin(linkedin);

String github = getNullableText(parsedResume, "github");
if (github == null) {
    github = resumeTextSectionExtractor.extractGithub(extractedText);
}
resumeProfile.setGithub(github);

String portfolio = getNullableText(parsedResume, "portfolio");
if (portfolio == null) {
    portfolio = resumeTextSectionExtractor.extractPortfolio(extractedText);
}
resumeProfile.setPortfolio(portfolio);

        // Projects: use structured AI data first, then text fallback.

JsonNode projectsArray =
        resumeTextSectionExtractor.extractProjects(extractedText);
        System.out.println("=== JAVA PROJECT EXTRACTOR DEBUG ===");
System.out.println("Extracted projects: " + projectsArray.toPrettyString());
System.out.println("Number of projects: " + projectsArray.size());
System.out.println("====================================");

if (!projectsArray.isArray() || projectsArray.isEmpty()) {
    projectsArray = parsedResume.path("projects");
}

if (projectsArray.isArray()) {
    resumeProfile.setProjects(projectsArray);
}


if (projectsArray.isArray()) {
    resumeProfile.setProjects(projectsArray);
}

// Certifications: use structured AI data first, then text fallback.
JsonNode certificationsArray = parsedResume.path("certifications");

if (!certificationsArray.isArray() || certificationsArray.isEmpty()) {
    certificationsArray = resumeTextSectionExtractor.extractCertifications(
            root.path("extractedText").asText("")
    );
}

if (certificationsArray.isArray()) {
    resumeProfile.setCertifications(certificationsArray);
}

// Achievements: use structured AI data first, then text fallback.
JsonNode achievementsArray = parsedResume.path("achievements");

if (!achievementsArray.isArray() || achievementsArray.isEmpty()) {
    achievementsArray = resumeTextSectionExtractor.extractAchievements(
            root.path("extractedText").asText("")
    );
}

if (achievementsArray.isArray()) {
    resumeProfile.setAchievements(achievementsArray);
}
System.out.println("=== CONTACT INFO DEBUG ===");
System.out.println("AI phone: " + getNullableText(parsedResume, "phone"));
System.out.println("Final phone: " + resumeProfile.getPhone());
System.out.println("Final LinkedIn: " + resumeProfile.getLinkedin());
System.out.println("Final GitHub: " + resumeProfile.getGithub());
System.out.println("Final portfolio: " + resumeProfile.getPortfolio());
System.out.println("==========================");
        resumeProfileService.saveResumeProfile(resumeProfile);



// =========================================================
// 6. SAVE EXPERIENCE
// =========================================================

JsonNode experienceArray = parsedResume.path("experience");

// Fallback to extracted resume text if AI parsing returns no experience.
if (!experienceArray.isArray() || experienceArray.isEmpty()) {
    experienceArray = resumeTextSectionExtractor.extractExperience(
            root.path("extractedText").asText("")
    );
}

if (experienceArray.isArray()) {
    for (JsonNode experienceNode : experienceArray) {

        String company = getNullableText(experienceNode, "company");
        String jobTitle = getNullableText(experienceNode, "jobTitle");

        // Save only records with both company and job title.
        if (company == null || jobTitle == null) {
            continue;
        }

        Experience experience = new Experience();
        experience.setResumeId(resumeId);
        experience.setCompany(company);
        experience.setJobTitle(jobTitle);

        String startDate = getNullableText(experienceNode, "startDate");
        String endDate = getNullableText(experienceNode, "endDate");

        // Use dates extracted from the resume text if AI dates are missing.
        if (startDate == null) {
            startDate = getNullableText(experienceNode, "startDateText");
        }

        if (endDate == null) {
            endDate = getNullableText(experienceNode, "endDateText");
        }

        LocalDate parsedStartDate = parseExperienceDate(startDate, false);
        LocalDate parsedEndDate = parseExperienceDate(endDate, true);

        if (parsedStartDate != null) {
            experience.setStartDate(parsedStartDate);
            experience.setOriginalStartDate(parsedStartDate);
        }

        if (parsedEndDate != null) {
            experience.setEndDate(parsedEndDate);
            experience.setOriginalEndDate(parsedEndDate);
        }

        experience.setDescription(
                getNullableText(experienceNode, "description")
        );

        experienceService.saveExperience(experience);
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
    
private LocalDate parseExperienceDate(String value, boolean endDate) {
    if (value == null || value.isBlank()) {
        return null;
    }

    String normalized = value.trim();

    if (normalized.matches("\\d{4}")) {
        int year = Integer.parseInt(normalized);
        return endDate
                ? LocalDate.of(year, 12, 31)
                : LocalDate.of(year, 1, 1);
    }

    if (normalized.matches("\\d{4}-\\d{2}-\\d{2}")) {
        try {
            return LocalDate.parse(normalized);
        } catch (Exception ignored) {
            return null;
        }
    }

    if (normalized.matches("(?i)present|current")) {
        return endDate ? null : LocalDate.now();
    }

    for (java.time.format.DateTimeFormatter formatter : List.of(
            java.time.format.DateTimeFormatter.ofPattern("MMM yyyy",
                    java.util.Locale.ENGLISH),
            java.time.format.DateTimeFormatter.ofPattern("MMMM yyyy",
                    java.util.Locale.ENGLISH))) {
        try {
            java.time.YearMonth month =
                    java.time.YearMonth.parse(normalized, formatter);

            return endDate
                    ? month.atEndOfMonth()
                    : month.atDay(1);
        } catch (Exception ignored) {
            // Try the next format.
        }
    }

    return null;
}

}

