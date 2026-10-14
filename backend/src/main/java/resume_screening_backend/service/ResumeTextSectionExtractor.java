
package resume_screening_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class ResumeTextSectionExtractor {

    private final ObjectMapper objectMapper;

public ResumeTextSectionExtractor() {
    this.objectMapper = new ObjectMapper();
}



public ArrayNode extractProjects(String text) {
    ArrayNode result = objectMapper.createArrayNode();

    if (text == null || text.isBlank()) {
        return result;
    }

    String[] lines = text.split("\\R");

    Pattern projectHeading = Pattern.compile(
            "(?i)^(projects|academic projects|personal projects|"
            + "technical projects|selected projects)\\s*:?$"
    );

    Pattern stopHeading = Pattern.compile(
            "(?i)^(education|technical skills|skills|experience|"
            + "experience & activities|work experience|"
            + "professional experience|certifications|"
            + "certifications & participation|achievements|awards|"
            + "additional information|research publication|"
            + "research publications|publications|languages|summary|"
            + "leadership experience|relevant coursework|"
            + "professional summary|internships|positions of responsibility)\\s*:?$"
    );

    Pattern descriptionStart = Pattern.compile(
            "(?i)^(developed|built|created|implemented|designed|"
            + "trained|applied|performed|processed|integrated|"
            + "saved|analyzed|analysed|deployed|improved|"
            + "leveraged|utilized|utilised|proposed|used|"
            + "worked on|collaborated|led|managed|coordinated|"
            + "participated|contributed|engineered|automated|"
            + "achieved|reduced|increased|evaluated|conducted)\\b.*"
    );

    Pattern technologyToken = Pattern.compile(
            "(?i)(?<![a-z0-9])(python|java|javascript|typescript|"
            + "c\\+\\+|c#|pytorch|tensorflow|keras|"
            + "react(?: native)?|node\\.js|express(?:\\.js)?|"
            + "fastapi|flask|django|spring boot|"
            + "unity|unreal engine|solidity|polygon|"
            + "mongodb|mysql|postgresql|sqlite|"
            + "opencv|scikit-learn|pandas|numpy|"
            + "power bi|rapidminer|streamlit|"
            + "html|css|machine learning|deep learning|"
            + "cnn-lstm|cnn|lstm|computer vision|"
            + "rest api|blockchain|docker|aws|"
            + "git|github|mediapipe)(?![a-z0-9])"
    );

    Pattern contactOrMetadata = Pattern.compile(
            "(?i)(@|https?://|www\\.|linkedin\\.com|github\\.com|"
            + "portfolio|e-mail|email\\s*:|phone\\s*:|"
            + "^\\+?\\d[\\d\\s().-]{7,}$|"
            + "^(19|20)\\d{2}\\s*[-–?]\\s*((19|20)\\d{2}|present)$)"
    );

    ObjectNode current = null;
    StringBuilder description = new StringBuilder();
    boolean inProjectsSection = false;

    for (String raw : lines) {
        String line = raw.trim();

        if (line.isEmpty()) {
            continue;
        }

        String clean = line
                .replaceFirst("^[•*\\-?]+\\s*", "")
                .replaceAll("\\s+", " ")
                .trim();

        if (clean.isEmpty()) {
            continue;
        }

        if (projectHeading.matcher(clean).matches()) {
            inProjectsSection = true;
            continue;
        }

        if (stopHeading.matcher(clean).matches()) {
            inProjectsSection = false;
            continue;
        }

        // Ignore contact details, dates and other metadata.
        if (contactOrMetadata.matcher(clean).find()) {
            continue;
        }

        if (!inProjectsSection) {
            continue;
        }

        // Normalize separators commonly corrupted during PDF extraction.
      String normalized = clean
        .replace('\u2013', ',')
        .replace('\u2014', ',')
        .replace('\u2212', ',')
        .replace('\uFFFD', ',')
        .replace('|', ',')
        .replaceAll("\\s+", " ")
        .trim();

String stackCandidate = normalized
        .replaceAll("\\s*,\\s*", ",")
        .trim();

// Detect technology stacks even when PDF separators are corrupted.

        // Count technology terms in the normalized line.
        Matcher techMatcher = technologyToken.matcher(normalized);
        int technologyCount = 0;

        while (techMatcher.find()) {
            technologyCount++;
        }

        boolean isDescription =
                descriptionStart.matcher(clean).matches()
                || line.matches("^[•*\\-].*");

        if (isDescription) {
            if (current != null) {
                if (description.length() > 0) {
                    description.append(" ");
                }
                description.append(clean);
            }
            continue;
        }

        // A technology stack generally contains multiple technologies
        // separated by delimiters and does not read like a sentence.
boolean isTechnologyStack =
        technologyCount >= 2
        && normalized.matches(
                "(?i)^[a-z0-9 .,#/+_()\\-]+$"
        )
        && !normalized.matches(".*[.!]$");
        if (isTechnologyStack) {
            if (current != null) {
                current.set(
                        "technologies",
                        splitTechnologies(normalized)
                );
            }
            continue;
        }

        // Ignore long descriptive or summary statements.
        if (clean.length() > 140
                || clean.matches(".*[.!]$")
                || clean.matches(
                        "(?i)^(strong interest|experienced in|"
                        + "undergraduate|proficient in|"
                        + "responsible for|worked as|"
                        + "currently pursuing|seeking).*"
                )) {
            if (current != null && description.length() > 0) {
                description.append(" ").append(clean);
            }
            continue;
        }

        // A new project heading starts the next project.
        if (looksLikeProjectHeading(clean)) {
            if (current != null) {
                current.put(
                        "description",
                        description.toString().trim()
                );
            }

            current = objectMapper.createObjectNode();
            current.put("title", clean);
            current.put("description", "");
            current.put("year", "");
            current.set(
                    "technologies",
                    objectMapper.createArrayNode()
            );

            result.add(current);
            description.setLength(0);
        }

    }

    if (current != null) {
        current.put("description", description.toString().trim());
    }

    // Remove duplicate project titles while preserving order.
    ArrayNode uniqueResults = objectMapper.createArrayNode();
    java.util.Set<String> seenTitles = new java.util.LinkedHashSet<>();

    for (JsonNode project : result) {
        String title = project.path("title").asText("").trim();
        String key = title.toLowerCase(java.util.Locale.ROOT);

        if (!key.isEmpty() && seenTitles.add(key)) {
            uniqueResults.add(project);
        }
    }

    return uniqueResults;
}

    
public ArrayNode extractCertifications(String text) {
    ArrayNode result = objectMapper.createArrayNode();

    String section = extractSection(
            text,
            "Certifications(?:\\s*&\\s*Participation)?|"
                    + "Certificates|Professional Certifications|"
                    + "Licenses & Certifications",
            "Achievements|Awards|Projects|Education|"
                    + "Experience|Experience & Activities|"
                    + "Work Experience|Professional Experience|"
                    + "Leadership Experience|Relevant Coursework|"
                    + "Technical Skills|Skills|Research Publication|"
                    + "Publications"
    );

  

    if (section == null || section.isBlank()) {
        return result;
    }

    for (String raw : section.split("\\R")) {
        String line = raw.trim()
                .replaceFirst("^[•*\\-?]+\\s*", "")
                .trim();

        if (line.isEmpty()) {
            continue;
        }

        // Participation statements belong in achievements, not certifications.
        if (line.matches("(?i)^(participated|attended|volunteered|"
                + "contributed to|developed|built|created)\\b.*")) {
            continue;
        }

        // Ignore descriptive text that isn't a certification entry.
        if (!line.matches("(?i).*(certification|certificate|"
                + "NPTEL|Infosys Springboard|Microsoft|AWS|"
                + "Google|Cisco|Oracle|Coursera|Udemy|"
                + "LinkedIn Learning|Java|Power BI).*")) {
            continue;
        }

        ObjectNode item = objectMapper.createObjectNode();
        item.put("name", line);
        item.put("issuingOrganization", "");
        item.put("issueDate", "");
        item.put("expiryDate", "");
        item.put("credentialId", "");
        item.put("credentialUrl", "");
        result.add(item);
    }

    return result;
}


    public ArrayNode extractAchievements(String text) {
        ArrayNode result = objectMapper.createArrayNode();

        String section = extractSection(
                text, "Achievements|Awards",
                "Projects|Education|Experience|Certifications|"
                + "Leadership Experience|Relevant Coursework|"
                + "Technical Skills|Skills"
        );

        if (section == null) return result;

        for (String raw : section.split("\\R")) {
            String line = raw.trim()
                    .replaceFirst("^[•\\-*?]+\\s*", "")
                    .trim();

            if (line.isEmpty()) continue;

            ObjectNode item = objectMapper.createObjectNode();
            item.put("title", line);
            item.put("description", "");
            item.put("date", "");
            item.put("issuer", "");
            result.add(item);
        }

        return result;
    }

    private String extractSection(
            String text, String heading, String stopHeadings) {

        if (text == null || text.isBlank()) return null;

        Pattern start = Pattern.compile(
                "(?im)^\\s*(?:" + heading + ")\\s*:?\\s*$"
        );

        Matcher matcher = start.matcher(text);
        if (!matcher.find()) return null;

        int startIndex = matcher.end();
        Pattern stop = Pattern.compile(
                "(?im)^\\s*(?:" + stopHeadings + ")\\s*:?\\s*$"
        );

        Matcher end = stop.matcher(text);
        if (!end.find(startIndex)) return text.substring(startIndex).trim();

        return text.substring(startIndex, end.start()).trim();
    }


private boolean looksLikeProjectHeading(String line) {
    if (line == null || line.isBlank()) {
        return false;
    }

    String normalized = line
            .replaceAll("\\s+", " ")
            .trim();


    if (normalized.length() < 3 || normalized.length() > 120) {
        return false;
    }

    // Reject known resume section headings.
    if (normalized.matches(
            "(?i)^(education|projects|academic projects|personal projects|"
            + "technical projects|selected projects|experience|"
            + "work experience|professional experience|"
            + "experience & activities|certifications|"
            + "certifications & participation|achievements|awards|"
            + "skills|technical skills|additional information|"
            + "leadership experience|relevant coursework|"
            + "professional summary|summary|research publication|"
            + "publications|languages)$")) {
        return false;
    }

    // Reject sentences that look like descriptions rather than titles.
    if (normalized.matches(
            "(?i)^(developed|built|implemented|applied|integrated|"
            + "designed|created|led|managed|coordinated|used|worked on|"
            + "trained|performed|processed|saved|analyzed|analysed|"
            + "deployed|improved|leveraged|utilized|utilised|"
            + "participated|attended|contributed)\\b.*")) {
        return false;
    }

    // Reject date-only lines and common contact information.
    if (normalized.matches(
            "(?i)^(\\d{4}([\\s?\\-–]+\\d{4})?|"
            + "present|current|email|phone|linkedin|github|"
            + "portfolio|website)\\b.*")) {
        return false;
    }

    // Do not reject titles just because they mention a technology.
    return true;
}



    private ArrayNode splitTechnologies(String raw) {
        ArrayNode result = objectMapper.createArrayNode();

        for (String item : raw.split(",")) {
            String value = item.trim();
            if (!value.isEmpty() && !result.toString().contains(
                    "\"" + value.replace("\"", "\\\"") + "\"")) {
                result.add(value);
            }
        }

        return result;
    }
    

public String extractPhone(String text) {
    if (text == null || text.isBlank()) {
        return null;
    }

    Matcher matcher = Pattern.compile(
            "(?<!\\d)(?:\\+\\d{1,3}[\\s().-]?)?"
            + "(?:\\d[\\s().-]?){8,13}\\d(?!\\d)"
    ).matcher(text);

    if (matcher.find()) {
        return matcher.group().trim();
    }

    return null;
}

public String extractLinkedin(String text) {
    return extractContactUrl(
            text,
            "(?i)(?:https?://)?(?:www\\.)?linkedin\\.com/[^\\s|,<>]+"
    );
}

public String extractGithub(String text) {
    return extractContactUrl(
            text,
            "(?i)(?:https?://)?(?:www\\.)?github\\.com/[^\\s|,<>]+"
    );
}

public String extractPortfolio(String text) {
    if (text == null || text.isBlank()) {
        return null;
    }

    Matcher matcher = Pattern.compile(
            "(?i)\\b(?:portfolio|website)\\s*:?\\s*"
            + "((?:https?://|www\\.)[^\\s|,<>]+)"
    ).matcher(text);

    if (matcher.find()) {
        return cleanContactUrl(matcher.group(1));
    }

    return null;
}


private String cleanContactUrl(String value) {
    if (value == null) {
        return null;
    }

    return value.trim().replaceAll("[.)\\]}]+$", "");
}

private String extractContactUrl(String text, String regex) {
    if (text == null) return null;

    Matcher matcher = Pattern.compile(
            regex, Pattern.CASE_INSENSITIVE
    ).matcher(text);

    if (!matcher.find()) return null;

    String url = matcher.group().trim();

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
    }

    return url.replaceAll("[.)]+$", "");
}

