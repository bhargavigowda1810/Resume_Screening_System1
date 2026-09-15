
package resume_screening_backend.service;

import org.springframework.stereotype.Service;

import resume_screening_backend.repository.ResumeJobMatchRepository;
import resume_screening_backend.repository.ResumeJobMatchRepository.MatchResult;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class ResumeJobMatchService {

    private final ResumeJobMatchRepository resumeJobMatchRepository;

    public ResumeJobMatchService(
            ResumeJobMatchRepository resumeJobMatchRepository) {

        this.resumeJobMatchRepository = resumeJobMatchRepository;
    }

    // =========================================================
    // Find similarity between one resume and one job
    // =========================================================

    public MatchResult findSimilarity(
            Long resumeId,
            Long jobId) {

        return resumeJobMatchRepository.findSimilarity(
                resumeId,
                jobId
        );
    }

    // =========================================================
    // Rank all resumes for a particular job
    // =========================================================

    public List<MatchResult> findRankedResumesForJob(
            Long jobId) {

        return resumeJobMatchRepository.findRankedResumesForJob(
                jobId
        );
    }

    // =========================================================
    // Calculate skill coverage
    // =========================================================

    public double calculateSkillCoverage(
            Long resumeId,
            Long jobId) {

        List<String> resumeSkills =
                resumeJobMatchRepository.findSkillNamesByResumeId(
                        resumeId
                );

        List<String> requiredSkills =
                resumeJobMatchRepository.findRequiredSkillsByJobId(
                        jobId
                );

        if (requiredSkills == null ||
                requiredSkills.isEmpty()) {

            return 1.0;
        }

        Set<String> resumeSkillSet =
                new HashSet<>();

        for (String skill : resumeSkills) {

            if (skill != null &&
                    !skill.isBlank()) {

                resumeSkillSet.add(
                        normalizeSkill(skill)
                );
            }
        }

        int matchedSkills = 0;

        for (String requiredSkill : requiredSkills) {

            if (requiredSkill == null ||
                    requiredSkill.isBlank()) {

                continue;
            }

            String normalizedRequiredSkill =
                    normalizeSkill(requiredSkill);

            if (resumeSkillSet.contains(
                    normalizedRequiredSkill)) {

                matchedSkills++;
            }
        }

        return (double) matchedSkills /
                requiredSkills.size();
    }

    // =========================================================
    // Normalize skill name
    // =========================================================

    private String normalizeSkill(String skill) {

        return skill
                .trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("\\s+", " ");
    }
}

