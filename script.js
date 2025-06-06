document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
    }

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Enhanced PYQ Database
    const pyqDatabase = {
        "1": {
            "Mathematics I": {
                "2023": ["MST1", "MST2", "EndTerm"],
                "2022": ["MST1", "MST2", "EndTerm"],
                "2021": ["MST1", "MST2", "EndTerm"]
            }
            // "Physics": {
            //     "2023": ["MST1", "MST2", "EndTerm"],
            //     "2022": ["MST1", "EndTerm"]
            // },
            // "Programming in C": {
            //     "2023": ["MST1", "EndTerm"],
            //     "2022": ["MST2", "EndTerm"]
            // }
        },
        "2": {
            "Data Structures": {
                "2023": ["MST1", "EndTerm"],
                "2022": ["MST2", "EndTerm"],
                "2021": ["MST1", "EndTerm"]
            },
            "Mathematics II": {
                "2023": ["MST1", "MST2", "EndTerm"],
                "2022": ["MST1", "EndTerm"]
            }
        },
        "3": {
            "Algorithms": {
                "2023": ["MST1", "MST2", "EndTerm"],
                "2022": ["MST1", "EndTerm"]
            },
            "Database Systems": {
                "2023": ["MST1", "EndTerm"],
                "2022": ["MST2", "EndTerm"]
            }
        },
        "4": {
            "Operating Systems": {
                "2023": ["MST1", "MST2", "EndTerm"],
                "2022": ["MST1", "EndTerm"]
            },
            "Computer Networks": {
                "2023": ["MST1", "EndTerm"],
                "2022": ["MST2", "EndTerm"]
            }
        }
    };

    // DOM elements
    const semesterSelect = document.getElementById('semester');
    const subjectSelect = document.getElementById('subject');
    const yearSelect = document.getElementById('year');
    const paperTypeSelect = document.getElementById('paper-type');
    const filterBtn = document.getElementById('filter-btn');
    const pyqGrid = document.querySelector('.pyq-grid');
    const modal = document.getElementById('pdf-modal');
    const pdfViewer = document.getElementById('pdf-viewer');
    const closeBtn = document.querySelector('.close-btn');
    const emptyState = document.querySelector('.empty-state');
    const pyqContent = document.querySelector('.pyq-content');

    // Populate semesters on page load
    if (semesterSelect) {
        semesterSelect.innerHTML = '<option value="all">All Semesters</option>';
        Object.keys(pyqDatabase).forEach(sem => {
            const option = document.createElement('option');
            option.value = sem;
            option.textContent = `Semester ${sem}`;
            semesterSelect.appendChild(option);
        });
    }

    // Populate subjects based on semester selection
    if (semesterSelect && subjectSelect) {
        semesterSelect.addEventListener('change', function() {
            const selectedSemester = this.value;
            subjectSelect.innerHTML = '<option value="all">All Subjects</option>';

            if (selectedSemester !== 'all' && pyqDatabase[selectedSemester]) {
                Object.keys(pyqDatabase[selectedSemester]).forEach(subject => {
                    const option = document.createElement('option');
                    option.value = subject;
                    option.textContent = subject;
                    subjectSelect.appendChild(option);
                });
            }
        });

        // Trigger change event to populate subjects for default semester
        semesterSelect.dispatchEvent(new Event('change'));
    }

    // Filter PYQs
    if (filterBtn && pyqGrid) {
        filterBtn.addEventListener('click', function() {
            if (!semesterSelect || !subjectSelect || !yearSelect || !paperTypeSelect) {
                console.error('One or more filter elements are missing');
                return;
            }

            const semester = semesterSelect.value || 'all';
            const subject = subjectSelect.value || 'all';
            const year = yearSelect.value || 'all';
            const paperType = paperTypeSelect.value || 'all';

            // Show results section
            const pyqResults = document.querySelector('.pyq-results');
            if (pyqResults) pyqResults.style.display = 'block';

            // Toggle empty state/content visibility
            if (emptyState) emptyState.style.display = 'none';
            if (pyqContent) pyqContent.style.display = 'block';

            // Clear current results
            pyqGrid.innerHTML = '';

            // Get all matching PYQs
            const results = findPYQs(semester, subject, year, paperType);

            if (results.length === 0) {
                pyqGrid.innerHTML = '<p class="no-results">No PYQs found matching your criteria</p>';
                return;
            }

            // Display results
            results.forEach(pyq => {
                const card = createPYQCard(pyq);
                pyqGrid.appendChild(card);
            });
        });
    }

    // Helper function to find matching PYQs
    function findPYQs(semester, subject, year, paperType) {
        const results = [];

        // Determine which semesters to search
        const semestersToSearch = semester === 'all' ? Object.keys(pyqDatabase) : [semester];

        semestersToSearch.forEach(sem => {
            if (!pyqDatabase[sem]) return;

            // Determine which subjects to search
            const subjectsToSearch = subject === 'all' ? Object.keys(pyqDatabase[sem]) : [subject];

            subjectsToSearch.forEach(sub => {
                if (!pyqDatabase[sem][sub]) return;

                // Determine which years to search
                const yearsToSearch = year === 'all' ? Object.keys(pyqDatabase[sem][sub]) : [year];

                yearsToSearch.forEach(yr => {
                    if (!pyqDatabase[sem][sub][yr]) return;

                    // Determine which paper types to include
                    const papersToInclude = paperType === 'all' ? pyqDatabase[sem][sub][yr] : [paperType];

                    papersToInclude.forEach(pt => {
                        if (pyqDatabase[sem][sub][yr].includes(pt)) {
                            results.push({
                                semester: sem,
                                subject: sub,
                                year: yr,
                                paperType: pt,
                                path: `pdfs/semester${sem}/${sub}/${yr}/${pt}.pdf`
                            });
                        }
                    });
                });
            });
        });

        return results;
    }

    // Helper function to create a PYQ card
    function createPYQCard(pyq) {
        const card = document.createElement('div');
        card.className = 'pyq-card';

        card.innerHTML = `
            <div class="pyq-card-content">
                <h3>${pyq.subject}</h3>
                <p>Semester ${pyq.semester} | ${pyq.year} | ${pyq.paperType}</p>
                <div class="pyq-actions">
                    <a href="#" class="view-btn" data-pdf="${pyq.path}">View PDF</a>
                    <a href="${pyq.path}" class="download-btn" download>Download</a>
                </div>
            </div>
        `;

        // Add event listener to view button
        card.querySelector('.view-btn')?.addEventListener('click', function(e) {
            e.preventDefault();
            openPdfViewer(this.getAttribute('data-pdf'));
        });

        return card;
    }

    // PDF Viewer functionality
    function openPdfViewer(pdfUrl) {
        if (!pdfViewer || !modal) {
            console.error('PDF viewer or modal element is missing');
            return;
        }

        try {
            pdfViewer.src = pdfUrl;
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        } catch (error) {
            console.error('Error opening PDF viewer:', error);
        }
    }

    // Close modal handlers
    function closePdfViewer() {
        if (pdfViewer && modal) {
            pdfViewer.src = '';
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closePdfViewer);
    }

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closePdfViewer();
        }
    });
});