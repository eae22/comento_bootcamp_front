const flipCard = document.getElementById('flipCard');

flipCard.addEventListener('click', () => {
  flipCard.classList.toggle('flipped');
});

const pages = document.querySelectorAll('.page');
const buttons = document.querySelectorAll('.page_nav button');

buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    pages.forEach((p) => p.classList.remove('active'));
    document.querySelector(`.page-${btn.dataset.page}`).classList.add('active');

    buttons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
  });
});
