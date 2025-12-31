document.addEventListener('DOMContentLoaded', (event) => {
  const toggleButtons = document.querySelectorAll('.toggle-button');

  toggleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const ostPartName = button.parentElement.nextElementSibling;
      if (ostPartName.style.display === 'none' || ostPartName.style.display === '') {
        ostPartName.style.display = 'block';
        button.textContent = '▲';
      } else {
        ostPartName.style.display = 'none';
        button.textContent = '▼';
      }
    });
  });
});

const flipCard = document.getElementById('flipCard');

flipCard.addEventListener('click', () => {
  flipCard.classList.toggle('flipped');
});