public ArrayNode extractEducation(String text) {
    ArrayNode result = objectMapper.createArrayNode();

    String section = extractSection(
            text,
            "Education|Academic Background|Educational Background|"
                    + "Academic Qualifications|Qualifications",
            "Technical Skills|Skills|Projects|Experience|"
                    + "Work Experience|Professional Experience|"
                    + "Leadership Experience|Certifications|"
                    + "Achievements|Awards|Relevant Coursework"
    );

    if (section == null) return result;

    String[] lines = section.split("\\R");
    ObjectNode current = null;

    Pattern yearRange = Pattern.compile(
            "(?i)\\b(19\\d{2}|20\\d{2})\\s*[-–—?to]+\\s*"
                    + "(Present|Current|19\\d{2}|20\\d{2})\\b"
    );

    for (String raw : lines) {
        String line = raw.trim();
        if (line.isEmpty()) continue;

        Matcher years = yearRange.matcher(line);

        if (years.find()) {
            if (current == null) {
                current = objectMapper.createObjectNode();
                result.add(current);
            }

            int start = Integer.parseInt(years.group(1));
            String endText = years.group(2);

            current.put("startYear", start);

            if (endText.matches("\\d{4}")) {
                current.put("endYear", Integer.parseInt(endText));
            }

            line = line.replace(years.group(), "").trim();
        }

        Matcher grade = Pattern.compile(
                "(?i)\\b(?:CGPA|GPA|Grade|Percentage|Score)"
                        + "\\s*:?\\s*([0-9]+(?:\\.[0-9]+)?"
                        + "\\s*(?:/\\s*[0-9]+|%)?)"
        ).matcher(line);

        if (grade.find()) {
            if (current == null) {
                current = objectMapper.createObjectNode();
                result.add(current);
            }

            current.put("grade", grade.group(1).trim());
            line = line.replace(grade.group(), "").trim();
        }

        if (line.isEmpty()) continue;

        if (current == null) {
            current = objectMapper.createObjectNode();
            result.add(current);
        }

        if (line.matches(
                "(?i).*(university|college|institute|school|"
                        + "academy|polytechnic).*")) {
            if (!current.has("institution")) {
                current.put("institution", line);
            }
        } else if (line.matches(
                "(?i).*(bachelor|master|phd|doctorate|diploma|"
                        + "degree|b\\.?tech|m\\.?tech|b\\.?e\\.?|"
                        + "m\\.?e\\.?|bca|mca|bsc|msc|mba|"
                        + "high school|secondary).*")) {
            if (!current.has("degree")) {
                current.put("degree", line);
            } else if (!current.has("fieldOfStudy")) {
                current.put("fieldOfStudy", line);
            }
        } else if (!current.has("fieldOfStudy")) {
            current.put("fieldOfStudy", line);
        }
    }

    return result;
}



