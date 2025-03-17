// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Preloader - remove after page loads
    window.addEventListener('load', function() {
        const preloader = document.querySelector('.preloader');
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, 1000);
    });

    // Header scroll effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            nav.classList.remove('active');
        });
    });

    // Back to top button
    const backToTopButton = document.querySelector('.back-to-top');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('active');
        } else {
            backToTopButton.classList.remove('active');
        }
    });
    
    if (backToTopButton) {
        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // FAQ accordion
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });

    // File upload preview - using your original code but adapted to the new UI
    const fileInput = document.getElementById('fingerprint');
    const previewImage = document.getElementById('preview-image');
    const uploadIcon = document.getElementById('upload-icon');
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                    previewImage.classList.remove('hidden');
                    uploadIcon.classList.add('hidden');
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // Form submission - using your original code but adapted to the new UI
    const uploadForm = document.getElementById('upload-form');
    const predictionResult = document.getElementById('prediction-result');
    const errorMessage = document.getElementById('error-message');
    const processingAnimation = document.getElementById('processing-animation');
    
    if (uploadForm) {
        uploadForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData();
            
            if (fileInput.files.length === 0) {
                showError('Please select an image first');
                return;
            }
            
            formData.append('file', fileInput.files[0]);
            
            // Show processing animation
            processingAnimation.classList.remove('hidden');
            errorMessage.classList.add('hidden');
            predictionResult.classList.add('hidden');
            
            try {
                const response = await fetch('/predict', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                // Hide processing animation
                processingAnimation.classList.add('hidden');
                
                if (result.success) {
                    document.getElementById('blood-group').textContent = result.blood_group;
                    document.getElementById('confidence').textContent = result.confidence;
                    predictionResult.classList.remove('hidden');
                    
                    // Create confidence chart if Chart.js is available
                    if (typeof Chart !== 'undefined' && result.confidence) {
                        createConfidenceChart(result.blood_group, parseFloat(result.confidence));
                    }
                } else {
                    showError(result.error || 'An error occurred while processing the image.');
                }
                
            } catch (error) {
                // Hide processing animation
                processingAnimation.classList.add('hidden');
                showError('An error occurred while processing the image.');
            }
        });
    }

    // Close result button
    const closeResult = document.querySelector('.close-result');
    
    if (closeResult) {
        closeResult.addEventListener('click', function() {
            predictionResult.classList.add('hidden');
        });
    }

    // Error message function
    function showError(message) {
        const errorText = document.getElementById('error-text');
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
    }

    // Create confidence chart
    function createConfidenceChart(bloodGroup, confidenceValue) {
        const ctx = document.getElementById('confidence-chart');
        
        // Convert string percentage to number if needed
        if (typeof confidenceValue === 'string') {
            confidenceValue = parseFloat(confidenceValue.replace('%', ''));
        }
        
        // Ensure confidence is between 0-100
        confidenceValue = Math.min(Math.max(confidenceValue, 0), 100);
        
        // Destroy existing chart if it exists
        if (window.confidenceChart) {
            window.confidenceChart.destroy();
        }
        
        // Create new chart
        window.confidenceChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Confidence', 'Uncertainty'],
                datasets: [{
                    data: [confidenceValue, 100 - confidenceValue],
                    backgroundColor: [
                        '#ff3366',
                        'rgba(255, 255, 255, 0.1)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '70%',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.raw + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    // Animate stats counter
    const stats = document.querySelectorAll('.stat-number');
    
    function animateStats() {
        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            const duration = 2000; // 2 seconds
            const step = target / (duration / 16); // 60fps
            let current = 0;
            
            const updateCount = () => {
                current += step;
                if (current < target) {
                    stat.textContent = Math.floor(current);
                    requestAnimationFrame(updateCount);
                } else {
                    stat.textContent = target;
                }
            };
            
            updateCount();
        });
    }

    // Intersection Observer for stats animation
    const aboutSection = document.querySelector('.about');
    
    if (aboutSection && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStats();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(aboutSection);
    }

    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // Here you would normally send the data to your server
            // For demo purposes, we'll just log it and show an alert
            console.log('Form submitted:', { name, email, subject, message });
            
            // Reset form
            contactForm.reset();
            
            // Show success message (you can replace this with a better UI notification)
            alert('Thank you for your message! We will get back to you soon.');
        });
    }

    // Drag and drop file upload
    const dropArea = document.querySelector('.file-upload-preview');
    
    if (dropArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight() {
            dropArea.style.borderColor = '#ff3366';
            dropArea.style.backgroundColor = 'rgba(255, 51, 102, 0.05)';
        }
        
        function unhighlight() {
            dropArea.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            dropArea.style.backgroundColor = 'transparent';
        }
        
        dropArea.addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0) {
                fileInput.files = files;
                
                // Trigger change event
                const event = new Event('change');
                fileInput.dispatchEvent(event);
            }
        }
    }

    // Initialize particles.js if available
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: '#ff3366' },
                shape: { type: 'circle' },
                opacity: { value: 0.5, random: false },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#ff3366',
                    opacity: 0.4,
                    width: 1
                },
                move: { enable: true, speed: 2 }
            }
        });
    }
});