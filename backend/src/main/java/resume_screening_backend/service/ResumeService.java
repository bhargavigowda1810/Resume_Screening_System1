package resume_screening_backend.service;

import resume_screening_backend.entity.Resume;
import org.springframework.stereotype.Service;
import resume_screening_backend.repository.ResumeRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;

    public ResumeService(ResumeRepository resumeRepository) {
        this.resumeRepository = resumeRepository;
    }

    public Resume saveResume(Resume resume) {
        return resumeRepository.save(resume);
    }

    public Optional<Resume> findById(Long resumeId) {
        return resumeRepository.findById(resumeId);
    }

    public List<Resume> findAllResumes() {
        return resumeRepository.findAll();
    }

    public List<Resume> findByApplicantId(Long applicantId) {
        return resumeRepository.findByApplicantId(applicantId);
    }

    public Resume updateResume(Resume resume) {
        return resumeRepository.save(resume);
    }

    public void deleteResume(Long resumeId) {
        resumeRepository.deleteById(resumeId);
    }
}