package resume_screening_backend.service;

import resume_screening_backend.entity.Education;
import org.springframework.stereotype.Service;
import resume_screening_backend.repository.EducationRepository;
import resume_screening_backend.repository.ResumeRepository;
import resume_screening_backend.entity.Resume;


import java.util.List;
import java.util.Optional;

@Service
public class EducationService {

    private final EducationRepository educationRepository;
private final ResumeRepository resumeRepository;

public EducationService(
        EducationRepository educationRepository,
        ResumeRepository resumeRepository) {

    this.educationRepository = educationRepository;
    this.resumeRepository = resumeRepository;
}

    public Education saveEducation(Education education) {
        return educationRepository.save(education);
    }

    public Optional<Education> findById(Long educationId) {
        return educationRepository.findById(educationId);
    }

    public List<Education> findByResumeId(Long resumeId) {
        return educationRepository.findByResumeId(resumeId);
    }

    public List<Education> findAllEducations() {
        return educationRepository.findAll();
    }

    public Education updateEducation(Education education) {
        return educationRepository.save(education);
    }

    public void deleteEducation(Long educationId) {
        educationRepository.deleteById(educationId);
    }
public boolean isOwnedByUser(Long educationId, Long userId) {

    Optional<Education> education =
            educationRepository.findById(educationId);

    if (education.isEmpty()) {
        return false;
    }

    Optional<Resume> resume =
            resumeRepository.findById(education.get().getResumeId());

    if (resume.isEmpty()) {
        return false;
    }

    return resume.get().getApplicantId().equals(userId);
}
public boolean isResumeOwnedByUser(Long resumeId, Long userId) {

    Optional<Resume> resume =
            resumeRepository.findById(resumeId);

    if (resume.isEmpty()) {
        return false;
    }

    return resume.get().getApplicantId().equals(userId);
}
}