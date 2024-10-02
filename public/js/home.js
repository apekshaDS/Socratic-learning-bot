document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
        window.location.href = '/bot';
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const headingElement = document.getElementById("heading");
    const text = headingElement.innerText;
    headingElement.innerText = ""; 
    let index = 0;

    function typeCharacter() {
        if (index < text.length) {
            headingElement.innerText += text.charAt(index);
            index++;
            setTimeout(typeCharacter, 50);
        }
    }

    typeCharacter();
});
