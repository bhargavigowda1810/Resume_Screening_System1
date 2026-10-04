package resume_screening_backend.service;

import com.fasterxml.jackson.databind.JsonNode;

import org.springframework.stereotype.Service;

import resume_screening_backend.dto.ApplicantProfileResponse;
import resume_screening_backend.entity.Education;
import resume_screening_backend.entity.Experience;
import resume_screening_backend.entity.Resume;
import resume_screening_backend.entity.ResumeProfile;
import resume_screening_backend.entity.ResumeSkill;
import resume_screening_backend.entity.Skill;
import resume_screening_backend.entity.User;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ApplicantProfileService {

    private final UserService userService;
    private final ResumeService resumeService;
    private final EducationService educationService;
    private final ExperienceService experienceService;
    private final ResumeSkillService resumeSkillService;
    private final SkillService skillService;
    private final ResumeProfileService resumeProfileService;

    public ApplicantProfileService(
            UserService userService,
            ResumeService resumeService,
            EducationService educationService,
            ExperienceService experienceService,
            ResumeSkillService resumeSkillService,
            SkillService skillService,
            ResumeProfileService resumeProfileService) {

        this.userService = userService;
        this.resumeService = resumeService;
        this.educationService = educationService;
        this.experienceService = experienceService;
        this.resumeSkillService = resumeSkillService;
        this.skillService = skillService;
        this.resumeProfileService = resumeProfileService;
    }

    public Optional<ApplicantProfileResponse> getApplicantProfile(
            String email) {

        Optional<User> optionalUser = userService.findByEmail(email);

        if (optionalUser.isEmpty()) {
            return Optional.empty();
        }

        User user = optionalUser.get();

        List<Resume> resumes =
                resumeService.findByApplicantId(user.getUserId());

        if (resumes.isEmpty()) {

            ApplicantProfileResponse response =
                    new ApplicantProfileResponse();

            response.setUserId(user.getUserId());
            response.setName(user.getName());
            response.setEmail(user.getEmail());
            response.setRole(user.getRole());

            response.setEducation(new ArrayList<>());
            response.setExperience(new ArrayList<>());
            response.setSkills(new ArrayList<>());

            response.setProjects(emptyArray());
            response.setCertifications(emptyArray());
            response.setAchievements(emptyArray());

            return Optional.of(response);
        }

        // Use the latest uploaded resume
        Resume resume = resumes.get(resumes.size() - 1);

        ApplicantProfileResponse response =
                new ApplicantProfileResponse();

        // Account information
        response.setUserId(user.getUserId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());

        // Resume information
        response.setResumeId(resume.getResumeId());
        response.setFileName(resume.getFileName());
        response.setFileType(resume.getFileType());
        response.setUploadedAt(resume.getUploadedAt());

        // Education
        List<Education> educationList =
                educationService.findByResumeId(
                        resume.getResumeId());

        List<ApplicantProfileResponse.EducationResponse>
                educationResponseList = new ArrayList<>();

        for (Education education : educationList) {

            ApplicantProfileResponse.EducationResponse
                    educationResponse =
                    new ApplicantProfileResponse.EducationResponse();

            educationResponse.setEducationId(
                    education.getEducationId());

            educationResponse.setDegree(
                    education.getDegree());

            educationResponse.setInstitution(
                    education.getInstitution());

            educationResponse.setFieldOfStudy(
                    education.getFieldOfStudy());

            educationResponse.setStartYear(
                    education.getStartYear());

            educationResponse.setEndYear(
                    education.getEndYear());

            educationResponse.setGrade(
                    education.getGrade());

            educationResponseList.add(educationResponse);
        }

        response.setEducation(educationResponseList);

        // Experience
        List<Experience> experienceList =
                experienceService.findByResumeId(
                        resume.getResumeId());

        List<ApplicantProfileResponse.ExperienceResponse>
                experienceResponseList = new ArrayList<>();

        for (Experience experience : experienceList) {

            ApplicantProfileResponse.ExperienceResponse
                    experienceResponse =
                    new ApplicantProfileResponse.ExperienceResponse();

            experienceResponse.setExperienceId(
                    experience.getExperienceId());

            experienceResponse.setCompany(
                    experience.getCompany());

            experienceResponse.setJobTitle(
                    experience.getJobTitle());

            experienceResponse.setStartDate(
                    experience.getStartDate() != null
                            ? experience.getStartDate().toString()
                            : null);

            experienceResponse.setEndDate(
                    experience.getEndDate() != null
                            ? experience.getEndDate().toString()
                            : null);

            experienceResponse.setDescription(
                    experience.getDescription());

            experienceResponseList.add(experienceResponse);
        }

        response.setExperience(experienceResponseList);

        // Skills
        List<ResumeSkill> resumeSkills =
                resumeSkillService.findSkillsByResumeId(
                        resume.getResumeId());

        List<String> skillNames = new ArrayList<>();

        for (ResumeSkill resumeSkill : resumeSkills) {

            if (resumeSkill.getId() == null) {
                continue;
            }

            Long skillId =
                    resumeSkill.getId().getSkillId();

            Optional<Skill> optionalSkill =
                    skillService.findById(skillId);

            optionalSkill.ifPresent(
                    skill -> skillNames.add(
                            skill.getSkillName()));
        }

        response.setSkills(skillNames);

        // Additional Resume Profile information
        Optional<ResumeProfile> optionalProfile =
                resumeProfileService.findByResumeId(
                        resume.getResumeId());

        if (optionalProfile.isPresent()) {

            ResumeProfile profile = optionalProfile.get();

            response.setPhone(profile.getPhone());
            response.setLinkedin(profile.getLinkedin());
            response.setGithub(profile.getGithub());
            response.setPortfolio(profile.getPortfolio());

            response.setProjects(profile.getProjects());
            response.setCertifications(profile.getCertifications());
            response.setAchievements(profile.getAchievements());

        } else {

            response.setProjects(emptyArray());
            response.setCertifications(emptyArray());
            response.setAchievements(emptyArray());
        }

        return Optional.of(response);
    }

    private JsonNode emptyArray() {

        return new com.fasterxml.jackson.databind.ObjectMapper()
                .createArrayNode();
    }
}