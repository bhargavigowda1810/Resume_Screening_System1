package resume_screening_backend.service;

import resume_screening_backend.entity.Education;
import org.springframework.stereotype.Service;
import resume_screening_backend.repository.EducationRepository;

import java.util.List;
import java.util.Optional;

@Service
public class EducationService {

    private final EducationRepository educationRepository;

    public EducationService(EducationRepository educationRepository) {
        this.educationRepository = educationRepository;
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
}