public ArrayNode extractExperience(String text) {
    ArrayNode result = objectMapper.createArrayNode();

    String section = extractSection(
            text,
            "Experience(?:\\s*&\\s*Activities)?|"
                    + "Work Experience|Professional Experience|"
                    + "Employment History|Work History|"
                    + "Leadership Experience|Internships|"
                    + "Career History",
            "Education|Academic Background|Educational Background|"
                    + "Technical Skills|Skills|Projects|"
                    + "Certifications|Certifications & Participation|"
                    + "Achievements|Awards|Relevant Coursework|"
                    + "Research Publication|Publications"
    );

    if (section == null || section.isBlank()) {
        return result;
    }

    String[] lines = section.split("\\R");

    ObjectNode current = null;
    String pendingOrganization = null;
    String pendingTitle = null;
    StringBuilder description = new StringBuilder();

    Pattern datePattern = Pattern.compile(
            "(?i)\\b((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|"
                    + "Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|"
                    + "Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|"
                    + "Nov(?:ember)?|Dec(?:ember)?\\s+)?"
                    + "(?:19|20)\\d{2})\\s*[-–—?]\\s*"
                    + "(Present|Current|(?:Jan(?:uary)?|Feb(?:ruary)?|"
                    + "Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|"
                    + "Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|"
                    + "Oct(?:ober)?|Nov(?:ember)?\\s+)?"
                    + "(?:19|20)\\d{2}|Present|Current)\\b"
    );

    Pattern bulletPattern = Pattern.compile("^[•*\\-?]\\s*.*");

    for (String raw : lines) {
        String line = raw.trim();

        if (line.isEmpty()) {
            continue;
        }

        boolean bullet = bulletPattern.matcher(line).matches();
        String clean = line.replaceFirst("^[•*\\-?]+\\s*", "").trim();

        if (clean.isEmpty()) {
            continue;
        }

        Matcher dateMatcher = datePattern.matcher(clean);

        if (dateMatcher.find()) {
            if (current != null) {
                current.put("description", description.toString().trim());
            }

            current = objectMapper.createObjectNode();
            result.add(current);
            description.setLength(0);

            current.put("startDateText", dateMatcher.group(1));
            current.put("endDateText", dateMatcher.group(2));

            String remaining = clean.replace(dateMatcher.group(), "").trim();

            if (!remaining.isEmpty()) {
                current.put("jobTitle", remaining);
            } else if (pendingOrganization != null) {
                current.put("company", pendingOrganization);
                pendingOrganization = null;
            }

            if (pendingTitle != null && !current.has("jobTitle")) {
                current.put("jobTitle", pendingTitle);
                pendingTitle = null;
            }

            continue;
        }

        if (bullet) {
            if (current != null) {
                if (description.length() > 0) {
                    description.append(" ");
                }
                description.append(clean);
            }
            continue;
        }

        // A new organization commonly appears after the previous role's
        // description. Preserve the previous record before starting another.
        if (current != null && description.length() > 0) {
            current.put("description", description.toString().trim());
            current = null;
            description.setLength(0);
            pendingOrganization = clean;
            continue;
        }

        if (pendingOrganization == null) {
            pendingOrganization = clean;
        } else if (pendingTitle == null) {
            pendingTitle = clean;
            current = objectMapper.createObjectNode();
            current.put("company", pendingOrganization);
            current.put("jobTitle", pendingTitle);
            result.add(current);
            pendingOrganization = null;
            pendingTitle = null;
        } else if (current != null) {
            if (description.length() > 0) {
                description.append(" ");
            }
            description.append(clean);
        }
    }

    if (current != null) {
        current.put("description", description.toString().trim());
    }

    return result;
}


}
