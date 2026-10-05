package resume_screening_backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "recruiter_profiles")
public class RecruiterProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recruiter_profile_id")
    private Long recruiterProfileId;

    // =========================================================
    // USER RELATIONSHIP
    // =========================================================

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            unique = true
    )
    private User user;

    // =========================================================
    // RECRUITER DETAILS
    // =========================================================

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "designation", length = 100)
    private String designation;

    // =========================================================
    // COMPANY DETAILS
    // =========================================================

    @Column(name = "company_name", nullable = false, length = 200)
    private String companyName;

    @Column(name = "company_email", nullable = false, length = 255)
    private String companyEmail;

    @Column(name = "company_phone", length = 20)
    private String companyPhone;

    @Column(name = "company_website", length = 500)
    private String companyWebsite;

    @Column(name = "industry", length = 100)
    private String industry;

    @Column(name = "company_size", length = 50)
    private String companySize;

    @Column(name = "company_address", columnDefinition = "text")
    private String companyAddress;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public RecruiterProfile() {
    }

    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public Long getRecruiterProfileId() {
        return recruiterProfileId;
    }

    public void setRecruiterProfileId(Long recruiterProfileId) {
        this.recruiterProfileId = recruiterProfileId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyEmail() {
        return companyEmail;
    }

    public void setCompanyEmail(String companyEmail) {
        this.companyEmail = companyEmail;
    }

    public String getCompanyPhone() {
        return companyPhone;
    }

    public void setCompanyPhone(String companyPhone) {
        this.companyPhone = companyPhone;
    }

    public String getCompanyWebsite() {
        return companyWebsite;
    }

    public void setCompanyWebsite(String companyWebsite) {
        this.companyWebsite = companyWebsite;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getCompanySize() {
        return companySize;
    }

    public void setCompanySize(String companySize) {
        this.companySize = companySize;
    }

    public String getCompanyAddress() {
        return companyAddress;
    }

    public void setCompanyAddress(String companyAddress) {
        this.companyAddress = companyAddress;
    }
}