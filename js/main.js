document.addEventListener('DOMContentLoaded', () => {

    // Force form field heights based on screen width
    function applyFormHeights() {
        const w = window.innerWidth;
        const inputs = document.querySelectorAll('.od-input');
        const selects = document.querySelectorAll('.od-degree-select');
        const buttons = document.querySelectorAll('.od-submit-button');

        if (w >= 1024 && w <= 1920) {
            inputs.forEach(el  => el.style.setProperty('height', '52px', 'important'));
            selects.forEach(el => el.style.setProperty('height', '62px', 'important'));
            buttons.forEach(el => el.style.setProperty('height', '62px', 'important'));
        } else if (w > 1920) {
            inputs.forEach(el  => el.style.setProperty('height', '74px', 'important'));
            selects.forEach(el => el.style.setProperty('height', '82px', 'important'));
            buttons.forEach(el => el.style.setProperty('height', '82px', 'important'));
        } else {
            inputs.forEach(el  => el.style.removeProperty('height'));
            selects.forEach(el => el.style.removeProperty('height'));
            buttons.forEach(el => el.style.removeProperty('height'));
        }
    }

    applyFormHeights();
    window.addEventListener('resize', applyFormHeights);

    const readMoreBtn     = document.getElementById('readMoreBtn');
    const readMoreContent = document.getElementById('readMoreContent');
    if (readMoreBtn && readMoreContent) {
        readMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            readMoreContent.style.maxHeight = readMoreContent.scrollHeight + 'px';
            readMoreContent.style.opacity   = '1';
            readMoreBtn.style.display       = 'none';
        });
    }

    document.querySelectorAll('.od-video-card[data-youtube-id]').forEach(card => {
        card.addEventListener('click', () => {
            const videoId = card.dataset.youtubeId;
            card.innerHTML = `<iframe
                class="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1"
                frameborder="0"
                allow="autoplay; encrypted-media; fullscreen"
                allowfullscreen>
            </iframe>`;
        });
    });

    const leadForm = document.getElementById('leadForm');
    if (!leadForm) return;

    leadForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = document.getElementById('submitBtn');
        const btnText = document.getElementById('btnText');
        const btnIcon = document.getElementById('btnIcon');
        const loadingIcon = document.getElementById('loadingIcon');
        const messageDiv = document.getElementById('formMessage');

        const formData = {
            fullName:   document.getElementById('fullName').value.trim(),
            phone:      document.getElementById('phone').value.trim(),
            email:      document.getElementById('email').value.trim(),
            department: document.getElementById('degree').value || '61',
        };

        submitBtn.disabled = true;
        btnText.innerText = 'שולח...';
        btnIcon.classList.add('hidden');
        loadingIcon.classList.remove('hidden');
        messageDiv.classList.add('hidden');

        try {
            const API_URL = '/api/submit';

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Server error');

            messageDiv.innerText = 'הפרטים נשלחו בהצלחה! ניצור קשר בהקדם.';
            messageDiv.className =
                'text-center font-bold text-lg p-3 rounded bg-[#1B2F22] text-[#7CEE96] border border-[#7CEE96] mt-4 block';
            this.reset();
        } catch (error) {
            console.error('Error:', error);
            messageDiv.innerText = 'אירעה שגיאה בשליחת הנתונים. אנא נסה שנית.';
            messageDiv.className =
                'text-center font-bold text-lg p-3 rounded bg-red-900/50 text-red-300 border border-red-500 mt-4 block';
        } finally {
            submitBtn.disabled = false;
            btnText.innerText = 'שליחה';
            btnIcon.classList.remove('hidden');
            loadingIcon.classList.add('hidden');
        }
    });
});
